import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicActivities } from "@/lib/activity";
import { getAuthSession } from "@/lib/auth";
import { getPlaces } from "@/lib/camping";
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
    activities: "/images/agencies.jpg"
  },
  fallback: {
    place: "/images/camping.jpg",
    activity: "/images/agencies.jpg",
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
    city: isMeaningfulText(place.city) ? String(place.city).trim() : "",
    description: isMeaningfulText(place.description) ? String(place.description).trim() : "",
    image: resolveImage(place.images?.[0], HOMEPAGE_IMAGES.fallback.place)
  };
}

function sanitizeActivity(activity: any): HomeActivity | null {
  if (!activity || !isMeaningfulText(activity.title)) {
    return null;
  }

  return {
    _id: String(activity._id),
    title: String(activity.title).replace(/\s+/g, " ").trim(),
    city: isMeaningfulText(activity.city) ? String(activity.city).trim() : "",
    description: isMeaningfulText(activity.description) ? String(activity.description).trim() : "",
    image: resolveImage(activity.images?.[0], HOMEPAGE_IMAGES.fallback.activity),
    price: Number(activity.price || 0)
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
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c46018] sm:text-sm">{kicker}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p> : null}
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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <h3 className="text-2xl font-black text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <Link href={href} className="text-sm font-bold text-[#0f3d2e] hover:text-[#f97316]">
        {action}
      </Link>
    </div>
  );
}

function FeatureStatCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-[0_20px_45px_rgba(15,61,46,0.08)] sm:p-6">
      <p className="text-lg font-black text-[#0f3d2e] sm:text-xl">{title}</p>
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
      className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_20px_50px_rgba(15,61,46,0.08)]"
    >
      <div className="relative h-56">
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
          <h4 className="mt-2 text-2xl font-black">{place.name}</h4>
        </div>
      </div>
      <div className="space-y-4 p-5">
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
      className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_20px_50px_rgba(15,61,46,0.08)]"
    >
      <div className="relative h-56">
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
          <h4 className="text-2xl font-black">{destination}</h4>
        </div>
      </div>
      <div className="space-y-4 p-5">
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
      href={withLocale(`/activities/${activity._id}`, locale)}
      className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_20px_50px_rgba(15,61,46,0.08)]"
    >
      <div className="relative h-56">
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
            {activity.city || locationFallback}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h4 className="text-2xl font-black">{activity.title}</h4>
        </div>
      </div>
      <div className="space-y-4 p-5">
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
      ? getPublicActivities({ page: 1, pageSize: 5 }).catch((error) => {
          logServerError("page.home.activities", error);
          return {
            activities: [],
            pagination: { page: 1, pageSize: 5, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
          };
        })
      : Promise.resolve({
          activities: [],
          pagination: { page: 1, pageSize: 5, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
        })
  ]);

  const featuredPlaces = places.map(sanitizePlace).filter(isPresent);
  const featuredActivities = activitiesResult.activities.map(sanitizeActivity).filter(isPresent).slice(0, 5);

  const serviceRoutes = [
    withLocale("/travel-partners", locale),
    withLocale("/camping", locale),
    withLocale("/marketplace", locale),
    withLocale("/activities", locale)
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell max-w-7xl space-y-10 pb-16 sm:space-y-14">
      <section className="overflow-hidden rounded-[2.5rem] bg-[#0f3d2e] shadow-[0_30px_80px_rgba(15,61,46,0.22)]">
        <div className="relative">
          <Image
            src={HOMEPAGE_IMAGES.hero}
            alt={copy.hero.title}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(122deg,rgba(2,14,10,0.96),rgba(5,35,25,0.9)_42%,rgba(9,55,40,0.78)_68%,rgba(12,60,43,0.45)_100%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_58%)] xl:block" />
          <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(320px,360px)] xl:items-end">
              <div className="max-w-3xl space-y-6 text-white">
                <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white/90">
                  {copy.hero.badge}
                </span>
                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
                    {copy.hero.title}
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-white/84 sm:text-base">{copy.hero.subtitle}</p>
                </div>
                <div className="grid gap-2 text-sm text-white/92 sm:grid-cols-2 sm:text-base">
                  {copy.hero.bullets.map((item) => (
                    <p key={item} className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                      <span className="min-w-0">{item}</span>
                    </p>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={withLocale("/travel-partners", locale)}
                    className="inline-flex items-center justify-center rounded-full bg-[#f97316] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_35px_rgba(249,115,22,0.32)] hover:-translate-y-0.5 hover:bg-[#ea580c]"
                  >
                    {copy.hero.primaryCta}
                  </Link>
                  <Link
                    href={withLocale("/camping", locale)}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/12 px-5 py-3 text-sm font-bold text-white hover:bg-white/18"
                  >
                    {copy.hero.secondaryCta}
                  </Link>
                  <Link
                    href={withLocale("/marketplace", locale)}
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-[#103d2f]/60 px-5 py-3 text-sm font-bold text-white hover:bg-[#123f31]"
                  >
                    {copy.hero.tertiaryCta}
                  </Link>
                </div>
              </div>

              <aside className="rounded-[2rem] border border-white/15 bg-[rgba(5,35,25,0.72)] p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-5">
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

      <section className="grid gap-4 md:grid-cols-3">
        {copy.stats.items.map((item) => (
          <FeatureStatCard key={item.title} title={item.title} description={item.description} />
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading kicker={copy.services.kicker} title={copy.services.title} align="center" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {copy.services.items.map((item, index) => (
            <article
              key={item.key}
              className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_24px_60px_rgba(15,61,46,0.1)]"
            >
              <div className="relative h-60">
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
              <div className="p-4">
                <Link
                  href={serviceRoutes[index]}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#0f3d2e] px-4 py-3 text-sm font-bold text-white hover:bg-[#0c3327]"
                >
                  {item.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,#ffffff,#f8fbf9)] p-5 shadow-[0_24px_60px_rgba(15,61,46,0.08)] sm:p-8">
        <SectionHeading kicker={copy.live.kicker} title={copy.live.title} subtitle={copy.live.subtitle} />
        <div className="mt-8 space-y-10">
          {FEATURES.travelPartners ? (
            <section className="space-y-5">
              <HomeSectionHeader
                title={copy.live.travelTitle}
                description={copy.live.travelDescription}
                href={withLocale("/travel-partners", locale)}
                action={copy.live.viewAllTravel}
              />
              {travelPosts.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
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
            <section className="space-y-5">
              <HomeSectionHeader
                title={copy.live.campingTitle}
                description={copy.live.campingDescription}
                href={withLocale("/camping", locale)}
                action={copy.live.viewAllCamping}
              />
              {featuredPlaces.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
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
            <section className="space-y-5">
              <HomeSectionHeader
                title={copy.live.activitiesTitle}
                description={copy.live.activitiesDescription}
                href={withLocale("/activities", locale)}
                action={copy.live.viewAllActivities}
              />
              {featuredActivities.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
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
