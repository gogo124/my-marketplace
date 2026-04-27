import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { HomeTripCodeCard } from "@/components/home-trip-code-card";
import { HomeServiceCard } from "@/components/home-service-card";
import { VerificationBadge } from "@/components/verification-badge";
import { getAgencyProfiles } from "@/lib/agency";
import { getAuthSession } from "@/lib/auth";
import { getPlaces } from "@/lib/camping";
import { getListingsPage } from "@/lib/data";
import { formatLocaleDate, formatLocaleNumber, getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";
import { buildPageMetadata } from "@/lib/seo";
import { getTravelPosts } from "@/lib/travel-posts";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title:
      locale === "ar"
        ? "Moroccan Trip | احجز الرحلة وكراء المعدات وابحث عن رفيق السفر"
        : "Moroccan Trip | Voyages, equipements et compagnons de route au Maroc",
    description:
      locale === "ar"
        ? "احجز الرحلة، كراء المعدات، وابحث عن رفيق السفر في منصة مغربية واحدة تجمع الوكالات الموثقة والمنتجات والخدمات."
        : "Reservez un voyage, louez votre equipement et trouvez un compagnon de route sur une plateforme marocaine claire et fiable.",
    path: "/",
    image: "/images/hero-main.jpg"
  });
}

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; type?: string; location?: string; category?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const session = await getAuthSession().catch((error) => {
    logServerError("page.home.auth", error);
    return null;
  });
  const [agencies, listingsPage, featuredCampingPlaces, travelPartnerPreview] = await Promise.all([
    getAgencyProfiles().catch((error) => {
      logServerError("page.home.agencies", error);
      return [];
    }),
    getListingsPage({ type: "sale", page: 1, pageSize: 4 }).catch((error) => {
      logServerError("page.home.listings", error);
      return {
        listings: [],
        pagination: {
          page: 1,
          pageSize: 4,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }),
    getPlaces({ userId: session?.user?.id, limit: 3 }).catch((error) => {
      logServerError("page.home.places", error);
      return [];
    }),
    getTravelPosts({ userId: session?.user?.id, limit: 3 }).catch((error) => {
      logServerError("page.home.travel-posts", error);
      return [];
    })
  ]);

  const featuredAgencies = agencies.slice(0, 3);
  const featuredSaleListings = listingsPage.listings.slice(0, 4);
  const totalTrips = agencies.reduce((sum: number, agency: any) => sum + Number(agency.stats?.tripsCount || 0), 0);
  const totalOpenSeats = agencies.reduce((sum: number, agency: any) => sum + Number(agency.stats?.openSeats || 0), 0);
  const totalProducts = Number(listingsPage.pagination.total || 0);

  const homeStats = [
    {
      label: isArabic ? "وكالات نشيطة" : "Agences actives",
      value: formatLocaleNumber(agencies.length, locale)
    },
    {
      label: isArabic ? "رحلات متاحة" : "Voyages disponibles",
      value: formatLocaleNumber(totalTrips, locale)
    },
    {
      label: isArabic ? "مقاعد مفتوحة" : "Places ouvertes",
      value: formatLocaleNumber(totalOpenSeats, locale)
    },
    {
      label: isArabic ? "منتجات للبيع" : "Produits en vente",
      value: formatLocaleNumber(totalProducts, locale)
    }
  ];

  const services = [
    {
      badgeLabel: isArabic ? "الأكثر طلباً" : "Populaire",
      title: isArabic ? "رحلات مع وكالات" : "Voyages avec agences",
      description: isArabic ? "قارن بين وكالات موثقة، البرامج، والمقاعد المتاحة بسرعة." : "Comparez rapidement les agences verifiees, les programmes et les places disponibles.",
      href: withLocale("/agencies", locale),
      image: "/images/agencies.jpg",
      ctaLabel: isArabic ? "استكشف الرحلات" : "Explorer",
      accent: "#0f3d2e",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M7 15h10" />
          <path d="M8 9h8" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "معدات" : "Equipement",
      title: isArabic ? "كراء المعدات" : "Louer du materiel",
      description: isArabic ? "استأجر تجهيزات السفر والتخييم بسهولة عندما تحتاجها." : "Accedez au materiel de voyage et de camping quand vous en avez besoin.",
      href: withLocale("/rentals", locale),
      image: "/images/rent-gear.jpg",
      ctaLabel: isArabic ? "شوف العروض" : "Voir les offres",
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
      badgeLabel: isArabic ? "متجر" : "Boutique",
      title: isArabic ? "شراء معدات" : "Acheter du materiel",
      description: isArabic ? "اكتشف منتجات جديدة ومستعملة من بائعين موثقين داخل المنصة." : "Decouvrez des produits neufs ou d'occasion proposes par des vendeurs verifies.",
      href: withLocale("/listings/new#sale-products", locale),
      image: "/images/buy-gear.jpg",
      ctaLabel: isArabic ? "تصفح المتجر" : "Voir la boutique",
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
      title: isArabic ? "أماكن التخييم" : "Lieux de camping",
      description: isArabic ? "اعثر على أماكن موصى بها مع صور، تفاصيل، وتقييمات أوضح." : "Trouvez des spots recommandes avec photos, details et signaux de confiance plus clairs.",
      href: withLocale("/camping", locale),
      image: "/images/camping.jpg",
      ctaLabel: isArabic ? "اكتشف الأماكن" : "Decouvrir",
      accent: "#0f3d2e",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 4v16" />
          <path d="M5 18 12 7l7 11" />
          <path d="M8.5 12.5h7" />
        </svg>
      )
    }
  ];

  const supportTools = [
    {
      title: "Trip Code",
      description: isArabic ? "دخول مباشر إلى تفاصيل الرحلة بعد تأكيد الحجز." : "Acces direct aux details du voyage apres confirmation.",
      href: `${withLocale("/", locale)}#trip-code`
    },
    {
      title: isArabic ? "رفيق سفر" : "Partenaire de voyage",
      description: isArabic ? "ابحث عن شخص يشاركك نفس الوجهة أو نفس الاهتمامات." : "Trouvez quelqu'un qui partage votre destination ou votre style de voyage.",
      href: withLocale("/travel-partners", locale)
    }
  ];

  const trustPoints = [
    {
      title: isArabic ? "وكالات وبائعون موثقون" : "Agences et vendeurs verifies",
      description: isArabic ? "إشارات التوثيق ظاهرة من البداية لتقليل التردد." : "Les signaux de verification apparaissent plus tot pour reduire l'hesitation."
    },
    {
      title: isArabic ? "تقييمات ومراجعات" : "Notes et avis",
      description: isArabic ? "المستخدم يقدر يقارن بسرعة قبل ما يتواصل أو يحجز." : "Les utilisateurs peuvent comparer plus vite avant de contacter ou reserver."
    },
    {
      title: isArabic ? "خطوات واضحة" : "Parcours plus clair",
      description: isArabic ? "كل صفحة عندها هدف واضح: استكشاف، مقارنة، أو دخول مباشر." : "Chaque page sert mieux une intention claire : explorer, comparer ou acceder."
    }
  ];

  const steps = [
    {
      number: "1",
      title: isArabic ? "اختار المسار المناسب" : "Choisissez le bon parcours",
      description: isArabic ? "رحلات، معدات، تخييم أو شريك سفر من الواجهة الرئيسية مباشرة." : "Voyages, equipements, camping ou partenaire de route directement depuis l'accueil."
    },
    {
      number: "2",
      title: isArabic ? "قارن قبل ما تقرر" : "Comparez avant d'agir",
      description: isArabic ? "شوف التوثيق، التقييم، المدينة، والمقاعد أو السعر في ثوانٍ." : "Verification, note, ville, places ou prix sont plus lisibles en quelques secondes."
    },
    {
      number: "3",
      title: isArabic ? "تواصل أو ادخل مباشرة" : "Contactez ou accedez directement",
      description: isArabic ? "انطلق نحو الحجز، التفاصيل، أو الرسائل بدون لف ودوران." : "Passez plus vite a la reservation, au detail ou a la messagerie."
    }
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8 sm:space-y-10">
      <section className="overflow-hidden rounded-[2rem] bg-[#0f3d2e] shadow-[0_24px_70px_rgba(15,61,46,0.22)] sm:rounded-[2.5rem]">
        <div className="relative">
          <Image
            src="/images/hero-main.jpg"
            alt={isArabic ? "منظر جبال وطبيعة في المغرب" : "Paysage marocain"}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,31,24,0.9),rgba(15,61,46,0.76),rgba(15,61,46,0.42))]" />
          <div className="relative grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
            <div className="hero-fade-up space-y-6 text-white">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.25em] text-white/85">
                {isArabic ? "منصة سفر أوضح وأسهل" : "Une plateforme voyage plus claire"}
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">
                  {isArabic ? "احجز الرحلة + كراء المعدات + رفيق السفر في منصة واحدة" : "Reservez le voyage, l'equipement et le compagnon de route depuis une seule plateforme"}
                </h1>
                <p className="max-w-2xl text-sm leading-8 text-white/85 sm:text-base">
                  {isArabic
                    ? "Moroccan Trip تجمع الرحلات المنظمة، الوكالات الموثقة، كراء أو شراء المعدات، ورفيق السفر في تجربة أوضح وأسرع في اتخاذ القرار."
                    : "Moroccan Trip reunit voyages organises, agences verifiees, equipements et compagnons de route dans un parcours plus clair et plus orienté action."}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={withLocale("/agencies", locale)}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f3d2e] transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  {isArabic ? "استكشف الرحلات" : "Explorer les voyages"}
                </Link>
                <Link
                  href={withLocale("/agencies", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {isArabic ? "شوف الوكالات" : "Voir les agences"}
                </Link>
                <Link
                  href={withLocale("/travel-partners", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  {isArabic ? "ابحث عن رفيق سفر" : "Chercher un compagnon"}
                </Link>
              </div>
              <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <form
                  action={withLocale("/agencies", locale)}
                  className="rounded-[1.75rem] border border-white/15 bg-white/95 p-4 shadow-2xl backdrop-blur"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                    {isArabic ? "ابحث عن الرحلة أو الوكالة" : "Chercher un voyage ou une agence"}
                  </p>
                  <div className="mt-3 grid gap-3">
                    <input
                      type="text"
                      name="q"
                      placeholder={isArabic ? "مثلاً: مرزوكة، توبقال، جبل" : "Ex: Merzouga, Toubkal, desert"}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d2e]/30 focus:ring-2 focus:ring-[#0f3d2e]/10"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        name="destination"
                        placeholder={isArabic ? "الوجهة" : "Destination"}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d2e]/30 focus:ring-2 focus:ring-[#0f3d2e]/10"
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder={isArabic ? "المدينة" : "Ville"}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d2e]/30 focus:ring-2 focus:ring-[#0f3d2e]/10"
                      />
                    </div>
                    <button className="rounded-2xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c]">
                      {isArabic ? "استكشف الرحلات" : "Explorer les voyages"}
                    </button>
                  </div>
                </form>
                <form
                  action={withLocale("/travel-partners", locale)}
                  className="rounded-[1.75rem] border border-white/15 bg-white/10 p-4 text-white backdrop-blur"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
                    {isArabic ? "ابحث عن أشخاص يسافرون لنفس الوجهة" : "Trouver des voyageurs vers la meme destination"}
                  </p>
                  <div className="mt-3 grid gap-3">
                    <input
                      type="text"
                      name="destination"
                      placeholder={isArabic ? "الوجهة" : "Destination"}
                      className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="date"
                        name="date"
                        className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder={isArabic ? "المدينة" : "Ville"}
                        className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                      />
                    </div>
                    <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0f3d2e] transition hover:bg-slate-100">
                      {isArabic ? "ابحث عن رفيق سفر" : "Chercher un compagnon"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-white/90">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
                  {isArabic ? "وكالات موثقة" : "Agences verifiees"}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
                  {isArabic ? "تقييمات ومراجعات" : "Notes et avis"}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
                  {isArabic ? "دخول سريع عبر Trip Code" : "Acces rapide par Trip Code"}
                </span>
              </div>
            </div>
            <div className="hero-fade-up grid gap-4 self-end">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/12 p-5 text-white backdrop-blur">
                <p className="text-xs font-bold tracking-[0.24em] text-white/70">
                  {isArabic ? "من أين تبدأ؟" : "Par ou commencer"}
                </p>
                <h2 className="mt-3 text-2xl font-black">
                  {isArabic ? "اختر المسار حسب نيتك الحالية" : "Choisissez le bon parcours selon votre intention"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  {isArabic
                    ? "رحلة منظمة، معدات، أو رفيق سفر: كل مسار أصبح أوضح من البداية مع أرقام حقيقية من المنصة."
                    : "Voyage organise, equipement ou compagnon de route : chaque parcours demarre avec des informations plus claires et des chiffres reels."}
                </p>
                <Link
                  href={withLocale("/agencies", locale)}
                  className="mt-5 inline-flex rounded-full bg-[#f97316] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ea580c]"
                >
                  {isArabic ? "شوف الوكالات" : "Voir les agences"}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {homeStats.map((item, index) => (
                  <div
                    key={item.label}
                    className={`${index === homeStats.length - 1 ? "bg-[#f97316] text-white" : "bg-white/12 text-white"} rounded-[1.5rem] border border-white/10 p-5 backdrop-blur`}
                  >
                    <p className={`${index === homeStats.length - 1 ? "text-white/80" : "text-white/70"} text-xs font-bold tracking-[0.24em]`}>
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-black">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {travelPartnerPreview.length > 0 ? (
        <section className="-mt-2 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="section-card p-5 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "رفيق سفر" : "Partenaire de voyage"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {isArabic ? "أشخاص يسافرون الآن إلى وجهات مشابهة" : "Des voyageurs partent deja vers des destinations similaires"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {isArabic ? "إعلانات حقيقية من قاعدة البيانات مع الوجهة، التاريخ، والجاهزية للتواصل عبر واتساب." : "Des annonces reelles issues de la base de donnees avec destination, date et disponibilite pour un contact WhatsApp."}
            </p>
            <Link href={withLocale("/travel-partners", locale)} className="mt-5 inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white">
              {isArabic ? "استكشف كل الإعلانات" : "Voir toutes les annonces"}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {travelPartnerPreview.map((post: any) => (
              <Link
                key={post._id}
                href={withLocale(`/travel-partners?destination=${encodeURIComponent(post.destination)}${post.city ? `&city=${encodeURIComponent(post.city)}` : ""}`, locale)}
                className="section-card flex flex-col gap-4 p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,61,46,0.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
                    {post.city || (isArabic ? "بدون مدينة" : "Sans ville")}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                    {formatLocaleDate(post.date, locale, { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <div>
                  <h3 className="line-clamp-2 text-lg font-black text-slate-900">{post.destination}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">{post.description}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-slate-50 px-3 py-1">
                    {post.profileCompleteness || 0}% {isArabic ? "اكتمال" : "profil"}
                  </span>
                  <span className="rounded-full bg-slate-50 px-3 py-1">
                    {post.hasVerifiedAccount ? (isArabic ? "حساب موثق" : "compte verifie") : isArabic ? "حساب ظاهر" : "profil visible"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "المسارات الرئيسية" : "Parcours principaux"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {isArabic ? "اختار بسرعة الخدمة اللي تناسبك" : "Choisissez rapidement le bon point d'entree"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              {isArabic ? "قسمنا البداية إلى مسارات واضحة باش المستخدم يفهم المنصة خلال أول ثواني." : "L'accueil est organise autour de parcours clairs pour etre compris en quelques secondes."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <HomeServiceCard
                key={service.title}
                title={service.title}
                description={service.description}
                href={service.href}
                image={service.image}
                icon={service.icon}
                badgeLabel={service.badgeLabel}
                ctaLabel={service.ctaLabel}
                accent={service.accent}
              />
            ))}
          </div>
        </div>
        <aside className="section-card p-5 sm:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
            {isArabic ? "أدوات مفيدة" : "Outils utiles"}
          </p>
          <div className="mt-4 space-y-4">
            {supportTools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="block rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4 transition hover:border-[#0f3d2e]/15 hover:bg-white hover:shadow-sm"
              >
                <h3 className="text-lg font-black text-slate-900">{tool.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="section-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "الثقة والوضوح" : "Confiance et clarte"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {isArabic ? "المنصة كتبيّن لك إشارات الثقة قبل ما تطلب أي خطوة" : "La plateforme montre les bons signaux avant chaque action"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {isArabic ? "التوثيق، التقييم، والهدف من كل صفحة أصبح ظاهر أكثر لتسهيل القرار وتقليل التردد." : "Verification, notes et intention de page sont mis en avant pour faciliter la decision et reduire les frictions."}
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

      <section className="grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <article key={step.number} className="section-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f3d2e] text-lg font-black text-white">
              {step.number}
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
          </article>
        ))}
      </section>

      <section
        id="trip-code"
        className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_45px_rgba(15,61,46,0.08)]"
      >
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[260px]">
            <Image
              src="/images/trip-code.jpg"
              alt="Trip Code"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/80">Trip Code</p>
              <h2 className="mt-2 text-3xl font-black">
                {isArabic ? "دخول سريع إلى تفاصيل الرحلة" : "Accedez rapidement aux details du voyage"}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/80">
                {isArabic
                  ? "من بعد تأكيد الحجز، الوكالة تقدر تعطيك Trip Code باش تدخل مباشرة للرحلة والمعلومات المرتبطة بها."
                  : "Apres confirmation, l'agence peut partager un Trip Code pour ouvrir directement votre voyage et les informations associees."}
              </p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="rounded-[1.75rem] bg-slate-50 p-5 sm:p-6">
              <p className="text-sm font-semibold text-slate-500">
                {isArabic ? "طريقة سريعة وواضحة" : "Acces rapide et simple"}
              </p>
              <HomeTripCodeCard locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "وكالات مختارة" : "Agences a la une"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {isArabic ? "ابدأ بجهات أكثر وضوحاً وثقة" : "Commencez par des agences plus claires et plus fiables"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {isArabic ? "عدد الرحلات، المقاعد، التوثيق، والتقييم ظاهر من البداية باش القرار يكون أسرع." : "Trips, places, verification et confiance apparaissent plus tot pour aider la decision."}
            </p>
          </div>
          <Link
            href={withLocale("/agencies", locale)}
            className="inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14533f]"
          >
            {isArabic ? "عرض كل الوكالات" : "Voir toutes les agences"}
          </Link>
        </div>
        {featuredAgencies.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredAgencies.map((agency: any) => {
              const logo = agency.logo || "/images/agencies.jpg";
              const coverImage = agency.coverImage || "/images/agencies.jpg";
              const rating = Number(agency.rating || 0);
              const profileCompleteness = Number(agency.profileCompleteness || 0);

              return (
                <article
                  key={agency._id}
                  className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,61,46,0.16)]"
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={coverImage}
                      alt={agency.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,61,46,0.2)_50%,rgba(0,0,0,0.76)_100%)]" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                        {isArabic ? "وكالة" : "Agence"}
                      </span>
                      <VerificationBadge type="agency" status={agency.verificationStatus} locale={locale} />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-2xl font-black text-white">{agency.name}</h3>
                        <p className="mt-2 text-sm text-white/80">{agency.city}</p>
                      </div>
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/30 bg-white/20 backdrop-blur">
                        <Image src={logo} alt={agency.name} fill sizes="56px" className="object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <p className="line-clamp-3 text-sm leading-7 text-slate-600">{agency.description}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-[1.4rem] bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الرحلات" : "Trips"}</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{agency.stats?.tripsCount || 0}</p>
                      </div>
                      <div className="rounded-[1.4rem] bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isArabic ? "التقييم" : "Note"}</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{rating > 0 ? rating.toFixed(1) : "4.8"}</p>
                      </div>
                      <div className="rounded-[1.4rem] bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الملف" : "Profil"}</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{profileCompleteness}%</p>
                      </div>
                    </div>
                    <Link
                      href={withLocale(`/agencies/${agency._id}`, locale)}
                      className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-3 font-semibold text-white transition hover:bg-[#14533f]"
                    >
                      {isArabic ? "عرض الوكالة" : "Voir l'agence"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "المتجر" : "Boutique"}
            </p>
            <h2 className="text-3xl font-black text-slate-900">
              {isArabic ? "منتجات أوضح مع ثقة أكثر" : "Des produits plus clairs et plus rassurants"}
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              {isArabic
                ? `${formatLocaleNumber(totalProducts, locale)} منتج متوفر حالياً مع سعر أوضح، صور متوازنة، وثقة أفضل في البائع.`
                : `${formatLocaleNumber(totalProducts, locale)} produits sont actuellement disponibles avec prix plus clair, images mieux cadrees et confiance vendeur plus visible.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={withLocale("/listings/new#sale-products", locale)} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
              {isArabic ? "تصفح العروض" : "Voir les offres"}
            </Link>
            <Link href={withLocale("/listings/new", locale)} className="rounded-full bg-[#f97316] px-4 py-2 font-semibold text-white">
              {isArabic ? "نشر إعلان" : "Publier"}
            </Link>
          </div>
        </div>
        {featuredSaleListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredSaleListings.map((listing: any) => (
              <ListingCard key={listing._id} listing={listing} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="section-card p-6 text-sm text-slate-600">
            {isArabic ? "لا توجد حالياً منتجات بيع منشورة." : "Aucun produit en vente publie pour le moment."}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">Camping</p>
            <h2 className="text-3xl font-black text-slate-900">
              {isArabic ? "أماكن تخييم تستاهل الزيارة" : "Des spots de camping qui valent le detour"}
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              {isArabic ? "واجهة أوضح لاكتشاف الأماكن النشطة مع إشارات جودة إضافية." : "Une presentation plus lisible pour explorer les lieux actifs avec plus de signaux de qualite."}
            </p>
          </div>
          <Link href={withLocale("/camping", locale)} className="inline-flex rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
            {isArabic ? "عرض جميع أماكن التخييم" : "Voir tous les lieux"}
          </Link>
        </div>
        {featuredCampingPlaces.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredCampingPlaces.map((place: any) => (
              <article
                key={place._id}
                className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,61,46,0.16)]"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={place.images?.[0] || "/images/camping.jpg"}
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
                    <p className="mt-2 text-sm text-white/80">{place.city}</p>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <p className="line-clamp-3 text-sm leading-7 text-slate-600">{place.description}</p>
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
            alt={isArabic ? "منظر طبيعي بالمغرب" : "Paysage du Maroc"}
            fill
            sizes="100vw"
            className="absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,61,46,0.88),rgba(15,61,46,0.65),rgba(15,61,46,0.48))]" />
          <div className="relative flex flex-col gap-4 px-6 py-10 text-white sm:px-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/75">
                {isArabic ? "ابدأ اليوم" : "Commencez aujourd'hui"}
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                {isArabic ? "المغرب عامر وجهات وتجارب تستاهل تكتاشف" : "Le Maroc regorge de destinations et d'experiences a explorer"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/80">
                {isArabic ? "اختر رحلتك، تعرف على الوكالة، وخلّي باقي الخطوات أوضح وأسهل." : "Choisissez votre voyage, identifiez la bonne agence et avancez plus vite vers l'action utile."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={withLocale("/agencies", locale)}
                className="inline-flex w-fit items-center justify-center rounded-full bg-[#f97316] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ea580c]"
              >
                {isArabic ? "استكشف الرحلات" : "Explorer les voyages"}
              </Link>
              <Link
                href={withLocale("/register", locale)}
                className="inline-flex w-fit items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                {isArabic ? "إنشاء حساب" : "Creer un compte"}
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
              {isArabic ? "منصة مغربية للسفر، التخييم، المعدات ورفقاء الطريق." : "Marketplace voyage, camping, equipements et compagnons de route."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <Link href={withLocale("/", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "الرئيسية" : "Accueil"}
            </Link>
            <Link href={withLocale("/agencies", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "الرحلات" : "Voyages"}
            </Link>
            <Link href={withLocale("/camping", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "التخييم" : "Camping"}
            </Link>
            <Link href={withLocale("/travel-partners", locale)} className="rounded-full bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
              {isArabic ? "رفيق سفر" : "Partenaires"}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
