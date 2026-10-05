import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { createDb } from '../db/client'
import { achievements, organizations, people, submissions } from '../db/schema'
import { requireAuth } from '../lib/auth'
import type { AppEnv } from '../types'

export const dashboardRoutes = new Hono<AppEnv>()

dashboardRoutes.get('/summary', requireAuth(), async (c) => {
  const db = createDb(c.env.DB)

  const [peopleCount] = await db.select({ count: sql<number>`count(*)` }).from(people)
  const [orgCount] = await db.select({ count: sql<number>`count(*)` }).from(organizations)
  const [achCount] = await db.select({ count: sql<number>`count(*)` }).from(achievements)
  const [submissionCount] = await db.select({ count: sql<number>`count(*)` }).from(submissions)

  const byStatus = await db
    .select({
      status: submissions.status,
      count: sql<number>`count(*)`,
    })
    .from(submissions)
    .groupBy(submissions.status)

  return c.json({
    counts: {
      people: Number(peopleCount?.count ?? 0),
      organizations: Number(orgCount?.count ?? 0),
      achievements: Number(achCount?.count ?? 0),
      submissions: Number(submissionCount?.count ?? 0),
    },
    submissionsByStatus: byStatus,
    queues: {
      cpReview: Number(byStatus.find((s) => s.status === 'cp_review')?.count ?? 0),
      committeeReview: Number(byStatus.find((s) => s.status === 'committee_review')?.count ?? 0),
      needsInfo: Number(byStatus.find((s) => s.status === 'needs_info')?.count ?? 0),
    },
  })
})
