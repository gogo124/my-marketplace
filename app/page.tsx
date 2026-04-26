import Image from "next/image";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { HomeTripCodeCard } from "@/components/home-trip-code-card";
import { HomeServiceCard } from "@/components/home-service-card";
import { VerificationBadge } from "@/components/verification-badge";
import { getAgencyProfiles } from "@/lib/agency";
import { getAuthSession } from "@/lib/auth";
import { getPlaces } from "@/lib/camping";
import { getListings } from "@/lib/data";
import { formatLocaleNumber, getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";

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
  const [agencies, saleListings, featuredCampingPlaces] = await Promise.all([
    getAgencyProfiles().catch((error) => {
      logServerError("page.home.agencies", error);
      return [];
    }),
    getListings({ type: "sale", limit: 8 }).catch((error) => {
      logServerError("page.home.listings", error);
      return [];
    }),
    getPlaces({ userId: session?.user?.id, limit: 3 }).catch((error) => {
      logServerError("page.home.places", error);
      return [];
    })
  ]);
  const canCreateAgency = Boolean(session?.user?.canCreateAgency);
  const featuredAgencies = agencies.slice(0, 3);
  const featuredSaleListings = saleListings.slice(0, 4);
  const totalTrips = agencies.reduce((sum: number, agency: any) => sum + Number(agency.stats?.tripsCount || 0), 0);
  const totalOpenSeats = agencies.reduce((sum: number, agency: any) => sum + Number(agency.stats?.openSeats || 0), 0);
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
      label: isArabic ? "معدات للبيع" : "Produits",
      value: formatLocaleNumber(featuredSaleListings.length, locale)
    }
  ];
  const services = [
    {
      badgeLabel: isArabic ? "رفقاء" : "Compagnons",
      title: isArabic ? "رفيق سفر" : "Partenaire de voyage",
      description: isArabic ? "لقى ناس بنفس اهتماماتك وسافر معهم." : "Trouvez des voyageurs qui partagent la meme passion.",
      href: withLocale("/travel-partners", locale),
      image: "/images/travel-partner.jpg",
      ctaLabel: isArabic ? "اكتشف" : "Voir plus",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 18v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
          <circle cx="12" cy="8" r="3" />
          <path d="M4 18v-1a3 3 0 0 1 2-2.8" />
          <path d="M20 18v-1a3 3 0 0 0-2-2.8" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "كراء" : "Location",
      title: isArabic ? "كراء معدات" : "Location de materiel",
      description: isArabic ? "كري معدات التخييم والسفر بسهولة." : "Louez le materiel qu'il vous faut pour votre trip.",
      href: withLocale("/rentals", locale),
      image: "/images/rent-gear.jpg",
      ctaLabel: isArabic ? "اكتشف" : "Voir plus",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 7h10l1.5 6.5H5.5L7 7Z" />
          <path d="M8 13.5V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.5" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "شراء" : "Acheter",
      title: isArabic ? "شراء معدات" : "Acheter du materiel",
      description: isArabic ? "شري معدات جديدة أو مستعملة." : "Parcourez les produits neufs ou d'occasion.",
      href: withLocale("/listings/new#sale-products", locale),
      image: "/images/buy-gear.jpg",
      ctaLabel: isArabic ? "اكتشف" : "Voir plus",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 7h14l-1 11H6L5 7Z" />
          <path d="M9 10V8a3 3 0 0 1 6 0v2" />
        </svg>
      )
    },
    {
      badgeLabel: isArabic ? "وكالات" : "Agences",
      title: isArabic ? "وكالات السفر" : "Agences",
      description: isArabic ? "رحلات منظمة مع وكالات موثوقة." : "Decouvrez des voyages organises par des agences fiables.",
      href: withLocale("/agencies", locale),
      image: "/images/agencies.jpg",
      ctaLabel: isArabic ? "اكتشف" : "Voir plus",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M7 15h10" />
          <path d="M8 9h8" />
        </svg>
      )
    },
    {
      badgeLabel: "Camping",
      title: isArabic ? "أماكن التخييم" : "Camping",
      description: isArabic ? "اكتشف أفضل أماكن التخييم في المغرب." : "Explorez les plus beaux spots pour camper.",
      href: withLocale("/camping", locale),
      image: "/images/camping.jpg",
      ctaLabel: isArabic ? "اكتشف" : "Voir plus",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 4v16" />
          <path d="M5 18 12 7l7 11" />
          <path d="M8.5 12.5h7" />
        </svg>
      )
    },
    {
      badgeLabel: "Trip Code",
      title: "Trip Code",
      description: isArabic ? "دخل الكود وشوف تفاصيل رحلتك." : "Entrez votre code pour acceder aux details du voyage.",
      href: `${withLocale("/", locale)}#trip-code`,
      image: "/images/trip-code.jpg",
      ctaLabel: isArabic ? "اكتشف" : "Voir plus",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="6" width="16" height="12" rx="2.5" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
        </svg>
      )
    }
  ];
  const trustPoints = [
    { label: isArabic ? "منصة آمنة" : "Plateforme sure" },
    { label: isArabic ? "تقييمات حقيقية" : "Avis reels" },
    { label: isArabic ? "دعم مستمر" : "Support continu" },
    { label: isArabic ? "مجتمع مسافرين" : "Communaute de voyageurs" }
  ];
  const steps = [
    {
      number: "1",
      title: isArabic ? "اختار الخدمة" : "Choisissez le service",
      description: isArabic ? "رحلات، معدات، تخييم أو رفيق سفر حسب الحاجة ديالك." : "Voyage, materiel, camping ou compagnon selon votre besoin."
    },
    {
      number: "2",
      title: isArabic ? "تواصل أو احجز" : "Contactez ou reservez",
      description: isArabic ? "وصل بسرعة للوكالة أو البائع أو الشريك المناسب." : "Contactez rapidement la bonne agence, le bon vendeur ou partenaire."
    },
    {
      number: "3",
      title: isArabic ? "سافر واستمتع" : "Voyagez et profitez",
      description: isArabic ? "كلشي منظم فواجهة واحدة باش تبقى الرحلة أسهل." : "Tout est centralise pour rendre l'experience plus simple."
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
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,31,24,0.88),rgba(15,61,46,0.72),rgba(15,61,46,0.35))]" />
          <div className="relative grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.25fr_0.75fr] lg:px-10 lg:py-12">
            <div className="hero-fade-up space-y-5 text-white">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.25em] text-white/85">
                {isArabic ? "Moroccan Trip" : "Moroccan Trip"}
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
                  كل رحلتك تبدأ من هنا
                </h1>
                <p className="max-w-2xl text-sm leading-8 text-white/85 sm:text-base">
                  رحلات، وكالات، معدات، تخييم ورفقاء سفر في مكان واحد
                </p>
              </div>

              <form
                action={withLocale("/agencies", locale)}
                className="rounded-[1.75rem] border border-white/15 bg-white/95 p-3 shadow-2xl backdrop-blur sm:p-4"
              >
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      name="q"
                      placeholder={isArabic ? "فين بغيتي تمشي؟" : "Ou voulez-vous partir ?"}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d2e]/30 focus:ring-2 focus:ring-[#0f3d2e]/10"
                    />
                    <input
                      type="text"
                      name="location"
                      placeholder={isArabic ? "مدينة أو وجهة" : "Ville ou destination"}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d2e]/30 focus:ring-2 focus:ring-[#0f3d2e]/10"
                    />
                  </div>
                  <button className="rounded-2xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c]">
                    {isArabic ? "ابحث دابا" : "Rechercher"}
                  </button>
                </div>
              </form>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={withLocale("/agencies", locale)}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f3d2e] transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  اكتشف الرحلات
                </Link>
                <Link
                  href={withLocale("/rentals", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  كراء المعدات
                </Link>
                <Link
                  href={withLocale("/travel-partners", locale)}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  رفيق سفر
                </Link>
                {canCreateAgency ? (
                  <Link
                    href={withLocale("/agency/profile", locale)}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    {isArabic ? "إدارة الوكالة" : "Gerer l'agence"}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="hero-fade-up grid gap-4 self-end sm:grid-cols-2 lg:grid-cols-1">
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
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "الخدمات الرئيسية" : "Services"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {isArabic ? "كلشي اللي محتاج للسفر فواجهة وحدة" : "Tout ce qu'il faut pour voyager"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {isArabic ? "خدمات واضحة، صور جذابة، ووصول سريع لكل قسم مهم." : "Acces direct aux sections les plus importantes de la plateforme."}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
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
              accent="#0f3d2e"
            />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-[0_18px_45px_rgba(15,61,46,0.08)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
              {isArabic ? "الثقة أولاً" : "Confiance"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {isArabic ? "منصة مبنية على الوضوح والثقة" : "Une experience plus fiable"}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point) => (
              <div key={point.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f3d2e] text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-slate-800">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <article key={step.number} className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_45px_rgba(15,61,46,0.08)]">
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
            <img
              src="/images/hero-main.jpg"
              alt="Trip Code"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/80">Trip Code</p>
              <h2 className="mt-2 text-3xl font-black">
                {isArabic ? "دخل الكود وكمّل الرحلة بثقة" : "Accedez rapidement a votre voyage"}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/80">
                {isArabic
                  ? "من بعد تأكيد الحجز، الوكالة كتقدر تعطيك Trip Code باش توصل لتفاصيل الرحلة والمعدات المرتبطة بها."
                  : "Apres confirmation, l'agence peut partager un code pour acceder aux details du voyage et du materiel associe."}
              </p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="rounded-[1.75rem] bg-slate-50 p-5 sm:p-6">
              <p className="text-sm font-semibold text-slate-500">
                {isArabic ? "طريقة سريعة للوصول للتفاصيل" : "Acces rapide"}
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
                {isArabic ? "مختارات مميزة" : "Selection"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {isArabic ? "وكالات نشيطة ورحلات جاهزة" : "Agences et voyages a decouvrir"}
            </h2>
          </div>
          <Link
            href={withLocale("/agencies", locale)}
            className="inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14533f]"
            >
              {isArabic ? "اكتشف الرحلات" : "Decouvrir"}
            </Link>
          </div>
          {featuredAgencies.length > 0 ? (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredAgencies.map((agency: any) => {
                const logo = agency.logo || "/images/agencies.jpg";
                const coverImage = agency.coverImage || "/images/agencies.jpg";

                return (
                  <article
                    key={agency._id}
                    className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,61,46,0.16)]"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <Image src={coverImage} alt={agency.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-center transition duration-700 group-hover:scale-105" />
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
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[1.4rem] bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الرحلات" : "Trips"}</p>
                          <p className="mt-2 text-2xl font-black text-slate-900">{agency.stats?.tripsCount || 0}</p>
                        </div>
                        <div className="rounded-[1.4rem] bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{isArabic ? "المقاعد" : "Seats"}</p>
                          <p className="mt-2 text-2xl font-black text-slate-900">{agency.stats?.openSeats || 0}</p>
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
            </section>
          ) : null}
        </section>

        <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">{isArabic ? "المتجر" : "Boutique"}</p>
            <h2 className="text-3xl font-black text-slate-900">
              {isArabic ? "معدات ومنتجات جاهزة للبيع" : "Produits a vendre"}
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              {isArabic ? "نماذج من العروض المنشورة داخل المنصة." : "Quelques offres actives publiees sur la plateforme."}
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href={withLocale("/listings/new#sale-products", locale)} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
              {isArabic ? "عرض الكل" : "Voir tous"}
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
          <div className="rounded-[2rem] bg-white p-6 text-sm text-slate-600 shadow-card">
            {isArabic
              ? "لا توجد حالياً منتجات بيع منشورة."
              : "Aucun produit en vente publie pour le moment."}
          </div>
        )}
        <div className="sm:hidden">
          <Link href={withLocale("/listings/new#sale-products", locale)} className="inline-flex rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
            {isArabic ? "عرض الكل" : "Voir tous"}
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">Camping</p>
            <h2 className="text-3xl font-black text-slate-900">
              {isArabic ? "أماكن تخييم تستاهل الزيارة" : "Spots de camping"}
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              {isArabic ? "مختارات سريعة من أماكن التخييم النشطة داخل المنصة." : "Une selection legere des lieux de camping actifs."}
            </p>
          </div>
          <Link href={withLocale("/camping", locale)} className="hidden rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 sm:inline-flex">
            {isArabic ? "عرض جميع أماكن التخييم" : "Voir tous les lieux de camping"}
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
                  <Image src={place.images?.[0] || "/images/camping.jpg"} alt={place.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-center transition duration-700 group-hover:scale-105" />
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
                  <Link href={withLocale(`/camping/${place._id}`, locale)} className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-3 font-semibold text-white transition hover:bg-[#14533f]">
                    {isArabic ? "عرض التفاصيل" : "Voir details"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-6 text-sm text-slate-600 shadow-card">
            {isArabic
              ? "لا توجد أماكن تخييم منشورة حالياً."
              : "Aucun lieu de camping publie pour le moment."}
          </div>
        )}
        <div className="sm:hidden">
          <Link href={withLocale("/camping", locale)} className="inline-flex rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700">
            {isArabic ? "عرض جميع أماكن التخييم" : "Voir tous les lieux de camping"}
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] shadow-[0_22px_60px_rgba(15,61,46,0.16)]">
        <div className="relative">
          <img
            src="/images/camping.jpg"
            alt={isArabic ? "منظر طبيعي بالمغرب" : "Paysage du Maroc"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,61,46,0.88),rgba(15,61,46,0.65),rgba(15,61,46,0.48))]" />
          <div className="relative flex flex-col gap-4 px-6 py-10 text-white sm:px-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/75">
                {isArabic ? "ابدأ اليوم" : "Commencez"}
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                المغرب عامر بلايص تستاهل تكتاشف
              </h2>
            </div>
            <Link
              href={withLocale("/agencies", locale)}
              className="inline-flex w-fit items-center justify-center rounded-full bg-[#f97316] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ea580c]"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </section>

      <footer className="rounded-[2rem] bg-white px-5 py-6 shadow-[0_18px_45px_rgba(15,61,46,0.08)] sm:px-7">
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
          <div className="flex items-center gap-3">
            {["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.8 6.8h-1.5c-.2-1-.5-1.9-.9-2.8a8 8 0 0 1 2.4 2.8ZM12 4.1c.5.7 1.2 2.1 1.6 4H10.4c.4-1.9 1.1-3.3 1.6-4ZM9.2 6c-.4.9-.7 1.8-.9 2.8H6.8A8 8 0 0 1 9.2 6Zm-3 4.8h1.7a16 16 0 0 0 0 2.4H6.2a8 8 0 0 1 0-2.4Zm.6 4.4h1.5c.2 1 .5 1.9.9 2.8a8 8 0 0 1-2.4-2.8ZM12 19.9c-.5-.7-1.2-2.1-1.6-4h3.2c-.4 1.9-1.1 3.3-1.6 4Zm2.4-5.9h-4.8a14 14 0 0 1 0-2.4h4.8a14 14 0 0 1 0 2.4Zm-.1-3.9h-4.6c.4-1.8 1-3.1 1.5-3.8.5.7 1.1 2 1.5 3.8Zm.5 7.2c.4-.9.7-1.8.9-2.8h1.5a8 8 0 0 1-2.4 2.8Zm1.3-4.1a16 16 0 0 0 0-2.4h1.7a8 8 0 0 1 0 2.4h-1.7Z", "M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm8.1 1.7H8.1A4.4 4.4 0 0 0 3.7 8.1v7.8a4.4 4.4 0 0 0 4.4 4.4h7.8a4.4 4.4 0 0 0 4.4-4.4V8.1a4.4 4.4 0 0 0-4.4-4.4Zm-3.9 3.2A5.1 5.1 0 1 1 6.9 12 5.1 5.1 0 0 1 12 6.9Zm0 1.7A3.4 3.4 0 1 0 15.4 12 3.4 3.4 0 0 0 12 8.6Zm5.4-2.3a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z", "M20 4H4a2 2 0 0 0-2 2v12l4-3h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"].map((path, index) => (
              <span key={index} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-[#0f3d2e]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d={path} />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
