import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { loadSession } from './lib/auth'
import { authRoutes } from './routes/auth'
import { taxonomyRoutes } from './routes/taxonomies'
import { dashboardRoutes } from './routes/dashboard'
import { submissionRoutes } from './routes/submissions'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: (origin) => origin || 'http://localhost:5173',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)
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

app.notFound((c) => c.json({ error: 'المسار غير موجود' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'خطأ داخلي في الخادم' }, 500)
})

export default app
