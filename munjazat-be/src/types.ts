export type Env = {
  DB: D1Database
  EVIDENCE: R2Bucket
  SESSIONS: KVNamespace
  APP_NAME: string
  ENVIRONMENT: string
  FRONTEND_BASE_URL?: string
  CORS_ALLOW_ORIGINS?: string
  SESSION_SECRET?: string
}

export type AppVariables = {
  user: {
    id: string
    email: string
    name: string
    role: string
    contactPoint: string | null
  } | null
}

export type AppEnv = {
  Bindings: Env
  Variables: AppVariables
}
