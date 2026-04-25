import Image from "next/image";
import Link from "next/link";
import { HomeTripCodeCard } from "@/components/home-trip-code-card";
import { ListingCard } from "@/components/listing-card";
import { VerificationBadge } from "@/components/verification-badge";
import { getAgencyProfiles } from "@/lib/agency";
import { getAuthSession } from "@/lib/auth";
import { getListings } from "@/lib/data";
import { formatLocaleNumber, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; type?: string; location?: string; category?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const [session, agencies, saleListings] = await Promise.all([
    getAuthSession(),
    getAgencyProfiles().catch(() => []),
    getListings({ type: "sale" }).catch(() => [])
  ]);
  const canCreateAgency = Boolean(session?.user?.canCreateAgency);
  const featuredAgencies = agencies.slice(0, 3);
  const featuredSaleListings = saleListings.slice(0, 4);
  const totalTrips = agencies.reduce((sum: number, agency: any) => sum + Number(agency.stats?.tripsCount || 0), 0);
  const totalOpenSeats = agencies.reduce((sum: number, agency: any) => sum + Number(agency.stats?.openSeats || 0), 0);
  const primaryPaths = [
    {
      number: "01",
      title: "رحلات منظمة",
      description:
        locale === "ar"
          ? "ابدأ من الوكالات والرحلات المفتوحة مع مسار واضح للحجز والتواصل."
          : "Commencez par les agences et voyages ouverts avec un parcours clair de reservation et contact.",
      href: withLocale("/agencies", locale),
      cta: locale === "ar" ? "اكتشف الوكالات" : "Explorer les agences",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 18h16" />
          <path d="M7 18v-6l5-6 5 6v6" />
          <path d="M10 18v-3h4v3" />
        </svg>
      )
    },
    {
      number: "02",
      title: "كراء معدات",
      description:
        locale === "ar"
          ? "بعد تأكيد الرحلة، يمكن للمسافر الوصول إلى معدات الكراء المرتبطة بها عبر Trip Code."
          : "Apres confirmation du voyage, le voyageur accede aux equipements de location lies via Trip Code.",
      cta: locale === "ar" ? "أدخل Trip Code" : "Entrer le Trip Code",
      isTripCode: true,
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 7h10l1.5 6.5H5.5L7 7Z" />
          <path d="M8 13.5V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.5" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
        </svg>
      )
    },
    {
      number: "03",
      title: "اكتشف وكالات",
      description:
        locale === "ar"
          ? "راجع عدد الرحلات والمقاعد المفتوحة بسرعة قبل التواصل أو الحجز."
          : "Consultez rapidement les voyages actifs et places ouvertes avant de contacter ou reserver.",
      href: withLocale("/agencies", locale),
      cta: locale === "ar" ? "شاهد الرحلات" : "Voir les voyages",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M7 15h10" />
          <path d="M8 9h8" />
        </svg>
      )
    }
  ];
  const secondaryPaths = [
    {
      title: locale === "ar" ? "أماكن التخييم" : "Camping",
      description:
        locale === "ar"
          ? "اكتشف أماكن التخييم عبر الخريطة والمراجعات."
          : "Decouvrez des lieux de camping via la carte et les avis.",
      href: withLocale("/camping", locale)
    },
    {
      title: locale === "ar" ? "إيجاد رفيق سفر" : "Partenaires de voyage",
      description:
        locale === "ar"
          ? "انشر أو ابحث عن رفيق سفر لنفس الوجهة."
          : "Publiez ou trouvez un partenaire pour la meme destination.",
      href: withLocale("/travel-partners", locale)
    },
    {
      title: locale === "ar" ? "بيع وشراء المعدات" : "Vente d'equipements",
      description:
        locale === "ar"
          ? "معدات الرحلات والتخييم ما زالت متاحة كمسار ثانوي."
          : "Les equipements de voyage et camping restent disponibles en parcours secondaire.",
      href: withLocale("/listings/new", locale)
    }
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-10">
      <section className="grid gap-8 overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 px-5 sm:px-8 text-white shadow-card lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <span className="section-kicker">{copy.heroBadge}</span>
          <h1 className="max-w-3xl text-5xl text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-white/75">
            {locale === "ar"
              ? "منصة مركزة على الرحلات المنظمة مع وكالات موثوقة: احجز الرحلة، توصل بالتأكيد، ومن بعد اكتشف كراء المعدات المرتبط بها."
              : "Une plateforme orientee voyages organises avec agences verifiees : reserver, confirmer, puis acceder a la location liee au voyage."}
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-white/80">
            <span className="rounded-full border border-white/15 px-3 py-1">Agences</span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {locale === "ar" ? "حجوزات واضحة" : "Reservations claires"}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {locale === "ar" ? "كراء مرتبط بالرحلة" : "Location liee au voyage"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={withLocale("/agencies", locale)} className="rounded-full bg-white px-5 py-3 font-semibold text-forest shadow-card">
              {copy.heroPrimaryCta}
            </Link>
            {canCreateAgency ? (
              <Link href={withLocale("/agency/profile", locale)} className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">
                {copy.becomeAgency}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 rounded-[2rem] bg-white/10 p-5 backdrop-blur sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-white/60">{copy.agencies}</p>
            <p className="mt-3 text-3xl font-black">{formatLocaleNumber(agencies.length, locale)}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-white/60">{copy.trips}</p>
            <p className="mt-3 text-3xl font-black">{formatLocaleNumber(totalTrips, locale)}</p>
          </div>
          <div className="rounded-[1.75rem] bg-sand p-5 text-ink">
            <p className="text-sm uppercase tracking-[0.25em] text-ink/50">{copy.openSeats}</p>
            <p className="mt-3 text-3xl font-black">{formatLocaleNumber(totalOpenSeats, locale)}</p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">
              {locale === "ar" ? "المسار الرئيسي" : "Parcours principal"}
            </p>
            <h2 className="text-3xl font-black text-ink">
              {locale === "ar" ? "ابدأ من الرحلة ثم أكمل الباقي" : "Commencez par le voyage"}
            </h2>
            <p className="text-sm text-ink/60">
              {locale === "ar"
                ? "الواجهة صارت تركز أولاً على اكتشاف الوكالات والرحلات ثم الوصول إلى الكراء المرتبط بها."
                : "L'interface met d'abord en avant la decouverte des agences et voyages, puis la location liee."}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {primaryPaths.map((service) => (
            <article key={service.number} className="flex h-full flex-col rounded-[1.9rem] bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-forest text-white">
                  {service.icon}
                </div>
                <p className="text-sm font-black tracking-[0.2em] text-clay">{service.number}</p>
              </div>
              <h3 className="mt-4 min-h-[3.5rem] text-lg font-black leading-8 text-ink">{service.title}</h3>
              {service.isTripCode ? (
                <div className="mt-2 flex flex-1 flex-col">
                  <p className="min-h-[3.5rem] text-sm leading-7 text-ink/65">{service.description}</p>
                  <HomeTripCodeCard locale={locale} />
                </div>
              ) : service.href && service.cta ? (
                <div className="mt-2 flex flex-1 flex-col">
                  <p className="min-h-[3.5rem] text-sm leading-7 text-ink/65">{service.description}</p>
                  <Link href={service.href} className="mt-4 inline-flex rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">
                    {service.cta}
                  </Link>
                </div>
              ) : (
                <p className="mt-2 flex-1 text-sm leading-7 text-ink/65">{service.description}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">
              {locale === "ar" ? "مسارات إضافية" : "Parcours secondaires"}
            </p>
            <h2 className="text-2xl font-black text-ink">
              {locale === "ar" ? "خصائص مساندة بدون تشتيت المسار الأساسي" : "Fonctionnalites utiles sans distraire le parcours principal"}
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {secondaryPaths.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[1.5rem] border border-ink/10 bg-sand/35 p-5 transition hover:border-forest/20 hover:bg-sand/60"
            >
              <h3 className="text-lg font-black text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink/65">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-clay">{copy.primaryJourney}</p>
          <h2 className="mt-2 text-3xl font-black text-ink">{copy.exploreAgencies}</h2>
          <p className="mt-2 text-sm text-ink/60">
            {locale === "ar"
              ? "أفضل الوكالات والرحلات النشطة في مكان واحد، مع مسار واضح من الحجز حتى الكراء."
              : "Les agences et voyages actifs les plus utiles au meme endroit, avec un parcours clair de la reservation a la location."}
          </p>
        </div>
        <Link href={withLocale("/agencies", locale)} className="hidden rounded-full bg-forest px-4 py-2 font-semibold text-white sm:inline-flex">
          {copy.heroPrimaryCta}
        </Link>
      </section>

      {featuredAgencies.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredAgencies.map((agency: any) => {
            const logo = agency.logo || "https://images.unsplash.com/photo-1488646953014-85cb44e25828";
            const coverImage = agency.coverImage || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

            return (
              <article key={agency._id} className="overflow-hidden rounded-[2rem] bg-white shadow-card">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={agency.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] bg-sand">
                      <Image
                        src={logo}
                        alt={agency.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-black text-ink">{agency.name}</h3>
                        <VerificationBadge type="agency" status={agency.verificationStatus} locale={locale} />
                      </div>
                      <p className="text-sm text-ink/60">{agency.city}</p>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-sm leading-7 text-ink/70">
                    {agency.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.5rem] bg-sand p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.activeTrips}</p>
                      <p className="mt-2 text-2xl font-black text-ink">{agency.stats?.tripsCount || 0}</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-sand p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.openSeats}</p>
                      <p className="mt-2 text-2xl font-black text-ink">{agency.stats?.openSeats || 0}</p>
                    </div>
                  </div>
                  <Link href={withLocale(`/agencies/${agency._id}`, locale)} className="inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white">
                    {copy.viewAgency}
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">{copy.marketplaceSearch}</p>
            <h2 className="text-3xl font-black text-ink">
              {locale === "ar" ? "معدات للبيع" : "Produits en vente"}
            </h2>
            <p className="text-sm text-ink/60">
              {locale === "ar"
                ? "المنتجات المنشورة والنشطة تظهر هنا مباشرة."
                : "Les produits publies et actifs apparaissent ici directement."}
            </p>
          </div>
          <Link href={withLocale("/listings/new", locale)} className="hidden rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink sm:inline-flex">
            {copy.sell}
          </Link>
        </div>
        {featuredSaleListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredSaleListings.map((listing: any) => (
              <ListingCard key={listing._id} listing={listing} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-6 text-sm text-ink/60 shadow-card">
            {locale === "ar"
              ? "لا توجد حالياً منتجات بيع منشورة."
              : "Aucun produit en vente publie pour le moment."}
          </div>
        )}
      </section>
    </main>
  );
}
