import type { ReactNode } from 'react'

export function FormCard({
  title,
  hint,
  children,
  footer,
}: {
  title: string
  hint?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="surface space-y-4 p-5 sm:p-7">
      <div>
        <h2 className="form-section-title">{title}</h2>
        {hint ? <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{hint}</p> : null}
      </div>
      {children}
      {footer}
    </section>
  )
}
