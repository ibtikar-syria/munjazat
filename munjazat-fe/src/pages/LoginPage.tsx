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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-forest)]">
        دخول الموظفين
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        حسابات اللجنة ونقاط الاتصال وإدارة البعثة فقط.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-[var(--color-line)] bg-white p-6"
      >
        <label className="block text-sm">
          البريد
          <input
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>
        <label className="block text-sm">
          كلمة المرور
          <input
            className="mt-1 w-full rounded-md border border-[var(--color-line)] px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {info ? <p className="text-sm text-[var(--color-forest)]">{info}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-[var(--color-forest)] py-2.5 text-white disabled:opacity-60"
        >
          دخول
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void bootstrap()}
          className="w-full rounded-md border border-[var(--color-line)] py-2 text-sm text-[var(--color-muted)]"
        >
          تهيئة مدير تجريبي (تطوير فقط)
        </button>
      </form>
    </div>
  )
}
