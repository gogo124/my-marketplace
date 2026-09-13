import type { Metadata } from "next";
import { AffiliatePriceDisplay } from "@/components/affiliate-price-display";
import { ProductGallery } from "@/components/product-gallery";
import { notFound } from "next/navigation";
import { ActivityBookLink, ActivityViewTracker } from "@/components/activity-analytics";
import { ActivityCard } from "@/components/activity-card";
import { ActivityTypeBadge } from "@/components/activity-type-badge";
import { AdSenseDisplayAd } from "@/components/ads/AdSenseDisplayAd";
import { getPublishedActivityBySlug, getRelatedActivities } from "@/lib/activity";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const activity = await getPublishedActivityBySlug(slug);
  if (!activity) return { title: "Activity not found", robots: { index: false, follow: false } };
  return buildPageMetadata({ title: activity.metaTitle || activity.title, description: activity.metaDescription || activity.shortDescription, path: `/activities/${activity.slug || activity._id}`, image: activity.ogImage || activity.image, keywords: [activity.category, activity.location, ...(activity.types || [])] });
}
export default async function ActivityDetailPage({ params, searchParams }: Props) {
  const [{ slug }, { lang }] = await Promise.all([params, searchParams]); const locale = resolveLocale(lang); const activity = await getPublishedActivityBySlug(slug); if (!activity) notFound(); const related = await getRelatedActivities(activity); const images = [activity.image, ...(activity.galleryImages || [])];
  const schema = { "@context": "https://schema.org", "@type": "TouristAttraction", name: activity.title, description: activity.metaDescription || activity.shortDescription, image: images, url: absoluteUrl(`/activities/${activity.slug || activity._id}`), address: { "@type": "PostalAddress", addressLocality: activity.location, addressCountry: "MA" }, touristType: activity.types, offers: { "@type": "Offer", url: activity.affiliateUrl, availability: "https://schema.org/InStock", price: activity.discountedPrice ?? activity.price, priceCurrency: activity.currency } };
  return <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-14 pb-24"><ActivityViewTracker activityId={activity._id} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><section className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><ProductGallery images={images} alt={activity.title} fit="cover" /><div className="h-fit rounded-[2.5rem] bg-white p-8 shadow-[0_24px_70px_rgba(15,61,46,.12)] lg:sticky lg:top-24"><p className="text-xs font-bold uppercase tracking-[.24em] text-clay">{activity.category} · {activity.location}</p><h1 className="mt-4 text-4xl font-black text-ink">{activity.title}</h1><div className="mt-5"><AffiliatePriceDisplay price={activity.price} currency={activity.currency} discountedPrice={activity.discountedPrice} large /></div><p className="mt-5 text-base leading-8 text-ink/70">{activity.shortDescription}</p><div className="mt-5 flex flex-wrap gap-2">{activity.types.map((type: string) => <ActivityTypeBadge key={type} type={type} compact />)}</div><ActivityBookLink activityId={activity._id} href={activity.affiliateUrl} className="mt-8 inline-flex w-full justify-center rounded-full bg-forest px-6 py-4 text-lg font-black text-white shadow-[0_18px_40px_rgba(15,61,46,.24)] transition hover:-translate-y-0.5 hover:bg-clay">{locale === "ar" ? "احجز الآن" : "Book Now"}</ActivityBookLink><p className="mt-3 text-center text-xs text-ink/45">You will continue to our affiliate partner.</p></div></section><section className="rounded-[2rem] bg-white p-8 shadow-card"><h2 className="text-2xl font-black text-ink">About this activity</h2><p className="mt-5 whitespace-pre-line text-base leading-8 text-ink/70">{activity.description}</p></section><AdSenseDisplayAd id="activity-detail-ad-1" />{related.length ? <section className="space-y-5"><h2 className="text-3xl font-black text-ink">Related activities</h2><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{related.map((item) => <ActivityCard key={item._id} activity={item} locale={locale} />)}</div></section> : null}</main>;
}
