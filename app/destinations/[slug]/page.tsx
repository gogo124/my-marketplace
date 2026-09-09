import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDestinationBySlug } from "@/lib/destinations";
import { getDirection, localizeField, resolveLocale, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { slug } = await params; const { lang } = await searchParams; const locale = resolveLocale(lang); const item: any = await getDestinationBySlug(slug);
  if (!item) return { title: "Destination not found | Moroccan Trip" };
  return buildPageMetadata({ title: localizeField(item.seoTitle, locale) || `${localizeField(item.name, locale)} | Moroccan Trip`, description: localizeField(item.seoDescription, locale) || localizeField(item.shortDescription, locale), path: `/destinations/${slug}`, image: item.coverImage });
}

export default async function DestinationPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params; const { lang } = await searchParams; const locale = resolveLocale(lang); const item: any = await getDestinationBySlug(slug);
  if (!item) return <main className="page-shell py-24 text-center"><h1 className="text-4xl font-black">Destination not found</h1></main>;
  const name = localizeField(item.name, locale); const location = localizeField(item.location, locale); const article = Array.isArray(item.article) ? item.article : [];
  return <main dir={getDirection(locale)} className="page-shell max-w-[1320px] pb-24"><Link href={withLocale("/destinations", locale)} className="mb-6 inline-block text-sm font-black text-ink/55">← {locale === "ar" ? "كل الوجهات" : locale === "fr" ? "Toutes les destinations" : "All destinations"}</Link>
    <article><header className="relative min-h-[560px] overflow-hidden rounded-[2.75rem] bg-forest"><Image src={item.coverImage} alt={name} fill priority sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" /><div className="relative flex min-h-[560px] items-end p-7 sm:p-12 lg:p-16"><div className="max-w-4xl text-white"><p className="text-sm font-bold text-white/70">{location}</p><h1 className="mt-4 text-5xl font-black leading-none tracking-tight sm:text-7xl">{name}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">{localizeField(item.intro, locale) || localizeField(item.shortDescription, locale)}</p></div></div></header>
      <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-10">{article.map((section: any, index: number) => <section key={section._id || index}>{section.type === "image" && section.imageUrl ? <figure><div className="relative aspect-video overflow-hidden rounded-[2rem]"><Image src={section.imageUrl} alt={localizeField(section.caption, locale) || name} fill sizes="800px" className="object-cover" /></div><figcaption className="mt-2 text-center text-sm text-ink/50">{localizeField(section.caption, locale)}</figcaption></figure> : section.type === "quote" ? <blockquote className="border-s-4 border-clay bg-sand/40 px-7 py-6 text-xl font-bold leading-9">{localizeField(section.body, locale)}</blockquote> : section.type === "list" ? <><h2 className="text-3xl font-black">{localizeField(section.title, locale)}</h2><ul className="list-disc space-y-2 ps-6 leading-8 text-ink/70">{(section.items || []).map((x: any, i: number) => <li key={i}>{localizeField(x, locale)}</li>)}</ul></> : <><h2 className="text-3xl font-black">{localizeField(section.title, locale)}</h2><div className="whitespace-pre-line text-base leading-8 text-ink/70">{localizeField(section.body, locale)}</div></>}</section>)}</div>
      <aside className="space-y-7 lg:sticky lg:top-6 lg:self-start">{item.gallery?.length ? <section><h2 className="text-xl font-black">{locale === "ar" ? "معرض الصور" : locale === "fr" ? "Galerie" : "Gallery"}</h2><div className="mt-4 grid grid-cols-2 gap-2">{item.gallery.slice(0, 6).map((image: any, i: number) => <div key={i} className="relative aspect-square overflow-hidden rounded-2xl"><Image src={image.url} alt={localizeField(image.caption, locale) || name} fill sizes="160px" className="object-cover" /></div>)}</div></section> : null}</aside></div>
    </article></main>;
}
