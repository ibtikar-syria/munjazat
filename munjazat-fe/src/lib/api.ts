const API_BASE = ''

export type User = {
  id: string
  email: string
  name: string
  role: string
  contactPoint: string | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'حدث خطأ غير متوقع')
  }
  return data as T
}

export const api = {
  health: () => request<{ ok: boolean; app: string }>('/api/health'),
  login: (email: string, password: string) =>
    request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('/api/auth/me'),
  bootstrapAdmin: () =>
    request<{ seeded: boolean; email?: string; password?: string; message?: string }>(
      '/api/auth/bootstrap-admin',
      { method: 'POST' },
    ),
  seedTaxonomies: () =>
    request<{ seeded: boolean; message?: string }>('/api/taxonomies/seed', { method: 'POST' }),
  cities: () =>
    request<{ items: Array<{ id: string; nameAr: string; contactPoint: string }> }>(
      '/api/taxonomies/cities',
    ),
  sectors: () =>
    request<{ items: Array<{ id: string; nameAr: string }> }>('/api/taxonomies/sectors'),
  dashboardSummary: () =>
    request<{
      counts: {
        people: number
        organizations: number
        achievements: number
        submissions: number
      }
      queues: { cpReview: number; committeeReview: number; needsInfo: number }
    }>('/api/dashboard/summary'),
  submit: (body: unknown) =>
    request<{ trackingCode: string; message: string }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  track: (code: string) =>
    request<{
      trackingCode: string
      status: string
      entityKind: string
      createdAt: string
      updatedAt: string
      reviewNote: string | null
    }>(`/api/submissions/track/${encodeURIComponent(code)}`),
}
