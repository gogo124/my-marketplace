import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import { Compass, Search, SlidersHorizontal } from "lucide-react";
import { ActivityCard } from "@/components/activity-card";
import { AffiliateWidgetRenderer, AffiliateWidgetSection } from "@/components/affiliate-widget-renderer";
import { ACTIVITY_TYPES } from "@/lib/activity-types";
import { getActivityFilterOptions, getPublishedActivities } from "@/lib/activity";
import { getPublishedAffiliateWidgets } from "@/lib/affiliate-widgets";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
export const revalidate = 60;
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
 const { lang } = await searchParams;
 const locale = resolveLocale(lang);
 const [activities, widgets] = await Promise.all([
  getPublishedActivities().catch(() => []),
  getPublishedAffiliateWidgets("activities").catch(() => [])
 ]);
 const copy = {
  ar: { title: "أنشطة وتجارب خارجية في المغرب", description: "اكتشف أنشطة وتجارب خارجية في المغرب، من المغامرات والرياضات المائية إلى الجولات الثقافية." },
  fr: { title: "Activités et expériences au Maroc", description: "Découvrez des activités outdoor au Maroc, des aventures en plein air aux sports nautiques et visites culturelles." },
  en: { title: "Outdoor activities and experiences in Morocco", description: "Find outdoor adventures, water sports, guided tours and cultural experiences across Morocco." }
 }[locale];
 return buildPageMetadata({ ...copy, path: "/activities", image: "/images/activities.jpg", locale, indexable: activities.length > 0 || widgets.length > 0 });
}
export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ lang?: string; q?: string; category?: string; location?: string; type?: string }> }) {
 const { lang, q = "", category = "", location = "", type = "" } = await searchParams; const locale = resolveLocale(lang); const isArabic = locale === "ar"; const [activities, options, affiliateWidgets] = await Promise.all([getPublishedActivities({ q, category, location, type }), getActivityFilterOptions(), getPublishedAffiliateWidgets("activities")]);
 return <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-14 pb-24 sm:space-y-20"><section className="relative min-h-[620px] overflow-hidden rounded-[2.5rem] bg-emerald-950 shadow-[0_35px_100px_rgba(15,61,46,.28)] sm:rounded-[3rem]"><Image src="/images/activities.jpg" alt="Outdoor adventure activities in Morocco" fill priority sizes="100vw" className="object-cover object-[center_42%]" /><div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(2,18,13,.97),rgba(15,61,46,.75)_58%,rgba(249,115,22,.32))]" /><div className="relative flex min-h-[620px] items-end px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16"><div className="max-w-4xl text-white"><p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.28em] backdrop-blur">Affiliate Activities</p><h1 className="mt-6 text-4xl font-black leading-[1.03] tracking-[-.04em] sm:text-6xl lg:text-7xl">{isArabic ? "اكتشف أفضل الأنشطة والتجارب" : "Discover unforgettable activities"}</h1><p className="mt-6 max-w-3xl text-base leading-8 text-white/78 sm:text-lg">{isArabic ? "اختر تجربتك وانتقل مباشرة إلى موقع الشريك للحجز." : "Choose your next adventure and continue directly to the trusted affiliate partner to book."}</p><div className="mt-8 flex flex-wrap gap-3 text-xs font-bold text-white/85"><span className="rounded-full bg-white/10 px-4 py-2 backdrop-blur">Adventure experiences</span><span className="rounded-full bg-white/10 px-4 py-2 backdrop-blur">Direct booking access</span><span className="rounded-full bg-white/10 px-4 py-2 backdrop-blur">Across Morocco</span></div></div></div></section>
 <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_160px]">
 <section aria-labelledby="viator-discover-title" className="overflow-hidden rounded-[2.5rem] border border-emerald-900/10 bg-[linear-gradient(135deg,#f0f8f3_0%,#ffffff_55%,#fff5e9_100%)] p-4 shadow-[0_28px_80px_rgba(15,61,46,.10)] sm:rounded-[3rem] sm:p-8 lg:p-10">
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
   <div className="max-w-2xl">
    <p className="text-xs font-black uppercase tracking-[.25em] text-clay">Viator · Official partner experiences</p>
    <h2 id="viator-discover-title" className="mt-3 text-3xl font-black tracking-[-.035em] text-ink sm:text-4xl">{isArabic ? "اكتشف واحجز تجاربك القادمة" : locale === "fr" ? "Découvrez et réservez votre prochaine expérience" : "Discover and book your next experience"}</h2>
    <p className="mt-3 text-sm leading-7 text-ink/60 sm:text-base">{isArabic ? "تصفح الجولات والأنشطة والتجارب السياحية، واختر ما يناسب رحلتك." : locale === "fr" ? "Parcourez des visites, activités et expériences pour trouver celles qui correspondent à votre voyage." : "Browse tours, activities and local experiences to find the right fit for your trip."}</p>
   </div>
   <span className="w-fit rounded-full border border-emerald-900/10 bg-white/80 px-4 py-2 text-xs font-bold text-forest">{isArabic ? "حجز عبر شريكنا" : locale === "fr" ? "Réservation partenaire" : "Book with our partner"}</span>
  </div>
  <div className="rounded-[1.75rem] border border-white bg-white/90 p-2 shadow-[0_18px_50px_rgba(15,61,46,.08)] sm:p-4">
   <AffiliateWidgetRenderer widget={{ name: "Explore tours and activities", provider: "Viator", type: "widget", active: true, embedCode: '<div data-vi-partner-id="P00319762" data-vi-widget-ref="W-7d16c0c0-45f8-4cc7-bfb5-619fd2345c82"></div><script async src="https://www.viator.com/orion/partner/widget.js"></script>' }} />
  </div>
  <p className="mt-4 text-center text-[11px] leading-5 text-ink/45">{isArabic ? "قد نحصل على عمولة عند الحجز عبر روابط الشريك، دون تكلفة إضافية عليك." : locale === "fr" ? "Nous pouvons recevoir une commission si vous réservez via notre partenaire, sans frais supplémentaires." : "We may earn a commission when you book through our partner, at no extra cost to you."}</p>
 </section>
 </section>
 <aside aria-label="Viator sponsored activities" className="flex justify-center lg:sticky lg:top-24 lg:pt-8">
  <div className="min-h-[600px] w-[120px] overflow-hidden rounded-xl bg-white/70">
   <div data-id="viator-banner" data-partner-id="P00319762" data-url="https://www.viator.com/" data-banner-width="120" data-banner-height="600" data-banner-language="en" data-banner-selection="banner3" data-campaign="moroccantrip"></div>
  </div>
  <Script id="viator-vertical-banner" src="https://partners.vtrcdn.com/static/scripts/banners/banners.js" strategy="lazyOnload" />
 </aside>
 </div>
 <section className="sticky top-3 z-20 rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,61,46,.13)] backdrop-blur-xl sm:p-5"><div className="mb-4 flex items-center gap-3"><span className="rounded-full bg-orange-50 p-2.5 text-clay"><SlidersHorizontal className="h-5 w-5" /></span><div><h2 className="font-black text-ink">Find an experience</h2><p className="text-xs text-ink/45">{activities.length} activities available</p></div></div><form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))_auto]"><input type="hidden" name="lang" value={locale} /><label className="relative md:col-span-2 xl:col-span-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><input name="q" defaultValue={q} placeholder="Search by activity title" className="w-full rounded-[1.15rem] border border-ink/10 bg-sand/30 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-clay focus:bg-white" /></label><select name="category" defaultValue={category} className="rounded-[1.15rem] border border-ink/10 bg-sand/30 px-4 py-3.5 text-sm font-semibold"><option value="">All categories</option>{options.categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><select name="location" defaultValue={location} className="rounded-[1.15rem] border border-ink/10 bg-sand/30 px-4 py-3.5 text-sm font-semibold"><option value="">All locations</option>{options.locations.map((item) => <option key={item} value={item}>{item}</option>)}</select><select name="type" defaultValue={type} className="rounded-[1.15rem] border border-ink/10 bg-sand/30 px-4 py-3.5 text-sm font-semibold"><option value="">All activity types</option>{ACTIVITY_TYPES.map((item) => <option key={item}>{item}</option>)}</select><button className="rounded-[1.15rem] bg-forest px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,61,46,.2)] transition hover:bg-clay">Discover</button></form></section>
 <AffiliateWidgetSection widgets={affiliateWidgets} title={isArabic ? "عروض الشركاء" : "Partner activities and offers"} />
 <section className="rounded-[2.75rem] bg-[linear-gradient(145deg,#edf7f2,#ffffff_58%,#fff4e8)] p-5 shadow-[0_30px_90px_rgba(15,61,46,.11)] sm:p-9 lg:p-12"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Experiences worth remembering</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em] text-ink sm:text-5xl">Adventure starts here</h2></div><p className="max-w-lg text-sm leading-7 text-ink/55">Explore outdoor adventures, guided experiences, and unforgettable ways to see Morocco.</p></div>{activities.length ? <div className="mt-9 grid gap-8 md:grid-cols-2 xl:grid-cols-3">{activities.map((activity) => <ActivityCard key={activity._id} activity={activity} locale={locale} />)}</div> : <div className="mt-9 rounded-[2.5rem] border border-dashed border-ink/15 bg-white p-12 text-center text-ink/60"><Compass className="mx-auto h-16 w-16 text-clay/60" /><h2 className="mt-4 text-2xl font-black">No published activities match your search</h2></div>}</section>
</main>;
}
