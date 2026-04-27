import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { VerificationBadge } from "@/components/verification-badge";
import { getAgencyProfiles } from "@/lib/agency";
import { formatLocaleNumber, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; city?: string }>;
}): Promise<Metadata> {
  const { lang, city = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const cityLabel = city ? ` - ${city}` : "";

  return buildPageMetadata({
    title:
      locale === "ar"
        ? `وكالات السفر والرحلات المنظمة${cityLabel}`
        : `Agences de voyage et voyages organises${cityLabel}`,
    description:
      locale === "ar"
        ? "اكتشف وكالات سفر موثقة، قارن الرحلات والمقاعد المتاحة، وانتقل بسرعة إلى الحجز أو التواصل."
        : "Decouvrez des agences verifiees, comparez les voyages et les places disponibles, puis passez rapidement a la reservation ou au contact.",
    path: "/agencies",
    image: "/images/agencies.jpg"
  });
}

export default async function AgenciesPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string; destination?: string; verified?: string; rating?: string; sort?: string }>;
}) {
  const { lang, q = "", city = "", destination = "", verified = "", rating = "", sort = "recommended" } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  let agencies: any[] = [];

  try {
    agencies = await getAgencyProfiles({ q, city });
  } catch (error) {
    console.error("Failed to load agencies directory", { error });
    agencies = [];
  }

  const normalizedQuery = q.trim().toLowerCase();
  const normalizedCity = city.trim().toLowerCase();
  const normalizedDestination = destination.trim().toLowerCase();
  const showVerifiedOnly = verified === "1" || verified === "true";
  const minimumRating = Math.max(0, Number(rating) || 0);
  const filteredAgencies = agencies.filter((agency: any) => {
    const haystack = [
      agency.name,
      agency.city,
      agency.description,
      agency.user?.name,
      agency.user?.email
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    const matchesCity = !normalizedCity || String(agency.city || "").toLowerCase().includes(normalizedCity);
    const matchesDestination =
      !normalizedDestination || String(agency.description || "").toLowerCase().includes(normalizedDestination);
    const matchesVerification = !showVerifiedOnly || agency.verificationStatus === "verified";
    const matchesRating = Number(agency.rating || 0) >= minimumRating;

    return matchesQuery && matchesCity && matchesDestination && matchesVerification && matchesRating;
  }).sort((left: any, right: any) => {
    if (sort === "rating") {
      return Number(right.rating || 0) - Number(left.rating || 0);
    }

    if (sort === "trips") {
      return Number(right.stats?.tripsCount || 0) - Number(left.stats?.tripsCount || 0);
    }

    if (sort === "latest") {
      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    }

    const leftVerified = left.verificationStatus === "verified";
    const rightVerified = right.verificationStatus === "verified";

    if (leftVerified !== rightVerified) {
      return Number(rightVerified) - Number(leftVerified);
    }

    return Number(right.rating || 0) - Number(left.rating || 0);
  });

  const statLabel = locale === "ar" ? "رحلات" : "voyages";
  const verifiedCount = filteredAgencies.filter((agency: any) => agency.verificationStatus === "verified").length;

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="relative overflow-hidden rounded-[2.75rem] px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,61,46,0.25)] sm:px-8 sm:py-14">
        <div className="absolute inset-0">
          <Image
            src="/images/agencies.jpg"
            alt={copy.agencyDiscovery}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,24,18,0.88),rgba(15,61,46,0.72)_50%,rgba(249,115,22,0.28))]" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              {copy.travelSide}
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              اكتشف وكالات سياحية موثوقة
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              رحلات منظمة، برامج واضحة، وحجز سهل داخل المغرب
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                {filteredAgencies.length} {copy.agenciesCount}
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                {verifiedCount} {locale === "ar" ? "موثقة" : "verifiees"}
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                {locale === "ar" ? "رحلات مع مقاعد متاحة" : "Voyages avec places ouvertes"}
              </div>
            </div>
          </div>
          <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              {locale === "ar" ? "أضف بحثك" : "Affinez votre recherche"}
            </p>
            <p className="text-sm leading-6 text-white/75">
              {locale === "ar"
                ? "قارن بين المدينة، الوجهة، والتوثيق قبل أن تختار الوكالة."
                : "Comparez ville, destination et verification avant de choisir l'agence."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">{copy.agencyDiscovery}</h2>
            <p className="text-sm text-ink/60">{copy.agencyDiscoveryBody}</p>
          </div>
          <p className="text-sm text-ink/50">
            {formatLocaleNumber(filteredAgencies.length, locale)} {copy.agenciesCount}
          </p>
        </div>
        <form action="/agencies" className="sticky top-4 z-20 mt-5 grid gap-3 rounded-[1.75rem] border border-ink/10 bg-sand/25 p-4 shadow-sm backdrop-blur lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr_0.8fr_auto_auto]">
          <input type="hidden" name="lang" value={locale} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={copy.searchAgencyPlaceholder}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-clay/30"
          />
          <input
            type="text"
            name="city"
            defaultValue={city}
            placeholder={copy.city}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-clay/30"
          />
          <input
            type="text"
            name="destination"
            defaultValue={destination}
            placeholder={locale === "ar" ? "الوجهة" : "Destination"}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-clay/30"
          />
          <label className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink">
            <input type="checkbox" name="verified" value="1" defaultChecked={showVerifiedOnly} className="h-4 w-4 rounded border-ink/20" />
            <span>{locale === "ar" ? "الموثقة فقط" : "Verifiees seulement"}</span>
          </label>
          <select
            name="rating"
            defaultValue={rating}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:ring-2 focus:ring-clay/30"
            aria-label={locale === "ar" ? "الحد الأدنى للتقييم" : "Note minimum"}
          >
            <option value="">{locale === "ar" ? "كل التقييمات" : "Toutes les notes"}</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:ring-2 focus:ring-clay/30"
            aria-label={locale === "ar" ? "ترتيب النتائج" : "Trier les resultats"}
          >
            <option value="recommended">{locale === "ar" ? "الأكثر توصية" : "Recommandees"}</option>
            <option value="rating">{locale === "ar" ? "الأعلى تقييماً" : "Mieux notees"}</option>
            <option value="trips">{locale === "ar" ? "الأكثر رحلات" : "Plus de voyages"}</option>
            <option value="latest">{locale === "ar" ? "الأحدث" : "Plus recentes"}</option>
          </select>
          <button className="rounded-2xl bg-clay px-5 py-3 font-semibold text-white transition hover:brightness-105">{copy.search}</button>
          <Link href={withLocale("/agencies", locale)} className="rounded-2xl border border-ink/10 px-5 py-3 text-center font-semibold text-ink">
            {copy.clear}
          </Link>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-clay">
            {locale === "ar" ? "كيفاش كتمشي العملية" : "Comment ca marche"}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "1. اختار الرحلة" : "1. Choisissez le voyage"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/60">
                {locale === "ar" ? "قارن بين المدن، التواريخ والمقاعد المتاحة." : "Comparez villes, dates et places disponibles."}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "2. دير الحجز" : "2. Envoyez la reservation"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/60">
                {locale === "ar" ? "الوكالة كتراجع الطلب وكتأكد الحالة ديالو." : "L'agence verifie la demande puis confirme le statut."}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "3. دخل للكراء" : "3. Accedez a la location"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/60">
                {locale === "ar" ? "الكراء متاح فقط بعد تأكيد الحجز وكود الرحلة." : "La location n'est disponible qu'apres confirmation et code voyage."}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-forest/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,241,232,0.96))] p-6 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-clay">
            {locale === "ar" ? "ملاحظة مهمة" : "Note utile"}
          </p>
          <h2 className="mt-3 text-2xl font-black text-ink">
            {locale === "ar" ? "الحجز أولاً، ثم الكراء" : "Reservation d'abord, location ensuite"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">
            {locale === "ar"
              ? "باش تكون التجربة واضحة وآمنة، كراء المعدات مربوط بالرحلات المنظمة المؤكدة فقط."
              : "Pour garder un parcours clair et fiable, la location d'equipements est liee uniquement aux voyages organises confirmes."}
          </p>
        </div>
      </section>

      {filteredAgencies.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgencies.map((agency: any) => {
            const coverImage = agency.coverImage || "/images/agencies.jpg";
            const rating = Number(agency.rating || 0);
            const openTrips = Number(agency.stats?.tripsCount || 0);
            const profilePercent = Number(agency.profileCompleteness || 0);

            return (
              <article key={agency._id} className="group overflow-hidden rounded-[2rem] bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,61,46,0.16)]">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={agency.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,18,0.08),rgba(7,24,18,0.78))]" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-forest">
                      {locale === "ar" ? "وكالة" : "Agence"}
                    </span>
                    {agency.verificationStatus === "verified" ? (
                      <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                        {locale === "ar" ? "موثقة" : "Verifiee"}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative -mt-14 h-20 w-20 overflow-hidden rounded-[1.75rem] border-4 border-white bg-sand shadow-[0_15px_35px_rgba(15,61,46,0.18)]">
                      {agency.logo ? (
                        <Image src={agency.logo} alt={agency.name} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-forest text-2xl font-black text-white">
                          {String(agency.name || "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-xl font-black text-ink">{agency.name}</h3>
                        <VerificationBadge type="agency" status={agency.verificationStatus} locale={locale} />
                      </div>
                      <p className="mt-1 text-sm text-ink/60">{agency.city}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-ink/60">
                        <span className="rounded-full bg-sand px-3 py-1">
                          {formatLocaleNumber(openTrips, locale)} {statLabel}
                        </span>
                        <span className="rounded-full bg-sand px-3 py-1">
                          {profilePercent}% {copy.profileComplete}
                        </span>
                        <span className="rounded-full bg-sand px-3 py-1">
                          {rating > 0 ? rating.toFixed(1) : "4.8"} ★
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-sm leading-7 text-ink/70">
                    {agency.description || copy.agencyProfileBody}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={withLocale(`/agencies/${agency._id}`, locale)}
                      className="rounded-full bg-forest px-4 py-2 font-semibold text-white transition hover:bg-forest/90"
                    >
                      {copy.viewAgency}
                    </Link>
                    <span className="rounded-full bg-[#fff7ed] px-4 py-2 text-sm font-semibold text-[#c2410c]">
                      {Number(agency.stats?.openSeats || 0)} {locale === "ar" ? "مقاعد مفتوحة" : "places ouvertes"}
                    </span>
                    {agency.whatsapp ? (
                      <a
                        href={`https://wa.me/${String(agency.whatsapp).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        data-analytics-event="whatsapp_click"
                        className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink transition hover:border-clay hover:text-clay"
                      >
                        {copy.contact}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-forest/20 bg-sand/30 p-8 text-center">
            <p className="text-lg font-bold text-ink">{copy.noAgencies}</p>
            <p className="mt-2 text-sm leading-7 text-ink/60">
              {locale === "ar"
                ? "جرب تعديل البحث أو اختر مدينة مختلفة لعرض الوكالات المتاحة."
                : "Essayez de modifier la recherche ou de choisir une autre ville pour afficher les agences disponibles."}
            </p>
            <Link href={withLocale("/agencies", locale)} className="mt-5 inline-flex rounded-full bg-forest px-5 py-3 font-semibold text-white">
              {copy.clear}
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
