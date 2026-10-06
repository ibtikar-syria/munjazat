import { EvidenceFileGrid } from '../components/form/FileUploadGrid'
import { FormCard } from '../components/form/FormCard'
import { LinkPreviewCard } from '../components/form/LinkPreviewCard'
import type { DashboardSubmissionDetail, RelatedLink } from '../lib/api'
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
    <FormCard title="بيانات السجل" hint="العنوان والتفاصيل والموقع كما وردت في الطلب.">
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
  const links: RelatedLink[] = Array.isArray(detail.payload.relatedLinks)
    ? detail.payload.relatedLinks
        .map((item) => {
          if (typeof item === 'string') {
            return {
              url: item,
              title: null,
              description: null,
              imageKey: null,
              imageUrl: null,
              siteName: null,
            } satisfies RelatedLink
          }
          if (item && typeof item === 'object' && 'url' in item && typeof (item as { url: unknown }).url === 'string') {
            const rec = item as Partial<RelatedLink> & { url: string }
            return {
              url: rec.url,
              title: rec.title ?? null,
              description: rec.description ?? null,
              imageKey: rec.imageKey ?? null,
              imageUrl: rec.imageUrl ?? null,
              siteName: rec.siteName ?? null,
            }
          }
          return null
        })
        .filter((item): item is RelatedLink => item !== null)
    : []

  return (
    <FormCard title="الشواهد" hint="الروابط والملفات المرفقة مع الطلب.">
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-[var(--color-muted)]">روابط ذات صلة</dt>
          <dd className="mt-2 space-y-3">
            {links.length ? (
              links.map((link) => <LinkPreviewCard key={link.url} link={link} />)
            ) : (
              <span className="text-[var(--color-muted)]">لا توجد روابط.</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">وسائط ذات صلة</dt>
          <dd className="mt-1">
            {detail.media?.length ? (
              <EvidenceFileGrid items={detail.media} />
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
    <FormCard title="المقدّم" hint="للتواصل الداخلي فقط، ولا تُنشر للعموم.">
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
    <FormCard title="إجراءات المراجعة" hint="انقل الحالة بعد مراجعة البيانات والشواهد.">
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
