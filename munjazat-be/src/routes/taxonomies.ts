import { Hono } from 'hono'
import { asc } from 'drizzle-orm'
import { createDb, type Db } from '../db/client'
import { cities, entityTypes, sectors } from '../db/schema'
import { createId } from '../lib/ids'
import { requireAuth, requireRoles } from '../lib/auth'
import { normalizePlaceKey, TURKEY_PROVINCES } from '../lib/turkeyProvinces'
import type { AppEnv } from '../types'

const DEFAULT_SECTORS = [
  { nameAr: 'اقتصاد وأعمال', nameEn: 'Economy & Business' },
  { nameAr: 'تعليم وبحث علمي', nameEn: 'Education & Research' },
  { nameAr: 'ثقافة وإعلام', nameEn: 'Culture & Media' },
  { nameAr: 'مجتمع مدني وإنساني', nameEn: 'Civil Society' },
  { nameAr: 'صحة', nameEn: 'Health' },
  { nameAr: 'نساء وشباب', nameEn: 'Women & Youth' },
  { nameAr: 'تقنية وابتكار', nameEn: 'Tech & Innovation' },
  { nameAr: 'قانون وحوكمة', nameEn: 'Law & Governance' },
]

const DEFAULT_ENTITY_TYPES = [
  { nameAr: 'شركة / مشروع', nameEn: 'Company' },
  { nameAr: 'منظمة / جمعية', nameEn: 'NGO' },
  { nameAr: 'مجلس / رابطة', nameEn: 'Council' },
  { nameAr: 'مبادرة', nameEn: 'Initiative' },
  { nameAr: 'مؤسسة إعلامية', nameEn: 'Media' },
  { nameAr: 'مؤسسة أكاديمية', nameEn: 'Academic' },
  { nameAr: 'أخرى', nameEn: 'Other' },
]

export async function ensureTurkeyProvinces(db: Db) {
  const existing = await db.select().from(cities)
  const keys = new Set(
    existing.flatMap((row) =>
      [normalizePlaceKey(row.nameEn), normalizePlaceKey(row.nameAr)].filter(Boolean),
    ),
  )

  for (const province of TURKEY_PROVINCES) {
    const names = [province.nameEn, province.nameAr, ...(province.aliases ?? [])]
    if (names.some((name) => keys.has(normalizePlaceKey(name)))) continue

    await db.insert(cities).values({
      id: createId('cty'),
      nameAr: province.nameAr,
      nameEn: province.nameEn,
      province: province.nameAr,
      contactPoint: province.contactPoint,
    })
    keys.add(normalizePlaceKey(province.nameEn))
    keys.add(normalizePlaceKey(province.nameAr))
  }
}

export const taxonomyRoutes = new Hono<AppEnv>()

taxonomyRoutes.get('/sectors', async (c) => {
  const db = createDb(c.env.DB)
  const rows = await db.select().from(sectors).orderBy(asc(sectors.sortOrder))
  return c.json({ items: rows })
})

taxonomyRoutes.get('/entity-types', async (c) => {
  const db = createDb(c.env.DB)
  const rows = await db.select().from(entityTypes).orderBy(asc(entityTypes.sortOrder))
  return c.json({ items: rows })
})

taxonomyRoutes.get('/cities', async (c) => {
  const db = createDb(c.env.DB)
  await ensureTurkeyProvinces(db)
  const rows = await db.select().from(cities).orderBy(asc(cities.nameAr))
  return c.json({ items: rows })
})

taxonomyRoutes.post('/seed', requireAuth(), requireRoles('embassy_admin'), async (c) => {
  const db = createDb(c.env.DB)
  const [existingSectors] = await db.select().from(sectors).limit(1)
  if (existingSectors) {
    await ensureTurkeyProvinces(db)
    return c.json({ seeded: false, message: 'التصنيفات موجودة مسبقاً' })
  }

  for (const [i, s] of DEFAULT_SECTORS.entries()) {
    await db.insert(sectors).values({
      id: createId('sec'),
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      sortOrder: i + 1,
    })
  }
  for (const [i, t] of DEFAULT_ENTITY_TYPES.entries()) {
    await db.insert(entityTypes).values({
      id: createId('ety'),
      nameAr: t.nameAr,
      nameEn: t.nameEn,
      sortOrder: i + 1,
    })
  }
  await ensureTurkeyProvinces(db)

  return c.json({ seeded: true })
})
