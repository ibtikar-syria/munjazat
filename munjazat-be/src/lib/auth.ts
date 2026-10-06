import { eq } from 'drizzle-orm'
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../db/client'
import { sessions, users } from '../db/schema'
import { AUTH_COOKIE, getJwtSecret, readBearerToken, verifyStaffJwt } from './jwt'
import type { AppEnv } from '../types'

export { AUTH_COOKIE }

export async function loadSession(c: Context<AppEnv>, next: Next) {
  c.set('user', null)
  const token = getCookie(c, AUTH_COOKIE) || readBearerToken(c.req.header('Authorization'))
  if (!token) return next()

  const secret = getJwtSecret(c.env.JWT_SECRET)
  if (!secret) return next()

  const claims = await verifyStaffJwt(token, secret)
  if (!claims) return next()

  const db = createDb(c.env.DB)
  const [session] = await db.select().from(sessions).where(eq(sessions.id, claims.jti)).limit(1)
  if (!session) return next()
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, session.id))
    return next()
  }
  if (session.userId !== claims.sub) return next()

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  if (!user || !user.active) return next()

  c.set('user', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    contactPoint: user.contactPoint,
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
