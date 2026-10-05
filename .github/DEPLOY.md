# GitHub Actions / Cloudflare deploy notes for Munjazat
# Pattern adapted from https://github.com/ibtikar-org-tr/vms

## Environments

Create GitHub Environments: `dev` and `main`.

## Secrets (per environment)

| Name | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Wrangler deploy + D1 migrate |
| `SESSION_SECRET` | Backend session signing (like VMS `JWT_SECRET`) |

## Variables (per environment)

| Name | Example / notes |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account id |
| `THIS_APP_NAME_BE` | Worker name on **main** (e.g. `munjazat-be`) |
| `THIS_APP_NAME_FE` | Worker/Pages name on **main** (e.g. `munjazat-fe`) |
| `MUNJAZAT_DB_ID` | D1 database id |
| `MUNJAZAT_DB_NAME` | D1 database name (e.g. `munjazat`) |
| `BUCKET_NAME` | R2 evidence bucket name |
| `SESSIONS_KV_ID` | KV namespace id for sessions |
| `APP_NAME` | `منجزات` |
| `ENVIRONMENT` | `development` or `production` |
| `FRONTEND_BASE_URL` | Public site URL |
| `CORS_ALLOW_ORIGINS` | Comma-separated origins allowed by API |
| `VITE_MUNJAZAT_MS` | Public API base URL baked into frontend (like VMS `VITE_MEMBER_MS`) |
| `VITE_BASE_PATH` | Usually `/` |
| `VITE_SITE_URL` | Canonical frontend URL |

## Dev worker names (hardcoded like VMS)

- Backend: `munjazat-be-dev`
- Frontend: `munjazat-fe-dev`

## Workflows

- `backend-dev.yml` / `backend-main.yml` — deploy API + apply D1 migrations
- `frontend-dev.yml` / `frontend-main.yml` — build Vite + deploy assets worker
- `db-dev.yml` / `db-main.yml` — migrations-only (on `munjazat-be/migrations/**`)
