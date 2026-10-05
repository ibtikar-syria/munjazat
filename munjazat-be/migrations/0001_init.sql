-- Migration: initial Munjazat schema
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  contact_point TEXT,
  specialty TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX users_email_uq ON users(email);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX sessions_user_idx ON sessions(user_id);
CREATE UNIQUE INDEX sessions_token_uq ON sessions(token_hash);

CREATE TABLE cities (
  id TEXT PRIMARY KEY NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  province TEXT,
  contact_point TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX cities_cp_idx ON cities(contact_point);

CREATE TABLE sectors (
  id TEXT PRIMARY KEY NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE entity_types (
  id TEXT PRIMARY KEY NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE people (
  id TEXT PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL,
  specialty TEXT,
  city_id TEXT REFERENCES cities(id),
  bio TEXT,
  email TEXT,
  phone TEXT,
  publish_consent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX people_city_idx ON people(city_id);
CREATE INDEX people_status_idx ON people(status);

CREATE TABLE organizations (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  entity_type_id TEXT REFERENCES entity_types(id),
  city_id TEXT REFERENCES cities(id),
  founded_year INTEGER,
  scope TEXT,
  description TEXT,
  website TEXT,
  publish_consent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX orgs_city_idx ON organizations(city_id);
CREATE INDEX orgs_status_idx ON organizations(status);

CREATE TABLE achievements (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  period_start TEXT,
  period_end TEXT,
  impact_scope TEXT,
  city_id TEXT REFERENCES cities(id),
  person_id TEXT REFERENCES people(id),
  organization_id TEXT REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX achievements_status_idx ON achievements(status);
CREATE INDEX achievements_city_idx ON achievements(city_id);

CREATE TABLE entity_sectors (
  id TEXT PRIMARY KEY NOT NULL,
  entity_kind TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  sector_id TEXT NOT NULL REFERENCES sectors(id)
);
CREATE INDEX entity_sectors_entity_idx ON entity_sectors(entity_kind, entity_id);

CREATE TABLE submissions (
  id TEXT PRIMARY KEY NOT NULL,
  tracking_code TEXT NOT NULL,
  entity_kind TEXT NOT NULL,
  entity_id TEXT,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  submitter_phone TEXT,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  contact_point TEXT,
  assigned_to TEXT REFERENCES users(id),
  review_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX submissions_tracking_uq ON submissions(tracking_code);
CREATE INDEX submissions_status_idx ON submissions(status);
CREATE INDEX submissions_cp_idx ON submissions(contact_point);

CREATE TABLE evidence (
  id TEXT PRIMARY KEY NOT NULL,
  entity_kind TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  submission_id TEXT REFERENCES submissions(id),
  r2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX evidence_entity_idx ON evidence(entity_kind, entity_id);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  actor_user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_kind TEXT,
  entity_id TEXT,
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  meta_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX audit_logs_entity_idx ON audit_logs(entity_kind, entity_id);
