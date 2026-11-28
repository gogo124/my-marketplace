import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DestinationGallery from "@/components/destination-gallery";
import { getDestinationBySlug } from "@/lib/destinations";
import { getDirection, localizeField, resolveLocale, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const item: any = await getDestinationBySlug(slug);
  if (!item) return { title: "Destination not found | Moroccan Trip", robots: { index: false, follow: true } };
  return buildPageMetadata({
    title: localizeField(item.seoTitle, locale) || `${localizeField(item.name, locale)} | Moroccan Trip`,
    description: localizeField(item.seoDescription, locale) || localizeField(item.shortDescription, locale),
    path: `/destinations/${item.slug}`,
    image: item.coverImage
  });
}

const copy = {
  ar: { all: "كل الوجهات", gallery: "معرض الصور", agencies: "وكالات محلية مقترحة", book: "احجز الآن", contact: "تواصل", tip: "نصيحة سفر", related: "استكشف المزيد", explore: "اكتشف الوجهة", location: "اكتشف المغرب", partners: "شركاؤنا المحليون", disclaimer: "روابط الحجز والتواصل تفتح مواقع الشركاء الخارجية." },
  fr: { all: "Toutes les destinations", gallery: "Galerie photos", agencies: "Agences locales recommandées", book: "Réserver", contact: "Contacter", tip: "Conseil voyage", related: "Explorer davantage", explore: "Guide de destination", location: "À découvrir au Maroc", partners: "Nos partenaires locaux", disclaimer: "Les liens de réservation et de contact ouvrent les sites externes de nos partenaires." },
  en: { all: "All destinations", gallery: "Photo gallery", agencies: "Recommended local agencies", book: "Book now", contact: "Contact", tip: "Travel tip", related: "Explore more", explore: "Destination guide", location: "Discover Morocco", partners: "Our local partners", disclaimer: "Booking and contact links open our partners’ external websites." }
} as const;

function hasText(value: unknown) { return typeof value === "string" && value.trim().length > 0; }

export default async function DestinationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const t = copy[locale];
  const item: any = await getDestinationBySlug(slug);
  if (!item) notFound();

  const name = localizeField(item.name, locale, "Morocco destination");
  const location = localizeField(item.location, locale);
  const intro = localizeField(item.intro, locale) || localizeField(item.shortDescription, locale);
  const article = Array.isArray(item.article) ? item.article : [];
  const gallery = Array.isArray(item.gallery) ? item.gallery.filter((image: any) => hasText(image?.url)) : [];
  const agencies = Array.isArray(item.recommendedAgencies) ? item.recommendedAgencies.filter((entry: any) => entry?.agency) : [];

  return (
    <main dir={getDirection(locale)} className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-6 sm:px-6 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
        <Link href={withLocale("/destinations", locale)} className="rounded-full px-3 py-2 transition hover:bg-white hover:text-orange-600">← {t.all}</Link>
        <span aria-hidden="true">/</span><span className="text-slate-800">{name}</span>
      </nav>

      <article>
        <header className="group relative isolate min-h-[390px] overflow-hidden rounded-[2rem] bg-[#123d32] shadow-[0_24px_70px_rgba(15,61,46,.18)] sm:min-h-[470px] lg:min-h-[540px]">
          {hasText(item.coverImage) ? <Image src={item.coverImage} alt={name} fill priority sizes="100vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
          <div className="relative flex min-h-[390px] items-end p-6 sm:min-h-[470px] sm:p-10 lg:min-h-[540px] lg:p-16">
            <div className="max-w-4xl text-white">
              <span className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-white backdrop-blur-md">{t.explore}</span>
              {hasText(location) ? <p className="mt-5 text-sm font-bold text-white/80 sm:text-base">{location}</p> : null}
              <h1 className="mt-3 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-8xl">{name}</h1>
              {hasText(intro) ? <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/90 sm:text-lg sm:leading-8">{intro}</p> : null}
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#destination-content" className="inline-flex items-center rounded-full bg-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-950/20 hover:-translate-y-0.5 hover:bg-orange-600">{t.explore} <span className="ms-2" aria-hidden="true">↓</span></a>
                {agencies.length ? <a href="#local-agencies" className="inline-flex items-center rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-extrabold text-white backdrop-blur hover:bg-white/20">{t.partners}</a> : null}
              </div>
            </div>
          </div>
        </header>

        <div id="destination-content" className="mx-auto mt-8 grid max-w-[1280px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-10">
          <div className="min-w-0 space-y-8">
            {article.length ? <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5 shadow-[0_12px_38px_rgba(15,23,42,.045)] sm:p-8 lg:p-10">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full bg-orange-500" />
                <span className="text-xs font-black uppercase tracking-[.2em] text-orange-600">{t.explore}</span>
              </div>
              <div className="destination-article space-y-9">
                {article.map((section: any, index: number) => {
                  const title = localizeField(section?.title, locale);
                  const body = localizeField(section?.body, locale);
                  if (section?.type === "image" && hasText(section.imageUrl)) return <section key={section._id || index}><figure><div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100"><Image src={section.imageUrl} alt={localizeField(section.caption, locale) || name} fill sizes="(max-width: 1024px) 100vw, 850px" className="object-cover" /></div>{hasText(localizeField(section.caption, locale)) ? <figcaption className="mt-3 text-center text-sm text-slate-500">{localizeField(section.caption, locale)}</figcaption> : null}</figure></section>;
                  if (section?.type === "quote" && hasText(body)) return <section key={section._id || index}><blockquote className="rounded-r-2xl border-s-4 border-orange-500 bg-orange-50/80 px-6 py-6 text-lg font-bold leading-8 text-slate-800 sm:text-xl">{body}</blockquote></section>;
                  if (section?.type === "list") { const items = Array.isArray(section.items) ? section.items.map((x: any) => localizeField(x, locale)).filter(hasText) : []; if (!items.length && !hasText(title)) return null; return <section key={section._id || index}>{hasText(title) ? <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h2> : null}{items.length ? <ul className="mt-4 space-y-3 ps-6 leading-8 text-slate-600 marker:text-orange-500">{items.map((x: string, i: number) => <li key={i} className="ps-1">{x}</li>)}</ul> : null}</section>; }
                  if (section?.type === "tip") return hasText(title) || hasText(body) ? <section key={section._id || index} className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">✦ {t.tip}</p>{hasText(title) ? <h2 className="mt-3 text-2xl font-black text-slate-900">{title}</h2> : null}{hasText(body) ? <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">{body}</p> : null}</section> : null;
                  if (!hasText(title) && !hasText(body)) return null;
                  return <section key={section._id || index}>{hasText(title) ? <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h2> : null}{hasText(body) ? <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600 sm:text-[17px] sm:leading-9">{body}</p> : null}</section>;
                })}
              </div>
            </div> : null}
          </div>

          <aside className="min-w-0 space-y-6 lg:sticky lg:top-6">
            {gallery.length ? <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_12px_38px_rgba(15,23,42,.05)] sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-900">{t.gallery}</h2><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{gallery.length}</span></div><DestinationGallery images={gallery} alt={name} /></section> : null}
            {agencies.length ? <section id="local-agencies" className="scroll-mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_12px_38px_rgba(15,23,42,.05)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-[#f0f7f3] to-white px-5 py-5"><p className="text-[11px] font-black uppercase tracking-[.18em] text-orange-600">{t.partners}</p><h2 className="mt-1 text-xl font-black text-slate-900">{t.agencies}</h2></div>
              <div className="space-y-3 p-4">{agencies.map((entry: any, index: number) => { const agency = entry.agency || {}; const agencyName = hasText(agency.name) ? agency.name : "Agency"; const description = localizeField(entry.description, locale) || localizeField(agency.description, locale); return <div key={entry._id || index} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg hover:shadow-slate-900/5">{(agency.logo || agency.coverImage) ? <div className="relative mb-3 h-28 overflow-hidden rounded-xl bg-slate-100"><Image src={agency.logo || agency.coverImage} alt={agencyName} fill sizes="300px" className="object-cover" /></div> : <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-800" aria-hidden="true">✦</div>}<h3 className="font-extrabold text-slate-900">{agencyName}</h3>{hasText(agency.city) ? <p className="mt-1 text-xs font-semibold text-slate-500">{agency.city}</p> : null}{hasText(description) ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}<div className="mt-4 flex flex-wrap gap-2">{hasText(entry.bookingUrl) ? <a href={entry.bookingUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#123d32] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-orange-600">{t.book} ↗</a> : null}{hasText(agency.whatsapp) ? <a href={`https://wa.me/${String(agency.whatsapp).replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-emerald-200 px-4 py-2.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50">WhatsApp</a> : null}{hasText(agency.phone) ? <a href={`tel:${agency.phone}`} className="rounded-full border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50">{t.contact}</a> : null}</div><div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">{Object.entries(entry.socials || {}).filter(([, url]) => hasText(url)).map(([key, url]) => <a key={key} href={String(url)} target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:underline">{key}</a>)}</div></div>; })}</div>
              <p className="px-5 pb-5 text-xs leading-5 text-slate-400">{t.disclaimer}</p>
            </section> : null}
          </aside>
        </div>
      </article>
    </main>
  );
}
