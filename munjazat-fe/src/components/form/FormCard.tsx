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
      <div className="border-b border-[var(--color-line)] pb-3">
        <h2 className="form-section-title">{title}</h2>
        {hint ? <p className="form-section-hint">{hint}</p> : null}
      </div>
      {children}
      {footer}
    </section>
  )
}
