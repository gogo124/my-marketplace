import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ActivityCard } from "@/components/activity-card";
import { ListingCard } from "@/components/listing-card";
import { TravelPostCard } from "@/components/travel-post-card";
import { getPublicActivities } from "@/lib/activity";
import { getAuthSession } from "@/lib/auth";
import { getPlaces } from "@/lib/camping";
import { getListingsPage } from "@/lib/data";
import { FEATURES } from "@/lib/features";
import { formatLocaleNumber, getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";
import { buildPageMetadata } from "@/lib/seo";
import { getTravelPosts } from "@/lib/travel-posts";

type HomeSearchParams = {
  lang?: string;
};

function isMeaningfulText(value: unknown) {
  return typeof value === "string" && value.replace(/\s+/g, " ").trim().length >= 3;
}

function resolveImage(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function sanitizeListing(listing: any, fallbackImage: string) {
  if (!listing || !isMeaningfulText(listing.title) || Number(listing.price || 0) <= 0) {
    return null;
  }

  return {
    ...listing,
    title: String(listing.title).replace(/\s+/g, " ").trim(),
    category: isMeaningfulText(listing.category) ? String(listing.category).trim() : "Camping",
    location: isMeaningfulText(listing.location) ? String(listing.location).trim() : "",
    images: [resolveImage(listing.images?.[0], fallbackImage)]
  };
}

function sanitizePlace(place: any) {
  if (!place || !isMeaningfulText(place.name)) {
    return null;
  }

  return {
    ...place,
    name: String(place.name).replace(/\s+/g, " ").trim(),
    city: isMeaningfulText(place.city) ? String(place.city).trim() : "",
    category: isMeaningfulText(place.category) ? String(place.category).trim() : "Camping",
    heroImage: resolveImage(place.images?.[0], "/images/camping.jpg")
  };
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
        ? "Moroccan Trip | رفيق السفر والتخييم والمعدات في المغرب"
        : "Moroccan Trip | Travel partners, camping and gear in Morocco",
    description:
      locale === "ar"
        ? "اعثر على رفيق سفر، اكتشف أماكن التخييم، تصفح معدات التخييم، وجرب أنشطة جديدة داخل منصة مغربية أوضح وأسهل."
        : "Find a travel partner, discover camping places, browse outdoor gear and explore activities in a clearer Morocco-focused platform.",
    path: "/",
    image: "/images/hero-main.jpg"
  });
}

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const session = await getAuthSession().catch(() => null);

  const [travelPosts, places, listingsPage, activitiesResult] = await Promise.all([
    FEATURES.travelPartners
      ? getTravelPosts({ limit: 3, userId: session?.user?.id }).catch((error) => {
          logServerError("page.home.travel-posts", error);
          return [];
        })
      : Promise.resolve([]),
    FEATURES.camping
      ? getPlaces({ limit: 3 }).catch((error) => {
          logServerError("page.home.places", error);
          return [];
        })
      : Promise.resolve([]),
    FEATURES.marketplace
      ? getListingsPage({ type: "sale", page: 1, pageSize: 3 }).catch((error) => {
          logServerError("page.home.marketplace", error);
          return {
            listings: [],
            pagination: { page: 1, pageSize: 3, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
          };
        })
      : Promise.resolve({
          listings: [],
          pagination: { page: 1, pageSize: 3, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
        }),
    FEATURES.activities
      ? getPublicActivities({ page: 1, pageSize: 3 }).catch((error) => {
          logServerError("page.home.activities", error);
          return {
            activities: [],
            pagination: { page: 1, pageSize: 3, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
          };
        })
      : Promise.resolve({
          activities: [],
          pagination: { page: 1, pageSize: 3, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
        })
  ]);

  const featuredPlaces = places.map(sanitizePlace).filter(Boolean) as any[];
  const featuredListings = listingsPage.listings
    .map((listing: any) => sanitizeListing(listing, "/images/buy-gear.jpg"))
    .filter(Boolean) as any[];
  const featuredActivities = activitiesResult.activities.slice(0, 3);

  const heroBullets = isArabic
    ? [
        "ابحث عن رفيق يشاركك الرحلة",
        "اكتشف أماكن التخييم",
        "اشتر معدات التخييم",
        "جرب أنشطة جديدة"
      ]
    : ["Find a travel partner", "Discover camping places", "Buy camping gear", "Try new activities"];
  const trustPoints = isArabic
    ? ["تواصل مباشر مع المستخدمين", "بدون وسيط", "مجتمع رحلات حقيقي في المغرب"]
    : ["Direct contact with real users", "No middleman", "A real Morocco travel community"];
  const fomoPoints = isArabic
    ? [
        `${formatLocaleNumber(travelPosts.length, locale)} أشخاص يبحثون عن رفيق الآن`,
        `${formatLocaleNumber(activitiesResult.pagination.total, locale)} رحلات نشطة حالياً`,
        `${formatLocaleNumber(featuredPlaces.length, locale)} أماكن محدودة`
      ]
    : [
        `${formatLocaleNumber(travelPosts.length, locale)} people looking for a partner now`,
        `${formatLocaleNumber(activitiesResult.pagination.total, locale)} active plans right now`,
        `${formatLocaleNumber(featuredPlaces.length, locale)} limited camping spots`
      ];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8 sm:space-y-10">
      <section className="overflow-hidden rounded-[2.5rem] bg-[#0f3d2e] shadow-[0_24px_70px_rgba(15,61,46,0.22)]">
        <div className="relative">
          <Image
            src="/images/hero-main.jpg"
            alt={isArabic ? "التخييم والسفر في المغرب" : "Travel and camping in Morocco"}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,31,24,0.92),rgba(15,61,46,0.78),rgba(249,115,22,0.18))]" />
          <div className="relative grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div className="space-y-6 text-white">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.25em] text-white/85">
                Moroccan Trip
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">
                  {isArabic
                    ? "اعثر على رفيق السفر واكتشف أماكن التخييم في المغرب بسهولة"
                    : "Find travel partners and discover camping places in Morocco with less friction"}
                </h1>
                <div className="grid gap-2 text-sm leading-7 text-white/88 sm:text-base">
                  {heroBullets.map((item) => (
                    <p key={item} className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={withLocale("/travel-partners", locale)}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f3d2e] transition hover:-translate-y-0.5"
                >
                  {isArabic ? "ابحث عن رفيق السفر" : "Find Travel Partner"}
                </Link>
                <Link
                  href={withLocale("/camping", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ea580c]"
                >
                  {isArabic ? "استكشف التخييم" : "Explore Camping"}
                </Link>
                <Link
                  href={withLocale("/marketplace", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {isArabic ? "تصفح المعدات" : "Browse Marketplace"}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-end">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/12 p-5 text-white backdrop-blur">
                <p className="text-xs font-bold tracking-[0.24em] text-white/70">
                  {isArabic ? "الثقة والسرعة" : "Trust and speed"}
                </p>
                <div className="mt-4 grid gap-3">
                  {trustPoints.map((item) => (
                    <div key={item} className="rounded-[1.3rem] border border-white/10 bg-white/10 p-4">
                      <p className="font-semibold">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {fomoPoints.map((item, index) => (
                  <div
                    key={item}
                    className={`${index === 0 ? "bg-[#f97316]" : "bg-white/12"} rounded-[1.5rem] border border-white/10 p-5 text-white backdrop-blur`}
                  >
                    <p className="text-sm font-black">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {trustPoints.map((item, index) => (
          <article key={item} className="rounded-[2rem] bg-white p-5 shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay">
              {index === 0 ? (isArabic ? "ثقة" : "Trust") : index === 1 ? (isArabic ? "سهولة" : "Clarity") : isArabic ? "مجتمع" : "Community"}
            </p>
            <h2 className="mt-3 text-xl font-black text-ink">{item}</h2>
            <p className="mt-2 text-sm leading-7 text-ink/60">
              {index === 0
                ? isArabic
                  ? "تواصل مباشر مع أصحاب الإعلانات ومزودي الأنشطة بدون خطوات مربكة."
                  : "Reach posters and activity providers directly without a heavy funnel."
                : index === 1
                  ? isArabic
                    ? "واجهة أخف وترتيب أوضح يقودك بسرعة إلى الإجراء المناسب."
                    : "A lighter interface and clearer hierarchy push users faster to action."
                  : isArabic
                    ? "مجتمع مغربي حقيقي للسفر والتخييم والأنشطة الخارجية."
                    : "A real Moroccan outdoor community for travel, camping and activities."}
            </p>
          </article>
        ))}
      </section>

      {FEATURES.travelPartners ? (
        <section className="space-y-6">
          <div className="grid gap-6 rounded-[2.25rem] bg-white p-5 shadow-card sm:p-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
                {isArabic ? "الأولوية الرئيسية" : "Main priority"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                {isArabic ? "رفقاء السفر" : "Travel Partners"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                {isArabic
                  ? "هذا هو القسم الأقوى في الواجهة الآن: وجهة واضحة، تاريخ الرحلة، وتواصل مباشر عبر واتساب أو الهاتف."
                  : "This is now the dominant public surface: clear destination, date and direct WhatsApp or phone contact."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <Link href={withLocale("/travel-partners", locale)} className="rounded-full bg-forest px-5 py-3 text-center font-semibold text-white">
                {isArabic ? "ابحث عن رفيق" : "Find a partner"}
              </Link>
              <Link href={withLocale("/register", locale)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center font-semibold text-slate-900">
                {isArabic ? "انضم الآن" : "Join now"}
              </Link>
            </div>
          </div>

          {travelPosts.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-3">
              {travelPosts.map((post: any) => (
                <TravelPostCard
                  key={post._id}
                  locale={locale}
                  post={post}
                  canReport={Boolean(session?.user)}
                  isSignedIn={Boolean(session?.user)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center shadow-card">
              <h3 className="text-2xl font-black text-ink">{isArabic ? "ابدأ أول إعلان" : "Start the first post"}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/60">
                {isArabic
                  ? "انشر وجهتك وتاريخك ودع المسافرين يتواصلون معك مباشرة."
                  : "Publish your destination and date, then let travelers contact you directly."}
              </p>
            </div>
          )}
        </section>
      ) : null}

      {FEATURES.camping ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
                {isArabic ? "اكتشف الأماكن" : "Camping places"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                {isArabic ? "أماكن التخييم" : "Camping Places"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                {isArabic
                  ? "صور قوية، موقع واضح، ومعلومات تساعدك تختار المكان المناسب بسرعة."
                  : "Stronger visuals, location-first cards and useful details to pick a spot faster."}
              </p>
            </div>
            <Link href={withLocale("/camping", locale)} className="rounded-full bg-[#0f3d2e] px-5 py-3 text-center font-semibold text-white">
              {isArabic ? "اكتشف الأماكن" : "Explore Camping"}
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredPlaces.length > 0 ? (
              featuredPlaces.map((place: any) => (
                <Link
                  key={place._id}
                  href={withLocale(`/camping/${place._id}`, locale)}
                  className="group overflow-hidden rounded-[2rem] bg-white shadow-card"
                >
                  <div className="relative h-64">
                    <Image
                      src={place.heroImage}
                      alt={place.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05),rgba(0,0,0,0.7))]" />
                    <div className="absolute left-4 top-4 flex gap-2">
                      <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">{place.category}</span>
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e]">{place.city || (isArabic ? "المغرب" : "Morocco")}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-black">{place.name}</h3>
                      <p className="mt-2 text-sm text-white/80">
                        {place.city || (isArabic ? "موقع مناسب للتخييم" : "Outdoor camping spot")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <p className="text-sm font-semibold text-slate-600">
                      {isArabic ? "أماكن محدودة" : "Limited spots"}
                    </p>
                    <span className="rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white">
                      {isArabic ? "احجز الآن" : "Explore"}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card lg:col-span-3">
                {isArabic ? "لا توجد أماكن ظاهرة حالياً." : "No camping places are highlighted right now."}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {FEATURES.marketplace ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
                {isArabic ? "المتجر" : "Marketplace"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                {isArabic ? "معدات التخييم" : "Outdoor Gear"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                {isArabic
                  ? "تصفح المنتجات المنشورة من بائعين نشطين وخذ القرار بسرعة من بطاقات أوضح."
                  : "Browse public gear from active sellers with cleaner cards and faster purchase intent."}
              </p>
            </div>
            <Link href={withLocale("/marketplace", locale)} className="rounded-full bg-clay px-5 py-3 text-center font-semibold text-white">
              {isArabic ? "تصفح المعدات" : "Browse Marketplace"}
            </Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredListings.map((listing: any) => (
                <ListingCard key={listing._id} listing={listing} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card">
              {isArabic ? "لا توجد معدات معروضة حالياً." : "No gear is featured right now."}
            </div>
          )}
        </section>
      ) : null}

      {FEATURES.activities ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
                {isArabic ? "أنشطة خارجية" : "Outdoor activities"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                {isArabic ? "اكتشف أنشطة قريبة منك" : "Discover activities near you"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                {isArabic
                  ? "قسم ثانوي لكنه واضح: صور، مدينة، سعر، وزر مباشر لاكتشاف النشاط."
                  : "Secondary but visible: strong visuals, city, price and a direct explore CTA."}
              </p>
            </div>
            <Link href={withLocale("/activities", locale)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center font-semibold text-slate-900">
              {isArabic ? "عرض جميع الأنشطة" : "View all activities"}
            </Link>
          </div>

          {featuredActivities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredActivities.map((activity: any) => (
                <ActivityCard key={activity._id} activity={activity} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card">
              {isArabic ? "لا توجد أنشطة مطابقة حالياً." : "No matching activities right now."}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
