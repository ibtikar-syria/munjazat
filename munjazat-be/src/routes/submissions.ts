import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createDb } from '../db/client'
import { cities, submissions } from '../db/schema'
import { createId, createTrackingCode } from '../lib/ids'
import type { AppEnv } from '../types'
import type { ContactPointCode, EntityKind } from '../db/schema'

const submitSchema = z.object({
  entityKind: z.enum(['person', 'organization', 'achievement']),
  submitterName: z.string().min(2),
  submitterEmail: z.string().email(),
  submitterPhone: z.string().optional(),
  cityId: z.string().optional(),
  payload: z.record(z.string(), z.unknown()),
  consent: z.literal(true),
})

export const submissionRoutes = new Hono<AppEnv>()

submissionRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'بيانات غير صالحة', details: parsed.error.flatten() }, 400)
  }

  const data = parsed.data
  const db = createDb(c.env.DB)

  let contactPoint: ContactPointCode | null = null
  if (data.cityId) {
    const [city] = await db.select().from(cities).where(eq(cities.id, data.cityId)).limit(1)
    contactPoint = city?.contactPoint ?? null
  }

  const trackingCode = createTrackingCode()
  const id = createId('sub')

  await db.insert(submissions).values({
    id,
    trackingCode,
    entityKind: data.entityKind as EntityKind,
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail.toLowerCase(),
    submitterPhone: data.submitterPhone,
    payloadJson: JSON.stringify(data.payload),
    status: contactPoint ? 'cp_review' : 'submitted',
    contactPoint,
  })

  return c.json(
    {
      id,
      trackingCode,
      status: contactPoint ? 'cp_review' : 'submitted',
      message: 'تم استلام طلب التوثيق بنجاح',
    },
    201,
  )
})

submissionRoutes.get('/track/:code', async (c) => {
  const code = c.req.param('code').toUpperCase()
  const db = createDb(c.env.DB)
  const [row] = await db.select().from(submissions).where(eq(submissions.trackingCode, code)).limit(1)
  if (!row) return c.json({ error: 'لم يتم العثور على الطلب' }, 404)

  return c.json({
    trackingCode: row.trackingCode,
    status: row.status,
    entityKind: row.entityKind,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    reviewNote: row.status === 'needs_info' ? row.reviewNote : null,
  })
})
