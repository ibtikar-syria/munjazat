import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { api, type AuditItem, type StaffUser } from '../lib/api'
import { contactPointLabels, formatDate, roleLabels, statusLabels } from '../lib/labels'

export function GovernancePage() {
  const { user } = useAuth()
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [audit, setAudit] = useState<AuditItem[]>([])
  const [error, setError] = useState('')

  const allowed = user?.role === 'embassy_admin' || user?.role === 'committee_chair'

  useEffect(() => {
    if (!allowed) return
    void Promise.all([api.dashboardUsers(), api.dashboardAudit()])
      .then(([usersRes, auditRes]) => {
        setStaff(usersRes.items)
        setAudit(auditRes.items)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر تحميل الحوكمة'))
  }, [allowed])

  if (!allowed) {
    return (
      <div className="surface mx-auto max-w-2xl p-6">
        <h1 className="display text-2xl text-[var(--color-forest)]">الحوكمة</h1>
        <p className="mt-3 text-[var(--color-muted)]">هذا القسم لمدير البعثة ورئيس اللجنة فقط.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="display text-2xl text-[var(--color-forest)] sm:text-3xl">الحوكمة</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">المستخدمون الداخليون وسجل تغيير حالات الطلبات.</p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <section className="surface overflow-x-auto">
        <h2 className="border-b border-[var(--color-line)] px-4 py-3 font-medium text-[var(--color-forest)]">
          المستخدمون
        </h2>
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-2 text-right font-medium">الاسم</th>
              <th className="px-4 py-2 text-right font-medium">البريد</th>
              <th className="px-4 py-2 text-right font-medium">الدور</th>
              <th className="px-4 py-2 text-right font-medium">نقطة الاتصال</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {staff.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3" dir="ltr">
                  {item.email}
                </td>
                <td className="px-4 py-3">{roleLabels[item.role] ?? item.role}</td>
                <td className="px-4 py-3">
                  {item.contactPoint ? contactPointLabels[item.contactPoint] : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="surface overflow-x-auto">
        <h2 className="border-b border-[var(--color-line)] px-4 py-3 font-medium text-[var(--color-forest)]">
          سجل التدقيق
        </h2>
        {audit.length ? (
          <ul className="divide-y divide-[var(--color-line)] text-sm">
            {audit.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <div>
                  {item.fromStatus ? statusLabels[item.fromStatus] ?? item.fromStatus : '—'}
                  {' → '}
                  {item.toStatus ? statusLabels[item.toStatus] ?? item.toStatus : '—'}
                </div>
                <div className="mt-1 text-xs text-[var(--color-muted)]">
                  {formatDate(item.createdAt)}
                  {item.note ? ` · ${item.note}` : ''}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-sm text-[var(--color-muted)]">لا توجد أحداث تدقيق بعد.</p>
        )}
      </section>
    </div>
  )
}
