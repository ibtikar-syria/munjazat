import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../db/client'
import { sessions, users } from '../db/schema'
import { createId } from '../lib/ids'
import { hashPassword, hashToken, verifyPassword } from '../lib/password'
import { AUTH_COOKIE, requireAuth } from '../lib/auth'
import {
  JWT_TTL_SECONDS,
  getJwtSecret,
  readBearerToken,
  signStaffJwt,
  verifyStaffJwt,
} from '../lib/jwt'
import type { AppEnv } from '../types'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

const DUMMY_PASSWORD_HASH =
  'pbkdf2$100000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000'

function cookieOptions(c: { req: { url: string } }) {
  const secure = new URL(c.req.url).protocol === 'https:'
  return {
    httpOnly: true,
    sameSite: 'Lax' as const,
    path: '/',
    secure,
    maxAge: JWT_TTL_SECONDS,
  }
}

export const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', async (c) => {
  const secret = getJwtSecret(c.env.JWT_SECRET)
  if (!secret) {
    return c.json({ error: 'إعداد الخادم غير مكتمل' }, 500)
  }

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
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1)

  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH)
  if (!user || !user.active || !ok) {
    return c.json({ error: 'بيانات الدخول غير صحيحة' }, 401)
  }

  const sessionId = createId('ses')
  const token = await signStaffJwt(secret, user.id, sessionId)
  const tokenHash = await hashToken(sessionId)
  const expiresAt = new Date(Date.now() + JWT_TTL_SECONDS * 1000).toISOString()

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    tokenHash,
    expiresAt,
  })

  setCookie(c, AUTH_COOKIE, token, cookieOptions(c))

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
  const secret = getJwtSecret(c.env.JWT_SECRET)
  const token = getCookie(c, AUTH_COOKIE) || readBearerToken(c.req.header('Authorization'))
  if (token && secret) {
    const claims = await verifyStaffJwt(token, secret)
    if (claims) {
      const db = createDb(c.env.DB)
      await db.delete(sessions).where(eq(sessions.id, claims.jti))
    }
  }
  deleteCookie(c, AUTH_COOKIE, { path: '/', secure: new URL(c.req.url).protocol === 'https:' })
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
