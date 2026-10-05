import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

export function LoginPage() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@munjazat.local')
  const [password, setPassword] = useState('Admin123!')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الدخول')
    } finally {
      setBusy(false)
    }
  }

  async function bootstrap() {
    setBusy(true)
    setError('')
    setInfo('')
    try {
      const res = await api.bootstrapAdmin()
      setInfo(
        res.seeded
          ? `تم إنشاء المدير: ${res.email} / ${res.password}`
          : res.message || 'المستخدمون موجودون مسبقاً',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر التهيئة')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-shell py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="display text-3xl text-[var(--color-forest)] sm:text-4xl">دخول الموظفين</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
          حسابات اللجنة ونقاط الاتصال وإدارة البعثة فقط. الرابط متاح من تذييل الموقع.
        </p>

        <form onSubmit={onSubmit} className="surface mt-8 space-y-4 p-5 sm:p-7">
          <label className="label">
            البريد
            <input
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="username"
            />
          </label>
          <label className="label">
            كلمة المرور
            <input
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {info ? (
            <p className="rounded-lg bg-[var(--color-sand)] px-3 py-2 text-sm text-[var(--color-forest)]">
              {info}
            </p>
          ) : null}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            دخول
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void bootstrap()}
            className="btn-secondary w-full text-[var(--color-muted)]"
          >
            تهيئة مدير تجريبي (تطوير فقط)
          </button>
        </form>
      </div>
    </div>
  )
}
