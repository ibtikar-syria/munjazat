import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b3d2e_0%,#0f4d3a_45%,#163a2f_100%)]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(197,164,110,.35), transparent 35%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.08), transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 text-white">
          <p className="text-[var(--color-gold)] text-sm mb-3 tracking-wide">منصة مؤسسية للتوثيق</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl leading-tight max-w-3xl">
            منجزات
          </h1>
          <p className="mt-5 max-w-2xl text-white/85 text-lg leading-relaxed">
            توثيق منجزات وإسهامات السوريين في تركيا — أفرادًا ومؤسسات ومبادرات — ضمن قاعدة معرفية
            موثوقة تدعم التواصل والشراكات واتخاذ القرار.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/submit"
              className="rounded-md bg-[var(--color-gold)] px-5 py-2.5 text-[var(--color-forest-deep)] font-medium hover:brightness-105"
            >
              قدّم منجزًا للتوثيق
            </Link>
            <Link
              to="/track"
              className="rounded-md border border-white/30 px-5 py-2.5 text-white hover:bg-white/10"
            >
              تتبع حالة طلبك
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-8">
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
        ].map((item) => (
          <div key={item.title} className="border-t-2 border-[var(--color-gold)] pt-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-forest)]">
              {item.title}
            </h2>
            <p className="mt-2 text-[var(--color-muted)] leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
