import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'
import { contactPointLabels, entityKindLabels, formatDate, statusLabels } from '../lib/labels'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="p-8 text-[var(--color-muted)]">جاري التحميل…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function DashboardHome() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<{
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
  } | null>(null)
  const [seedMsg, setSeedMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void api
      .dashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر تحميل الملخص'))
  }, [])

  async function seed() {
    try {
      const res = await api.seedTaxonomies()
      setSeedMsg(res.seeded ? 'تم زرع التصنيفات والمدن' : res.message || 'موجودة مسبقاً')
    } catch (err) {
      setSeedMsg(err instanceof Error ? err.message : 'فشل الزرع')
    }
  }

  const cards = [
    { label: 'كفاءات', value: summary?.counts.people ?? '—', to: '/dashboard/directory?kind=people' },
    { label: 'جهات', value: summary?.counts.organizations ?? '—', to: '/dashboard/directory?kind=organizations' },
    { label: 'منجزات', value: summary?.counts.achievements ?? '—', to: '/dashboard/directory?kind=achievements' },
    { label: 'طلبات', value: summary?.counts.submissions ?? '—', to: '/dashboard/queue' },
  ]

  const queues = [
    { title: 'مُقدَّم', value: summary?.queues.submitted ?? 0, status: 'submitted' },
    { title: 'نقاط الاتصال', value: summary?.queues.cpReview ?? 0, status: 'cp_review' },
    { title: 'اللجنة', value: summary?.queues.committeeReview ?? 0, status: 'committee_review' },
    { title: 'يحتاج استكمال', value: summary?.queues.needsInfo ?? 0, status: 'needs_info' },
    { title: 'موثَّق بانتظار النشر', value: summary?.queues.verified ?? 0, status: 'verified' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="display text-2xl text-[var(--color-forest)] sm:text-3xl">مرحباً، {user?.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          راجع الطلبات، حدّث حالتها، وانشر السجلات المعتمدة في الدليل العام.
        </p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="surface p-4 sm:p-5 transition hover:border-[var(--color-forest)]/30">
            <div className="text-xs text-[var(--color-muted)] sm:text-sm">{card.label}</div>
            <div className="display mt-2 text-2xl text-[var(--color-forest)] sm:text-3xl">{card.value}</div>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-medium text-[var(--color-forest)]">الطوابير</h2>
          <Link to="/dashboard/queue" className="text-sm text-[var(--color-forest)] hover:underline">
            فتح الطابور
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {queues.map((queue) => (
            <Link
              key={queue.status}
              to={`/dashboard/queue?status=${queue.status}`}
              className="rounded-2xl border border-[var(--color-line)] bg-white p-4 transition hover:border-[var(--color-forest)]/40"
            >
              <div className="text-sm text-[var(--color-muted)]">{queue.title}</div>
              <div className="mt-2 text-2xl text-[var(--color-forest)]">{queue.value}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-4 py-3 sm:px-5">
          <h2 className="font-medium text-[var(--color-forest)]">أحدث الطلبات</h2>
        </div>
        {summary?.recent.length ? (
          <ul className="divide-y divide-[var(--color-line)]">
            {summary.recent.map((row) => (
              <li key={row.id}>
                <Link
                  to={`/dashboard/queue/${row.id}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-[var(--color-sand)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div>
                    <div className="font-medium text-[var(--color-ink)]">{row.title}</div>
                    <div className="mt-0.5 text-xs text-[var(--color-muted)]">
                      {row.trackingCode} · {entityKindLabels[row.entityKind] ?? row.entityKind}
                      {row.contactPoint ? ` · ${contactPointLabels[row.contactPoint] ?? row.contactPoint}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="rounded-full bg-[var(--color-sand)] px-2.5 py-1 text-xs text-[var(--color-forest)]">
                      {statusLabels[row.status] ?? row.status}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">{formatDate(row.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-sm text-[var(--color-muted)] sm:px-5">لا توجد طلبات بعد.</p>
        )}
      </div>

      {user?.role === 'embassy_admin' ? (
        <div className="surface p-5 sm:p-6">
          <h2 className="font-medium text-[var(--color-forest)]">تهيئة التصنيفات</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            زرع القطاعات وأنواع الجهات ومحافظات تركيا لنقاط الاتصال الثلاث.
          </p>
          <button type="button" onClick={() => void seed()} className="btn-secondary mt-4 !text-[var(--color-forest)]">
            زرع البيانات الأساسية
          </button>
          {seedMsg ? <p className="mt-2 text-sm text-[var(--color-muted)]">{seedMsg}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
