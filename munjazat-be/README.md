# Munjazat Backend

Hono API on Cloudflare Workers with D1 and R2.

## Local setup

```bash
npm install
npm run db:migrate:local
npm run dev
```

API listens on `http://127.0.0.1:8787`.

Copy `.dev.vars.example` to `.dev.vars` and set `JWT_SECRET` to a long random string (`openssl rand -base64 48`). Do not commit `.dev.vars`.

On Cloudflare, store the same name as a Worker secret (`JWT_SECRET`), matching VMS. GitHub Environments should define secret `JWT_SECRET`, not a public variable.

### Useful endpoints

- `GET /api/health`
- `POST /api/auth/bootstrap-admin` (dev only)
- `POST /api/auth/login`
- `POST /api/taxonomies/seed` (admin)
- `POST /api/submissions`
- `GET /api/dashboard/summary` (auth)

Default admin after bootstrap: `admin@munjazat.local` / `Admin123!`
