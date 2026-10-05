import { Hono } from 'hono'
import { and, desc, eq, isNull, like, or, sql } from 'drizzle-orm'
import { createDb } from '../db/client'
import {
  achievements,
  cities,
  organizations,
  people,
} from '../db/schema'
import { createId } from '../lib/ids'
import type { AppEnv } from '../types'

export const catalogRoutes = new Hono<AppEnv>()

catalogRoutes.get('/achievements', async (c) => {
  const q = (c.req.query('q') ?? '').trim()
  const cityId = (c.req.query('cityId') ?? '').trim()
  const db = createDb(c.env.DB)

  const filters = [
    eq(achievements.status, 'published'),
    isNull(achievements.deletedAt),
  ]
  if (cityId) filters.push(eq(achievements.cityId, cityId))
  if (q) {
    filters.push(
      or(
        like(achievements.title, `%${q}%`),
        like(achievements.description, `%${q}%`),
      )!,
    )
  }

  const items = await db
    .select({
      id: achievements.id,
      title: achievements.title,
      description: achievements.description,
      periodStart: achievements.periodStart,
      periodEnd: achievements.periodEnd,
      impactScope: achievements.impactScope,
      cityId: achievements.cityId,
      cityNameAr: cities.nameAr,
      personName: people.fullName,
      organizationName: organizations.name,
      createdAt: achievements.createdAt,
    })
    .from(achievements)
    .leftJoin(cities, eq(achievements.cityId, cities.id))
    .leftJoin(people, eq(achievements.personId, people.id))
    .leftJoin(organizations, eq(achievements.organizationId, organizations.id))
    .where(and(...filters))
    .orderBy(desc(achievements.createdAt))
    .limit(100)

  return c.json({ items })
})

catalogRoutes.get('/achievements/:id', async (c) => {
  const id = c.req.param('id')
  const db = createDb(c.env.DB)

  const [item] = await db
    .select({
      id: achievements.id,
      title: achievements.title,
      description: achievements.description,
      periodStart: achievements.periodStart,
      periodEnd: achievements.periodEnd,
      impactScope: achievements.impactScope,
      cityId: achievements.cityId,
      cityNameAr: cities.nameAr,
      personName: people.fullName,
      personSpecialty: people.specialty,
      organizationName: organizations.name,
      createdAt: achievements.createdAt,
    })
    .from(achievements)
    .leftJoin(cities, eq(achievements.cityId, cities.id))
    .leftJoin(people, eq(achievements.personId, people.id))
    .leftJoin(organizations, eq(achievements.organizationId, organizations.id))
    .where(
      and(
        eq(achievements.id, id),
        eq(achievements.status, 'published'),
        isNull(achievements.deletedAt),
      ),
    )
    .limit(1)

  if (!item) return c.json({ error: 'المنجز غير موجود أو غير منشور' }, 404)
  return c.json({ item })
})

catalogRoutes.get('/people', async (c) => {
  const q = (c.req.query('q') ?? '').trim()
  const cityId = (c.req.query('cityId') ?? '').trim()
  const db = createDb(c.env.DB)

  const filters = [
    eq(people.status, 'published'),
    isNull(people.deletedAt),
    eq(people.publishConsent, true),
  ]
  if (cityId) filters.push(eq(people.cityId, cityId))
  if (q) {
    filters.push(or(like(people.fullName, `%${q}%`), like(people.specialty, `%${q}%`), like(people.bio, `%${q}%`))!)
  }

  const items = await db
    .select({
      id: people.id,
      fullName: people.fullName,
      specialty: people.specialty,
      bio: people.bio,
      cityId: people.cityId,
      cityNameAr: cities.nameAr,
    })
    .from(people)
    .leftJoin(cities, eq(people.cityId, cities.id))
    .where(and(...filters))
    .orderBy(desc(people.createdAt))
    .limit(100)

  return c.json({ items })
})

catalogRoutes.get('/organizations', async (c) => {
  const q = (c.req.query('q') ?? '').trim()
  const cityId = (c.req.query('cityId') ?? '').trim()
  const db = createDb(c.env.DB)

  const filters = [
    eq(organizations.status, 'published'),
    isNull(organizations.deletedAt),
    eq(organizations.publishConsent, true),
  ]
  if (cityId) filters.push(eq(organizations.cityId, cityId))
  if (q) {
    filters.push(
      or(like(organizations.name, `%${q}%`), like(organizations.description, `%${q}%`))!,
    )
  }

  const items = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      description: organizations.description,
      foundedYear: organizations.foundedYear,
      scope: organizations.scope,
      website: organizations.website,
      cityId: organizations.cityId,
      cityNameAr: cities.nameAr,
    })
    .from(organizations)
    .leftJoin(cities, eq(organizations.cityId, cities.id))
    .where(and(...filters))
    .orderBy(desc(organizations.createdAt))
    .limit(100)

  return c.json({ items })
})

catalogRoutes.get('/stats', async (c) => {
  const db = createDb(c.env.DB)
  const [a] = await db
    .select({ count: sql<number>`count(*)` })
    .from(achievements)
    .where(and(eq(achievements.status, 'published'), isNull(achievements.deletedAt)))
  const [p] = await db
    .select({ count: sql<number>`count(*)` })
    .from(people)
    .where(
      and(eq(people.status, 'published'), isNull(people.deletedAt), eq(people.publishConsent, true)),
    )
  const [o] = await db
    .select({ count: sql<number>`count(*)` })
    .from(organizations)
    .where(
      and(
        eq(organizations.status, 'published'),
        isNull(organizations.deletedAt),
        eq(organizations.publishConsent, true),
      ),
    )

  return c.json({
    counts: {
      achievements: Number(a?.count ?? 0),
      people: Number(p?.count ?? 0),
      organizations: Number(o?.count ?? 0),
    },
  })
})

/** Dev helper: seed a few published records so the public directory is browsable */
catalogRoutes.post('/seed-demo', async (c) => {
  const db = createDb(c.env.DB)
  const cityRows = await db.select().from(cities).limit(10)
  if (cityRows.length === 0) {
    return c.json({ error: 'ازرع التصنيفات والمدن أولاً من لوحة الإدارة' }, 400)
  }

  const [existing] = await db
    .select({ count: sql<number>`count(*)` })
    .from(achievements)
    .where(eq(achievements.status, 'published'))
  if (Number(existing?.count ?? 0) > 0) {
    return c.json({ seeded: false, message: 'توجد منجزات منشورة مسبقاً' })
  }

  const ankara = cityRows.find((x) => x.contactPoint === 'ankara') ?? cityRows[0]!
  const istanbul = cityRows.find((x) => x.contactPoint === 'istanbul') ?? cityRows[0]!
  const gaziantep = cityRows.find((x) => x.contactPoint === 'gaziantep') ?? cityRows[0]!

  const personId = createId('per')
  const orgId = createId('org')

  await db.insert(people).values({
    id: personId,
    fullName: 'د. لمى الحسن',
    specialty: 'علوم سياسية وإدارة عامة',
    cityId: ankara.id,
    bio: 'باحثة في الحوكمة والتنمية المؤسسية، تساهم في توثيق الخبرات السورية في تركيا.',
    publishConsent: true,
    status: 'published',
  })

  await db.insert(organizations).values({
    id: orgId,
    name: 'مبادرة جسور المعرفة',
    cityId: istanbul.id,
    foundedYear: 2018,
    scope: 'تعليمي وثقافي',
    description: 'مبادرة أهلية تدعم البرامج التعليمية والثقافية لأبناء الجالية السورية.',
    website: 'https://example.org',
    publishConsent: true,
    status: 'published',
  })

  const demoAchievements = [
    {
      title: 'إطلاق برنامج توثيق الخبرات السورية',
      description:
        'برنامج مؤسسي لجمع وتصنيف إسهامات السوريين في تركيا عبر نقاط اتصال ميدانية ومعايير تحقق موحّدة.',
      cityId: ankara.id,
      personId,
      impactScope: 'وطني',
      periodStart: '2024',
      periodEnd: '2026',
    },
    {
      title: 'شبكة دعم ريادة الأعمال في إسطنبول',
      description:
        'تأسيس شبكة تربط رواد الأعمال السوريين بشركاء أتراك ودوليين لتبادل الخبرات وفتح فرص التعاون.',
      cityId: istanbul.id,
      organizationId: orgId,
      impactScope: 'محلي',
      periodStart: '2022',
      periodEnd: '2025',
    },
    {
      title: 'مبادرة تعليم مجتمعي في غازي عنتاب',
      description:
        'مبادرة تطوعية قدّمت برامج تعليمية ودعمًا أكاديميًا للطلاب السوريين بالتنسيق مع جهات محلية.',
      cityId: gaziantep.id,
      impactScope: 'محلي',
      periodStart: '2021',
      periodEnd: '2024',
    },
  ]

  for (const item of demoAchievements) {
    await db.insert(achievements).values({
      id: createId('ach'),
      title: item.title,
      description: item.description,
      cityId: item.cityId,
      personId: item.personId,
      organizationId: item.organizationId,
      impactScope: item.impactScope,
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      status: 'published',
    })
  }

  return c.json({
    seeded: true,
    counts: { people: 1, organizations: 1, achievements: demoAchievements.length },
  })
})
