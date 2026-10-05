import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function PublicLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--color-line)] bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="font-[family-name:var(--font-display)] text-xl text-[var(--color-forest)]">
            منجزات
          </Link>
          <nav className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
            <NavLink to="/submit" className="hover:text-[var(--color-forest)]">
              تقديم توثيق
            </NavLink>
            <NavLink to="/track" className="hover:text-[var(--color-forest)]">
              تتبع الطلب
            </NavLink>
            {user ? (
              <NavLink
                to="/dashboard"
                className="rounded-md bg-[var(--color-forest)] px-3 py-1.5 text-white hover:bg-[var(--color-forest-deep)]"
              >
                لوحة التحكم
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="rounded-md border border-[var(--color-forest)] px-3 py-1.5 text-[var(--color-forest)]"
              >
                دخول الموظفين
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--color-line)] py-6 text-center text-sm text-[var(--color-muted)]">
        منصة توثيق منجزات السوريين في تركيا
      </footer>
    </div>
  )
}

const dashLinks = [
  { to: '/dashboard', label: 'نظرة عامة', end: true },
  { to: '/dashboard/queue', label: 'طوابير المراجعة' },
  { to: '/dashboard/directory', label: 'الدليل' },
  { to: '/dashboard/governance', label: 'الحوكمة' },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b lg:border-b-0 lg:border-l border-[var(--color-line)] bg-[var(--color-forest-deep)] text-white">
        <div className="p-5">
          <div className="font-[family-name:var(--font-display)] text-lg">منجزات</div>
          <p className="mt-1 text-xs text-white/70">لوحة العمليات الداخلية</p>
        </div>
        <nav className="px-3 pb-6 flex lg:flex-col gap-1 overflow-x-auto">
          {dashLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm whitespace-nowrap ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col min-h-screen">
        <header className="border-b border-[var(--color-line)] bg-white px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-[var(--color-muted)]">
            {user?.name} · <span className="text-[var(--color-forest)]">{user?.role}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-[var(--color-muted)] hover:text-[var(--color-forest)]">
              البوابة العامة
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-md border border-[var(--color-line)] px-3 py-1.5 hover:bg-[var(--color-sand)]"
            >
              خروج
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
