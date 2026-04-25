import Image from "next/image";
import Link from "next/link";
import { HomeTripCodeCard } from "@/components/home-trip-code-card";
import { ListingCard } from "@/components/listing-card";
import { VerificationBadge } from "@/components/verification-badge";
import { getAgencyProfiles } from "@/lib/agency";
import { getAuthSession } from "@/lib/auth";
import { getPlaces } from "@/lib/camping";
import { getListings } from "@/lib/data";
import { formatLocaleNumber, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; type?: string; location?: string; category?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
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
  const featuredSaleListings = saleListings;
  const totalTrips = agencies.reduce((sum: number, agency: any) => sum + Number(agency.stats?.tripsCount || 0), 0);
  const totalOpenSeats = agencies.reduce((sum: number, agency: any) => sum + Number(agency.stats?.openSeats || 0), 0);
  const services = [
    {
      number: "01",
      title: "رحلات منظمة",
      description:
        locale === "ar"
          ? "اكتشف رحلات موثوقة، شوف التفاصيل، وتواصل بسهولة قبل الحجز."
          : "Decouvrez des voyages fiables, consultez les details et contactez facilement avant de reserver.",
      href: withLocale("/agencies", locale),
      cta: locale === "ar" ? "اكتشف الرحلات" : "Decouvrir",
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
      title: "الوكالات السياحية",
      description:
        locale === "ar"
          ? "قارن بين الوكالات، شوف المدن والخدمات، واختار الأنسب ليك."
          : "Comparez les agences, leurs villes et leurs services pour choisir celle qui vous convient.",
      href: withLocale("/agencies", locale),
      cta: locale === "ar" ? "شوف الوكالات" : "Voir les agences",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M7 15h10" />
          <path d="M8 9h8" />
        </svg>
      )
    },
    {
      number: "03",
      title: "كراء المعدات",
      description:
        locale === "ar"
          ? "اكتشف المعدات المتاحة للكراء والمرتبطة بالرحلات المنظمة."
          : "Decouvrez les equipements disponibles a la location et lies aux voyages organises.",
      href: withLocale("/rentals", locale),
      cta: locale === "ar" ? "شوف الكراء" : "Voir la location",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 7h10l1.5 6.5H5.5L7 7Z" />
          <path d="M8 13.5V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.5" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
        </svg>
      )
    },
    {
      number: "04",
      title: locale === "ar" ? "بيع وشراء المعدات" : "Vente d'equipements",
      description:
        locale === "ar"
          ? "تصفح المنتجات المعروضة للبيع أو نشر إعلان جديد بسهولة."
          : "Parcourez les produits en vente ou publiez votre annonce simplement.",
      href: withLocale("/listings/new#sale-products", locale),
      cta: locale === "ar" ? "شوف المنتجات" : "Voir les produits",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 7h14l-1 11H6L5 7Z" />
          <path d="M9 10V8a3 3 0 0 1 6 0v2" />
          <path d="M9 13h.01" />
          <path d="M15 13h.01" />
        </svg>
      )
    },
    {
      number: "05",
      title: locale === "ar" ? "أماكن التخييم" : "Camping",
      description:
        locale === "ar"
          ? "اكتشف أماكن التخييم عبر الصور، الخريطة، والمراجعات."
          : "Decouvrez les lieux de camping via les images, la carte et les avis.",
      href: withLocale("/camping", locale),
      cta: locale === "ar" ? "عرض الأماكن" : "Voir les lieux",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v16" />
          <path d="M5 18 12 7l7 11" />
          <path d="M8.5 12.5h7" />
        </svg>
      )
    },
    {
      number: "06",
      title: locale === "ar" ? "إيجاد رفيق سفر" : "Partenaires de voyage",
      description:
        locale === "ar"
          ? "نشر أو ابحث عن رفيق سفر لنفس الوجهة وبنفس التاريخ."
          : "Publiez ou trouvez un compagnon pour la meme destination et la meme date.",
      href: withLocale("/travel-partners", locale),
      cta: locale === "ar" ? "لقى رفيق سفر" : "Trouver un partenaire",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 18v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
          <circle cx="12" cy="8" r="3" />
          <path d="M4 18v-1a3 3 0 0 1 2-2.83" />
          <path d="M20 18v-1a3 3 0 0 0-2-2.83" />
        </svg>
      )
    },
    {
      number: "07",
      title: locale === "ar" ? "Trip Code" : "Trip Code",
      description:
        locale === "ar"
          ? "بعد تأكيد الرحلة، خذ Trip Code من الوكالة وادخل للمعدات المرتبطة بنفس الرحلة."
          : "Apres confirmation du voyage, recevez le Trip Code de l'agence pour voir les equipements lies.",
      cta: locale === "ar" ? "أدخل الكود" : "Entrer le code",
      isTripCode: true,
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2.5" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
        </svg>
      )
    },
    {
      number: "08",
      title: locale === "ar" ? "نشر إعلان" : "Publier une annonce",
      description:
        locale === "ar"
          ? "بيع منتج، أعلن عن كراء، أو شارك عرضك بصور وتفاصيل واضحة."
          : "Vendez un produit, publiez une location ou partagez votre offre avec des details clairs.",
      href: withLocale("/listings/new", locale),
      cta: locale === "ar" ? "نشر إعلان" : "Publier",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
          <rect x="4" y="4" width="16" height="16" rx="3" />
        </svg>
      )
    }
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-10">
      <section className="grid gap-8 overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 px-5 sm:px-8 text-white shadow-card lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <span className="section-kicker">{copy.heroBadge}</span>
          <h1 className="max-w-3xl text-5xl text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">
            {locale === "ar"
              ? "منصة تجمع الرحلات، الوكالات، المعدات ورفقاء السفر في مكان واحد"
              : "Une plateforme qui reunit voyages, agences, equipements et compagnons de route"}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-white/75">
            {locale === "ar"
              ? "اكتشف رحلات منظمة، اكري معدات، بيع أو اشري تجهيزات، ولقى رفيق السفر المناسب."
              : "Decouvrez des voyages organises, louez du materiel, achetez ou vendez vos equipements et trouvez le bon compagnon."}
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-white/80">
            <span className="rounded-full border border-white/15 px-3 py-1">{locale === "ar" ? "رحلات منظمة" : "Voyages organises"}</span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {locale === "ar" ? "وكالات موثوقة" : "Agences fiables"}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {locale === "ar" ? "معدات وتجهيزات" : "Materiel et equipements"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={withLocale("/agencies", locale)} className="rounded-full bg-white px-5 py-3 font-semibold text-forest shadow-card">
              {locale === "ar" ? "اكتشف الرحلات" : "Decouvrir les voyages"}
            </Link>
            <Link href={withLocale("/listings/new", locale)} className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">
              {locale === "ar" ? "نشر إعلان" : "Publier une annonce"}
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
            <h2 className="text-3xl font-black text-ink">
              {locale === "ar" ? "شنو تقدر تدير فـ Moroccan Trip؟" : "Que pouvez-vous faire sur Moroccan Trip ?"}
            </h2>
            <p className="text-sm text-ink/60">
              {locale === "ar"
                ? "كل الخدمات الأساسية ديال السفر، التخييم والمعدات فواجهة واحدة واضحة."
                : "Retrouvez les services essentiels du voyage, du camping et des equipements dans une seule interface claire."}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article key={service.number} className="flex h-full flex-col rounded-[1.9rem] bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-forest text-white shadow-card">
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

      <section id="trip-code" className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">Trip Code</p>
            <h2 className="mt-2 text-2xl font-black text-ink">
              {locale === "ar" ? "كيفاش خدام Trip Code؟" : "Comment fonctionne le Trip Code ?"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              {locale === "ar"
                ? "بعد تأكيد الرحلة، يمكن للوكالة تعطيك Trip Code باش تدخل وتشوف المعدات المرتبطة بنفس الرحلة."
                : "Apres confirmation du voyage, l'agence peut vous donner un Trip Code pour voir les equipements lies au meme voyage."}
            </p>
          </div>
          <div className="rounded-[1.7rem] border border-ink/10 bg-sand/35 p-5">
            <HomeTripCodeCard locale={locale} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-clay">{locale === "ar" ? "وكالات موصى بها" : "Agences recommandees"}</p>
          <h2 className="mt-2 text-3xl font-black text-ink">{locale === "ar" ? "اكتشف الوكالات والرحلات" : "Decouvrez les agences et voyages"}</h2>
          <p className="mt-2 text-sm text-ink/60">
            {locale === "ar"
              ? "شوف الوكالات النشيطة، عدد الرحلات والمقاعد المفتوحة قبل ما تتواصل أو تحجز."
              : "Consultez les agences actives, leurs voyages et les places ouvertes avant de contacter ou reserver."}
          </p>
        </div>
        <Link href={withLocale("/agencies", locale)} className="hidden rounded-full bg-forest px-4 py-2 font-semibold text-white sm:inline-flex">
          {locale === "ar" ? "اكتشف الرحلات" : "Decouvrir"}
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
            <p className="text-sm uppercase tracking-[0.25em] text-clay">{locale === "ar" ? "منتجات وتجهيزات" : "Produits et equipements"}</p>
            <h2 className="text-3xl font-black text-ink">
              {locale === "ar" ? "معدات للبيع" : "Produits en vente"}
            </h2>
            <p className="text-sm text-ink/60">
              {locale === "ar"
                ? "المنتجات المنشورة والنشطة تظهر هنا مباشرة."
                : "Les produits publies et actifs apparaissent ici directement."}
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href={withLocale("/listings/new#sale-products", locale)} className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
              {locale === "ar" ? "عرض الكل" : "Voir tous"}
            </Link>
            <Link href={withLocale("/listings/new", locale)} className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
              {copy.sell}
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
          <div className="rounded-[2rem] bg-white p-6 text-sm text-ink/60 shadow-card">
            {locale === "ar"
              ? "لا توجد حالياً منتجات بيع منشورة."
              : "Aucun produit en vente publie pour le moment."}
          </div>
        )}
        <div className="sm:hidden">
          <Link href={withLocale("/listings/new#sale-products", locale)} className="inline-flex rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
            {locale === "ar" ? "عرض الكل" : "Voir tous"}
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">Camping</p>
            <h2 className="text-3xl font-black text-ink">
              {locale === "ar" ? "أماكن التخييم" : "Lieux de camping"}
            </h2>
            <p className="text-sm text-ink/60">
              {locale === "ar"
                ? "ثلاثة أماكن نشطة فقط في الواجهة الرئيسية للحفاظ على الصفحة خفيفة وسريعة."
                : "Trois lieux actifs seulement sur l'accueil pour garder la page legere et rapide."}
            </p>
          </div>
          <Link href={withLocale("/camping", locale)} className="hidden rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink sm:inline-flex">
            {locale === "ar" ? "عرض جميع أماكن التخييم" : "Voir tous les lieux de camping"}
          </Link>
        </div>
        {featuredCampingPlaces.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredCampingPlaces.map((place: any) => {
              const image = place.images?.[0] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

              return (
                <article key={place._id} className="overflow-hidden rounded-[2rem] bg-white shadow-card">
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={image}
                      alt={place.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-clay">{place.category}</p>
                        <h3 className="mt-2 text-xl font-black text-ink">{place.name}</h3>
                        <p className="mt-1 text-sm text-ink/60">{place.city}</p>
                      </div>
                      <VerificationBadge type="place" status={place.status} locale={locale} />
                    </div>
                    <p className="line-clamp-3 text-sm leading-7 text-ink/65">{place.description}</p>
                    <Link href={withLocale(`/camping/${place._id}`, locale)} className="inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white">
                      {locale === "ar" ? "عرض التفاصيل" : "Voir details"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-6 text-sm text-ink/60 shadow-card">
            {locale === "ar"
              ? "لا توجد أماكن تخييم منشورة حالياً."
              : "Aucun lieu de camping publie pour le moment."}
          </div>
        )}
        <div className="sm:hidden">
          <Link href={withLocale("/camping", locale)} className="inline-flex rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
            {locale === "ar" ? "عرض جميع أماكن التخييم" : "Voir tous les lieux de camping"}
          </Link>
        </div>
      </section>
    </main>
  );
}
