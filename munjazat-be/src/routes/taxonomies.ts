import { Hono } from 'hono'
import { asc } from 'drizzle-orm'
import { createDb } from '../db/client'
import { cities, entityTypes, sectors } from '../db/schema'
import { createId } from '../lib/ids'
import { requireAuth, requireRoles } from '../lib/auth'
import type { AppEnv } from '../types'
import type { ContactPointCode } from '../db/schema'

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

const DEFAULT_CITIES: Array<{
  nameAr: string
  nameEn: string
  province: string
  contactPoint: ContactPointCode
}> = [
  { nameAr: 'أنقرة', nameEn: 'Ankara', province: 'أنقرة', contactPoint: 'ankara' },
  { nameAr: 'إسطنبول', nameEn: 'Istanbul', province: 'إسطنبول', contactPoint: 'istanbul' },
  { nameAr: 'غازي عنتاب', nameEn: 'Gaziantep', province: 'غازي عنتاب', contactPoint: 'gaziantep' },
  { nameAr: 'مرسين', nameEn: 'Mersin', province: 'مرسين', contactPoint: 'gaziantep' },
  { nameAr: 'أضنة', nameEn: 'Adana', province: 'أضنة', contactPoint: 'gaziantep' },
  { nameAr: 'بورصة', nameEn: 'Bursa', province: 'بورصة', contactPoint: 'istanbul' },
  { nameAr: 'إزمير', nameEn: 'Izmir', province: 'إزمير', contactPoint: 'istanbul' },
  { nameAr: 'قيصري', nameEn: 'Kayseri', province: 'قيصري', contactPoint: 'ankara' },
  { nameAr: 'قونية', nameEn: 'Konya', province: 'قونية', contactPoint: 'ankara' },
  { nameAr: 'أنطاليا', nameEn: 'Antalya', province: 'أنطاليا', contactPoint: 'istanbul' },
  { nameAr: 'هطاي', nameEn: 'Hatay', province: 'هطاي', contactPoint: 'gaziantep' },
  { nameAr: 'شانلي أورفا', nameEn: 'Şanlıurfa', province: 'شانلي أورفا', contactPoint: 'gaziantep' },
  { nameAr: 'كلس', nameEn: 'Kilis', province: 'كلس', contactPoint: 'gaziantep' },
  { nameAr: 'ماردين', nameEn: 'Mardin', province: 'ماردين', contactPoint: 'gaziantep' },
]

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
  const rows = await db.select().from(cities).orderBy(asc(cities.nameAr))
  return c.json({ items: rows })
})

taxonomyRoutes.post('/seed', requireAuth(), requireRoles('embassy_admin'), async (c) => {
  const db = createDb(c.env.DB)
  const [existingSectors] = await db.select().from(sectors).limit(1)
  if (existingSectors) {
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
  for (const city of DEFAULT_CITIES) {
    await db.insert(cities).values({
      id: createId('cty'),
      nameAr: city.nameAr,
      nameEn: city.nameEn,
      province: city.province,
      contactPoint: city.contactPoint,
    })
  }

  return c.json({ seeded: true })
})
