import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DestinationGallery from "@/components/destination-gallery";
import DestinationAgencies from "@/components/destination-agencies";
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
    image: item.coverImage,
  });
}

export default async function DestinationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = {
    ar: { all: "كل الوجهات", gallery: "معرض الصور", agencies: "وكالات الرحلات", tip: "نصيحة سفر" },
    fr: { all: "Toutes les destinations", gallery: "Galerie", agencies: "Agences", tip: "Conseil voyage" },
    en: { all: "All destinations", gallery: "Gallery", agencies: "Agencies", tip: "Travel tip" },
  } as const;
  const t = copy[locale];
  const item: any = await getDestinationBySlug(slug);
  if (!item) notFound();

  const name = localizeField(item.name, locale, "Morocco destination");
  const location = localizeField(item.location, locale);
  const intro = localizeField(item.intro, locale) || localizeField(item.shortDescription, locale);
  const article = Array.isArray(item.article) ? item.article : [];
  const gallery = Array.isArray(item.gallery) ? item.gallery.filter((image: any) => typeof image?.url === "string" && image.url.trim()) : [];
  const agencies = Array.isArray(item.destinationAgencies)
    ? item.destinationAgencies.filter((entry: any) => entry?.name)
    : [];

  return (
    <main dir={getDirection(locale)} className="page-shell max-w-[1320px] pb-24">
      <Link href={withLocale("/destinations", locale)} className="mb-6 inline-flex text-sm font-black text-ink/55 hover:text-forest">← {t.all}</Link>
      <article>
        <header className="relative min-h-[560px] overflow-hidden rounded-[2.5rem] bg-forest">
          {item.coverImage ? <Image src={item.coverImage} alt={name} fill priority sizes="100vw" className="object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="relative flex min-h-[560px] items-end p-7 sm:p-12 lg:p-16">
            <div className="max-w-4xl text-white">
              {location ? <p className="text-sm font-bold text-white/70">{location}</p> : null}
              <h1 className="mt-4 text-5xl font-black leading-none tracking-tight sm:text-7xl">{name}</h1>
              {intro ? <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">{intro}</p> : null}
            </div>
          </div>
        </header>

        {gallery.length ? <section className="mx-auto mt-12 max-w-6xl"><h2 className="text-2xl font-black">{t.gallery}</h2><div className="mt-5"><DestinationGallery images={gallery} alt={name} /></div></section> : null}

        {agencies.length ? <section className="mx-auto mt-10 max-w-6xl"><div className="flex items-end justify-between gap-4"><h2 className="text-2xl font-black">{t.agencies}</h2><span className="text-xs font-bold text-ink/40">{agencies.length}</span></div><div className="mt-4"><DestinationAgencies agencies={agencies} locale={locale} /></div></section> : null}

        <div className="mx-auto mt-14 max-w-6xl"><div className="space-y-10">{article.map((section: any, index: number) => {
          const title = localizeField(section?.title, locale);
          const body = localizeField(section?.body, locale);
          if (section?.type === "image" && section.imageUrl) return <section key={section._id || index}><figure><div className="relative aspect-video overflow-hidden rounded-[2rem]"><Image src={section.imageUrl} alt={localizeField(section.caption, locale) || name} fill sizes="1200px" className="object-cover" /></div></figure></section>;
          if (section?.type === "quote" && body) return <blockquote key={section._id || index} className="border-s-4 border-clay bg-sand/40 px-7 py-6 text-xl font-bold leading-9">{body}</blockquote>;
          if (section?.type === "list") { const items = Array.isArray(section.items) ? section.items.map((x: any) => localizeField(x, locale)).filter((x: any) => x) : []; return <section key={section._id || index}>{title ? <h2 className="text-3xl font-black">{title}</h2> : null}{items.length ? <ul className="mt-3 list-disc space-y-2 ps-6 leading-8 text-ink/70">{items.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul> : null}</section>; }
          if (section?.type === "tip") return title || body ? <section key={section._id || index} className="rounded-2xl bg-sand/60 p-6"><p className="text-xs font-black uppercase tracking-widest text-clay">{t.tip}</p>{title ? <h2 className="mt-2 text-2xl font-black">{title}</h2> : null}{body ? <p className="mt-2 whitespace-pre-line leading-8 text-ink/70">{body}</p> : null}</section> : null;
          return !title && !body ? null : <section key={section._id || index}>{title ? <h2 className="text-3xl font-black">{title}</h2> : null}{body ? <p className="mt-2 whitespace-pre-line text-base leading-8 text-ink/70">{body}</p> : null}</section>;
        })}</div></div>
      </article>
    </main>
  );
}
