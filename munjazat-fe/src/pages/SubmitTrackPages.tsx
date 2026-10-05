import { type FormEvent, useEffect, useState } from 'react'
import { api } from '../lib/api'

type City = { id: string; nameAr: string; contactPoint: string }

const statusLabels: Record<string, string> = {
  submitted: 'مُقدَّم',
  cp_review: 'مراجعة نقطة الاتصال',
  needs_info: 'يحتاج استكمال',
  committee_review: 'مراجعة اللجنة',
  verified: 'موثَّق',
  published: 'منشور',
  rejected: 'مرفوض',
}

export function SubmitPage() {
  const [cities, setCities] = useState<City[]>([])
  const [entityKind, setEntityKind] = useState<'person' | 'organization' | 'achievement'>('person')
  const [title, setTitle] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')
  const [cityId, setCityId] = useState('')
  const [consent, setConsent] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void api.cities().then((res) => setCities(res.items)).catch(() => setCities([]))
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!consent) {
      setError('الموافقة على استخدام البيانات مطلوبة')
      return
    }
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const res = await api.submit({
        entityKind,
        submitterName,
        submitterEmail,
        cityId: cityId || undefined,
        consent: true,
        payload: {
          title,
          summary: title,
        },
      })
      setResult(`رمز التتبع: ${res.trackingCode}`)
      setTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر الإرسال')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-forest)]">
        تقديم طلب توثيق
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        أرسل بيانات أولية. ستمر عبر نقطة الاتصال ثم اللجنة قبل أي نشر عام.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-[var(--color-line)] bg-white p-6">
        <label className="block text-sm">
          نوع السجل
          <select
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2"
            value={entityKind}
            onChange={(e) => setEntityKind(e.target.value as typeof entityKind)}
          >
            <option value="person">كفاءة / شخص</option>
            <option value="organization">جهة / مؤسسة</option>
            <option value="achievement">منجز</option>
          </select>
        </label>
        <label className="block text-sm">
          الاسم / العنوان
          <input
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          المدينة
          <select
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            <option value="">— اختياري —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr}
              </option>
            ))}
          </select>
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block text-sm">
            اسم المقدّم
            <input
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            بريد المقدّم
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2"
              value={submitterEmail}
              onChange={(e) => setSubmitterEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          أوافق على معالجة البيانات لغرض التوثيق المؤسسي والمراجعة من قبل اللجنة والبعثة.
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {result ? <p className="text-sm text-[var(--color-forest)] font-medium">{result}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-[var(--color-forest)] px-5 py-2.5 text-white disabled:opacity-60"
        >
          إرسال الطلب
        </button>
      </form>
    </div>
  )
}

export function TrackPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [data, setData] = useState<{
    trackingCode: string
    status: string
    entityKind: string
    createdAt: string
    reviewNote: string | null
  } | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setData(null)
    try {
      const res = await api.track(code.trim())
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر التتبع')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-forest)]">
        تتبع الطلب
      </h1>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          className="flex-1 rounded-md border border-[var(--color-line)] px-3 py-2 bg-white"
          placeholder="مثال: MJZ-XXXXXXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit" className="rounded-md bg-[var(--color-forest)] px-4 text-white">
          بحث
        </button>
      </form>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {data ? (
        <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-white p-5 space-y-2 text-sm">
          <div>
            الرمز: <strong>{data.trackingCode}</strong>
          </div>
          <div>
            الحالة: <strong>{statusLabels[data.status] ?? data.status}</strong>
          </div>
          <div>النوع: {data.entityKind}</div>
          <div>تاريخ التقديم: {new Date(data.createdAt).toLocaleString('ar')}</div>
          {data.reviewNote ? <div>ملاحظة: {data.reviewNote}</div> : null}
        </div>
      ) : null}
    </div>
  )
}
