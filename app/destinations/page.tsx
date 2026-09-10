import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { EzoicAd } from "@/components/ads/EzoicAd";
import { ContentCarousel } from "@/components/content-carousel";
import { getDirection, resolveLocale, localizeField, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedDestinations } from "@/lib/destinations";

export const revalidate = 60;
export const metadata: Metadata = buildPageMetadata({ title: "Morocco Destinations | Moroccan Trip", description: "Discover Morocco through curated destination guides, travel stories and practical inspiration.", path: "/destinations" });

function isValidImageUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<{ lang?: string; q?: string }> }) {
  const params = await searchParams;
  const locale = resolveLocale(params.lang);
  const q = String(params.q || "").trim().toLowerCase();

  let all: any[] = [];
  try {
    const result = await getPublishedDestinations();
    all = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("[destinations] Failed to load published destinations.", error);
  }

  const destinations = all.filter((item) => {
    if (!item || !item.slug || !isValidImageUrl(item.coverImage)) return false;
    if (!q) return true;
    return [item.name, item.location, item.shortDescription].some((field) =>
      localizeField(field, locale).toLowerCase().includes(q)
    );
  });
  const featured = destinations.filter((item) => item.featured);
  const rest = destinations.filter((item) => !item.featured);
  const labels = {
    ar: { kicker: "دليل السفر المغربي", title: "اكتشف المغرب", intro: "وجهات مختارة تساعدك تعرف فين تمشي، شنو تكتشف، وكيفاش تبني الرحلة ديالك.", search: "ابحث عن مدينة أو منطقة...", submit: "بحث", featured: "وجهات مميزة", all: "كل الوجهات", explore: "اكتشف الوجهة", empty: "لا توجد وجهات منشورة بعد." },
    fr: { kicker: "Guide de voyage marocain", title: "Explorez le Maroc", intro: "Des destinations choisies pour vous aider à trouver où aller et construire votre prochaine aventure.", search: "Rechercher une ville ou une région...", submit: "Rechercher", featured: "Destinations à la une", all: "Toutes les destinations", explore: "Découvrir la destination", empty: "Aucune destination publiée pour le moment." },
    en: { kicker: "Morocco travel guide", title: "Explore Morocco", intro: "Curated destinations to help you decide where to go and shape your next adventure.", search: "Search a city or region...", submit: "Search", featured: "Featured destinations", all: "All destinations", explore: "Discover destination", empty: "No published destinations yet." }
  }[locale];

  const card = (item: any, featuredCard = false) => (
    <Link href={withLocale(`/destinations/${item.slug}`, locale)} className="group relative block h-[430px] overflow-hidden rounded-[1.75rem] bg-forest sm:h-[480px]">
      <Image src={item.coverImage} alt={localizeField(item.name, locale)} fill sizes="(max-width: 640px) 82vw, (max-width: 1024px) 58vw, 32vw" className="object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-white/65">{localizeField(item.location, locale)}</p>
        <h3 className={`${featuredCard ? "text-4xl" : "text-3xl"} mt-2 font-black tracking-tight`}>{localizeField(item.name, locale)}</h3>
        {localizeField(item.shortDescription, locale) ? <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-white/75">{localizeField(item.shortDescription, locale)}</p> : null}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-black">{labels.explore}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );

  return <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-14 pb-24 sm:space-y-20">
    <section className="relative min-h-[540px] overflow-hidden rounded-[2.5rem] bg-forest">
      {destinations[0]?.coverImage ? <Image src={destinations[0].coverImage} alt={localizeField(destinations[0].name, locale)} fill priority sizes="100vw" className="object-cover" /> : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
      <div className="relative flex min-h-[540px] items-end px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16"><div className="max-w-3xl text-white"><p className="text-xs font-black uppercase tracking-[.28em] text-white/65">{labels.kicker}</p><h1 className="mt-5 text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-7xl">{labels.title}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">{labels.intro}</p><form className="mt-8 flex max-w-2xl gap-2 rounded-[1.25rem] bg-white p-2 shadow-2xl"><input type="hidden" name="lang" value={locale} /><Search className="my-auto ml-3 h-5 w-5 shrink-0 text-ink/45" aria-hidden="true" /><input name="q" defaultValue={params.q || ""} placeholder={labels.search} aria-label={labels.search} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-ink outline-none" /><button className="rounded-[.9rem] bg-forest px-5 py-3 text-sm font-black text-white transition hover:bg-clay">{labels.submit}</button></form></div></div>
    </section>

    {featured.length ? <section className="space-y-7"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Moroccan Trip</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em] text-ink sm:text-5xl">{labels.featured}</h2></div><ContentCarousel label={labels.featured}>{featured.map((item: any) => card(item, true))}</ContentCarousel></section> : null}

    <EzoicAd id="destinations-top-ad" />

    <section className="space-y-7"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">{labels.all}</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em] text-ink sm:text-5xl">{locale === "ar" ? "فين غادي تمشي من بعد؟" : locale === "fr" ? "Où partir ensuite ?" : "Where will you go next?"}</h2></div>{rest.length ? <ContentCarousel label={labels.all}>{rest.map((item: any) => card(item))}</ContentCarousel> : featured.length ? <ContentCarousel label={labels.all}>{featured.map((item: any) => card(item))}</ContentCarousel> : <div className="rounded-[2rem] border border-dashed border-ink/15 p-12 text-center text-ink/55">{labels.empty}</div>}</section>
    <EzoicAd id="destinations-bottom-ad" />
  </main>;
}
