import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeServiceCard } from "@/components/home-service-card";
import { VerificationBadge } from "@/components/verification-badge";
import { getAgencyProfiles } from "@/lib/agency";
import { getPlaces } from "@/lib/camping";
import { getListingsPage } from "@/lib/data";
import { formatLocaleNumber, formatLocalePrice, getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";
import { buildPageMetadata } from "@/lib/seo";

type HomeSearchParams = {
  lang?: string;
};

function isMeaningfulText(value: unknown) {
  return typeof value === "string" && value.replace(/\s+/g, " ").trim().length >= 3;
}

function normalizeAgencyName(value: unknown) {
  if (!isMeaningfulText(value)) {
    return "";
  }

  const compactValue = String(value)
    .replace(/[_\-.]+/g, " ")
    .replace(/\b(officiel|official)\b/gi, "")
    .replace(/moroccan\s*travels?/gi, "Morocco Travels")
    .replace(/\s+/g, " ")
    .trim();

  return compactValue
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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
    images: [resolveImage(listing.images?.[0], fallbackImage)],
    sellerName: normalizeAgencyName(listing.seller?.name) || "Moroccan Trip"
  };
}

function sanitizeAgency(agency: any) {
  const name = normalizeAgencyName(agency?.name);

  if (!name) {
    return null;
  }

  return {
    ...agency,
    name,
    city: isMeaningfulText(agency?.city) ? String(agency.city).trim() : "",
    logo: resolveImage(agency?.logo, "/images/agencies.jpg"),
    coverImage: resolveImage(agency?.coverImage, "/images/agencies.jpg")
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
        ? "Moroccan Trip | كلشي ديال التريب فالمغرب"
        : "Moroccan Trip | Tout pour ton trip au Maroc",
    description:
      locale === "ar"
        ? "وجد التريب ديالك من الأول حتى للآخر: رحلات منظمة، وكالات سفر، كراء وشراء معدات، أماكن تخييم ورفيق تريب فبلاصة وحدة."
        : "Prepare ton trip au Maroc de A a Z : trips organises, agences, location et achat de materiel, spots de camping et compagnon de trip dans une seule plateforme.",
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

  const [agencies, rentalsPage, saleListingsPage, places] = await Promise.all([
    getAgencyProfiles({ limit: 6 }).catch((error) => {
      logServerError("page.home.agencies", error);
      return [];
    }),
    getListingsPage({ type: "rental", page: 1, pageSize: 4 }).catch((error) => {
      logServerError("page.home.rentals", error);
      return {
        listings: [],
        pagination: { page: 1, pageSize: 4, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      };
    }),
    getListingsPage({ type: "sale", page: 1, pageSize: 4 }).catch((error) => {
      logServerError("page.home.sale-listings", error);
      return {
        listings: [],
        pagination: { page: 1, pageSize: 4, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      };
    }),
    getPlaces({ limit: 3 }).catch((error) => {
      logServerError("page.home.places", error);
      return [];
    })
  ]);

  const featuredAgencies = agencies.map(sanitizeAgency).filter(Boolean).slice(0, 3) as any[];
  const featuredRentals = rentalsPage.listings.map((item: any) => sanitizeListing(item, "/images/rent-gear.jpg")).filter(Boolean) as any[];
  const featuredSaleListings = saleListingsPage.listings
    .map((item: any) => sanitizeListing(item, "/images/buy-gear.jpg"))
    .filter(Boolean) as any[];
  const featuredCampingPlaces = places.map(sanitizePlace).filter(Boolean).slice(0, 3) as any[];
  const totalTrips = featuredAgencies.reduce((sum, agency) => sum + Number(agency.stats?.tripsCount || 0), 0);
  const totalOpenSeats = featuredAgencies.reduce((sum, agency) => sum + Number(agency.stats?.openSeats || 0), 0);

  const homeStats = [
    {
      label: isArabic ? "رحلات منظمة" : "Voyages organises",
      value: formatLocaleNumber(totalTrips, locale)
    },
    {
      label: isArabic ? "معدات للكراء" : "Materiel a louer",
      value: formatLocaleNumber(featuredRentals.length, locale)
    },
    {
      label: isArabic ? "أماكن تخييم" : "Spots camping",
      value: formatLocaleNumber(featuredCampingPlaces.length, locale)
    },
    {
      label: isArabic ? "مقاعد مفتوحة" : "Places ouvertes",
      value: formatLocaleNumber(totalOpenSeats, locale)
    }
  ];

  const problemCards = [
    isArabic ? "ماعارفش فين تمشي؟" : "Tu ne sais pas ou partir ?",
    isArabic ? "معندكش ماتريال؟" : "Tu n'as pas de materiel ?",
    isArabic ? "ما لقيتيش معامن؟" : "Tu n'as trouve personne pour sortir ?",
    isArabic ? "خايف من وكالة ما موثوقة؟" : "Tu doutes d'une agence ?"
  ];

  const serviceCards = [
    {
      badgeLabel: isArabic ? "الخدمة الرئيسية" : "Service principal",
      title: isArabic ? "رحلات منظمة" : "Trips organises",
      description: isArabic
        ? "كتلقى trips منظمين ببرنامج واضح، تواريخ، وثقة أكثر قبل الحجز."
        : "Decouvrez des trips organises avec programme clair, dates visibles et plus de confiance avant reservation.",
      href: withLocale("/agencies", locale),
      image: "/images/agencies.jpg",
      ctaLabel: isArabic ? "اكتشف الرحلات" : "Discover trips",
      accent: "#0f3d2e",
      priority: "primary" as const,
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M7 15h10" />
          <path d="M8 9h8" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "وكالات" : "Agences",
      title: isArabic ? "وكالات السفر" : "Agences de voyage",
      description: isArabic
        ? "قارن بين الوكالات، شوف التوثيق، واختار اللي مناسب للتريب ديالك."
        : "Comparez les agences, verifiez la confiance et choisissez la bonne base pour votre trip.",
      href: withLocale("/agencies", locale),
      image: "/images/agencies.jpg",
      ctaLabel: isArabic ? "شوف الوكالات" : "View agencies",
      accent: "#14532d",
      priority: "primary" as const,
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 19h16" />
          <path d="M6 19V9l6-4 6 4v10" />
          <path d="M9 12h6" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "Trip Space" : "Espace Trip",
      title: isArabic ? "مساحة التريب" : "Espace Trip",
      description: isArabic
        ? "من بعد تأكيد الحجز، كتوصل لمساحة التريب باش تشوف المعدات المناسبة للتريب ديالك."
        : "Apres confirmation de reservation, accedez a l'Espace Trip pour voir le materiel adapte a votre trip.",
      href: `${withLocale("/", locale)}#trip-space`,
      image: "/images/trip-code.jpg",
      ctaLabel: isArabic ? "ادخل لمساحة التريب" : "Open Trip Space",
      accent: "#f97316",
      priority: "primary" as const,
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16" />
          <path d="M5 7h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Z" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "كراء" : "Location",
      title: isArabic ? "كراء معدات التخييم" : "Location de materiel",
      description: isArabic
        ? "كري الخيمة، الشنطة، والضروري كامل باش تكمل التريب بلا شراء كلشي."
        : "Louez tente, sac et essentials pour completer votre trip sans tout acheter.",
      href: withLocale("/rentals", locale),
      image: "/images/rent-gear.jpg",
      ctaLabel: isArabic ? "كري معدات" : "Rent gear",
      accent: "#14532d",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 7h10l1.5 6.5H5.5L7 7Z" />
          <path d="M8 13.5V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.5" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "بيع وشراء" : "Marketplace",
      title: isArabic ? "بيع وشراء معدات" : "Achat & vente de materiel",
      description: isArabic
        ? "فتح marketplace ديالك باش تشري أو تبيع معدات camping المستعملة أو الجديدة."
        : "Ouvrez le marketplace pour acheter ou vendre du materiel de camping neuf ou occasion.",
      href: withLocale("/listings/new#sale-products", locale),
      image: "/images/buy-gear.jpg",
      ctaLabel: isArabic ? "بيع أو شري معدات" : "Open marketplace",
      accent: "#f97316",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 7h14l-1 11H6L5 7Z" />
          <path d="M9 10V8a3 3 0 0 1 6 0v2" />
        </svg>
      )
    },
    {
      badgeLabel: "Camping",
      title: isArabic ? "أماكن التخييم" : "Spots de camping",
      description: isArabic
        ? "اكتشف بلايص جديدة للتخييم، شوف الصور، المدينة، وخطط التريب ديالك على بيّنة."
        : "Explorez de nouveaux spots de camping avec photos, ville et infos utiles pour preparer votre trip.",
      href: withLocale("/camping", locale),
      image: "/images/camping.jpg",
      ctaLabel: isArabic ? "اكتشف أماكن التخييم" : "Explore places",
      accent: "#0f3d2e",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 4v16" />
          <path d="M5 18 12 7l7 11" />
          <path d="M8.5 12.5h7" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "مجتمع" : "Communaute",
      title: isArabic ? "رفيق سفر" : "Compagnon de trip",
      description: isArabic
        ? "إلا ما لقيتيش معامن تخرج، لقى رفيق تريب عندو نفس الوجهة أو نفس الڤيب."
        : "Trouvez un compagnon de trip avec la meme destination ou la meme energie de voyage.",
      href: withLocale("/travel-partners", locale),
      image: "/images/travel-partner.jpg",
      ctaLabel: isArabic ? "لقى رفيق تريب" : "Find partners",
      accent: "#c2410c",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 4.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  const trustPoints = [
    {
      title: isArabic ? "وكالات موثوقة" : "Agences fiables",
      description: isArabic
        ? "المنصة كتبين التوثيق من البداية باش تعرف معامن كتهضر."
        : "La verification apparait des le debut pour savoir avec qui vous traitez."
    },
    {
      title: isArabic ? "محتوى منظم" : "Contenu propre",
      description: isArabic
        ? "الهوم فيها غير العناوين الواضحة، الصور النظيفة، والأسعار الصحيحة."
        : "L'accueil ne montre que titres clairs, visuels propres et prix valides."
    },
    {
      title: isArabic ? "اختيار سريع" : "Choix rapide",
      description: isArabic
        ? "كتلقى التريب، الماتريال، والبلاصا المناسبة فثواني."
        : "Trip, materiel et spot adapte se trouvent en quelques secondes."
    }
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8 sm:space-y-10">
      <section className="overflow-hidden rounded-[2rem] bg-[#0f3d2e] shadow-[0_24px_70px_rgba(15,61,46,0.22)] sm:rounded-[2.5rem]">
        <div className="relative">
          <Image
            src="/images/hero-main.jpg"
            alt={isArabic ? "رحلة وتخييم في المغرب" : "Trip et camping au Maroc"}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,31,24,0.92),rgba(15,61,46,0.82),rgba(249,115,22,0.22))]" />
          <div className="relative grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
            <div className="space-y-6 text-white">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.25em] text-white/85">
                {isArabic ? "كلشي ديال التريب فبلاصة وحدة" : "Tout pour ton trip au Maroc"}
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">
                  {isArabic ? "وجد التريب ديالك من الأول حتى للآخر" : "Prepare ton trip au Maroc de A a Z"}
                </h1>
                <p className="max-w-2xl text-sm leading-8 text-white/85 sm:text-base">
                  {isArabic
                    ? "رحلات، كراء معدات، بيع وشراء، أماكن تخييم، ورفيق سفر... كلشي فبلاصة وحدة."
                    : "Trips organises, location de materiel, achat/vente, spots de camping et compagnons de voyage dans une seule plateforme."}
                </p>
                <p className="max-w-2xl text-sm leading-8 text-white/72 sm:text-base">
                  {isArabic
                    ? "Moroccan Trip كتعاونك تكتاشف trips، تجهز gear، تلقى spots، وتكمل التريب ديالك بلا تشتت."
                    : "Moroccan Trip vous aide a trouver des trips, preparer votre gear, explorer des spots et completer votre trip sans dispersion."}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={withLocale("/agencies", locale)}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f3d2e] transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  {isArabic ? "اكتشف الرحلات" : "Discover trips"}
                </Link>
                <Link
                  href={withLocale("/rentals", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ea580c]"
                >
                  {isArabic ? "كري معدات" : "Rent gear"}
                </Link>
                <Link
                  href={withLocale("/camping", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {isArabic ? "اكتشف أماكن التخييم" : "Explore places"}
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    title: isArabic ? "التريبات" : "Trips",
                    body: isArabic ? "رحلات منظمة ووكالات موثوقة" : "Trips organises et agences fiables"
                  },
                  {
                    title: isArabic ? "الكراء والـ gear" : "Gear & rentals",
                    body: isArabic ? "كراء، بيع وشراء معدات التخييم" : "Location, achat et vente de materiel"
                  },
                  {
                    title: isArabic ? "الأماكن والرفقة" : "Spots & partners",
                    body: isArabic ? "أماكن تخييم ورفيق تريب" : "Spots camping et compagnon de trip"
                  }
                ].map((item) => (
                  <div key={item.title} className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm font-black text-white">{item.title}</p>
                    <p className="mt-2 text-xs leading-6 text-white/75">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 self-end">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/12 p-5 text-white backdrop-blur">
                <p className="text-xs font-bold tracking-[0.24em] text-white/70">
                  {isArabic ? "شنو كتلقى هنا؟" : "Ce que vous trouvez ici"}
                </p>
                <h2 className="mt-3 text-2xl font-black">
                  {isArabic ? "اختار التريب، حضر gear، وكمل الخطة فبلاصة وحدة" : "Choisissez le trip, preparez le gear et finalisez le plan au meme endroit"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  {isArabic
                    ? "التريبات، الوكالات، الMarketplace، الكراء، السبوطات ورفيق التريب مرتبّين باش توصل بسرعة لقرار واضح."
                    : "Trips, agences, marketplace, location, spots et compagnons de trip sont organises pour vous mener vite a une decision claire."}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {homeStats.map((item, index) => (
                  <div
                    key={item.label}
                    className={`${index === 1 ? "bg-[#f97316] text-white" : "bg-white/12 text-white"} rounded-[1.5rem] border border-white/10 p-5 backdrop-blur`}
                  >
                    <p className="text-xs font-bold tracking-[0.24em] text-white/75">{item.label}</p>
                    <p className="mt-3 text-3xl font-black">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "قبل ما تخرج" : "Avant de partir"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {isArabic ? "شنو كيوقفك قبل التريب؟" : "Qu'est-ce qui bloque ton trip ?"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {isArabic
                ? "هادشي هو اللي كيخلّي بزاف ديال الناس يأجلو التخييم أو الرحلة، وهادشي بالضبط اللي Moroccan Trip جات تحلو."
                : "C'est souvent ce qui retarde un camping ou un trip, et c'est exactement ce que Moroccan Trip aide a resoudre."}
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-[#0f3d2e]/10 bg-[#f6fbf8] p-5">
            <p className="text-sm font-semibold text-[#0f3d2e]">
              {isArabic
                ? "Moroccan Trip كتعاونك تختار التريب، تجهز الماتريال، وتلقى الناس المناسبين."
                : "Moroccan Trip vous aide a choisir le trip, preparer le materiel et trouver les bonnes personnes."}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {problemCards.map((problem) => (
            <article key={problem} className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f3d2e] text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-900">{problem}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "الخدمات الرئيسية" : "Services principaux"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {isArabic ? "كل خدمات التريب فواجهة واحدة" : "Tous les services du trip sur une seule page"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              {isArabic
                ? "التريبات والوكالات ومساحة التريب باقين الأساس، ولكن الكراء والMarketplace والأماكن ورفيق التريب ظاهرين بوضوح حتى هما."
                : "Trips, agences et Espace Trip restent le coeur, tout en gardant location, marketplace, spots et compagnons bien visibles."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {serviceCards.map((service) => (
              <HomeServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="trip-space"
        className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_45px_rgba(15,61,46,0.08)]"
      >
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[260px]">
          <Image
            src="/images/trip-code.jpg"
            alt={isArabic ? "مساحة التريب" : "Espace Trip"}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/80">
                {isArabic ? "مساحة التريب" : "Espace Trip"}
              </p>
              <h2 className="mt-2 text-3xl font-black">
                {isArabic ? "أكدتي الحجز؟ دخل لمساحة التريب" : "Reservation confirmee ? Ouvrez l'Espace Trip"}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/80">
                {isArabic
                  ? "من بعد تأكيد الحجز، كتلقى زر الدخول لمساحة التريب فلوحة الحساب ديالك وتلقى المعدات المرتبطة بنفس الرحلة."
                  : "Apres confirmation, vous voyez le bouton d'entree dans votre tableau de bord et accedez au materiel lie a ce voyage."}
              </p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid gap-4 rounded-[1.75rem] bg-slate-50 p-5 sm:p-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {isArabic ? "وصول منظم من بعد الحجز" : "Acces structure apres reservation"}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {isArabic
                    ? "اختار رحلة، دير الحجز، ومن بعد التأكيد تلقى مساحة خاصة فيها تفاصيل الرحلة والمعدات المناسبة."
                    : "Choisissez un voyage, effectuez la reservation, puis retrouvez un espace prive avec les details et le materiel adapte."}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={withLocale("/agencies", locale)}
                  className="inline-flex items-center justify-center rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14533f]"
                >
                  {isArabic ? "وجد التريب ديالك" : "Trouver ton trip"}
                </Link>
                <Link
                  href={withLocale("/dashboard", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {isArabic ? "لوحتي" : "Mon tableau"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "الثقة" : "Confiance"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {isArabic ? "علاش القرار كيكون أسهل؟" : "Pourquoi la decision est plus facile ?"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {isArabic
                ? "الهوم كتبيّن غير المحتوى المنظم: وكالات منسقة، عناوين صحيحة، أسعار صالحة، وصور fallback نظيفة."
                : "L'accueil montre uniquement un contenu propre : agences normalisees, titres valides, prix utiles et visuels de secours propres."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <article key={point.title} className="rounded-[1.5rem] bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3d2e] text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{point.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "وكالات السفر" : "Agences de voyage"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {isArabic ? "وكالات مرتبة وواضحة قبل ما تحجز" : "Des agences claires avant de reserver"}
            </h2>
          </div>
          <Link
            href={withLocale("/agencies", locale)}
            className="inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14533f]"
          >
            {isArabic ? "عرض كل الوكالات" : "Voir les agences"}
          </Link>
        </div>
        {featuredAgencies.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredAgencies.map((agency) => (
              <article
                key={agency._id}
                className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,61,46,0.16)]"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={agency.coverImage}
                    alt={agency.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,61,46,0.2)_50%,rgba(0,0,0,0.76)_100%)]" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {isArabic ? "وكالة سفر" : "Agence"}
                    </span>
                    <VerificationBadge type="agency" status={agency.verificationStatus} locale={locale} />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-2xl font-black text-white">{agency.name}</h3>
                      <p className="mt-2 text-sm text-white/80">
                        {agency.city || (isArabic ? "المغرب" : "Maroc")}
                      </p>
                    </div>
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/30 bg-white/20 backdrop-blur">
                      <Image src={agency.logo} alt={agency.name} fill sizes="56px" className="object-cover" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 p-5">
                  <div className="rounded-[1.4rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الرحلات" : "Trips"}</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{agency.stats?.tripsCount || 0}</p>
                  </div>
                  <div className="rounded-[1.4rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isArabic ? "المقاعد" : "Places"}</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{agency.stats?.openSeats || 0}</p>
                  </div>
                  <div className="rounded-[1.4rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الثقة" : "Confiance"}</p>
                    <p className="mt-2 text-base font-black text-slate-900">
                      {agency.verificationStatus === "verified" ? (isArabic ? "موثوقة" : "Verifiee") : isArabic ? "قيد المراجعة" : "En revue"}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <Link
                    href={withLocale(`/agencies/${agency._id}`, locale)}
                    className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-3 font-semibold text-white transition hover:bg-[#14533f]"
                  >
                    {isArabic ? "عرض الوكالة" : "Voir l'agence"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="section-card p-6 text-sm text-slate-600">
            {isArabic ? "ما كايناش وكالات ظاهرة دابا." : "Aucune agence visible pour le moment."}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "كراء المعدات" : "Location de materiel"}
            </p>
            <h2 className="text-3xl font-black text-slate-900">
              {isArabic ? "معدات جاهزة للتريب والتخييم" : "Du materiel pret pour le trip et le camping"}
            </h2>
          </div>
          <Link href={withLocale("/rentals", locale)} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
            {isArabic ? "شوف كل معدات الكراء" : "Voir toute la location"}
          </Link>
        </div>
        {featuredRentals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredRentals.map((listing) => (
              <Link
                key={listing._id}
                href={withLocale(`/listings/${listing._id}`, locale)}
                className="group overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,61,46,0.08)] transition hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,61,46,0.16)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,61,46,0.12)_50%,rgba(0,0,0,0.72)_100%)]" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e]">
                    {listing.category}
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-900">{listing.title}</h3>
                  <div className="inline-flex rounded-full bg-[#fff7ed] px-4 py-2 text-lg font-black text-[#c2410c]">
                    {formatLocalePrice(Number(listing.price || 0), locale)}
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="truncate">{listing.location || (isArabic ? "المغرب" : "Maroc")}</span>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      {isArabic ? "كراء" : "Location"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="section-card p-6 text-sm text-slate-600">
            {isArabic ? "ما كايناش معدات كراء صالحة للعرض دابا." : "Aucun materiel de location propre a afficher pour le moment."}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "بيع وشراء" : "Achat et vente"}
            </p>
            <h2 className="text-3xl font-black text-slate-900">
              {isArabic ? "شراء وبيع معدات camping" : "Acheter et vendre du materiel camping"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={withLocale("/listings/new#sale-products", locale)} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
              {isArabic ? "شوف العروض" : "Voir les offres"}
            </Link>
            <Link href={withLocale("/listings/new", locale)} className="rounded-full bg-[#f97316] px-4 py-2 font-semibold text-white">
              {isArabic ? "نشر إعلان" : "Publier"}
            </Link>
          </div>
        </div>
        {featuredSaleListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredSaleListings.map((listing) => (
              <Link
                key={listing._id}
                href={withLocale(`/listings/${listing._id}`, locale)}
                className="group overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,61,46,0.08)] transition hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,61,46,0.16)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,61,46,0.12)_50%,rgba(0,0,0,0.72)_100%)]" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e]">
                    {listing.category}
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-900">{listing.title}</h3>
                  <div className="inline-flex rounded-full bg-[#fff7ed] px-4 py-2 text-lg font-black text-[#c2410c]">
                    {formatLocalePrice(Number(listing.price || 0), locale)}
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="truncate">{listing.location || (isArabic ? "المغرب" : "Maroc")}</span>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      {isArabic ? "بيع" : "Vente"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="section-card p-6 text-sm text-slate-600">
            {isArabic ? "ما كايناش منتجات بيع صالحة للعرض دابا." : "Aucun produit de vente propre a afficher pour le moment."}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">Camping</p>
            <h2 className="text-3xl font-black text-slate-900">
              {isArabic ? "أماكن التخييم فالمغرب" : "Lieux de camping au Maroc"}
            </h2>
          </div>
          <Link href={withLocale("/camping", locale)} className="inline-flex rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
            {isArabic ? "عرض جميع أماكن التخييم" : "Voir tous les lieux"}
          </Link>
        </div>
        {featuredCampingPlaces.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredCampingPlaces.map((place) => (
              <article
                key={place._id}
                className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,61,46,0.16)]"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={place.heroImage}
                    alt={place.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,61,46,0.18)_50%,rgba(0,0,0,0.76)_100%)]" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {place.category}
                    </span>
                    <VerificationBadge type="place" status={place.status} locale={locale} />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="line-clamp-2 text-2xl font-black text-white">{place.name}</h3>
                    <p className="mt-2 text-sm text-white/80">{place.city || (isArabic ? "المغرب" : "Maroc")}</p>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    {place.ratingAverage ? (
                      <span className="rounded-full bg-slate-50 px-3 py-2">
                        {isArabic ? "التقييم" : "Note"}: {place.ratingAverage}/5
                      </span>
                    ) : null}
                    {place.reviewCount ? (
                      <span className="rounded-full bg-slate-50 px-3 py-2">
                        {place.reviewCount} {isArabic ? "مراجعات" : "avis"}
                      </span>
                    ) : null}
                    {place.savedCount ? (
                      <span className="rounded-full bg-slate-50 px-3 py-2">
                        {place.savedCount} {isArabic ? "حفظ" : "sauvegardes"}
                      </span>
                    ) : null}
                  </div>
                  <Link href={withLocale(`/camping/${place._id}`, locale)} className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-3 font-semibold text-white transition hover:bg-[#14533f]">
                    {isArabic ? "عرض التفاصيل" : "Voir les details"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="section-card p-6 text-sm text-slate-600">
            {isArabic ? "لا توجد أماكن تخييم منشورة حالياً." : "Aucun lieu de camping publie pour le moment."}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[2rem] shadow-[0_22px_60px_rgba(15,61,46,0.16)]">
        <div className="relative">
          <Image
            src="/images/camping.jpg"
            alt={isArabic ? "تخييم بالمغرب" : "Camping au Maroc"}
            fill
            sizes="100vw"
            className="absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,61,46,0.88),rgba(15,61,46,0.65),rgba(249,115,22,0.34))]" />
          <div className="relative flex flex-col gap-4 px-6 py-10 text-white sm:px-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/75">
                {isArabic ? "خرجها مرتاحة" : "Partez sereinement"}
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                {isArabic ? "التريب ديالك كيبدا من هنا وكيكمل هنا" : "Ton trip commence ici et se complete ici"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/80">
                {isArabic
                  ? "بلا ما تبقى تقلّب بزاف: لقى التريب، شوف الوكالة، اكتشف السبوط، وكري ولا شري gear من نفس البلاصة."
                  : "Sans multiplier les recherches : trouvez le trip, l'agence, le spot, puis louez ou achetez le gear depuis la meme plateforme."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={withLocale("/agencies", locale)}
                className="inline-flex w-fit items-center justify-center rounded-full bg-[#f97316] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ea580c]"
              >
                {isArabic ? "وجد التريب ديالك" : "Trouver ton trip"}
              </Link>
              <Link
                href={withLocale("/listings/new#sale-products", locale)}
                className="inline-flex w-fit items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                {isArabic ? "فتح الMarketplace" : "Open marketplace"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="section-card px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Moroccan Trip</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {isArabic
                ? "منصة مغربية للرحلات، التخييم، كراء وشراء المعدات، ورفيق السفر."
                : "Plateforme marocaine pour voyages, camping, location et achat de materiel, et compagnon de voyage."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <Link href={withLocale("/", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "الرئيسية" : "Accueil"}
            </Link>
            <Link href={withLocale("/agencies", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "الرحلات" : "Voyages"}
            </Link>
            <Link href={withLocale("/rentals", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "كراء المعدات" : "Location"}
            </Link>
            <Link href={withLocale("/listings/new", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              Marketplace
            </Link>
            <Link href={withLocale("/camping", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "التخييم" : "Camping"}
            </Link>
            <Link href={withLocale("/travel-partners", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "رفيق تريب" : "Compagnon de trip"}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
