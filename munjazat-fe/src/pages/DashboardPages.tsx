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
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-forest)]">
          مرحباً، {user?.name}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">ملخص تشغيلي أولي لمنصة منجزات</p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[var(--color-line)] bg-white p-4">
            <div className="text-sm text-[var(--color-muted)]">{card.label}</div>
            <div className="mt-2 text-3xl font-[family-name:var(--font-display)] text-[var(--color-forest)]">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <QueueCard title="مراجعة نقاط الاتصال" value={summary?.queues.cpReview ?? 0} />
        <QueueCard title="مراجعة اللجنة" value={summary?.queues.committeeReview ?? 0} />
        <QueueCard title="يحتاج استكمال" value={summary?.queues.needsInfo ?? 0} />
      </div>

      {user?.role === 'embassy_admin' ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-5">
          <h2 className="font-medium text-[var(--color-forest)]">تهيئة التصنيفات</h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            زرع القطاعات وأنواع الجهات والمدن الافتراضية لنقاط الاتصال الثلاث.
          </p>
          <button
            type="button"
            onClick={() => void seed()}
            className="mt-3 rounded-md border border-[var(--color-forest)] px-4 py-2 text-sm text-[var(--color-forest)]"
          >
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
    <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-white/70 p-4">
      <div className="text-sm text-[var(--color-muted)]">{title}</div>
      <div className="mt-2 text-2xl text-[var(--color-forest)]">{value}</div>
    </div>
  )
}

export function DashboardPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-white p-8">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-forest)]">
        {title}
      </h1>
      <p className="mt-3 text-[var(--color-muted)] max-w-2xl leading-relaxed">{body}</p>
      <p className="mt-6 text-sm text-[var(--color-gold)]">قيد البناء — المرحلة التالية من الخطة</p>
    </div>
  )
}
