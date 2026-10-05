import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const roles = [
  'embassy_admin',
  'committee_chair',
  'committee_member',
  'contact_point',
  'expert',
  'analyst',
] as const
export type Role = (typeof roles)[number]

export const contactPointCodes = ['ankara', 'istanbul', 'gaziantep'] as const
export type ContactPointCode = (typeof contactPointCodes)[number]

export const submissionStatuses = [
  'draft',
  'submitted',
  'cp_review',
  'needs_info',
  'committee_review',
  'verified',
  'published',
  'rejected',
  'archived',
] as const
export type SubmissionStatus = (typeof submissionStatuses)[number]

export const entityKinds = ['person', 'organization', 'achievement'] as const
export type EntityKind = (typeof entityKinds)[number]

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').$type<Role>().notNull(),
    contactPoint: text('contact_point').$type<ContactPointCode>(),
    specialty: text('specialty'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex('users_email_uq').on(t.email)],
)

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    tokenHash: text('token_hash').notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index('sessions_user_idx').on(t.userId), uniqueIndex('sessions_token_uq').on(t.tokenHash)],
)

export const cities = sqliteTable(
  'cities',
  {
    id: text('id').primaryKey(),
    nameAr: text('name_ar').notNull(),
    nameEn: text('name_en'),
    province: text('province'),
    contactPoint: text('contact_point').$type<ContactPointCode>().notNull(),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => [index('cities_cp_idx').on(t.contactPoint)],
)

export const sectors = sqliteTable('sectors', {
  id: text('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
})

export const entityTypes = sqliteTable('entity_types', {
  id: text('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
})

export const people = sqliteTable(
  'people',
  {
    id: text('id').primaryKey(),
    fullName: text('full_name').notNull(),
    specialty: text('specialty'),
    cityId: text('city_id').references(() => cities.id),
    bio: text('bio'),
    email: text('email'),
    phone: text('phone'),
    publishConsent: integer('publish_consent', { mode: 'boolean' }).notNull().default(false),
    status: text('status').$type<SubmissionStatus>().notNull().default('draft'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [index('people_city_idx').on(t.cityId), index('people_status_idx').on(t.status)],
)

export const organizations = sqliteTable(
  'organizations',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    entityTypeId: text('entity_type_id').references(() => entityTypes.id),
    cityId: text('city_id').references(() => cities.id),
    foundedYear: integer('founded_year'),
    scope: text('scope'),
    description: text('description'),
    website: text('website'),
    publishConsent: integer('publish_consent', { mode: 'boolean' }).notNull().default(false),
    status: text('status').$type<SubmissionStatus>().notNull().default('draft'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [index('orgs_city_idx').on(t.cityId), index('orgs_status_idx').on(t.status)],
)

export const achievements = sqliteTable(
  'achievements',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    periodStart: text('period_start'),
    periodEnd: text('period_end'),
    impactScope: text('impact_scope'),
    cityId: text('city_id').references(() => cities.id),
    personId: text('person_id').references(() => people.id),
    organizationId: text('organization_id').references(() => organizations.id),
    status: text('status').$type<SubmissionStatus>().notNull().default('draft'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [index('achievements_status_idx').on(t.status), index('achievements_city_idx').on(t.cityId)],
)

export const entitySectors = sqliteTable(
  'entity_sectors',
  {
    id: text('id').primaryKey(),
    entityKind: text('entity_kind').$type<EntityKind>().notNull(),
    entityId: text('entity_id').notNull(),
    sectorId: text('sector_id')
      .notNull()
      .references(() => sectors.id),
  },
  (t) => [index('entity_sectors_entity_idx').on(t.entityKind, t.entityId)],
)

export const submissions = sqliteTable(
  'submissions',
  {
    id: text('id').primaryKey(),
    trackingCode: text('tracking_code').notNull(),
    entityKind: text('entity_kind').$type<EntityKind>().notNull(),
    entityId: text('entity_id'),
    submitterName: text('submitter_name').notNull(),
    submitterEmail: text('submitter_email').notNull(),
    submitterPhone: text('submitter_phone'),
    payloadJson: text('payload_json').notNull(),
    status: text('status').$type<SubmissionStatus>().notNull().default('submitted'),
    contactPoint: text('contact_point').$type<ContactPointCode>(),
    assignedTo: text('assigned_to').references(() => users.id),
    reviewNote: text('review_note'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex('submissions_tracking_uq').on(t.trackingCode),
    index('submissions_status_idx').on(t.status),
    index('submissions_cp_idx').on(t.contactPoint),
  ],
)

export const evidence = sqliteTable(
  'evidence',
  {
    id: text('id').primaryKey(),
    entityKind: text('entity_kind').$type<EntityKind>().notNull(),
    entityId: text('entity_id').notNull(),
    submissionId: text('submission_id').references(() => submissions.id),
    r2Key: text('r2_key').notNull(),
    fileName: text('file_name').notNull(),
    contentType: text('content_type'),
    sizeBytes: integer('size_bytes'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index('evidence_entity_idx').on(t.entityKind, t.entityId)],
)

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    actorUserId: text('actor_user_id').references(() => users.id),
    action: text('action').notNull(),
    entityKind: text('entity_kind'),
    entityId: text('entity_id'),
    fromStatus: text('from_status'),
    toStatus: text('to_status'),
    note: text('note'),
    metaJson: text('meta_json'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index('audit_logs_entity_idx').on(t.entityKind, t.entityId)],
)
