import { Hono } from 'hono'
import { and, desc, eq, inArray, like, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { createDb } from '../db/client'
import {
  achievements,
  auditLogs,
  cities,
  organizations,
  people,
  submissions,
  users,
  submissionStatuses,
  contactPointCodes,
} from '../db/schema'
import { createId } from '../lib/ids'
import { requireAuth, requireRoles } from '../lib/auth'
import { allowedTransitions, canPublish, visibleStatusesForRole } from '../lib/rbac'
import { publishSubmission } from '../lib/publish'
import type { AppEnv } from '../types'
import type { ContactPointCode, SubmissionStatus } from '../db/schema'

const reviewSchema = z.object({
  status: z.enum(submissionStatuses).optional(),
  reviewNote: z.string().max(2000).optional(),
  contactPoint: z.enum(contactPointCodes).nullable().optional(),
})

function parsePayload(raw: string) {
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

function submissionTitle(payload: Record<string, unknown>, fallback: string) {
  const title = payload.title
  return typeof title === 'string' && title.trim() ? title.trim() : fallback
}

export const dashboardRoutes = new Hono<AppEnv>()

dashboardRoutes.use('*', requireAuth())

function scopedFilters(user: { role: string; contactPoint: string | null }) {
  const filters = []
  if (user.role === 'contact_point') {
    if (!user.contactPoint) return null
    filters.push(eq(submissions.contactPoint, user.contactPoint as ContactPointCode))
  }
  const statuses = visibleStatusesForRole(user.role)
  if (statuses) {
    filters.push(inArray(submissions.status, statuses))
  }
  return filters
}

dashboardRoutes.get('/summary', async (c) => {
  const user = c.get('user')!
  const db = createDb(c.env.DB)
  const scope = scopedFilters(user)
  if (scope === null) {
    return c.json({
      counts: { people: 0, organizations: 0, achievements: 0, submissions: 0 },
      queues: { submitted: 0, cpReview: 0, committeeReview: 0, needsInfo: 0, verified: 0 },
      recent: [],
    })
  }

  const [peopleCount] = await db.select({ count: sql<number>`count(*)` }).from(people)
  const [orgCount] = await db.select({ count: sql<number>`count(*)` }).from(organizations)
  const [achCount] = await db.select({ count: sql<number>`count(*)` }).from(achievements)

  const submissionWhere = scope.length ? and(...scope) : undefined
  const [submissionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(submissionWhere)

  const byStatus = await db
    .select({
      status: submissions.status,
      count: sql<number>`count(*)`,
    })
    .from(submissions)
    .where(submissionWhere)
    .groupBy(submissions.status)

  const recentRows = await db
    .select()
    .from(submissions)
    .where(submissionWhere)
    .orderBy(desc(submissions.createdAt))
    .limit(8)

  return c.json({
    counts: {
      people: Number(peopleCount?.count ?? 0),
      organizations: Number(orgCount?.count ?? 0),
      achievements: Number(achCount?.count ?? 0),
      submissions: Number(submissionCount?.count ?? 0),
    },
    queues: {
      submitted: Number(byStatus.find((s) => s.status === 'submitted')?.count ?? 0),
      cpReview: Number(byStatus.find((s) => s.status === 'cp_review')?.count ?? 0),
      committeeReview: Number(byStatus.find((s) => s.status === 'committee_review')?.count ?? 0),
      needsInfo: Number(byStatus.find((s) => s.status === 'needs_info')?.count ?? 0),
      verified: Number(byStatus.find((s) => s.status === 'verified')?.count ?? 0),
    },
    recent: recentRows.map((row) => {
      const payload = parsePayload(row.payloadJson)
      return {
        id: row.id,
        trackingCode: row.trackingCode,
        entityKind: row.entityKind,
        status: row.status,
        contactPoint: row.contactPoint,
        title: submissionTitle(payload, row.submitterName),
        createdAt: row.createdAt,
      }
    }),
  })
})

dashboardRoutes.get('/submissions', async (c) => {
  const user = c.get('user')!
  const db = createDb(c.env.DB)
  const scope = scopedFilters(user)
  if (scope === null) return c.json({ items: [] })

  const status = c.req.query('status') as SubmissionStatus | undefined
  const q = (c.req.query('q') ?? '').trim()
  const filters = [...scope]
  if (status && submissionStatuses.includes(status)) {
    filters.push(eq(submissions.status, status))
  }
  if (q) {
    filters.push(
      or(
        like(submissions.trackingCode, `%${q}%`),
        like(submissions.submitterName, `%${q}%`),
        like(submissions.payloadJson, `%${q}%`),
      )!,
    )
  }

  const rows = await db
    .select()
    .from(submissions)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(submissions.createdAt))
    .limit(150)

  return c.json({
    items: rows.map((row) => {
      const payload = parsePayload(row.payloadJson)
      return {
        id: row.id,
        trackingCode: row.trackingCode,
        entityKind: row.entityKind,
        status: row.status,
        contactPoint: row.contactPoint,
        submitterName: row.submitterName,
        title: submissionTitle(payload, row.submitterName),
        region: typeof payload.region === 'string' ? payload.region : null,
        city: typeof payload.city === 'string' ? payload.city : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    }),
  })
})

dashboardRoutes.get('/submissions/:id', async (c) => {
  const user = c.get('user')!
  const db = createDb(c.env.DB)
  const [row] = await db.select().from(submissions).where(eq(submissions.id, c.req.param('id'))).limit(1)
  if (!row) return c.json({ error: 'الطلب غير موجود' }, 404)
  if (user.role === 'contact_point' && row.contactPoint !== user.contactPoint) {
    return c.json({ error: 'ليست لديك صلاحية لهذا الطلب' }, 403)
  }

  const payload = parsePayload(row.payloadJson)
  return c.json({
    item: {
      id: row.id,
      trackingCode: row.trackingCode,
      entityKind: row.entityKind,
      entityId: row.entityId,
      status: row.status,
      contactPoint: row.contactPoint,
      submitterName: row.submitterName,
      submitterEmail: user.role === 'contact_point' ? null : row.submitterEmail,
      submitterPhone: user.role === 'contact_point' ? null : row.submitterPhone,
      reviewNote: row.reviewNote,
      payload,
      title: submissionTitle(payload, row.submitterName),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      allowedStatuses: allowedTransitions(user.role, row.status),
    },
  })
})

dashboardRoutes.patch('/submissions/:id', async (c) => {
  const user = c.get('user')!
  const body = await c.req.json().catch(() => null)
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'بيانات غير صالحة', details: parsed.error.flatten() }, 400)
  }
  if (user.role === 'analyst') {
    return c.json({ error: 'ليست لديك صلاحية لتعديل الطلبات' }, 403)
  }

  const db = createDb(c.env.DB)
  const [row] = await db.select().from(submissions).where(eq(submissions.id, c.req.param('id'))).limit(1)
  if (!row) return c.json({ error: 'الطلب غير موجود' }, 404)
  if (user.role === 'contact_point' && row.contactPoint !== user.contactPoint) {
    return c.json({ error: 'ليست لديك صلاحية لهذا الطلب' }, 403)
  }

  const nextStatus = parsed.data.status
  if (nextStatus && nextStatus !== row.status) {
    const allowed = allowedTransitions(user.role, row.status)
    if (!allowed.includes(nextStatus)) {
      return c.json({ error: 'لا يمكن الانتقال إلى هذه الحالة من دورك' }, 403)
    }
    if (nextStatus === 'published' && !canPublish(user.role)) {
      return c.json({ error: 'النشر يتطلب رئيس اللجنة أو مدير البعثة' }, 403)
    }
    if (nextStatus === 'needs_info' && !parsed.data.reviewNote?.trim() && !row.reviewNote) {
      return c.json({ error: 'أضف ملاحظة للمقدّم عند طلب الاستكمال' }, 400)
    }
  }

  const now = new Date().toISOString()
  if (nextStatus === 'published' && row.status !== 'published') {
    await publishSubmission(db, row)
  }

  await db
    .update(submissions)
    .set({
      status: nextStatus ?? row.status,
      reviewNote: parsed.data.reviewNote ?? row.reviewNote,
      contactPoint: parsed.data.contactPoint === undefined ? row.contactPoint : parsed.data.contactPoint,
      assignedTo: user.id,
      updatedAt: now,
    })
    .where(eq(submissions.id, row.id))

  if (nextStatus && nextStatus !== row.status) {
    await db.insert(auditLogs).values({
      id: createId('aud'),
      actorUserId: user.id,
      action: 'submission.status',
      entityKind: row.entityKind,
      entityId: row.id,
      fromStatus: row.status,
      toStatus: nextStatus,
      note: parsed.data.reviewNote,
    })
  }

  const [updated] = await db.select().from(submissions).where(eq(submissions.id, row.id)).limit(1)
  return c.json({ ok: true, item: updated })
})

dashboardRoutes.get('/directory', async (c) => {
  const kind = c.req.query('kind') || 'achievements'
  const q = (c.req.query('q') ?? '').trim()
  const db = createDb(c.env.DB)

  if (kind === 'people') {
    const filters = q
      ? or(like(people.fullName, `%${q}%`), like(people.specialty, `%${q}%`), like(people.bio, `%${q}%`))
      : undefined
    const items = await db
      .select({
        id: people.id,
        title: people.fullName,
        status: people.status,
        cityNameAr: cities.nameAr,
        extra: people.specialty,
        updatedAt: people.updatedAt,
      })
      .from(people)
      .leftJoin(cities, eq(people.cityId, cities.id))
      .where(filters)
      .orderBy(desc(people.updatedAt))
      .limit(120)
    return c.json({ items })
  }

  if (kind === 'organizations') {
    const filters = q
      ? or(like(organizations.name, `%${q}%`), like(organizations.description, `%${q}%`))
      : undefined
    const items = await db
      .select({
        id: organizations.id,
        title: organizations.name,
        status: organizations.status,
        cityNameAr: cities.nameAr,
        extra: organizations.scope,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .leftJoin(cities, eq(organizations.cityId, cities.id))
      .where(filters)
      .orderBy(desc(organizations.updatedAt))
      .limit(120)
    return c.json({ items })
  }

  const filters = q
    ? or(like(achievements.title, `%${q}%`), like(achievements.description, `%${q}%`))
    : undefined
  const items = await db
    .select({
      id: achievements.id,
      title: achievements.title,
      status: achievements.status,
      cityNameAr: cities.nameAr,
      extra: achievements.impactScope,
      updatedAt: achievements.updatedAt,
    })
    .from(achievements)
    .leftJoin(cities, eq(achievements.cityId, cities.id))
    .where(filters)
    .orderBy(desc(achievements.updatedAt))
    .limit(120)
  return c.json({ items })
})

dashboardRoutes.get('/users', requireRoles('embassy_admin', 'committee_chair'), async (c) => {
  const db = createDb(c.env.DB)
  const items = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      contactPoint: users.contactPoint,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.name)
  return c.json({ items })
})

dashboardRoutes.get('/audit', requireRoles('embassy_admin', 'committee_chair'), async (c) => {
  const db = createDb(c.env.DB)
  const items = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(80)
  return c.json({ items })
})
