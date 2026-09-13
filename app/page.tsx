import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { HomeServicesCarousel } from "@/components/home-services-carousel";
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
import { getPublishedHeroSlides } from "@/lib/hero-slides";
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

  const [travelPosts, places, activitiesResult, heroSlides] = await Promise.all([
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
      : Promise.resolve([]),
    getPublishedHeroSlides().catch((error) => {
      logServerError("page.home.hero-slides", error);
      return [];
    })
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

  const serviceItems = copy.services.items.map((item, index) => ({
    key: item.key,
    title: item.title,
    description: item.description,
    eyebrow: item.eyebrow,
    cta: item.cta,
    image: HOMEPAGE_IMAGES.services[item.key],
    href: serviceRoutes[index]
  }));

  return (
    <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-14 pb-20 sm:space-y-20 lg:space-y-24 lg:pb-28">
      <HomeHero
        slides={heroSlides as any[]}
        locale={locale}
        fallback={{
          image: HOMEPAGE_IMAGES.hero,
          eyebrow: copy.hero.badge,
          title: copy.hero.title,
          description: copy.hero.subtitle,
          ctaLabel: copy.hero.primaryCta,
          ctaUrl: "/travel-partners"
        }}
      />

      <section className="relative z-10 -mt-10 grid gap-4 px-3 sm:-mt-16 md:grid-cols-3 lg:-mt-20 lg:px-10">
        {copy.stats.items.map((item) => (
          <FeatureStatCard key={item.title} title={item.title} description={item.description} />
        ))}
      </section>

      <section className="space-y-8 rounded-[2.75rem] border border-white/80 bg-white/80 p-5 shadow-[0_30px_90px_rgba(15,61,46,0.1)] backdrop-blur sm:p-9 lg:p-12">
        <SectionHeading kicker={copy.services.kicker} title={copy.services.title} subtitle="Plan the whole outdoor journey from one trusted place." align="center" />
        <HomeServicesCarousel items={serviceItems} />
      </section>

      <section className="relative overflow-hidden rounded-[2.75rem] bg-[#0f3d2e] px-6 py-10 text-white shadow-[0_35px_100px_rgba(15,61,46,.24)] sm:px-10 sm:py-14 lg:px-14">
        <Image src="/images/activities.jpg" alt="Outdoor adventures in Morocco" fill sizes="100vw" className="object-cover object-[center_44%] opacity-55" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,18,13,.97),rgba(15,61,46,.82)_58%,rgba(249,115,22,.35))]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.28em] text-orange-300">Plan less. Experience more.</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-[-.03em] sm:text-5xl">Turn the next free weekend into an outdoor escape.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">Discover a place to camp, add an unforgettable activity, and get the gear you need from trusted partners.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link href={withLocale("/camping", locale)} className="rounded-full bg-[#f97316] px-7 py-4 text-center text-sm font-black text-white shadow-[0_18px_40px_rgba(249,115,22,.3)] hover:-translate-y-0.5 hover:bg-white hover:text-[#0f3d2e]">Explore camping</Link><Link href={withLocale("/activities", locale)} className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-center text-sm font-black text-white backdrop-blur hover:bg-white hover:text-[#0f3d2e]">Find activities</Link></div>
        </div>
      </section>
    </main>
  );
}
