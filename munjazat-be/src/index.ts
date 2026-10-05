import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { loadSession } from './lib/auth'
import { authRoutes } from './routes/auth'
import { taxonomyRoutes } from './routes/taxonomies'
import { dashboardRoutes } from './routes/dashboard'
import { submissionRoutes } from './routes/submissions'
import { catalogRoutes } from './routes/catalog'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

app.use('*', logger())
app.use('*', async (c, next) => {
  const allowed = (c.env.CORS_ALLOW_ORIGINS || c.env.FRONTEND_BASE_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const corsMiddleware = cors({
    origin: (origin) => {
      if (!origin) return allowed[0] || 'http://localhost:5173'
      return allowed.includes(origin) ? origin : allowed[0] || 'http://localhost:5173'
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })

  return corsMiddleware(c, next)
})
app.use('*', loadSession)

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    app: c.env.APP_NAME ?? 'منجزات',
    environment: c.env.ENVIRONMENT ?? 'development',
  }),
)

app.route('/api/auth', authRoutes)
app.route('/api/taxonomies', taxonomyRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/submissions', submissionRoutes)
app.route('/api/catalog', catalogRoutes)

app.notFound((c) => c.json({ error: 'المسار غير موجود' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'خطأ داخلي في الخادم' }, 500)
})

export default app
