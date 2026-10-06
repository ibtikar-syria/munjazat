import { sign, verify } from 'hono/jwt'

export const AUTH_COOKIE = 'munjazat_session'
export const JWT_ISSUER = 'munjazat'
export const JWT_AUDIENCE = 'munjazat-staff'
export const JWT_ALG = 'HS256' as const
export const JWT_TTL_SECONDS = 60 * 60 * 8
export const JWT_SECRET_MIN_LENGTH = 32

type SessionClaims = {
  sub: string
  jti: string
  iss: string
  aud: string
  iat: number
  nbf: number
  exp: number
}

export function getJwtSecret(raw?: string): string | null {
  const secret = raw?.trim() ?? ''
  if (secret.length < JWT_SECRET_MIN_LENGTH) return null
  if (secret === 'delete-on-deployment' || secret === 'change-me-local-dev-secret') return null
  return secret
}

export async function signStaffJwt(secret: string, userId: string, sessionId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionClaims = {
    sub: userId,
    jti: sessionId,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    iat: now,
    nbf: now,
    exp: now + JWT_TTL_SECONDS,
  }
  return sign(payload, secret, JWT_ALG)
}

export async function verifyStaffJwt(token: string, secret: string): Promise<SessionClaims | null> {
  try {
    const payload = await verify(token, secret, {
      alg: JWT_ALG,
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      exp: true,
      nbf: true,
      iat: true,
    })

    if (typeof payload.sub !== 'string' || typeof payload.jti !== 'string') return null
    return {
      sub: payload.sub,
      jti: payload.jti,
      iss: String(payload.iss),
      aud: String(payload.aud),
      iat: Number(payload.iat),
      nbf: Number(payload.nbf),
      exp: Number(payload.exp),
    }
  } catch {
    return null
  }
}

export function readBearerToken(header: string | undefined): string | null {
  if (!header) return null
  const [scheme, token] = header.split(' ')
  if (!scheme || !token) return null
  if (scheme.toLowerCase() !== 'bearer') return null
  return token.trim() || null
}
