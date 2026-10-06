import { type FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmailField } from '../components/form/EmailField'
import { TurkeyLocationFields } from '../components/form/TurkeyLocationFields'
import { api } from '../lib/api'
import { isValidEmail } from '../utils/email'

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
  const [entityKind, setEntityKind] = useState<'person' | 'organization' | 'achievement'>('person')
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')
  const [location, setLocation] = useState({ region: '', city: '' })
  const [consent, setConsent] = useState(false)
  const [trackingCode, setTrackingCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function resetForm() {
    setTrackingCode(null)
    setCopied(false)
    setError('')
    setTitle('')
    setDetails('')
    setSubmitterName('')
    setSubmitterEmail('')
    setLocation({ region: '', city: '' })
    setConsent(false)
    setEntityKind('person')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidEmail(submitterEmail)) {
      setError('البريد الإلكتروني غير صالح. اكتب الصيغة الصحيحة مثل: name@gmail.com')
      return
    }
    if (!consent) {
      setError('الموافقة على استخدام البيانات مطلوبة')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await api.submit({
        entityKind,
        submitterName,
        submitterEmail,
        region: location.region || undefined,
        city: location.city || undefined,
        consent: true,
        payload: {
          title,
          details,
          summary: details || title,
          country: 'TR',
          region: location.region || undefined,
          city: location.city || undefined,
        },
      })
      setTrackingCode(res.trackingCode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر الإرسال')
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    if (!trackingCode) return
    try {
      await navigator.clipboard.writeText(trackingCode)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        {trackingCode ? (
          <div className="surface p-6 sm:p-8">
            <p className="text-sm font-medium text-[var(--color-forest)]">تم استلام الطلب</p>
            <h1 className="display mt-2 text-3xl text-[var(--color-forest)] sm:text-4xl">احتفظ برمز التتبع</h1>
            <p className="mt-3 leading-relaxed text-[var(--color-muted)]">
              استخدم هذا الرمز لمتابعة حالة الطلب. لا يُنشر شيء للعموم قبل المراجعة.
            </p>
            <p className="mt-8 font-mono text-2xl tracking-[0.18em] text-[var(--color-ink)] sm:text-3xl">
              {trackingCode}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => void copyCode()}>
                {copied ? 'تم النسخ' : 'نسخ الرمز'}
              </button>
              <Link to={`/track?code=${encodeURIComponent(trackingCode)}`} className="btn-secondary">
                تتبع الطلب
              </Link>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                تقديم طلب آخر
              </button>
            </div>
          </div>
        ) : (
          <>
        <h1 className="display text-3xl text-[var(--color-forest)] sm:text-4xl">تقديم طلب توثيق</h1>
        <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
          أرسل بيانات أولية. ستمر عبر نقطة الاتصال ثم اللجنة قبل أي نشر عام.
        </p>

        <form onSubmit={onSubmit} className="surface mt-8 space-y-5 p-5 sm:p-7">
          <label className="label">
            نوع السجل
            <select
              className="field"
              value={entityKind}
              onChange={(e) => setEntityKind(e.target.value as typeof entityKind)}
            >
              <option value="person">كفاءة / شخص</option>
              <option value="organization">جهة / مؤسسة</option>
              <option value="achievement">منجز</option>
            </select>
          </label>

          <label className="label">
            الاسم / العنوان
            <input
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="label">
            التفاصيل
            <textarea
              className="field min-h-48 resize-y leading-relaxed"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="اكتب وصفاً واضحاً للمنجز أو الجهة أو الكفاءة: ماذا تم، أين، ومتى، وأثره."
              required
              rows={10}
            />
          </label>

          <TurkeyLocationFields value={location} onChange={setLocation} />

          <label className="label">
            اسم المقدّم
            <input
              className="field"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              required
            />
          </label>

          <EmailField
            id="submitter-email"
            label="بريد المقدّم"
            value={submitterEmail}
            onChange={setSubmitterEmail}
            required
          />

          <label className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-muted)]">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-[var(--color-forest)]"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            أوافق على معالجة البيانات لغرض التوثيق المؤسسي والمراجعة من قبل اللجنة والبعثة.
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
            {busy ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
          </button>
        </form>
          </>
        )}
      </div>
    </div>
  )
}

export function TrackPage() {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') ?? '')
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
    <div className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-lg">
        <h1 className="display text-3xl text-[var(--color-forest)] sm:text-4xl">تتبع الطلب</h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">أدخل رمز التتبع الذي وصلك بعد التقديم.</p>

        <form onSubmit={onSubmit} className="surface mt-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-stretch">
          <input
            className="field !mt-0 flex-1"
            placeholder="مثال: MJZ-XXXXXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary w-full sm:w-auto">
            بحث
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        {data ? (
          <div className="surface mt-6 space-y-3 p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[var(--color-muted)]">الرمز</span>
              <strong className="font-mono tracking-wide">{data.trackingCode}</strong>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[var(--color-muted)]">الحالة</span>
              <strong className="text-[var(--color-forest)]">
                {statusLabels[data.status] ?? data.status}
              </strong>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[var(--color-muted)]">النوع</span>
              <span>{data.entityKind}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[var(--color-muted)]">تاريخ التقديم</span>
              <span>{new Date(data.createdAt).toLocaleString('ar')}</span>
            </div>
            {data.reviewNote ? (
              <div className="rounded-lg bg-[var(--color-sand)] px-3 py-2">ملاحظة: {data.reviewNote}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
