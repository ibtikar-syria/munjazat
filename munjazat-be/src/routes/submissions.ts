import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createDb } from '../db/client'
import { cities, evidence, submissions } from '../db/schema'
import { createId, createTrackingCode } from '../lib/ids'
import {
  MAX_MEDIA_FILES,
  MAX_SUBMISSION_BYTES,
  normalizeRelatedLinks,
  resolveContentType,
  sanitizeFileName,
} from '../lib/media'
import {
  contactPointFromTurkeyRegion,
  findTurkeyProvince,
  normalizePlaceKey,
} from '../lib/turkeyProvinces'
import { ensureTurkeyProvinces } from './taxonomies'
import type { AppEnv } from '../types'
import type { ContactPointCode, EntityKind } from '../db/schema'

const submitSchema = z.object({
  entityKind: z.enum(['person', 'organization', 'achievement']),
  submitterName: z.string().min(2),
  submitterEmail: z.string().email(),
  submitterPhone: z.string().optional(),
  cityId: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  payload: z.record(z.string(), z.unknown()),
  consent: z.literal(true),
  relatedLinks: z.array(z.string()).max(20).optional(),
})

export const submissionRoutes = new Hono<AppEnv>()

async function readSubmitRequest(c: { req: { header: (name: string) => string | undefined; json: () => Promise<unknown>; formData: () => Promise<FormData> } }) {
  const contentType = c.req.header('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    const form = await c.req.formData()
    const raw = form.get('meta')
    if (typeof raw !== 'string') {
      return { error: 'بيانات غير صالحة' as const, status: 400 as const }
    }
    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return { error: 'بيانات غير صالحة' as const, status: 400 as const }
    }
    const files = form.getAll('media').filter((item): item is File => item instanceof File && item.size > 0)
    return { body, files }
  }

  const body = await c.req.json().catch(() => null)
  return { body, files: [] as File[] }
}

submissionRoutes.post('/', async (c) => {
  const contentLength = Number(c.req.header('content-length') || 0)
  if (contentLength > MAX_SUBMISSION_BYTES + 1024 * 1024) {
    return c.json({ error: 'حجم الطلب يتجاوز 100 ميغابايت' }, 413)
  }

  const incoming = await readSubmitRequest(c)
  if ('error' in incoming) {
    return c.json({ error: incoming.error }, incoming.status)
  }

  const parsed = submitSchema.safeParse(incoming.body)
  if (!parsed.success) {
    return c.json({ error: 'بيانات غير صالحة', details: parsed.error.flatten() }, 400)
  }

  const files = incoming.files
  if (files.length > MAX_MEDIA_FILES) {
    return c.json({ error: `يمكن إرفاق ${MAX_MEDIA_FILES} ملفاً كحد أقصى` }, 400)
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes > MAX_SUBMISSION_BYTES) {
    return c.json({ error: 'حجم الملفات مجتمعة يتجاوز 100 ميغابايت' }, 413)
  }

  const mediaMeta: Array<{ file: File; contentType: string; fileName: string }> = []
  for (const file of files) {
    const contentType = resolveContentType(file)
    if (!contentType) {
      return c.json({ error: `نوع الملف غير مسموح: ${file.name}` }, 400)
    }
    mediaMeta.push({ file, contentType, fileName: sanitizeFileName(file.name) })
  }

  const data = parsed.data
  const db = createDb(c.env.DB)
  await ensureTurkeyProvinces(db)

  const region =
    data.region?.trim() ||
    (typeof data.payload.region === 'string' ? data.payload.region : '') ||
    ''
  const cityName =
    data.city?.trim() || (typeof data.payload.city === 'string' ? data.payload.city : '') || ''

  let contactPoint: ContactPointCode | null = null

  if (data.cityId) {
    const [city] = await db.select().from(cities).where(eq(cities.id, data.cityId)).limit(1)
    contactPoint = city?.contactPoint ?? null
  }

  if (!contactPoint) {
    const province = findTurkeyProvince(region)
    if (province) {
      const rows = await db.select().from(cities)
      const match = rows.find((row) => {
        const keys = [row.nameEn, row.nameAr].map((name) => normalizePlaceKey(name))
        return (
          keys.includes(normalizePlaceKey(province.nameEn)) ||
          keys.includes(normalizePlaceKey(province.nameAr))
        )
      })
      contactPoint = match?.contactPoint ?? province.contactPoint
    } else {
      contactPoint = contactPointFromTurkeyRegion(region)
    }
  }

  const relatedLinks = normalizeRelatedLinks(data.relatedLinks ?? data.payload.relatedLinks)
  const payload = {
    ...data.payload,
    country: 'TR',
    region: region || undefined,
    city: cityName || undefined,
    relatedLinks,
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
    payloadJson: JSON.stringify(payload),
    status: contactPoint ? 'cp_review' : 'submitted',
    contactPoint,
  })

  if (mediaMeta.length) {
    for (const item of mediaMeta) {
      const evidenceId = createId('ev')
      const r2Key = `submissions/${id}/${evidenceId}-${item.fileName}`
      await c.env.EVIDENCE.put(r2Key, item.file, {
        httpMetadata: { contentType: item.contentType },
        customMetadata: { submissionId: id, fileName: item.fileName },
      })
      await db.insert(evidence).values({
        id: evidenceId,
        entityKind: data.entityKind as EntityKind,
        entityId: id,
        submissionId: id,
        r2Key,
        fileName: item.fileName,
        contentType: item.contentType,
        sizeBytes: item.file.size,
      })
    }
  }

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
