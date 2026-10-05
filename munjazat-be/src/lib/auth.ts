import { eq } from 'drizzle-orm'
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../db/client'
import { sessions, users } from '../db/schema'
import { hashToken } from './password'
import type { AppEnv } from '../types'

export const SESSION_COOKIE = 'munjazat_session'

export async function loadSession(c: Context<AppEnv>, next: Next) {
  c.set('user', null)
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return next()

  const db = createDb(c.env.DB)
  const tokenHash = await hashToken(token)
  const rows = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      contactPoint: users.contactPoint,
      active: users.active,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1)

  const row = rows[0]
  if (!row || !row.active) return next()
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, row.sessionId))
    return next()
  }

  c.set('user', {
    id: row.userId,
    email: row.email,
    name: row.name,
    role: row.role,
    contactPoint: row.contactPoint,
  })
  return next()
}

export function requireAuth() {
  return async (c: Context<AppEnv>, next: Next) => {
    if (!c.get('user')) {
      return c.json({ error: 'مطلوب تسجيل الدخول' }, 401)
    }
    return next()
  }
}

export function requireRoles(...allowed: string[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'مطلوب تسجيل الدخول' }, 401)
    if (!allowed.includes(user.role)) {
      return c.json({ error: 'ليست لديك صلاحية لهذا الإجراء' }, 403)
    }
    return next()
  }
}
