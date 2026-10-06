import { type FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SubmitEvidenceCard, SubmitRecordCard, SubmitterCard } from '../components/form/SubmitFormCards'
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

const MAX_SUBMISSION_BYTES = 100 * 1024 * 1024
const MAX_MEDIA_FILES = 20
const MAX_RELATED_LINKS = 20

function parseHttpUrl(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null
    return url.toString()
  } catch {
    return null
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} بايت`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`
}

export function SubmitPage() {
  const [entityKind, setEntityKind] = useState<'person' | 'organization' | 'achievement'>('person')
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')
  const [location, setLocation] = useState({ region: '', city: '' })
  const [linkDraft, setLinkDraft] = useState('')
  const [relatedLinks, setRelatedLinks] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [consent, setConsent] = useState(false)
  const [trackingCode, setTrackingCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const mediaBytes = mediaFiles.reduce((sum, file) => sum + file.size, 0)

  function resetForm() {
    setTrackingCode(null)
    setCopied(false)
    setError('')
    setTitle('')
    setDetails('')
    setSubmitterName('')
    setSubmitterEmail('')
    setLocation({ region: '', city: '' })
    setLinkDraft('')
    setRelatedLinks([])
    setMediaFiles([])
    setConsent(false)
    setEntityKind('person')
  }

  function addRelatedLink() {
    const url = parseHttpUrl(linkDraft)
    if (!url) {
      setError('أدخل رابطاً صالحاً يبدأ بـ http أو https')
      return
    }
    if (relatedLinks.includes(url)) {
      setLinkDraft('')
      return
    }
    if (relatedLinks.length >= MAX_RELATED_LINKS) {
      setError(`يمكن إضافة ${MAX_RELATED_LINKS} رابطاً كحد أقصى`)
      return
    }
    setError('')
    setRelatedLinks((current) => [...current, url])
    setLinkDraft('')
  }

  function addMedia(list: FileList | null) {
    if (!list?.length) return
    const next = [...mediaFiles]
    for (const file of Array.from(list)) {
      if (next.some((item) => item.name === file.name && item.size === file.size)) continue
      if (next.length >= MAX_MEDIA_FILES) {
        setError(`يمكن إرفاق ${MAX_MEDIA_FILES} ملفاً كحد أقصى`)
        break
      }
      const total = next.reduce((sum, item) => sum + item.size, 0) + file.size
      if (total > MAX_SUBMISSION_BYTES) {
        setError('حجم الملفات مجتمعة يتجاوز 100 ميغابايت')
        break
      }
      next.push(file)
    }
    setMediaFiles(next)
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
    if (mediaBytes > MAX_SUBMISSION_BYTES) {
      setError('حجم الملفات مجتمعة يتجاوز 100 ميغابايت')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await api.submit(
        {
          entityKind,
          submitterName,
          submitterEmail,
          region: location.region || undefined,
          city: location.city || undefined,
          consent: true,
          relatedLinks,
          payload: {
            title,
            details,
            summary: details || title,
            country: 'TR',
            region: location.region || undefined,
            city: location.city || undefined,
            relatedLinks,
          },
        },
        mediaFiles,
      )
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

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <SubmitRecordCard
            entityKind={entityKind}
            title={title}
            details={details}
            location={location}
            onEntityKind={setEntityKind}
            onTitle={setTitle}
            onDetails={setDetails}
            onLocation={setLocation}
          />
          <SubmitEvidenceCard
            linkDraft={linkDraft}
            relatedLinks={relatedLinks}
            mediaFiles={mediaFiles}
            mediaBytes={mediaBytes}
            formatBytes={formatBytes}
            onLinkDraft={setLinkDraft}
            onAddLink={addRelatedLink}
            onRemoveLink={(url) => setRelatedLinks((current) => current.filter((item) => item !== url))}
            onAddMedia={addMedia}
            onRemoveMedia={(file) => setMediaFiles((current) => current.filter((item) => item !== file))}
          />
          <SubmitterCard
            submitterName={submitterName}
            submitterEmail={submitterEmail}
            consent={consent}
            onName={setSubmitterName}
            onEmail={setSubmitterEmail}
            onConsent={setConsent}
          />

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
