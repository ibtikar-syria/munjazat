import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api, type CatalogAchievement, type CatalogOrganization, type CatalogPerson } from '../lib/api'

type Tab = 'achievements' | 'people' | 'organizations'

const impactLabels: Record<string, string> = {
  local: 'محلي',
  national: 'وطني',
  bilateral: 'ثنائي',
  محلي: 'محلي',
  وطني: 'وطني',
  ثنائي: 'ثنائي',
}

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as Tab) || 'achievements'
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [cityId, setCityId] = useState(searchParams.get('cityId') ?? '')
  const [cities, setCities] = useState<Array<{ id: string; nameAr: string }>>([])
  const [achievements, setAchievements] = useState<CatalogAchievement[]>([])
  const [people, setPeople] = useState<CatalogPerson[]>([])
  const [organizations, setOrganizations] = useState<CatalogOrganization[]>([])
  const [stats, setStats] = useState({ achievements: 0, people: 0, organizations: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [seedMsg, setSeedMsg] = useState('')

  useEffect(() => {
    void api.cities().then((res) => setCities(res.items)).catch(() => setCities([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const params = {
          q: searchParams.get('q') ?? undefined,
          cityId: searchParams.get('cityId') ?? undefined,
        }
        const [statsRes, achRes, peopleRes, orgRes] = await Promise.all([
          api.catalogStats(),
          api.catalogAchievements(params),
          api.catalogPeople(params),
          api.catalogOrganizations(params),
        ])
        if (cancelled) return
        setStats(statsRes.counts)
        setAchievements(achRes.items)
        setPeople(peopleRes.items)
        setOrganizations(orgRes.items)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'تعذّر تحميل الدليل')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [searchParams])

  function applyFilters(e: FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    if (q.trim()) next.set('q', q.trim())
    else next.delete('q')
    if (cityId) next.set('cityId', cityId)
    else next.delete('cityId')
    setSearchParams(next)
  }

  function setTab(nextTab: Tab) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', nextTab)
    setSearchParams(next)
  }

  async function seedDemo() {
    setSeedMsg('')
    try {
      const res = await api.seedCatalogDemo()
      setSeedMsg(
        res.seeded
          ? `تم زرع ${res.counts?.achievements ?? 0} منجزات للعرض`
          : res.message || 'البيانات موجودة مسبقاً',
      )
      if (res.seeded) {
        const [statsRes, achRes, peopleRes, orgRes] = await Promise.all([
          api.catalogStats(),
          api.catalogAchievements({
            q: searchParams.get('q') ?? undefined,
            cityId: searchParams.get('cityId') ?? undefined,
          }),
          api.catalogPeople({
            q: searchParams.get('q') ?? undefined,
            cityId: searchParams.get('cityId') ?? undefined,
          }),
          api.catalogOrganizations({
            q: searchParams.get('q') ?? undefined,
            cityId: searchParams.get('cityId') ?? undefined,
          }),
        ])
        setStats(statsRes.counts)
        setAchievements(achRes.items)
        setPeople(peopleRes.items)
        setOrganizations(orgRes.items)
      }
    } catch (err) {
      setSeedMsg(err instanceof Error ? err.message : 'فشل الزرع')
    }
  }

  const empty = useMemo(() => {
    if (tab === 'people') return people.length === 0
    if (tab === 'organizations') return organizations.length === 0
    return achievements.length === 0
  }, [tab, achievements.length, people.length, organizations.length])

  return (
    <div className="page-shell py-10 sm:py-14">
      <div className="max-w-3xl">
        <h1 className="display text-3xl text-[var(--color-forest)] sm:text-4xl">تصفّح المنجزات</h1>
        <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
          دليل عام لما نُشر بعد التحقق المؤسسي: منجزات وكفاءات وجهات. لا تُعرض بيانات التواصل الخاصة.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 max-w-xl">
        <Stat label="منجزات" value={stats.achievements} />
        <Stat label="كفاءات" value={stats.people} />
        <Stat label="جهات" value={stats.organizations} />
      </div>

      <form onSubmit={applyFilters} className="surface mt-8 grid gap-3 p-4 sm:grid-cols-[1fr_180px_auto] sm:p-5">
        <input
          className="field !mt-0"
          placeholder="ابحث بالعنوان أو الوصف…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="field !mt-0" value={cityId} onChange={(e) => setCityId(e.target.value)}>
          <option value="">كل المدن</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary w-full sm:w-auto">
          تصفية
        </button>
      </form>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ['achievements', 'المنجزات', stats.achievements],
            ['people', 'الكفاءات', stats.people],
            ['organizations', 'الجهات', stats.organizations],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm whitespace-nowrap transition ${
              tab === key
                ? 'bg-[var(--color-forest)] text-white'
                : 'bg-white border border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-forest)]/40'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {error ? <p className="mt-6 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="mt-8 text-[var(--color-muted)]">جاري التحميل…</p> : null}

      {!loading && empty ? (
        <div className="surface mt-8 p-6 sm:p-8">
          <p className="text-[var(--color-muted)]">لا توجد سجلات منشورة مطابقة حالياً.</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            للتطوير المحلي يمكنك زرع بيانات عرض تجريبية بعد تهيئة المدن.
          </p>
          <button type="button" onClick={() => void seedDemo()} className="btn-secondary mt-4">
            زرع بيانات عرض تجريبية
          </button>
          {seedMsg ? <p className="mt-2 text-sm text-[var(--color-forest)]">{seedMsg}</p> : null}
        </div>
      ) : null}

      {!loading && !empty && tab === 'achievements' ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {achievements.map((item) => (
            <Link
              key={item.id}
              to={`/browse/${item.id}`}
              className="surface block p-5 transition hover:border-[var(--color-forest)]/35 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                {item.cityNameAr ? <span>{item.cityNameAr}</span> : null}
                {item.impactScope ? (
                  <span className="rounded-full bg-[var(--color-sand)] px-2 py-0.5">
                    {impactLabels[item.impactScope] ?? item.impactScope}
                  </span>
                ) : null}
              </div>
              <h2 className="display mt-2 text-xl text-[var(--color-forest)]">{item.title}</h2>
              {item.description ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.description}
                </p>
              ) : null}
              <div className="mt-3 text-xs text-[var(--color-muted)]">
                {item.personName || item.organizationName || 'منجز موثّق'}
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {!loading && !empty && tab === 'people' ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {people.map((item) => (
            <article key={item.id} className="surface p-5">
              <h2 className="display text-xl text-[var(--color-forest)]">{item.fullName}</h2>
              {item.specialty ? <p className="mt-1 text-sm text-[var(--color-gold)]">{item.specialty}</p> : null}
              {item.cityNameAr ? <p className="mt-1 text-xs text-[var(--color-muted)]">{item.cityNameAr}</p> : null}
              {item.bio ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{item.bio}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !empty && tab === 'organizations' ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {organizations.map((item) => (
            <article key={item.id} className="surface p-5">
              <h2 className="display text-xl text-[var(--color-forest)]">{item.name}</h2>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                {item.cityNameAr ? <span>{item.cityNameAr}</span> : null}
                {item.foundedYear ? <span>تأسست {item.foundedYear}</span> : null}
                {item.scope ? <span>{item.scope}</span> : null}
              </div>
              {item.description ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{item.description}</p>
              ) : null}
              {item.website ? (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-[var(--color-forest)] underline"
                >
                  الموقع
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-3 text-center sm:p-4">
      <div className="text-xs text-[var(--color-muted)]">{label}</div>
      <div className="display mt-1 text-2xl text-[var(--color-forest)]">{value}</div>
    </div>
  )
}

export function AchievementDetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState<CatalogAchievement | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void api
      .catalogAchievement(id)
      .then((res) => setItem(res.item))
      .catch((err) => setError(err instanceof Error ? err.message : 'تعذّر التحميل'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="page-shell py-14 text-[var(--color-muted)]">جاري التحميل…</div>
  }

  if (error || !item) {
    return (
      <div className="page-shell py-14">
        <p className="text-red-700">{error || 'غير موجود'}</p>
        <Link to="/browse" className="btn-secondary mt-4 inline-flex">
          العودة إلى التصفّح
        </Link>
      </div>
    )
  }

  return (
    <div className="page-shell py-10 sm:py-14">
      <Link to="/browse" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-forest)]">
        ← العودة إلى التصفّح
      </Link>
      <article className="surface mt-4 max-w-3xl p-6 sm:p-8">
        <div className="flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
          {item.cityNameAr ? <span>{item.cityNameAr}</span> : null}
          {item.impactScope ? (
            <span className="rounded-full bg-[var(--color-sand)] px-2 py-0.5">
              {impactLabels[item.impactScope] ?? item.impactScope}
            </span>
          ) : null}
          {item.periodStart || item.periodEnd ? (
            <span>
              {item.periodStart ?? '…'} — {item.periodEnd ?? '…'}
            </span>
          ) : null}
        </div>
        <h1 className="display mt-3 text-3xl text-[var(--color-forest)] sm:text-4xl">{item.title}</h1>
        {item.description ? (
          <p className="mt-5 leading-relaxed text-[var(--color-ink)]/90">{item.description}</p>
        ) : null}
        <div className="mt-6 space-y-1 border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-muted)]">
          {item.personName ? (
            <p>
              الكفاءة المرتبطة: <strong className="text-[var(--color-ink)]">{item.personName}</strong>
              {item.personSpecialty ? ` · ${item.personSpecialty}` : ''}
            </p>
          ) : null}
          {item.organizationName ? (
            <p>
              الجهة المرتبطة: <strong className="text-[var(--color-ink)]">{item.organizationName}</strong>
            </p>
          ) : null}
        </div>
      </article>
    </div>
  )
}
