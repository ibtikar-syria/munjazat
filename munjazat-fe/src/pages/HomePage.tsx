import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div>
      <section className="relative min-h-[78vh] overflow-hidden sm:min-h-[85vh]">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#072a20_0%,#0b3d2e_42%,#134a38_100%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(197,164,110,.4), transparent 32%), radial-gradient(circle at 85% 70%, rgba(255,255,255,.1), transparent 38%), linear-gradient(180deg, transparent 55%, rgba(7,42,32,.55))',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, rgba(255,255,255,.35) 0, rgba(255,255,255,.35) 1px, transparent 1px, transparent 14px)',
          }}
        />

        <div className="page-shell relative flex min-h-[78vh] flex-col justify-end pb-14 pt-24 sm:min-h-[85vh] sm:pb-20 sm:pt-28">
          <p className="mb-4 text-sm tracking-wide text-[var(--color-gold)]">منصة مؤسسية للتوثيق</p>
          <h1 className="display max-w-3xl text-5xl leading-[1.15] text-white sm:text-6xl md:text-7xl">
            منجزات
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            توثيق منجزات وإسهامات السوريين في تركيا — أفرادًا ومؤسسات ومبادرات — ضمن قاعدة معرفية
            موثوقة تدعم التواصل والشراكات واتخاذ القرار.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/browse" className="btn-gold w-full sm:w-auto">
              تصفّح المنجزات
            </Link>
            <Link
              to="/submit"
              className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
            >
              قدّم منجزًا للتوثيق
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="display text-2xl text-[var(--color-forest)] sm:text-3xl">كيف تعمل المنصة</h2>
          <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
            مسار واضح من التقديم العام إلى التحقق المؤسسي، ثم الاستفادة عبر اللوحات والتقارير.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'تقديم منظّم',
              body: 'نماذج موحّدة للكفاءات والجهات والمنجزات مع موافقة واضحة على استخدام البيانات.',
            },
            {
              title: 'تحقق متعدد المستويات',
              body: 'نقاط اتصال في أنقرة وإسطنبول وغازي عنتاب، ثم مراجعة اللجنة قبل النشر.',
            },
            {
              title: 'مؤشرات وقرارات',
              body: 'لوحات تغطية قطاعية وجغرافية وتقارير تساعد البعثة على التشبيك والاستفادة.',
            },
          ].map((item, index) => (
            <article
              key={item.title}
              className="border-t-2 border-[var(--color-gold)] pt-5 animate-[fadeUp_.55s_ease_both]"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <h3 className="display text-xl text-[var(--color-forest)]">{item.title}</h3>
              <p className="mt-2 text-[var(--color-muted)] leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
