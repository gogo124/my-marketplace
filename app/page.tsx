import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedActivities } from "@/lib/activity";
import { getPublishedAffiliateProducts } from "@/lib/affiliate-products";
import { ProductCard } from "@/components/product-card";
import { getAuthSession } from "@/lib/auth";
import { getPlaces } from "@/lib/camping";
import { CampingCard } from "@/components/camping-card";
import { FEATURES } from "@/lib/features";
import { formatLocaleDate, getDirection, marketingCopy, resolveLocale, type SiteLocale, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";
import { buildPageMetadata } from "@/lib/seo";
import { getTravelPosts } from "@/lib/travel-posts";
import { formatPrice } from "@/lib/utils";

type HomeSearchParams = {
  lang?: string;
};

const HOMEPAGE_IMAGES = {
  hero: "/images/hero-main.jpg",
  services: {
    travel: "/images/travel-partner.jpg",
    camping: "/images/camping.jpg",
    marketplace: "/images/buy-gear.jpg",
    activities: "/images/activities.jpg"
  },
  fallback: {
    place: "/images/featured-campsite.jpg",
    activity: "/images/featured-kayaking.jpg",
    travel: "/images/travel-partner.jpg"
  }
} as const;

type HomePlace = {
  _id: string;
  name: string;
  city: string;
  description: string;
  image: string;
};

type HomeActivity = {
  _id: string;
  title: string;
  city: string;
  description: string;
  image: string;
  price: number;
  slug: string;
  featured: boolean;
};

function isMeaningfulText(value: unknown) {
  return typeof value === "string" && value.replace(/\s+/g, " ").trim().length >= 3;
}

function resolveImage(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function sanitizePlace(place: any): HomePlace | null {
  if (!place || !isMeaningfulText(place.name)) {
    return null;
  }

  return {
    _id: String(place._id),
    name: String(place.name).replace(/\s+/g, " ").trim(),
    city: isMeaningfulText(place.location) ? String(place.location).trim() : "",
    description: isMeaningfulText(place.description) ? String(place.description).trim() : "",
    image: resolveImage(place.image, HOMEPAGE_IMAGES.fallback.place)
  };
}

function sanitizeActivity(activity: any): HomeActivity | null {
  if (!activity || !isMeaningfulText(activity.title)) {
    return null;
  }

  return {
    _id: String(activity._id),
    title: String(activity.title).replace(/\s+/g, " ").trim(),
    city: isMeaningfulText(activity.location) ? String(activity.location).trim() : "",
    description: isMeaningfulText(activity.shortDescription) ? String(activity.shortDescription).trim() : "",
    image: resolveImage(activity.image, HOMEPAGE_IMAGES.fallback.activity),
    price: 0,
    slug: String(activity.slug || activity._id),
    featured: Boolean(activity.featured)
  };
}

function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "left"
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <p className="inline-flex rounded-full bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-[#c46018] sm:text-xs">{kicker}</p>
      <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-5xl">{title}</h2>
      {subtitle ? <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-lg sm:leading-8">{subtitle}</p> : null}
    </div>
  );
}

function FeatureIcon({ kind }: { kind: "travel" | "camping" | "marketplace" | "activities" }) {
  const common = "h-5 w-5";

  if (kind === "travel") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
        <path d="M3 17h18" />
        <path d="M5 17 12 6l7 11" />
        <path d="M9 17v-2.5" />
        <path d="M15 17v-2.5" />
      </svg>
    );
  }

  if (kind === "camping") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
        <path d="m4 20 8-14 8 14" />
        <path d="M12 6v14" />
        <path d="M8.5 14h7" />
      </svg>
    );
  }

  if (kind === "marketplace") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
        <path d="M6 8h12l-1 10H7L6 8Z" />
        <path d="M9 10V7a3 3 0 1 1 6 0v3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
      <path d="M4 19c5-1 11-6 16-14" />
      <path d="M14 5h6v6" />
      <path d="M5 13c1.5-.2 3.5.6 4.5 1.8" />
    </svg>
  );
}

function HomeSectionHeader({
  title,
  description,
  href,
  action
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <h3 className="text-2xl font-black tracking-[-0.02em] text-slate-950 sm:text-3xl">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
      </div>
      <Link href={href} className="inline-flex w-fit rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(15,61,46,.16)] hover:-translate-y-0.5 hover:bg-[#f97316]">
        {action}
      </Link>
    </div>
  );
}

function FeatureStatCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,61,46,0.14)] backdrop-blur sm:p-7">
      <p className="text-xl font-black tracking-[-0.02em] text-[#0f3d2e] sm:text-2xl">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

function isPresent<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}

function PlacePreviewCard({
  place,
  locale,
  cta,
  locationFallback,
  descriptionFallback
}: {
  place: HomePlace | null;
  locale: SiteLocale;
  cta: string;
  locationFallback: string;
  descriptionFallback: string;
}) {
  if (!place) {
    return null;
  }

  return (
    <Link
      href={withLocale(`/camping/${place._id}`, locale)}
      className="group overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-[0_24px_65px_rgba(15,61,46,0.11)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_85px_rgba(15,61,46,0.18)]"
    >
      <div className="relative h-72 sm:h-80">
        <Image
          src={place.image}
          alt={place.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 20vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,16,12,0.08),rgba(2,16,12,0.82))]" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{place.city || locationFallback}</p>
          <h4 className="mt-2 text-2xl font-black sm:text-3xl">{place.name}</h4>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{place.description || descriptionFallback}</p>
        <span className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white">{cta}</span>
      </div>
    </Link>
  );
}

function TravelPreviewCard({
  post,
  locale,
  cta,
  partnerCta,
  locationFallback,
  descriptionFallback,
  interestedLabel
}: {
  post: any;
  locale: SiteLocale;
  cta: string;
  partnerCta: string;
  locationFallback: string;
  descriptionFallback: string;
  interestedLabel: string;
}) {
  const destination = isMeaningfulText(post?.destination) ? String(post.destination).trim() : locationFallback;
  const city = isMeaningfulText(post?.city) ? String(post.city).trim() : "";
  const description = isMeaningfulText(post?.description) ? String(post.description).trim() : descriptionFallback;
  const coverImage = resolveImage(post?.coverImage, HOMEPAGE_IMAGES.fallback.travel);
  const interestedCount = Number(post?.interestedCount || 0);
  const hasDate = post?.date ? !Number.isNaN(new Date(post.date).getTime()) : false;
  const href = withLocale(
    isMeaningfulText(post?.destination)
      ? `/travel-partners?destination=${encodeURIComponent(String(post.destination).trim())}`
      : "/travel-partners",
    locale
  );

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-[0_24px_65px_rgba(15,61,46,0.11)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_85px_rgba(15,61,46,0.18)]"
    >
      <div className="relative h-72 sm:h-80">
        <Image
          src={coverImage}
          alt={destination}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 20vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,16,12,0.08),rgba(2,16,12,0.84))]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
            {city || locationFallback}
          </span>
          {hasDate ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e]">
              {formatLocaleDate(post.date, locale, { dateStyle: "medium" })}
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h4 className="text-2xl font-black sm:text-3xl">{destination}</h4>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{description}</p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          {city ? <span className="rounded-full bg-slate-50 px-3 py-1">{city}</span> : null}
          {interestedCount > 0 ? (
            <span className="rounded-full bg-slate-50 px-3 py-1">
              {interestedCount} {interestedLabel}
            </span>
          ) : null}
          <span className="rounded-full bg-slate-50 px-3 py-1">{partnerCta}</span>
        </div>
        <span className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white">{cta}</span>
      </div>
    </Link>
  );
}

function ActivityPreviewCard({
  activity,
  locale,
  cta,
  locationFallback,
  descriptionFallback,
  priceOnRequest
}: {
  activity: HomeActivity | null;
  locale: SiteLocale;
  cta: string;
  locationFallback: string;
  descriptionFallback: string;
  priceOnRequest: string;
}) {
  if (!activity) {
    return null;
  }

  return (
    <Link
      href={withLocale(`/activities/${activity.slug}`, locale)}
      className="group overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-[0_24px_65px_rgba(15,61,46,0.11)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_85px_rgba(15,61,46,0.18)]"
    >
      <div className="relative h-72 sm:h-80">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 20vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,16,12,0.08),rgba(2,16,12,0.82))]" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e]">
            {activity.featured ? "Featured · " : ""}{activity.city || locationFallback}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h4 className="text-2xl font-black sm:text-3xl">{activity.title}</h4>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">{activity.description || descriptionFallback}</p>
          <div className="shrink-0 rounded-[1rem] bg-[#fff7ed] px-4 py-3 text-right">
            <p className="text-sm font-black text-[#c2410c]">
              {activity.price > 0 ? formatPrice(activity.price, locale) : priceOnRequest}
            </p>
          </div>
        </div>
        <span className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white">{cta}</span>
      </div>
    </Link>
  );
}

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<HomeSearchParams>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title:
      locale === "ar"
        ? "Moroccan Trip | أماكن التخييم ورفقاء السفر والأنشطة الخارجية والمعدات في المغرب"
        : locale === "fr"
          ? "Moroccan Trip | Camping, partenaires de voyage, activites outdoor et marketplace au Maroc"
          : "Moroccan Trip | Camping places, travel partners, activities and gear marketplace in Morocco",
    description:
      locale === "ar"
        ? "اكتشف أماكن التخييم في المغرب، اعثر على رفقاء السفر، استكشف الأنشطة الخارجية وتصفح سوق معدات التخييم."
        : locale === "fr"
          ? "Decouvrez des campings au Maroc, trouvez des partenaires de voyage, explorez les activites outdoor et parcourez le marketplace d'equipement."
          : "Discover camping places in Morocco, find travel partners, explore outdoor activities and browse the camping gear marketplace.",
    path: "/",
    image: HOMEPAGE_IMAGES.hero
  });
}

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = marketingCopy[locale];
  const session = await getAuthSession().catch(() => null);

  const [travelPosts, places, activitiesResult] = await Promise.all([
    FEATURES.travelPartners
      ? getTravelPosts({ limit: 5, userId: session?.user?.id }).catch((error) => {
          logServerError("page.home.travel-posts", error);
          return [];
        })
      : Promise.resolve([]),
    FEATURES.camping
      ? getPlaces({ limit: 5 }).catch((error) => {
          logServerError("page.home.places", error);
          return [];
        })
      : Promise.resolve([]),
    FEATURES.activities
      ? getPublishedActivities({ featured: true, limit: 5 }).catch((error) => {
          logServerError("page.home.activities", error);
          return [];
        })
      : Promise.resolve([])
  ]);

  const [featuredProducts, popularProducts, newProducts, recommendedProducts] = await Promise.all([
    getPublishedAffiliateProducts({ featured: true, limit: 4 }).catch(() => []),
    getPublishedAffiliateProducts({ sort: "popular", limit: 4 }).catch(() => []),
    getPublishedAffiliateProducts({ sort: "newest", limit: 4 }).catch(() => []),
    getPublishedAffiliateProducts({ recommended: true, limit: 4 }).catch(() => [])
  ]);

  const [affiliateFeaturedCamping, affiliatePopularCamping, affiliateNewCamping, affiliateRecommendedCamping] = await Promise.all([
    getPlaces({ featured: true, limit: 4 }).catch(() => []), getPlaces({ sort: "popular", limit: 4 }).catch(() => []), getPlaces({ sort: "newest", limit: 4 }).catch(() => []), getPlaces({ recommended: true, limit: 4 }).catch(() => [])
  ]);
  const featuredPlaces = places.map(sanitizePlace).filter(isPresent);
  const featuredActivities = activitiesResult.map(sanitizeActivity).filter(isPresent).slice(0, 5);

  const serviceRoutes = [
    withLocale("/travel-partners", locale),
    withLocale("/camping", locale),
    withLocale("/marketplace", locale),
    withLocale("/activities", locale)
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-14 pb-20 sm:space-y-20 lg:space-y-24 lg:pb-28">
      <section className="overflow-hidden rounded-[2.25rem] bg-[#0f3d2e] shadow-[0_35px_100px_rgba(15,61,46,0.28)] sm:rounded-[3rem]">
        <div className="relative min-h-[680px] sm:min-h-[720px] xl:min-h-[760px]">
          <Image
            src={HOMEPAGE_IMAGES.hero}
            alt={copy.hero.title}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 object-cover object-[center_58%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(122deg,rgba(2,14,10,0.96),rgba(5,35,25,0.9)_42%,rgba(9,55,40,0.78)_68%,rgba(12,60,43,0.45)_100%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_58%)] xl:block" />
          <div className="relative flex min-h-[680px] items-end px-5 py-8 sm:min-h-[720px] sm:px-10 sm:py-12 lg:px-14 lg:py-16 xl:min-h-[760px]">
            <div className="grid w-full gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,430px)] xl:items-end">
              <div className="max-w-4xl space-y-7 text-white">
                <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white/90">
                  {copy.hero.badge}
                </span>
                <div className="space-y-4">
                  <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                    {copy.hero.title}
                  </h1>
                  <p className="max-w-3xl text-base leading-8 text-white/84 sm:text-lg">{copy.hero.subtitle}</p>
                </div>
                <div className="grid gap-2 text-sm text-white/92 sm:grid-cols-2 sm:text-base">
                  {copy.hero.bullets.map((item) => (
                    <p key={item} className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                      <span className="min-w-0">{item}</span>
                    </p>
                  ))}
                </div>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href={withLocale("/travel-partners", locale)}
                    className="inline-flex items-center justify-center rounded-full bg-[#f97316] px-7 py-4 text-sm font-bold text-white shadow-[0_18px_35px_rgba(249,115,22,0.32)] hover:-translate-y-0.5 hover:bg-[#ea580c]"
                  >
                    {copy.hero.primaryCta}
                  </Link>
                  <Link
                    href={withLocale("/camping", locale)}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/12 px-7 py-4 text-sm font-bold text-white hover:bg-white/18"
                  >
                    {copy.hero.secondaryCta}
                  </Link>
                  <Link
                    href={withLocale("/marketplace", locale)}
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-[#103d2f]/60 px-7 py-4 text-sm font-bold text-white hover:bg-[#123f31]"
                  >
                    {copy.hero.tertiaryCta}
                  </Link>
                </div>
              </div>

              <aside className="rounded-[2rem] border border-white/15 bg-[rgba(5,35,25,0.72)] p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/70">{copy.trust.label}</p>
                <div className="mt-4 grid gap-3">
                  {copy.trust.items.map((item) => (
                    <article key={item.title} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
                      <h2 className="text-base font-bold">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/78">{item.description}</p>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 grid gap-4 px-3 sm:-mt-16 md:grid-cols-3 lg:-mt-20 lg:px-10">
        {copy.stats.items.map((item) => (
          <FeatureStatCard key={item.title} title={item.title} description={item.description} />
        ))}
      </section>

      <section className="space-y-8 rounded-[2.75rem] border border-white/80 bg-white/80 p-5 shadow-[0_30px_90px_rgba(15,61,46,0.1)] backdrop-blur sm:p-9 lg:p-12">
        <SectionHeading kicker={copy.services.kicker} title={copy.services.title} subtitle="Plan the whole outdoor journey from one trusted place." align="center" />
        <div className="grid gap-6 md:grid-cols-2">
          {copy.services.items.map((item, index) => (
            <article
              key={item.key}
              className="group overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-[0_28px_75px_rgba(15,61,46,0.14)] transition duration-300 hover:-translate-y-1.5"
            >
              <div className="relative h-80 sm:h-[26rem]">
                <Image
                  src={HOMEPAGE_IMAGES.services[item.key]}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,26,20,0.08),rgba(12,26,20,0.74))]" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0f3d2e]">
                    {item.eyebrow}
                  </span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f97316] text-white shadow-[0_12px_25px_rgba(249,115,22,0.28)]">
                    <FeatureIcon kind={item.key} />
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/82">{item.description}</p>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <Link
                  href={serviceRoutes[index]}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#0f3d2e] px-5 py-4 text-sm font-bold text-white hover:bg-[#0c3327]"
                >
                  {item.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2.75rem] bg-[#0f3d2e] px-6 py-10 text-white shadow-[0_35px_100px_rgba(15,61,46,.24)] sm:px-10 sm:py-14 lg:px-14">
        <Image src="/images/activities.jpg" alt="Outdoor adventures in Morocco" fill sizes="100vw" className="object-cover object-[center_44%] opacity-55" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,18,13,.97),rgba(15,61,46,.82)_58%,rgba(249,115,22,.35))]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.28em] text-orange-300">Plan less. Experience more.</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-[-.03em] sm:text-5xl">Turn the next free weekend into an outdoor escape.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">Discover a place to camp, add an unforgettable activity, and get the gear you need from trusted partners.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link href={withLocale("/camping", locale)} className="rounded-full bg-[#f97316] px-7 py-4 text-center text-sm font-black text-white shadow-[0_18px_40px_rgba(249,115,22,.3)] hover:-translate-y-0.5 hover:bg-white hover:text-[#0f3d2e]">Explore camping</Link><Link href={withLocale("/activities", locale)} className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-center text-sm font-black text-white backdrop-blur hover:bg-white hover:text-[#0f3d2e]">Find activities</Link></div>
        </div>
      </section>

      <section className="space-y-12 overflow-hidden rounded-[2.5rem] border border-emerald-950/5 bg-[linear-gradient(145deg,#edf7f2,#ffffff_55%,#f7efe4)] p-5 shadow-[0_30px_90px_rgba(15,61,46,0.12)] sm:p-9 lg:p-12"><SectionHeading kicker="Affiliate camping directory" title="Camping places selected for every kind of escape" />{[{title:"Featured Camping Places",items:affiliateFeaturedCamping},{title:"Popular Camping Places",items:affiliatePopularCamping},{title:"New Camping Places",items:affiliateNewCamping},{title:"Recommended Camping Places",items:affiliateRecommendedCamping}].filter(g=>g.items.length).map(g=><section key={g.title} className="space-y-6 border-t border-emerald-950/10 pt-10 first:border-0 first:pt-0"><HomeSectionHeader title={g.title} description="Curated camping places with direct partner access." href={withLocale("/camping",locale)} action="Explore camping"/><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{g.items.map((place:any)=><CampingCard key={place._id} place={place} locale={locale}/>)}</div></section>)}</section>

      <section className="space-y-12 overflow-hidden rounded-[2.5rem] border border-orange-950/5 bg-[linear-gradient(145deg,#fff8ef,#ffffff_55%,#edf7f2)] p-5 shadow-[0_30px_90px_rgba(15,61,46,0.12)] sm:p-9 lg:p-12">
        <SectionHeading kicker="Premium marketplace" title="Products selected for your next adventure" subtitle="Featured, popular, new, and recommended products from trusted affiliate partners." />
        {[{ title: "Featured Products", items: featuredProducts }, { title: "Popular Products", items: popularProducts }, { title: "New Products", items: newProducts }, { title: "Recommended Products", items: recommendedProducts }].filter((group) => group.items.length > 0).map((group) => (
          <section key={group.title} className="space-y-6 border-t border-orange-950/10 pt-10 first:border-0 first:pt-0"><HomeSectionHeader title={group.title} description="Curated products with clear trust indicators and direct partner-store access." href={withLocale("/marketplace", locale)} action="View marketplace" /><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{group.items.map((product: any) => <ProductCard key={product._id} product={product} locale={locale} />)}</div></section>
        ))}
      </section>

      <section className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff,#edf7f2)] p-5 shadow-[0_30px_90px_rgba(15,61,46,0.12)] sm:p-9 lg:p-12">
        <SectionHeading kicker={copy.live.kicker} title={copy.live.title} subtitle={copy.live.subtitle} />
        <div className="mt-10 space-y-14">
          {FEATURES.travelPartners ? (
            <section className="space-y-6 border-t border-ink/5 pt-10 first:border-0 first:pt-0">
              <HomeSectionHeader
                title={copy.live.travelTitle}
                description={copy.live.travelDescription}
                href={withLocale("/travel-partners", locale)}
                action={copy.live.viewAllTravel}
              />
              {travelPosts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {travelPosts.slice(0, 5).map((post: any) => (
                    <TravelPreviewCard
                      key={post._id}
                      post={post}
                      locale={locale}
                      cta={copy.live.viewPlan}
                      partnerCta={copy.live.findPartner}
                      locationFallback={copy.live.locationFallback}
                      descriptionFallback={copy.live.travelFallbackDescription}
                      interestedLabel={copy.live.interestedLabel}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-8 text-center text-sm text-ink/60">
                  {copy.live.emptyTravel}
                </div>
              )}
            </section>
          ) : null}

          {FEATURES.camping ? (
            <section className="space-y-6 border-t border-ink/5 pt-10 first:border-0 first:pt-0">
              <HomeSectionHeader
                title={copy.live.campingTitle}
                description={copy.live.campingDescription}
                href={withLocale("/camping", locale)}
                action={copy.live.viewAllCamping}
              />
              {featuredPlaces.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {featuredPlaces.map((place) => (
                    <PlacePreviewCard
                      key={place._id}
                      place={place}
                      locale={locale}
                      cta={copy.live.viewPlace}
                      locationFallback={copy.live.locationFallback}
                      descriptionFallback={copy.live.placeFallbackDescription}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-8 text-center text-sm text-ink/60">
                  {copy.live.emptyCamping}
                </div>
              )}
            </section>
          ) : null}

          {FEATURES.activities ? (
            <section className="space-y-6 border-t border-ink/5 pt-10 first:border-0 first:pt-0">
              <HomeSectionHeader
                title={copy.live.activitiesTitle}
                description={copy.live.activitiesDescription}
                href={withLocale("/activities", locale)}
                action={copy.live.viewAllActivities}
              />
              {featuredActivities.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {featuredActivities.map((activity) => (
                    <ActivityPreviewCard
                      key={activity._id}
                      activity={activity}
                      locale={locale}
                      cta={copy.live.discoverActivity}
                      locationFallback={copy.live.locationFallback}
                      descriptionFallback={copy.live.activityFallbackDescription}
                      priceOnRequest={copy.live.priceOnRequest}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-8 text-center text-sm text-ink/60">
                  {copy.live.emptyActivities}
                </div>
              )}
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
