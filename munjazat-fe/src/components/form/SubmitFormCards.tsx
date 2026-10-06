import { EmailField } from './EmailField'
import { FormCard } from './FormCard'
import { TurkeyLocationFields } from './TurkeyLocationFields'

type EntityKind = 'person' | 'organization' | 'achievement'

export function SubmitRecordCard({
  entityKind,
  title,
  details,
  location,
  onEntityKind,
  onTitle,
  onDetails,
  onLocation,
}: {
  entityKind: EntityKind
  title: string
  details: string
  location: { region: string; city: string }
  onEntityKind: (value: EntityKind) => void
  onTitle: (value: string) => void
  onDetails: (value: string) => void
  onLocation: (value: { region: string; city: string }) => void
}) {
  return (
    <FormCard title="بيانات السجل">
      <label className="label">
        نوع السجل
        <select
          className="field"
          value={entityKind}
          onChange={(e) => onEntityKind(e.target.value as EntityKind)}
        >
          <option value="person">كفاءة / شخص</option>
          <option value="organization">جهة / مؤسسة</option>
          <option value="achievement">منجز</option>
        </select>
      </label>

      <label className="label">
        الاسم / العنوان
        <input className="field" value={title} onChange={(e) => onTitle(e.target.value)} required />
      </label>

      <label className="label">
        التفاصيل
        <textarea
          className="field min-h-48 resize-y leading-relaxed"
          value={details}
          onChange={(e) => onDetails(e.target.value)}
          placeholder="اكتب وصفاً واضحاً للمنجز أو الجهة أو الكفاءة: ماذا تم، أين، ومتى، وأثره."
          required
          rows={10}
        />
      </label>

      <TurkeyLocationFields value={location} onChange={onLocation} />
    </FormCard>
  )
}

export function SubmitEvidenceCard({
  linkDraft,
  relatedLinks,
  mediaFiles,
  mediaBytes,
  formatBytes,
  onLinkDraft,
  onAddLink,
  onRemoveLink,
  onAddMedia,
  onRemoveMedia,
}: {
  linkDraft: string
  relatedLinks: string[]
  mediaFiles: File[]
  mediaBytes: number
  formatBytes: (bytes: number) => string
  onLinkDraft: (value: string) => void
  onAddLink: () => void
  onRemoveLink: (url: string) => void
  onAddMedia: (files: FileList | null) => void
  onRemoveMedia: (file: File) => void
}) {
  return (
    <FormCard title="الشواهد">
      <div>
        <p className="label">روابط ذات صلة</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">أضف رابطاً واحداً في كل مرة (مقال، موقع، شهادة منشورة).</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            className="field !mt-0 flex-1"
            dir="ltr"
            placeholder="https://"
            value={linkDraft}
            onChange={(e) => onLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onAddLink()
              }
            }}
          />
          <button type="button" className="btn-secondary" onClick={onAddLink}>
            إضافة الرابط
          </button>
        </div>
        {relatedLinks.length ? (
          <ul className="mt-3 space-y-2">
            {relatedLinks.map((url) => (
              <li
                key={url}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-sand)] px-3 py-2 text-sm"
              >
                <a href={url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-[var(--color-forest)]" dir="ltr">
                  {url}
                </a>
                <button type="button" className="shrink-0 text-xs text-red-700" onClick={() => onRemoveLink(url)}>
                  حذف
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <p className="label">وسائط ذات صلة</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          صور، فيديو، صوت، أو مستندات. الحد الأقصى لمجموع الملفات 100 ميغابايت.
        </p>
        <input
          className="field"
          type="file"
          multiple
          onChange={(e) => {
            onAddMedia(e.target.files)
            e.target.value = ''
          }}
        />
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          {formatBytes(mediaBytes)} من 100 م.ب · {mediaFiles.length} ملف
        </p>
        {mediaFiles.length ? (
          <ul className="mt-3 space-y-2">
            {mediaFiles.map((file) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate">
                  {file.name}
                  <span className="mr-2 text-[var(--color-muted)]">{formatBytes(file.size)}</span>
                </span>
                <button type="button" className="shrink-0 text-xs text-red-700" onClick={() => onRemoveMedia(file)}>
                  حذف
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </FormCard>
  )
}

export function SubmitterCard({
  submitterName,
  submitterEmail,
  consent,
  onName,
  onEmail,
  onConsent,
}: {
  submitterName: string
  submitterEmail: string
  consent: boolean
  onName: (value: string) => void
  onEmail: (value: string) => void
  onConsent: (value: boolean) => void
}) {
  return (
    <FormCard title="بيانات المقدّم">
      <label className="label">
        اسم المقدّم
        <input className="field" value={submitterName} onChange={(e) => onName(e.target.value)} required />
      </label>

      <EmailField id="submitter-email" label="بريد المقدّم" value={submitterEmail} onChange={onEmail} required />

      <label className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-muted)]">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-[var(--color-forest)]"
          checked={consent}
          onChange={(e) => onConsent(e.target.checked)}
        />
        أوافق على معالجة البيانات لغرض التوثيق المؤسسي والمراجعة من قبل اللجنة والبعثة.
      </label>
    </FormCard>
  )
}
