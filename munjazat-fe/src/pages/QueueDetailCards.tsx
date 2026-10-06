import { FormCard } from '../components/form/FormCard'
import type { DashboardSubmissionDetail } from '../lib/api'
import { contactPointLabels, entityKindLabels, formatDate, statusLabels } from '../lib/labels'

export function QueueHeaderCard({ detail }: { detail: DashboardSubmissionDetail }) {
  return (
    <section className="surface space-y-2 p-5 sm:p-7">
      <p className="form-section-title">الطلب</p>
      <p className="text-xs text-[var(--color-muted)]">{detail.trackingCode}</p>
      <p className="text-base font-medium text-[var(--color-ink)]">{detail.title}</p>
      <p className="text-sm text-[var(--color-muted)]">
        {entityKindLabels[detail.entityKind]} · {statusLabels[detail.status]}
        {detail.contactPoint ? ` · ${contactPointLabels[detail.contactPoint]}` : ''}
      </p>
    </section>
  )
}

export function QueueRecordCard({ detail }: { detail: DashboardSubmissionDetail }) {
  return (
    <FormCard title="بيانات السجل">
      <dl className="space-y-3 text-sm">
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
      </dl>
    </FormCard>
  )
}

export function QueueEvidenceCard({ detail }: { detail: DashboardSubmissionDetail }) {
  const links = Array.isArray(detail.payload.relatedLinks)
    ? detail.payload.relatedLinks.filter((item): item is string => typeof item === 'string')
    : []

  return (
    <FormCard title="الشواهد">
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-[var(--color-muted)]">روابط ذات صلة</dt>
          <dd className="mt-1 space-y-1">
            {links.length ? (
              links.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-[var(--color-forest)] underline-offset-2 hover:underline"
                  dir="ltr"
                >
                  {url}
                </a>
              ))
            ) : (
              <span className="text-[var(--color-muted)]">لا توجد روابط.</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">وسائط ذات صلة</dt>
          <dd className="mt-1 space-y-1">
            {detail.media?.length ? (
              detail.media.map((file) => (
                <a
                  key={file.id}
                  href={`/api/dashboard/evidence/${encodeURIComponent(file.id)}`}
                  className="block text-[var(--color-forest)] underline-offset-2 hover:underline"
                >
                  {file.fileName}
                  {file.sizeBytes != null ? ` · ${(file.sizeBytes / (1024 * 1024)).toFixed(1)} م.ب` : ''}
                </a>
              ))
            ) : (
              <span className="text-[var(--color-muted)]">لا توجد ملفات.</span>
            )}
          </dd>
        </div>
      </dl>
    </FormCard>
  )
}

export function QueueSubmitterCard({ detail }: { detail: DashboardSubmissionDetail }) {
  return (
    <FormCard title="المقدّم">
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-[var(--color-muted)]">الاسم</dt>
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
          <dt className="text-[var(--color-muted)]">تاريخ التقديم</dt>
          <dd>{formatDate(detail.createdAt)}</dd>
        </div>
      </dl>
    </FormCard>
  )
}

export function QueueReviewCard({
  detail,
  note,
  busy,
  onNote,
  onStatus,
}: {
  detail: DashboardSubmissionDetail
  note: string
  busy: boolean
  onNote: (value: string) => void
  onStatus: (status: string) => void
}) {
  return (
    <FormCard title="إجراءات المراجعة">
      <label className="label">
        ملاحظة المراجعة
        <textarea
          className="field min-h-24"
          value={note}
          onChange={(e) => onNote(e.target.value)}
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
              onClick={() => onStatus(next)}
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
    </FormCard>
  )
}
