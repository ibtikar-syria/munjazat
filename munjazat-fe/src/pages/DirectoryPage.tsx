import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, type DirectoryItem } from '../lib/api'
import { formatDate, statusLabels } from '../lib/labels'

const KINDS = [
  { id: 'achievements', label: 'المنجزات' },
  { id: 'people', label: 'الكفاءات' },
  { id: 'organizations', label: 'الجهات' },
] as const

export function DirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const kind = (searchParams.get('kind') as (typeof KINDS)[number]['id']) || 'achievements'
  const [q, setQ] = useState('')
  const [items, setItems] = useState<DirectoryItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    void api
      .dashboardDirectory({ kind, q: q.trim() || undefined })
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر تحميل الدليل'))
  }, [kind, q])

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="display text-2xl text-[var(--color-forest)] sm:text-3xl">الدليل الداخلي</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">كل السجلات بعد التوثيق أو أثناء المسار، بما فيها غير المنشورة.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams({ kind: tab.id })}
              className={`rounded-full px-3 py-1.5 text-sm ${
                kind === tab.id
                  ? 'bg-[var(--color-forest)] text-white'
                  : 'bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          className="field !mt-0 sm:mr-auto sm:max-w-xs"
          placeholder="بحث…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="bg-[var(--color-sand)] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3 text-right font-medium">العنوان</th>
              <th className="px-4 py-3 text-right font-medium">المدينة</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">آخر تحديث</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--color-ink)]">{item.title}</div>
                  {item.extra ? <div className="text-xs text-[var(--color-muted)]">{item.extra}</div> : null}
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{item.cityNameAr || '—'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[var(--color-sand)] px-2 py-1 text-xs text-[var(--color-forest)]">
                    {statusLabels[item.status] ?? item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{formatDate(item.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length ? <p className="px-4 py-8 text-sm text-[var(--color-muted)]">لا توجد سجلات بعد. انشر طلباً موثّقاً من الطابور.</p> : null}
      </div>
    </div>
  )
}
