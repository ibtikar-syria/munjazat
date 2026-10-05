# Munjazat Backend

Hono API on Cloudflare Workers with D1 and R2.

## Local setup

```bash
npm install
npm run db:migrate:local
npm run dev
```

API listens on `http://127.0.0.1:8787`.

### Useful endpoints

- `GET /api/health`
- `POST /api/auth/bootstrap-admin` (dev only)
- `POST /api/auth/login`
- `POST /api/taxonomies/seed` (admin)
- `POST /api/submissions`
- `GET /api/dashboard/summary` (auth)

Default admin after bootstrap: `admin@munjazat.local` / `Admin123!`
