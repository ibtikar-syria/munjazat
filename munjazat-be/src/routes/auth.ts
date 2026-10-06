import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../db/client'
import { sessions, users } from '../db/schema'
import { createId } from '../lib/ids'
import { hashPassword, hashToken, verifyPassword } from '../lib/password'
import { SESSION_COOKIE, requireAuth } from '../lib/auth'
import type { AppEnv } from '../types'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'بيانات غير صالحة', details: parsed.error.flatten() }, 400)
  }

  const { email, password } = parsed.data
  const db = createDb(c.env.DB)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (!user || !user.active) {
    return c.json({ error: 'بيانات الدخول غير صحيحة' }, 401)
  }
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return c.json({ error: 'بيانات الدخول غير صحيحة' }, 401)

  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`
  const tokenHash = await hashToken(token)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()

  await db.insert(sessions).values({
    id: createId('ses'),
    userId: user.id,
    tokenHash,
    expiresAt,
  })

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    secure: c.req.url.startsWith('https'),
    maxAge: 60 * 60 * 24 * 14,
  })

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      contactPoint: user.contactPoint,
    },
  })
})

authRoutes.post('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    const db = createDb(c.env.DB)
    const tokenHash = await hashToken(token)
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash))
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

authRoutes.get('/me', requireAuth(), async (c) => {
  return c.json({ user: c.get('user') })
})

authRoutes.post('/bootstrap-admin', async (c) => {
  const db = createDb(c.env.DB)
  const [existing] = await db.select().from(users).limit(1)
  if (existing) {
    return c.json({ message: 'يوجد مستخدمون مسبقاً', seeded: false })
  }

  const passwordHash = await hashPassword('Admin123!')
  await db.insert(users).values({
    id: createId('usr'),
    email: 'admin@munjazat.local',
    name: 'مدير النظام',
    passwordHash,
    role: 'embassy_admin',
  })

  return c.json({
    seeded: true,
    email: 'admin@munjazat.local',
    password: 'Admin123!',
  })
})
