import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, type DashboardSubmission, type DashboardSubmissionDetail } from '../lib/api'
import { contactPointLabels, entityKindLabels, formatDate, statusLabels } from '../lib/labels'

const STATUS_TABS = [
  { id: '', label: 'الكل' },
  { id: 'submitted', label: 'مُقدَّم' },
  { id: 'cp_review', label: 'نقطة الاتصال' },
  { id: 'needs_info', label: 'استكمال' },
  { id: 'committee_review', label: 'اللجنة' },
  { id: 'verified', label: 'موثَّق' },
  { id: 'published', label: 'منشور' },
  { id: 'rejected', label: 'مرفوض' },
]

export function QueuePage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const status = searchParams.get('status') ?? ''
  const [q, setQ] = useState('')
  const [items, setItems] = useState<DashboardSubmission[]>([])
  const [detail, setDetail] = useState<DashboardSubmissionDetail | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const query = useMemo(() => ({ status: status || undefined, q: q.trim() || undefined }), [status, q])

  useEffect(() => {
    void api
      .dashboardSubmissions(query)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر تحميل الطابور'))
  }, [query.status, query.q])

  useEffect(() => {
    if (!id) {
      setDetail(null)
      setNote('')
      return
    }
    void api
      .dashboardSubmission(id)
      .then((res) => {
        setDetail(res.item)
        setNote(res.item.reviewNote ?? '')
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر فتح الطلب'))
  }, [id])

  async function applyStatus(next: string) {
    if (!detail) return
    setBusy(true)
    setError('')
    try {
      await api.reviewSubmission(detail.id, { status: next, reviewNote: note || undefined })
      const [list, item] = await Promise.all([
        api.dashboardSubmissions(query),
        api.dashboardSubmission(detail.id),
      ])
      setItems(list.items)
      setDetail(item.item)
      setNote(item.item.reviewNote ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تحديث الحالة')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="display text-2xl text-[var(--color-forest)] sm:text-3xl">طوابير المراجعة</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">افتح طلباً، راجع التفاصيل، ثم انقل حالته في المسار.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => {
            const active = status === tab.id
            return (
              <button
                key={tab.id || 'all'}
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  if (tab.id) next.set('status', tab.id)
                  else next.delete('status')
                  setSearchParams(next)
                }}
                className={`rounded-full px-3 py-1.5 text-xs sm:text-sm ${
                  active
                    ? 'bg-[var(--color-forest)] text-white'
                    : 'bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <input
          className="field !mt-0 sm:mr-auto sm:max-w-xs"
          placeholder="بحث بالرمز أو الاسم…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="surface overflow-hidden">
          {items.length ? (
            <ul className="divide-y divide-[var(--color-line)]">
              {items.map((item) => {
                const active = item.id === id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/queue/${item.id}${status ? `?status=${status}` : ''}`)}
                      className={`w-full px-4 py-3 text-right transition sm:px-5 ${
                        active ? 'bg-[var(--color-sand)]' : 'hover:bg-[var(--color-sand)]/70'
                      }`}
                    >
                      <div className="font-medium text-[var(--color-ink)]">{item.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                        <span>{item.trackingCode}</span>
                        <span>{entityKindLabels[item.entityKind] ?? item.entityKind}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[var(--color-forest)]">
                          {statusLabels[item.status] ?? item.status}
                        </span>
                        {item.contactPoint ? <span>{contactPointLabels[item.contactPoint]}</span> : null}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-sm text-[var(--color-muted)]">لا توجد طلبات في هذا التصفية.</p>
          )}
        </div>

        <div className="surface p-4 sm:p-5">
          {detail ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[var(--color-muted)]">{detail.trackingCode}</div>
                <h2 className="display mt-1 text-xl text-[var(--color-forest)]">{detail.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {entityKindLabels[detail.entityKind]} · {statusLabels[detail.status]}
                  {detail.contactPoint ? ` · ${contactPointLabels[detail.contactPoint]}` : ''}
                </p>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-[var(--color-muted)]">المقدّم</dt>
                  <dd>{detail.submitterName}</dd>
                </div>
                {detail.submitterEmail ? (
                  <div>
                    <dt className="text-[var(--color-muted)]">البريد</dt>
                    <dd dir="ltr" className="text-left">
                      {detail.submitterEmail}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[var(--color-muted)]">الموقع</dt>
                  <dd>
                    {typeof detail.payload.region === 'string' ? detail.payload.region : '—'}
                    {typeof detail.payload.city === 'string' ? ` / ${detail.payload.city}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">التفاصيل</dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-relaxed">
                    {typeof detail.payload.details === 'string'
                      ? detail.payload.details
                      : typeof detail.payload.summary === 'string'
                        ? detail.payload.summary
                        : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">تاريخ التقديم</dt>
                  <dd>{formatDate(detail.createdAt)}</dd>
                </div>
              </dl>

              <label className="label">
                ملاحظة المراجعة
                <textarea
                  className="field min-h-24"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="تظهر للمقدّم إذا طُلب استكمال"
                />
              </label>

              {detail.allowedStatuses.length ? (
                <div className="flex flex-wrap gap-2">
                  {detail.allowedStatuses.map((next) => (
                    <button
                      key={next}
                      type="button"
                      disabled={busy}
                      onClick={() => void applyStatus(next)}
                      className={
                        next === 'published'
                          ? 'btn-gold !px-3 !py-2 !text-xs'
                          : next === 'rejected'
                            ? 'btn-secondary !px-3 !py-2 !text-xs !text-red-700'
                            : 'btn-secondary !px-3 !py-2 !text-xs !text-[var(--color-forest)]'
                      }
                    >
                      {statusLabels[next] ?? next}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">لا توجد إجراءات متاحة لدورك على هذه الحالة.</p>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--color-muted)]">اختر طلباً من القائمة لمراجعته.</p>
          )}
        </div>
      </div>
    </div>
  )
}
