import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, ArrowUpRight } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { getDirection, resolveLocale, localizeField, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedDestinations } from "@/lib/destinations";

export const revalidate = 60;
export const metadata: Metadata = buildPageMetadata({ title: "Morocco Destinations | Moroccan Trip", description: "Discover Morocco through curated destination guides, travel stories and practical inspiration.", path: "/destinations" });

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<{ lang?: string; q?: string }> }) {
  const params = await searchParams;
  const locale = resolveLocale(params.lang);
  const q = String(params.q || "").trim().toLowerCase();
  const all = await getPublishedDestinations();
  const destinations = (all as any[]).filter((item) => !q || [item.name, item.location, item.shortDescription].some((field) => localizeField(field, locale).toLowerCase().includes(q)));
  const featured = destinations.filter((item) => item.featured).slice(0, 3);
  const rest = destinations.filter((item) => !featured.some((featuredItem) => featuredItem._id === item._id));
  const cards = [...featured, ...rest];
  const labels = {
    ar: { kicker: "دليل السفر المغربي", title: "اكتشف المغرب بطريقة مختلفة", intro: "وجهات مختارة، قصص سفر ونصائح عملية تساعدك تبني رحلتك حول التجربة التي تبحث عنها.", search: "ابحث عن مدينة أو منطقة...", submit: "بحث", featured: "وجهات مميزة", all: "كل الوجهات", explore: "اكتشف الوجهة", empty: "لا توجد وجهات منشورة بعد." },
    fr: { kicker: "Guide de voyage marocain", title: "Découvrez le Maroc autrement", intro: "Des destinations choisies, des récits de voyage et des conseils pratiques pour construire un séjour autour de votre expérience.", search: "Rechercher une ville ou une région...", submit: "Rechercher", featured: "Destinations à la une", all: "Toutes les destinations", explore: "Découvrir la destination", empty: "Aucune destination publiée pour le moment." },
    en: { kicker: "Morocco travel guide", title: "Discover Morocco differently", intro: "Curated destinations, travel stories and practical advice to help you build a trip around the experience you want.", search: "Search a city or region...", submit: "Search", featured: "Featured destinations", all: "All destinations", explore: "Discover destination", empty: "No published destinations yet." }
  }[locale];

  return <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-14 pb-24 sm:space-y-20">
    <section className="relative min-h-[560px] overflow-hidden rounded-[2.5rem] bg-forest">
      {cards[0]?.coverImage ? <Image src={cards[0].coverImage} alt={localizeField(cards[0].name, locale)} fill priority sizes="100vw" className="object-cover" /> : null}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(3,20,14,.96),rgba(15,61,46,.6),rgba(15,61,46,.12))]" />
      <div className="relative flex min-h-[560px] items-end px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16"><div className="max-w-4xl text-white"><p className="text-xs font-black uppercase tracking-[.28em] text-white/65">{labels.kicker}</p><h1 className="mt-5 text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-7xl">{labels.title}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">{labels.intro}</p><form className="mt-8 flex max-w-2xl gap-2 rounded-[1.25rem] bg-white p-2 shadow-2xl"><input type="hidden" name="lang" value={locale} /><Search className="my-auto ml-3 h-5 w-5 shrink-0 text-ink/45" aria-hidden="true" /><input name="q" defaultValue={params.q || ""} placeholder={labels.search} aria-label={labels.search} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-ink outline-none" /><button className="rounded-[.9rem] bg-forest px-5 py-3 text-sm font-black text-white transition hover:bg-clay">{labels.submit}</button></form></div></div>
    </section>

    {featured.length ? <section className="space-y-7"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Moroccan Trip</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em] text-ink sm:text-5xl">{labels.featured}</h2></div><div className="grid gap-6 lg:grid-cols-3">{featured.map((item: any, index: number) => <Link key={item._id} href={withLocale(`/destinations/${item.slug}`, locale)} className={`group relative min-h-[420px] overflow-hidden rounded-[2rem] bg-forest ${index === 0 ? "lg:min-h-[500px]" : ""}`}><Image src={item.coverImage} alt={localizeField(item.name, locale)} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-white/65">{localizeField(item.location, locale)}</p><h3 className="mt-2 text-3xl font-black">{localizeField(item.name, locale)}</h3></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink"><ArrowUpRight className="h-5 w-5" /></span></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-white/75">{localizeField(item.shortDescription, locale)}</p></div></Link>)}</div></section> : null}

    <AdSlot id="destinations-top-ad" minHeight={100} />

    <section className="space-y-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">{labels.all}</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em] text-ink sm:text-5xl">{locale === "ar" ? "اختر وجهتك التالية" : locale === "fr" ? "Choisissez votre prochaine destination" : "Choose your next destination"}</h2></div><p className="max-w-md text-sm leading-6 text-ink/55">{locale === "ar" ? "كل بطاقة تقودك إلى دليل الوجهة والمعلومات المتاحة عنها." : locale === "fr" ? "Chaque carte ouvre le guide et les informations disponibles sur la destination." : "Each card opens the destination guide and the information available for it."}</p></div>
      {cards.length ? <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">{cards.map((item: any) => <Link key={item._id} href={withLocale(`/destinations/${item.slug}`, locale)} className="group overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white shadow-[0_18px_50px_rgba(15,61,46,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(15,61,46,.14)]"><div className="relative aspect-[4/3] overflow-hidden bg-sand">{item.coverImage ? <Image src={item.coverImage} alt={localizeField(item.name, locale)} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" /> : null}<span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-ink backdrop-blur">{localizeField(item.category, locale)}</span></div><div className="space-y-3 p-6"><h3 className="text-2xl font-black tracking-[-.025em]">{localizeField(item.name, locale)}</h3><p className="flex items-center gap-1.5 text-xs font-bold text-ink/45"><MapPin className="h-4 w-4" aria-hidden="true" />{localizeField(item.location, locale)}</p><p className="line-clamp-3 text-sm leading-7 text-ink/60">{localizeField(item.shortDescription, locale)}</p><span className="inline-flex items-center gap-2 pt-2 text-sm font-black text-clay">{labels.explore}<ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></Link>)}</div> : <div className="rounded-[2rem] border border-dashed border-ink/15 p-12 text-center text-ink/55">{labels.empty}</div>}
    </section>
    <AdSlot id="destinations-bottom-ad" minHeight={100} />
  </main>;
}
