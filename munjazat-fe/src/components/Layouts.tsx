import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import iqabMark from '../assets/iqab.svg'
import { useAuth } from '../lib/auth'

function PublicNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
    >
      {children}
    </NavLink>
  )
}

function SiteFooter() {
  const { user } = useAuth()

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[var(--color-line)] bg-[var(--color-forest-deep)] text-white">
      <img
        src={iqabMark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 end-[-4%] h-[min(22rem,130%)] w-auto max-w-[min(42%,20rem)] -translate-y-1/2 object-contain opacity-[0.16] select-none sm:end-0 sm:opacity-[0.2]"
      />
      <div className="page-shell relative z-10 py-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="display text-2xl">منجزات</div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
              منصة لتوثيق منجزات وإسهامات السوريين في تركيا ضمن قاعدة معرفية مؤسسية قابلة للتحديث.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--color-gold)]">للجمهور</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>
                <Link to="/browse" className="hover:text-white">
                  تصفّح المنجزات
                </Link>
              </li>
              <li>
                <Link to="/submit" className="hover:text-white">
                  تقديم توثيق
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white">
                  تتبع الطلب
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white">
                  عن المنصة
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--color-gold)]">نطاق العمل</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>أنقرة</li>
              <li>إسطنبول</li>
              <li>غازي عنتاب</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--color-gold)]">الوصول الداخلي</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              مخصص للجنة ونقاط الاتصال وإدارة البعثة فقط.
            </p>
            {user ? (
              <Link
                to="/dashboard"
                className="mt-4 inline-flex rounded-lg border border-white/25 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                لوحة التحكم
              </Link>
            ) : (
              <Link
                to="/login"
                className="mt-4 inline-flex rounded-lg border border-white/25 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                دخول الموظفين
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>منصة توثيق منجزات السوريين في تركيا</p>
          <p>واجهة عربية · مراجعة داخلية قبل أي نشر عام</p>
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-white/90 backdrop-blur-md">
        <div className="page-shell flex items-center justify-between gap-3 py-3.5">
          <Link to="/" className="display text-xl text-[var(--color-forest)] sm:text-2xl">
            منجزات
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <PublicNavLink to="/browse">تصفّح المنجزات</PublicNavLink>
            <PublicNavLink to="/submit">تقديم توثيق</PublicNavLink>
            <PublicNavLink to="/track">تتبع الطلب</PublicNavLink>
            {user ? (
              <NavLink to="/dashboard" className="btn-primary !py-2 !text-sm">
                لوحة التحكم
              </NavLink>
            ) : null}
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-line)] text-[var(--color-forest)] md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">القائمة</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-[var(--color-line)] bg-white md:hidden">
            <nav className="page-shell flex flex-col gap-1 py-3">
              <NavLink
                to="/browse"
                className="rounded-lg px-3 py-3 text-sm text-[var(--color-ink)] hover:bg-[var(--color-sand)]"
              >
                تصفّح المنجزات
              </NavLink>
              <NavLink
                to="/submit"
                className="rounded-lg px-3 py-3 text-sm text-[var(--color-ink)] hover:bg-[var(--color-sand)]"
              >
                تقديم توثيق
              </NavLink>
              <NavLink
                to="/track"
                className="rounded-lg px-3 py-3 text-sm text-[var(--color-ink)] hover:bg-[var(--color-sand)]"
              >
                تتبع الطلب
              </NavLink>
              {user ? (
                <NavLink
                  to="/dashboard"
                  className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-sand)]"
                >
                  لوحة التحكم
                </NavLink>
              ) : null}
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
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
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-[var(--color-line)] bg-[var(--color-forest-deep)] text-white lg:border-b-0 lg:border-l">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
          <div>
            <Link to="/" className="display text-lg">
              منجزات
            </Link>
            <p className="mt-1 text-xs text-white/65">لوحة العمليات الداخلية</p>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-white/20 px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10 lg:hidden"
          >
            البوابة
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible lg:pb-6">
          {dashLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-sm text-[var(--color-muted)]">
              <span className="truncate font-medium text-[var(--color-ink)]">{user?.name}</span>
              <span className="mx-2 text-[var(--color-line)]">·</span>
              <span className="text-[var(--color-forest)]">{user?.role}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="btn-secondary !px-3 !py-1.5 hidden sm:inline-flex">
                البوابة العامة
              </Link>
              <button type="button" onClick={() => void logout()} className="btn-secondary !px-3 !py-1.5">
                خروج
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
