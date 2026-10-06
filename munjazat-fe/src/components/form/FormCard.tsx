import type { ReactNode } from 'react'

export function FormCard({
  title,
  children,
  footer,
}: {
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="surface space-y-4 p-5 sm:p-7">
      <h2 className="form-section-title">{title}</h2>
      {children}
      {footer}
    </section>
  )
}
