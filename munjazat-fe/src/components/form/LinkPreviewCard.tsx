import type { RelatedLink } from '../../lib/api'

export function previewImageSrc(link: RelatedLink) {
  if (link.imageKey) return `/api/submissions/link-previews/${encodeURIComponent(link.imageKey)}`
  return link.imageUrl
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function LinkPreviewCard({
  link,
  pending,
  onRemove,
}: {
  link: RelatedLink
  pending?: boolean
  onRemove?: () => void
}) {
  const image = previewImageSrc(link)
  const host = hostnameOf(link.url)
  const title = link.title || host

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className={`flex min-h-[5.5rem] ${pending ? 'pointer-events-none opacity-70' : ''}`}
      >
        <div className="h-auto w-28 shrink-0 bg-[var(--color-sand)] sm:w-32">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[5.5rem] items-center justify-center px-2 text-center text-[10px] text-[var(--color-muted)]">
              {host}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 p-3" dir="auto">
          <p className="text-[11px] text-[var(--color-muted)]" dir="ltr">
            {link.siteName || host}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm font-medium text-[var(--color-ink)]">{title}</p>
          {link.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--color-muted)]">{link.description}</p>
          ) : null}
        </div>
      </a>
      {onRemove ? (
        <button
          type="button"
          className="absolute start-2 top-2 rounded-md bg-white/90 px-2 py-1 text-[11px] text-red-700 shadow-sm"
          onClick={onRemove}
        >
          حذف
        </button>
      ) : null}
      {pending ? (
        <p className="absolute inset-x-0 bottom-0 bg-white/80 px-3 py-1 text-center text-[11px] text-[var(--color-muted)]">
          جارٍ جلب المعاينة…
        </p>
      ) : null}
    </div>
  )
}
