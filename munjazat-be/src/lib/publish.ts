import { eq } from 'drizzle-orm'
import { type Db } from '../db/client'
import { achievements, cities, organizations, people, submissions } from '../db/schema'
import { createId } from './ids'
import { findTurkeyProvince, normalizePlaceKey } from './turkeyProvinces'
import type { EntityKind } from '../db/schema'

function payloadString(payload: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

async function resolveCityId(db: Db, payload: Record<string, unknown>) {
  const region = payloadString(payload, 'region')
  const province = findTurkeyProvince(region)
  if (!province) return null
  const rows = await db.select({ id: cities.id, nameEn: cities.nameEn, nameAr: cities.nameAr }).from(cities)
  const match = rows.find((row) => {
    const keys = [row.nameEn, row.nameAr].map((name) => normalizePlaceKey(name))
    return keys.includes(normalizePlaceKey(province.nameEn)) || keys.includes(normalizePlaceKey(province.nameAr))
  })
  return match?.id ?? null
}

export async function publishSubmission(
  db: Db,
  submission: {
    id: string
    entityKind: EntityKind
    entityId: string | null
    payloadJson: string
  },
) {
  const payload = JSON.parse(submission.payloadJson) as Record<string, unknown>
  const title = payloadString(payload, 'title', 'fullName', 'name') || 'سجل بدون عنوان'
  const details = payloadString(payload, 'details', 'summary', 'description', 'bio')
  const cityId = await resolveCityId(db, payload)
  const now = new Date().toISOString()

  if (submission.entityKind === 'person') {
    const id = submission.entityId ?? createId('per')
    if (submission.entityId) {
      await db
        .update(people)
        .set({
          fullName: title,
          bio: details || null,
          cityId,
          publishConsent: true,
          status: 'published',
          updatedAt: now,
        })
        .where(eq(people.id, id))
    } else {
      await db.insert(people).values({
        id,
        fullName: title,
        bio: details || null,
        cityId,
        publishConsent: true,
        status: 'published',
      })
      await db.update(submissions).set({ entityId: id, updatedAt: now }).where(eq(submissions.id, submission.id))
    }
    return id
  }

  if (submission.entityKind === 'organization') {
    const id = submission.entityId ?? createId('org')
    if (submission.entityId) {
      await db
        .update(organizations)
        .set({
          name: title,
          description: details || null,
          cityId,
          publishConsent: true,
          status: 'published',
          updatedAt: now,
        })
        .where(eq(organizations.id, id))
    } else {
      await db.insert(organizations).values({
        id,
        name: title,
        description: details || null,
        cityId,
        publishConsent: true,
        status: 'published',
      })
      await db.update(submissions).set({ entityId: id, updatedAt: now }).where(eq(submissions.id, submission.id))
    }
    return id
  }

  const id = submission.entityId ?? createId('ach')
  if (submission.entityId) {
    await db
      .update(achievements)
      .set({
        title,
        description: details || null,
        cityId,
        status: 'published',
        updatedAt: now,
      })
      .where(eq(achievements.id, id))
  } else {
    await db.insert(achievements).values({
      id,
      title,
      description: details || null,
      cityId,
      status: 'published',
    })
    await db.update(submissions).set({ entityId: id, updatedAt: now }).where(eq(submissions.id, submission.id))
  }
  return id
}
