import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { getActiveAffiliatePartners } from "@/lib/affiliate-partners";
import { PartnerLogoCarousel } from "@/components/partner-logo-carousel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  return buildPageMetadata({ title: locale === "ar" ? "من نحن" : "About Moroccan Trip", description: locale === "ar" ? "تعرف على Moroccan Trip، المنصة المغربية للتخييم والأنشطة الخارجية ورفقاء السفر والمعدات." : "Discover Moroccan Trip, Morocco's platform for camping places, outdoor activities, travel partners and recommended gear.", path: "/about" });
}

export default async function AboutPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const ar = locale === "ar";
  const partners = await getActiveAffiliatePartners();
  const offers = [
    { number: "01", title: ar ? "أماكن التخييم" : "Camping Places", body: ar ? "اكتشف أماكن تخييم مختارة في مختلف مناطق المغرب بمعلومات وصور واضحة." : "Discover selected camping places across Morocco with useful information and inspiring visuals." },
    { number: "02", title: ar ? "الأنشطة الخارجية" : "Outdoor Activities", body: ar ? "تجارب وأنشطة تساعدك تستكشف الجبال، الساحل، الصحراء، والطبيعة." : "Find memorable ways to explore Morocco's mountains, coast, desert and wild landscapes." },
    { number: "03", title: ar ? "رفقاء السفر" : "Travel Partners", body: ar ? "تواصل مع أشخاص يشاركونك نفس الوجهة وروح المغامرة." : "Connect with people who share your destination, timing and spirit of adventure." },
    { number: "04", title: ar ? "معدات موصى بها" : "Affiliate Marketplace", body: ar ? "معدات تخييم وسفر مختارة من موردين وشركاء موثوقين." : "Explore recommended camping, travel and outdoor equipment from trusted suppliers." }
  ];
  const reasons = [
    ar ? "تركيز كامل على السفر والطبيعة في المغرب" : "Built specifically for outdoor travel in Morocco",
    ar ? "اختيارات واضحة تساعدك تتخذ القرار بسرعة" : "Clear, useful choices that make planning easier",
    ar ? "شركاء وموردون موثوقون" : "Trusted affiliate partners and quality suppliers",
    ar ? "منصة واحدة للتجارب والمعدات والمجتمع" : "One platform for experiences, equipment and community"
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-16 pb-24 sm:space-y-20 lg:space-y-24">
      <section className="relative min-h-[620px] overflow-hidden rounded-[2.5rem] bg-[#0f3d2e] shadow-[0_35px_100px_rgba(15,61,46,.28)] sm:rounded-[3rem]">
        <Image src="/images/hero-main.jpg" alt="Outdoor travel in Morocco" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,18,13,.96),rgba(15,61,46,.84)_55%,rgba(15,61,46,.32))]" />
        <div className="relative flex min-h-[620px] items-end px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16"><div className="max-w-4xl text-white"><p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.28em] backdrop-blur">Moroccan Trip</p><h1 className="mt-6 text-4xl font-black leading-[1.03] tracking-[-.04em] sm:text-6xl lg:text-7xl">{ar ? "نقربك من أجمل التجارب الخارجية في المغرب" : "Bringing Morocco's outdoor experiences within reach"}</h1><p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">{ar ? "Moroccan Trip منصة مغربية تجمع المسافرين ومحبي التخييم والمغامرة مع أماكن وتجارب وخدمات ومعدات موثوقة في جميع أنحاء المغرب." : "Moroccan Trip connects travelers, campers and outdoor enthusiasts with trusted places, memorable experiences, useful services and quality equipment across Morocco."}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href={withLocale("/camping", locale)} className="rounded-full bg-[#f97316] px-7 py-4 text-center text-sm font-black text-white shadow-[0_18px_40px_rgba(249,115,22,.3)] hover:-translate-y-0.5 hover:bg-white hover:text-[#0f3d2e]">{ar ? "استكشف التخييم" : "Explore camping"}</Link><Link href={withLocale("/activities", locale)} className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-center text-sm font-black text-white backdrop-blur hover:bg-white hover:text-[#0f3d2e]">{ar ? "اكتشف الأنشطة" : "Discover activities"}</Link></div></div></div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div className="max-w-xl"><p className="text-xs font-black uppercase tracking-[.28em] text-[#c46018]">{ar ? "مهمتنا" : "Our mission"}</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-[-.03em] text-slate-950 sm:text-5xl">{ar ? "رحلات خارجية أسهل، أوضح، وأكثر ثقة" : "Make outdoor travel easier, clearer and more trusted"}</h2><p className="mt-6 text-sm leading-8 text-slate-600 sm:text-base">{ar ? "هدفنا هو مساعدة الناس على استكشاف المغرب بثقة، من أول فكرة للرحلة إلى اختيار المكان والنشاط والمعدات المناسبة." : "Our goal is to help people explore Morocco with confidence, from the first idea for a trip to choosing the right place, activity and equipment."}</p></div><div className="relative min-h-[420px] overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_rgba(15,61,46,.18)]"><Image src="/images/featured-campsite.jpg" alt="Camping experience in Morocco" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#071b14]/70 via-transparent to-transparent" /><p className="absolute bottom-6 left-6 right-6 max-w-md text-xl font-black text-white sm:text-2xl">{ar ? "من الجبال إلى الساحل، نساعدك تجد تجربتك القادمة." : "From mountain escapes to coastal camps, find your next experience."}</p></div></section>

      <section className="rounded-[2.75rem] bg-[linear-gradient(145deg,#edf7f2,#ffffff_58%,#fff4e8)] p-6 shadow-[0_30px_90px_rgba(15,61,46,.12)] sm:p-10 lg:p-14"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.28em] text-[#c46018]">{ar ? "ما نقدمه" : "What we offer"}</p><h2 className="mt-4 text-3xl font-black tracking-[-.03em] text-slate-950 sm:text-5xl">{ar ? "كل ما تحتاجه للمغامرة القادمة" : "Everything around your next adventure"}</h2></div><div className="mt-10 grid gap-5 md:grid-cols-2">{offers.map((offer) => <article key={offer.number} className="group rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_55px_rgba(15,61,46,.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,61,46,.14)] sm:p-8"><div className="flex items-start justify-between gap-4"><h3 className="text-2xl font-black text-slate-950 sm:text-3xl">{offer.title}</h3><span className="text-sm font-black text-[#f97316]">{offer.number}</span></div><p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{offer.body}</p></article>)}</div></section>

      <section className="grid gap-6 lg:grid-cols-2"><article className="relative min-h-[460px] overflow-hidden rounded-[2.5rem] bg-[#0f3d2e] p-7 text-white shadow-[0_30px_80px_rgba(15,61,46,.2)] sm:p-10"><Image src="/images/travel-partner.jpg" alt="Moroccan Trip outdoor community" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-45" /><div className="absolute inset-0 bg-gradient-to-t from-[#071b14] via-[#0f3d2e]/65 to-transparent" /><div className="relative flex h-full flex-col justify-end"><p className="text-xs font-black uppercase tracking-[.28em] text-orange-300">{ar ? "مجتمع خارجي" : "Outdoor community"}</p><h2 className="mt-4 text-3xl font-black tracking-[-.03em] sm:text-5xl">{ar ? "المغامرة أحسن عندما نتشاركها" : "Adventure is better when it is shared"}</h2><p className="mt-5 text-sm leading-7 text-white/75 sm:text-base">{ar ? "نبني مساحة تجمع الناس الذين يحبون السفر والتخييم والطبيعة، وتساعدهم على التخطيط والتواصل والاكتشاف." : "We are building a space where people who love travel, camping and nature can plan, connect and discover together."}</p></div></article><article className="rounded-[2.5rem] border border-emerald-950/5 bg-white p-7 shadow-[0_30px_80px_rgba(15,61,46,.12)] sm:p-10"><p className="text-xs font-black uppercase tracking-[.28em] text-[#c46018]">{ar ? "لماذا Moroccan Trip" : "Why Moroccan Trip"}</p><h2 className="mt-4 text-3xl font-black tracking-[-.03em] text-slate-950 sm:text-5xl">{ar ? "اختيارات موثوقة لرحلة أفضل" : "Trusted choices for a better trip"}</h2><div className="mt-8 space-y-4">{reasons.map((reason, index) => <div key={reason} className="flex items-center gap-4 rounded-[1.5rem] bg-[#f5faf7] p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3d2e] text-sm font-black text-white">{index + 1}</span><p className="font-bold leading-6 text-slate-800">{reason}</p></div>)}</div></article></section>

      <section className="overflow-hidden rounded-[2.75rem] bg-[#0f3d2e] p-7 text-white shadow-[0_35px_100px_rgba(15,61,46,.25)] sm:p-10 lg:p-14"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.28em] text-orange-300">{ar ? "شركاؤنا الموثوقون" : "Trusted partners"}</p><h2 className="mt-4 text-3xl font-black tracking-[-.03em] sm:text-5xl">{ar ? "نتعاون مع موردين وشركاء يشاركوننا نفس معايير الجودة" : "Working with partners who share our standards"}</h2><p className="mt-5 text-sm leading-7 text-white/72 sm:text-base">{ar ? "نتعاون مع شركاء أفلييت وموردين موثوقين لتقديم معدات التخييم وخدمات السفر والمنتجات الخارجية الموصى بها بأسعار تنافسية." : "We work with affiliate partners and trusted suppliers to recommend quality camping gear, travel services and outdoor equipment at competitive prices."}</p></div><Link href={withLocale("/contact", locale)} className="rounded-full bg-[#f97316] px-7 py-4 text-center text-sm font-black text-white hover:bg-white hover:text-[#0f3d2e]">{ar ? "تعاون معنا" : "Partner with us"}</Link></div><PartnerLogoCarousel partners={partners as any[]} /></section>
    </main>
  );
}
