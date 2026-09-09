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
  ar: { all: "كل الوجهات", gallery: "معرض الصور", agencies: "وكالات مقترحة", book: "احجز الآن", contact: "تواصل", tip: "نصيحة سفر", related: "استكشف المزيد" },
  fr: { all: "Toutes les destinations", gallery: "Galerie", agencies: "Agences recommandées", book: "Réserver", contact: "Contacter", tip: "Conseil voyage", related: "Explorer davantage" },
  en: { all: "All destinations", gallery: "Gallery", agencies: "Recommended agencies", book: "Book now", contact: "Contact", tip: "Travel tip", related: "Explore more" }
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
    <main dir={getDirection(locale)} className="page-shell max-w-[1320px] pb-24">
      <Link href={withLocale("/destinations", locale)} className="mb-6 inline-flex text-sm font-black text-ink/55 hover:text-forest">← {t.all}</Link>
      <article>
        <header className="relative min-h-[560px] overflow-hidden rounded-[2.5rem] bg-forest">
          {hasText(item.coverImage) ? <Image src={item.coverImage} alt={name} fill priority sizes="100vw" className="object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="relative flex min-h-[560px] items-end p-7 sm:p-12 lg:p-16">
            <div className="max-w-4xl text-white">
              {hasText(location) ? <p className="text-sm font-bold text-white/70">{location}</p> : null}
              <h1 className="mt-4 text-5xl font-black leading-none tracking-tight sm:text-7xl">{name}</h1>
              {hasText(intro) ? <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">{intro}</p> : null}
            </div>
          </div>
        </header>

        <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            {article.map((section: any, index: number) => {
              const title = localizeField(section?.title, locale);
              const body = localizeField(section?.body, locale);
              if (section?.type === "image" && hasText(section.imageUrl)) return <section key={section._id || index}><figure><div className="relative aspect-video overflow-hidden rounded-[2rem]"><Image src={section.imageUrl} alt={localizeField(section.caption, locale) || name} fill sizes="800px" className="object-cover" /></div>{hasText(localizeField(section.caption, locale)) ? <figcaption className="mt-2 text-center text-sm text-ink/50">{localizeField(section.caption, locale)}</figcaption> : null}</figure></section>;
              if (section?.type === "quote" && hasText(body)) return <section key={section._id || index}><blockquote className="border-s-4 border-clay bg-sand/40 px-7 py-6 text-xl font-bold leading-9">{body}</blockquote></section>;
              if (section?.type === "list") { const items = Array.isArray(section.items) ? section.items.map((x: any) => localizeField(x, locale)).filter(hasText) : []; if (!items.length && !hasText(title)) return null; return <section key={section._id || index}>{hasText(title) ? <h2 className="text-3xl font-black">{title}</h2> : null}{items.length ? <ul className="mt-3 list-disc space-y-2 ps-6 leading-8 text-ink/70">{items.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul> : null}</section>; }
              if (section?.type === "tip") return hasText(title) || hasText(body) ? <section key={section._id || index} className="rounded-2xl bg-sand/60 p-6"><p className="text-xs font-black uppercase tracking-widest text-clay">{t.tip}</p>{hasText(title) ? <h2 className="mt-2 text-2xl font-black">{title}</h2> : null}{hasText(body) ? <p className="mt-2 whitespace-pre-line leading-8 text-ink/70">{body}</p> : null}</section> : null;
              if (!hasText(title) && !hasText(body)) return null;
              return <section key={section._id || index}>{hasText(title) ? <h2 className="text-3xl font-black">{title}</h2> : null}{hasText(body) ? <p className="mt-2 whitespace-pre-line text-base leading-8 text-ink/70">{body}</p> : null}</section>;
            })}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-6 lg:self-start">
            {gallery.length ? <section><h2 className="text-xl font-black">{t.gallery}</h2><div className="mt-4"><DestinationGallery images={gallery} alt={name} /></div></section> : null}
            {agencies.length ? <section><h2 className="text-xl font-black">{t.agencies}</h2><div className="mt-4 space-y-4">{agencies.map((entry: any, index: number) => { const agency = entry.agency || {}; const agencyName = hasText(agency.name) ? agency.name : "Agency"; const description = localizeField(entry.description, locale) || agency.description; return <div key={entry._id || index} className="rounded-2xl border border-ink/10 bg-white p-4">{(agency.logo || agency.coverImage) ? <div className="relative mb-3 h-24 overflow-hidden rounded-xl"><Image src={agency.logo || agency.coverImage} alt={agencyName} fill sizes="300px" className="object-cover" /></div> : null}<h3 className="font-black">{agencyName}</h3>{hasText(agency.city) ? <p className="text-xs text-ink/50">{agency.city}</p> : null}{hasText(description) ? <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p> : null}<div className="mt-4 flex flex-wrap gap-2">{hasText(entry.bookingUrl) ? <a href={entry.bookingUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-forest px-3 py-2 text-xs font-black text-white">{t.book}</a> : null}{hasText(agency.whatsapp) ? <a href={`https://wa.me/${String(agency.whatsapp).replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border px-3 py-2 text-xs font-black">WhatsApp</a> : null}{hasText(agency.phone) ? <a href={`tel:${agency.phone}`} className="rounded-xl border px-3 py-2 text-xs font-black">{t.contact}</a> : null}</div><div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">{Object.entries(entry.socials || {}).filter(([, url]) => hasText(url)).map(([key, url]) => <a key={key} href={String(url)} target="_blank" rel="noopener noreferrer" className="text-clay">{key}</a>)}</div></div>; })}</div><p className="mt-3 text-xs leading-5 text-ink/45">Moroccan Trip does not process bookings or payments. Booking links open the agency&apos;s external website.</p></section> : null}
          </aside>
        </div>
      </article>
    </main>
  );
}
