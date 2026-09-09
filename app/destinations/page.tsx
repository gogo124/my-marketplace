import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { getDirection, resolveLocale, localizeField, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedDestinations } from "@/lib/destinations";

export const revalidate = 60;
export const metadata: Metadata = buildPageMetadata({ title: "Morocco Destinations | Moroccan Trip", description: "Discover Morocco through curated destination guides, travel stories and practical inspiration.", path: "/destinations" });

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<{ lang?: string; q?: string }> }) {
  const params = await searchParams; const locale = resolveLocale(params.lang); const q = String(params.q || "").trim().toLowerCase();
  const all = await getPublishedDestinations();
  const destinations = (all as any[]).filter((item) => !q || [item.name, item.location, item.shortDescription].some((field) => localizeField(field, locale).toLowerCase().includes(q)));
  return <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-14 pb-24 sm:space-y-20">
    <section className="relative min-h-[560px] overflow-hidden rounded-[2.75rem] bg-forest shadow-[0_35px_100px_rgba(15,61,46,.24)]">
      {destinations[0]?.coverImage ? <Image src={destinations[0].coverImage} alt={localizeField(destinations[0].name, locale)} fill priority sizes="100vw" className="object-cover" /> : null}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(3,20,14,.94),rgba(15,61,46,.58),rgba(15,61,46,.12))]" />
      <div className="relative flex min-h-[560px] items-end px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16"><div className="max-w-4xl text-white"><p className="text-xs font-black uppercase tracking-[.28em] text-white/65">Moroccan Trip · Travel Guide</p><h1 className="mt-5 text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-7xl">{locale === "ar" ? "اكتشف المغرب، مدينة بعد مدينة" : locale === "fr" ? "Découvrez le Maroc, destination après destination" : "Discover Morocco, destination by destination"}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">{locale === "ar" ? "أدلة سفر تحريرية، أماكن ملهمة ونصائح عملية لاكتشاف المغرب." : locale === "fr" ? "Des guides éditoriaux, des lieux inspirants et des conseils pratiques pour explorer le Maroc." : "Editorial guides, inspiring places and practical advice for exploring Morocco."}</p><form className="mt-8 flex max-w-2xl gap-2 rounded-[1.4rem] bg-white p-2 shadow-2xl"><input type="hidden" name="lang" value={locale} /><Search className="my-auto ml-3 h-5 w-5 text-ink/45" /><input name="q" defaultValue={params.q || ""} placeholder={locale === "ar" ? "ابحث عن وجهة..." : "Search destinations..."} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-ink outline-none" /><button className="rounded-[1rem] bg-forest px-5 py-3 text-sm font-black text-white">{locale === "ar" ? "بحث" : locale === "fr" ? "Rechercher" : "Search"}</button></form></div></div>
    </section>
    <section className="space-y-8"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Curated Morocco</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em] text-ink sm:text-5xl">{locale === "ar" ? "وجهات تستحق الاكتشاف" : locale === "fr" ? "Des destinations à découvrir" : "Places worth discovering"}</h2></div>
      {destinations.length ? <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">{destinations.map((item: any) => <Link key={item._id} href={withLocale(`/destinations/${item.slug}`, locale)} className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_55px_rgba(15,61,46,.1)] transition hover:-translate-y-1"><div className="relative aspect-[4/3] overflow-hidden">{item.coverImage && <Image src={item.coverImage} alt={localizeField(item.name, locale)} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />}<span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-ink backdrop-blur">{localizeField(item.category, locale)}</span></div><div className="space-y-3 p-6"><h3 className="text-2xl font-black tracking-[-.025em]">{localizeField(item.name, locale)}</h3><p className="flex items-center gap-1.5 text-xs font-bold text-ink/45"><MapPin className="h-4 w-4" />{localizeField(item.location, locale)}</p><p className="line-clamp-3 text-sm leading-7 text-ink/60">{localizeField(item.shortDescription, locale)}</p><span className="inline-flex pt-2 text-sm font-black text-clay">{locale === "ar" ? "اكتشف الوجهة ←" : locale === "fr" ? "Explorer la destination →" : "Explore destination →"}</span></div></Link>)}</div> : <div className="rounded-[2rem] border border-dashed border-ink/15 p-12 text-center text-ink/55">{locale === "ar" ? "لا توجد وجهات منشورة بعد." : "No published destinations yet."}</div>}
    </section>
  </main>;
}
