import type { Metadata } from "next";
import Link from "next/link";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title: locale === "ar" ? "من نحن" : "A propos",
    description:
      locale === "ar"
        ? "تعرف على Moroccan Trip كمنصة للأنشطة الخارجية، مجتمع سفر، اكتشاف التخييم، واستكشاف الأنشطة والمعدات."
        : "Discover Moroccan Trip as an outdoor platform for travel community, camping discovery, activities and gear.",
    path: "/about"
  });
}

export default async function AboutPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const sections = [
    {
      title: isArabic ? "منصة Outdoor" : "Outdoor platform",
      body: isArabic ? "واجهة أوضح للتخييم، الرفقة، المعدات، والأنشطة داخل المغرب." : "A clearer interface for camping, community, gear and activities across Morocco."
    },
    {
      title: isArabic ? "مجتمع سفر" : "Travel community",
      body: isArabic ? "تواصل مباشر بين المستخدمين بدون وسيط وبخطوات أقل." : "Direct user-to-user contact with less friction and no middleman."
    },
    {
      title: isArabic ? "اكتشاف التخييم" : "Camping discovery",
      body: isArabic ? "أماكن وصور ومعلومات تساعدك تختار بسرعة." : "Places, visuals and useful info that help users decide faster."
    },
    {
      title: isArabic ? "استكشاف الأنشطة" : "Activities exploration",
      body: isArabic ? "أنشطة قريبة منك مع أسعار وصور وتواصل مباشر." : "Nearby activities with pricing, visuals and direct contact."
    },
    {
      title: isArabic ? "سوق للمعدات" : "Gear marketplace",
      body: isArabic ? "بيع وشراء معدات التخييم والسفر من بائعين نشطين." : "Buy and sell camping gear from active sellers."
    }
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="section-kicker">Moroccan Trip</p>
        <h1 className="text-5xl font-black leading-[1.08]">{isArabic ? "منصة مغربية للـ outdoor والسفر" : "A Moroccan outdoor platform"}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-8 text-white/80 sm:text-base">
          {isArabic
            ? "Moroccan Trip تجمع رفقاء السفر، أماكن التخييم، الأنشطة، ومعدات السفر داخل تجربة أوضح تساعدك تتواصل، تخطط، وتستكشف المغرب بسهولة."
            : "Moroccan Trip brings travel partners, camping places, activities and gear into one cleaner experience built to help people connect, plan and explore Morocco."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[2rem] bg-white p-6 shadow-card">
            <p className="text-lg font-black text-slate-900">{section.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-500">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2.25rem] bg-white p-6 shadow-card">
        <h2 className="text-2xl font-black text-slate-900">{isArabic ? "ما الذي نبنيه؟" : "What we are building"}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-100 p-5">
            <p className="text-lg font-black text-slate-900">{isArabic ? "للمستخدم" : "For the explorer"}</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {isArabic
                ? "تلقى رفيق مناسب، تكتشف بلايص جديدة، تشوف أنشطة قريبة، وتوصل للمعدات المناسبة بسرعة."
                : "Users can find the right partner, discover new places, explore activities and reach the right gear quickly."}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-100 p-5">
            <p className="text-lg font-black text-slate-900">{isArabic ? "للمنصة" : "For the platform"}</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {isArabic
                ? "الهدف هو رفع الوضوح والثقة والتحويل: صفحات أخف، CTA أقوى، ومسار أقصر نحو الإجراء."
                : "The goal is better clarity, trust and conversion through simpler pages, stronger CTAs and shorter paths to action."}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={withLocale("/travel-partners", locale)} className="rounded-full bg-forest px-5 py-3 font-semibold text-white">
            {isArabic ? "ابحث عن رفيق" : "Find a partner"}
          </Link>
          <Link href={withLocale("/camping", locale)} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900">
            {isArabic ? "استكشف التخييم" : "Explore camping"}
          </Link>
          <Link href={withLocale("/contact", locale)} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900">
            {isArabic ? "تواصل معنا" : "Nous contacter"}
          </Link>
        </div>
      </section>
    </main>
  );
}
