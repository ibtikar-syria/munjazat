import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

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
    queues: { cpReview: number; committeeReview: number; needsInfo: number }
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
    { label: 'كفاءات', value: summary?.counts.people ?? '—' },
    { label: 'جهات', value: summary?.counts.organizations ?? '—' },
    { label: 'منجزات', value: summary?.counts.achievements ?? '—' },
    { label: 'طلبات', value: summary?.counts.submissions ?? '—' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="display text-2xl text-[var(--color-forest)] sm:text-3xl">مرحباً، {user?.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">ملخص تشغيلي أولي لمنصة منجزات</p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {cards.map((card) => (
          <div key={card.label} className="surface p-4 sm:p-5">
            <div className="text-xs text-[var(--color-muted)] sm:text-sm">{card.label}</div>
            <div className="display mt-2 text-2xl text-[var(--color-forest)] sm:text-3xl">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <QueueCard title="مراجعة نقاط الاتصال" value={summary?.queues.cpReview ?? 0} />
        <QueueCard title="مراجعة اللجنة" value={summary?.queues.committeeReview ?? 0} />
        <QueueCard title="يحتاج استكمال" value={summary?.queues.needsInfo ?? 0} />
      </div>

      {user?.role === 'embassy_admin' ? (
        <div className="surface p-5 sm:p-6">
          <h2 className="font-medium text-[var(--color-forest)]">تهيئة التصنيفات</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            زرع القطاعات وأنواع الجهات والمدن الافتراضية لنقاط الاتصال الثلاث.
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

function QueueCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-white/80 p-4 sm:p-5">
      <div className="text-sm text-[var(--color-muted)]">{title}</div>
      <div className="mt-2 text-2xl text-[var(--color-forest)]">{value}</div>
    </div>
  )
}

export function DashboardPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface mx-auto max-w-3xl p-6 sm:p-8">
      <h1 className="display text-2xl text-[var(--color-forest)] sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-[var(--color-muted)]">{body}</p>
      <p className="mt-6 text-sm text-[var(--color-gold)]">قيد البناء — المرحلة التالية من الخطة</p>
    </div>
  )
}
