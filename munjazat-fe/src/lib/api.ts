const API_BASE = (import.meta.env.VITE_MUNJAZAT_MS as string | undefined)?.replace(/\/$/, '') || ''

export type User = {
  id: string
  email: string
  name: string
  role: string
  contactPoint: string | null
}

export type CatalogAchievement = {
  id: string
  title: string
  description: string | null
  periodStart: string | null
  periodEnd: string | null
  impactScope: string | null
  cityId: string | null
  cityNameAr: string | null
  personName: string | null
  personSpecialty?: string | null
  organizationName: string | null
  createdAt?: string
}

export type CatalogPerson = {
  id: string
  fullName: string
  specialty: string | null
  bio: string | null
  cityId: string | null
  cityNameAr: string | null
}

export type CatalogOrganization = {
  id: string
  name: string
  description: string | null
  foundedYear: number | null
  scope: string | null
  website: string | null
  cityId: string | null
  cityNameAr: string | null
}

export type DirectoryItem = {
  id: string
  title: string
  status: string
  cityNameAr: string | null
  extra: string | null
  updatedAt: string
}

export type DashboardSubmission = {
  id: string
  trackingCode: string
  entityKind: string
  status: string
  contactPoint: string | null
  submitterName: string
  title: string
  region: string | null
  city: string | null
  createdAt: string
  updatedAt: string
}

export type DashboardSubmissionDetail = DashboardSubmission & {
  entityId: string | null
  submitterEmail: string | null
  submitterPhone: string | null
  reviewNote: string | null
  payload: Record<string, unknown>
  allowedStatuses: string[]
}

export type StaffUser = {
  id: string
  email: string
  name: string
  role: string
  contactPoint: string | null
  active: boolean
}

export type AuditItem = {
  id: string
  action: string
  fromStatus: string | null
  toStatus: string | null
  note: string | null
  createdAt: string
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
    request<{
      items: Array<{ id: string; nameAr: string; nameEn?: string | null; contactPoint: string }>
    }>('/api/taxonomies/cities'),
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
      queues: {
        submitted: number
        cpReview: number
        committeeReview: number
        needsInfo: number
        verified: number
      }
      recent: Array<{
        id: string
        trackingCode: string
        entityKind: string
        status: string
        contactPoint: string | null
        title: string
        createdAt: string
      }>
    }>('/api/dashboard/summary'),
  dashboardSubmissions: (params?: { status?: string; q?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.q) qs.set('q', params.q)
    const suffix = qs.toString() ? `?${qs}` : ''
    return request<{ items: DashboardSubmission[] }>(`/api/dashboard/submissions${suffix}`)
  },
  dashboardSubmission: (id: string) =>
    request<{ item: DashboardSubmissionDetail }>(`/api/dashboard/submissions/${encodeURIComponent(id)}`),
  reviewSubmission: (id: string, body: { status?: string; reviewNote?: string }) =>
    request<{ ok: boolean }>(`/api/dashboard/submissions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  dashboardDirectory: (params?: { kind?: string; q?: string }) => {
    const qs = new URLSearchParams()
    if (params?.kind) qs.set('kind', params.kind)
    if (params?.q) qs.set('q', params.q)
    const suffix = qs.toString() ? `?${qs}` : ''
    return request<{ items: DirectoryItem[] }>(`/api/dashboard/directory${suffix}`)
  },
  dashboardUsers: () => request<{ items: StaffUser[] }>('/api/dashboard/users'),
  dashboardAudit: () => request<{ items: AuditItem[] }>('/api/dashboard/audit'),
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
  catalogStats: () =>
    request<{ counts: { achievements: number; people: number; organizations: number } }>(
      '/api/catalog/stats',
    ),
  catalogAchievements: (params?: { q?: string; cityId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.cityId) qs.set('cityId', params.cityId)
    const suffix = qs.toString() ? `?${qs}` : ''
    return request<{ items: CatalogAchievement[] }>(`/api/catalog/achievements${suffix}`)
  },
  catalogAchievement: (id: string) =>
    request<{ item: CatalogAchievement }>(`/api/catalog/achievements/${encodeURIComponent(id)}`),
  catalogPeople: (params?: { q?: string; cityId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.cityId) qs.set('cityId', params.cityId)
    const suffix = qs.toString() ? `?${qs}` : ''
    return request<{ items: CatalogPerson[] }>(`/api/catalog/people${suffix}`)
  },
  catalogOrganizations: (params?: { q?: string; cityId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.cityId) qs.set('cityId', params.cityId)
    const suffix = qs.toString() ? `?${qs}` : ''
    return request<{ items: CatalogOrganization[] }>(`/api/catalog/organizations${suffix}`)
  },
  seedCatalogDemo: () =>
    request<{
      seeded: boolean
      message?: string
      counts?: { people: number; organizations: number; achievements: number }
      error?: string
    }>('/api/catalog/seed-demo', { method: 'POST' }),
}
