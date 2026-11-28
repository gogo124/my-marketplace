import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DestinationGallery from "@/components/destination-gallery";
import DestinationAgencies from "@/components/destination-agencies";
import { AffiliateWidgetSection } from "@/components/affiliate-widget-renderer";
import { getDestinationBySlug } from "@/lib/destinations";
import { getPublishedAffiliateWidgets } from "@/lib/affiliate-widgets";
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
  const articleText = Array.isArray(item.article)
    ? item.article.map((section: any) => localizeField(section?.body, locale) || localizeField(section?.title, locale)).filter(Boolean).join(" ")
    : "";
  const description = localizeField(item.seoDescription, locale) || localizeField(item.shortDescription, locale) || localizeField(item.intro, locale) || articleText;
  return buildPageMetadata({
    title: localizeField(item.seoTitle, locale) || localizeField(item.name, locale),
    description,
    path: `/destinations/${item.slug}`,
    image: item.coverImage,
    locale,
  });
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export default async function DestinationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = {
    ar: { all: "كل الوجهات", gallery: "معرض الصور", agencies: "وكالات الرحلات", tip: "نصيحة سفر", guide: "دليل الوجهة", partners: "شركاؤنا", offers: "عروض الشركاء" },
    fr: { all: "Toutes les destinations", gallery: "Galerie photos", agencies: "Agences locales", tip: "Conseil voyage", guide: "Guide de destination", partners: "Nos partenaires", offers: "Offres des partenaires" },
    en: { all: "All destinations", gallery: "Photo gallery", agencies: "Local agencies", tip: "Travel tip", guide: "Destination guide", partners: "Our partners", offers: "Partner offers" },
  } as const;
  const t = copy[locale];
  const item: any = await getDestinationBySlug(slug);
  if (!item) notFound();

  // Keep the existing Admin Dashboard data sources and published-widget rules intact.
  const affiliateWidgets = await getPublishedAffiliateWidgets("destinations", slug, false);
  const name = localizeField(item.name, locale, "Morocco destination");
  const location = localizeField(item.location, locale);
  const intro = localizeField(item.intro, locale) || localizeField(item.shortDescription, locale);
  const article = Array.isArray(item.article) ? item.article : [];
  const gallery = Array.isArray(item.gallery) ? item.gallery.filter((image: any) => hasText(image?.url)) : [];
  const agencies = Array.isArray(item.destinationAgencies) ? item.destinationAgencies.filter((entry: any) => entry?.name) : [];

  return (
    <main dir={getDirection(locale)} className="page-shell max-w-[1440px] pb-24">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm font-bold text-ink/50">
        <Link href={withLocale("/destinations", locale)} className="rounded-full px-3 py-2 transition hover:bg-sand hover:text-forest">← {t.all}</Link>
        <span aria-hidden="true">/</span><span className="text-ink">{name}</span>
      </nav>

      <article className="min-w-0">
        <header className="group relative isolate min-h-[390px] overflow-hidden rounded-[2rem] bg-forest shadow-[0_24px_70px_rgba(15,61,46,.18)] sm:min-h-[470px] lg:min-h-[530px]">
          {hasText(item.coverImage) ? <Image src={item.coverImage} alt={name} fill priority sizes="100vw" className="object-cover transition duration-700 group-hover:scale-[1.02]" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
          <div className="relative flex min-h-[390px] items-end p-6 sm:min-h-[470px] sm:p-10 lg:min-h-[530px] lg:p-16">
            <div className="max-w-4xl text-white">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[.2em] backdrop-blur">{t.guide}</span>
              {hasText(location) ? <p className="mt-5 text-sm font-bold text-white/80 sm:text-base">{location}</p> : null}
              <h1 className="mt-3 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-8xl">{name}</h1>
              {hasText(intro) ? <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/90 sm:text-lg sm:leading-8">{intro}</p> : null}
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#destination-article" className="rounded-full bg-clay px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5">{locale === "ar" ? "اكتشف الوجهة" : locale === "fr" ? "Explorer" : "Explore destination"} ↓</a>
                {agencies.length ? <a href="#local-agencies" className="rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20">{t.partners}</a> : null}
              </div>
            </div>
          </div>
        </header>

        {affiliateWidgets.length ? <section aria-label={t.offers} className="mx-auto mt-7 max-w-[1320px] rounded-[1.75rem] border border-clay/20 bg-gradient-to-br from-sand/80 via-white to-sand/40 p-4 shadow-card sm:p-7 lg:p-9"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-clay">{t.partners}</p><h2 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">{t.offers}</h2></div><span className="rounded-full border border-clay/20 bg-white px-3 py-1.5 text-xs font-bold text-ink/55">{affiliateWidgets.length}</span></div><AffiliateWidgetSection widgets={affiliateWidgets} title="" /></section> : null}

        <div className="mx-auto mt-8 grid min-w-0 max-w-[1320px] items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-9">
          <div className="min-w-0 space-y-8">
            {article.length ? <section id="destination-article" className="scroll-mt-8 rounded-[1.75rem] border border-ink/10 bg-white p-5 shadow-card sm:p-8 lg:p-10">
              <div className="mb-7 flex items-center gap-3"><span className="h-8 w-1.5 rounded-full bg-clay" /><p className="text-xs font-black uppercase tracking-[.2em] text-clay">{t.guide}</p></div>
              <div className="destination-article space-y-9">
                {article.map((section: any, index: number) => {
                  const title = localizeField(section?.title, locale);
                  const body = localizeField(section?.body, locale);
                  if (section?.type === "image" && hasText(section.imageUrl)) return <section key={section._id || index}><figure><div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-sand"><Image src={section.imageUrl} alt={localizeField(section.caption, locale) || name} fill sizes="(max-width: 1024px) 100vw, 850px" className="object-cover" /></div>{hasText(localizeField(section.caption, locale)) ? <figcaption className="mt-3 text-center text-sm text-ink/45">{localizeField(section.caption, locale)}</figcaption> : null}</figure></section>;
                  if (section?.type === "quote" && hasText(body)) return <section key={section._id || index}><blockquote className="rounded-e-2xl border-s-4 border-clay bg-sand/60 px-6 py-6 text-lg font-bold leading-8 text-ink sm:text-xl">{body}</blockquote></section>;
                  if (section?.type === "list") { const items = Array.isArray(section.items) ? section.items.map((x: any) => localizeField(x, locale)).filter(hasText) : []; if (!items.length && !hasText(title)) return null; return <section key={section._id || index}>{hasText(title) ? <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">{title}</h2> : null}{items.length ? <ul className="mt-4 list-disc space-y-3 ps-6 leading-8 text-ink/70 marker:text-clay">{items.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul> : null}</section>; }
                  if (section?.type === "tip") return hasText(title) || hasText(body) ? <section key={section._id || index} className="rounded-2xl border border-clay/20 bg-sand/70 p-6 sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-clay">✦ {t.tip}</p>{hasText(title) ? <h2 className="mt-3 text-2xl font-black text-ink">{title}</h2> : null}{hasText(body) ? <p className="mt-3 whitespace-pre-line leading-8 text-ink/70">{body}</p> : null}</section> : null;
                  if (!hasText(title) && !hasText(body)) return null;
                  return <section key={section._id || index}>{hasText(title) ? <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">{title}</h2> : null}{hasText(body) ? <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink/70 sm:text-[17px] sm:leading-9">{body}</p> : null}</section>;
                })}
              </div>
            </section> : null}
          </div>

          <aside className="min-w-0 space-y-6 lg:sticky lg:top-6">
            {gallery.length ? <section className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white p-4 shadow-card sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-black text-ink">{t.gallery}</h2><span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-clay">{gallery.length}</span></div><DestinationGallery images={gallery} alt={name} /></section> : null}
            {agencies.length ? <section id="local-agencies" className="scroll-mt-6 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-card">
              <div className="border-b border-ink/5 bg-gradient-to-r from-sand to-white px-5 py-5"><p className="text-[10px] font-black uppercase tracking-[.2em] text-clay">{t.partners}</p><h2 className="mt-1 text-xl font-black text-ink">{t.agencies}</h2></div>
              <div className="p-4"><DestinationAgencies agencies={agencies} locale={locale} /></div>
            </section> : null}
          </aside>
        </div>

      </article>
    </main>
  );
}
