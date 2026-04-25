import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgencyReservationForm } from "@/components/agency-reservation-form";
import { ReportForm } from "@/components/report-form";
import { RentalTripAccessForm } from "@/components/rental-trip-access-form";
import { VerificationBadge } from "@/components/verification-badge";
import { getAuthSession } from "@/lib/auth";
import { buildLoginPath } from "@/lib/auth-flow";
import { getAgencyProfileById, getAgencyTrips } from "@/lib/agency";
import { formatLocaleDate, getDirection, resolveLocale, siteCopy, translateApiError, withLocale } from "@/lib/i18n";
import { getAgencyVerificationLabel } from "@/lib/trust";

export default async function AgencyProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ agencyId: string }>;
  searchParams: Promise<{ lang?: string; q?: string; city?: string; region?: string }>;
}) {
  const { agencyId } = await params;
  const { lang, q = "", city = "", region = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const [profile, trips, session] = await Promise.all([
    getAgencyProfileById(agencyId),
    getAgencyTrips(agencyId),
    getAuthSession()
  ]);

  if (!profile) {
    notFound();
  }

  const rating = Number(profile.rating || 0);
  const coverImage = profile.coverImage || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
  const logo = profile.logo || "https://images.unsplash.com/photo-1488646953014-85cb44e25828";
  const whatsappDigits = String(profile.whatsapp || "").replace(/\D/g, "");
  const filteredTrips = trips.filter((trip: any) => {
    if (!q.trim()) {
      return true;
    }

    const query = q.trim().toLowerCase();
    return [trip.title, trip.destination, trip.city, trip.description].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query)
    );
  });
  const normalizedCityFilter = city.trim().toLowerCase();
  const normalizedRegionFilter = region.trim().toLowerCase();
  const pageSearch = new URLSearchParams();
  pageSearch.set("lang", locale);
  if (q) pageSearch.set("q", q);
  if (city) pageSearch.set("city", city);
  if (region) pageSearch.set("region", region);
  const loginHref = buildLoginPath(`/agencies/${agencyId}`, pageSearch.toString(), locale);
  const rentalAccessLabels =
    locale === "ar"
      ? {
          title: "ولوج كراء الرحلة",
          description: "أدخل رمز رحلتك لعرض المعدات المتاحة.",
          placeholder: "أدخل رمز الرحلة",
          button: "عرض المعدات",
          invalid: "رمز الرحلة غير صالح."
        }
      : {
          title: "Trip rental access",
          description: "Enter your trip code to view available equipment.",
          placeholder: "Enter trip code",
          button: "View equipment",
          invalid: "Invalid trip code."
        };
  const verificationExplanation =
    profile.verificationStatus === "verified"
      ? locale === "ar"
        ? "تمت مراجعة بيانات الوكالة الظاهرة على المنصة من طرف الإدارة. هذا لا يعني ضماناً كاملاً للخدمة، لكنه يرفع مستوى الثقة قبل التواصل."
        : "Les informations visibles de l'agence ont ete revues par l'administration. Ce n'est pas une garantie totale du service, mais cela renforce la confiance avant contact."
      : profile.verificationStatus === "pending"
        ? locale === "ar"
          ? "ملف الوكالة قيد المراجعة حالياً. يمكنك الاطلاع على الرحلات والمعلومات، مع التحقق من التفاصيل قبل الدفع."
          : "Le profil agence est en cours de revue. Vous pouvez consulter les voyages et informations, en verifiant les details avant paiement."
        : locale === "ar"
          ? "هذه الوكالة منشورة لكنها غير موثقة بعد. من الأفضل التأكد من البرنامج والتواريخ وطريقة التواصل قبل الحجز."
          : "Cette agence est publiee mais pas encore verifiee. Il est preferable de confirmer le programme, les dates et le mode de contact avant reservation.";
  const trustHighlights =
    locale === "ar"
      ? [
          `${profile.profileCompleteness || 0}% اكتمال الملف`,
          `${profile.stats?.tripsCount || trips.length} رحلات منشورة`,
          `${profile.stats?.openSeats ||
            trips.reduce(
              (sum: number, trip: any) => sum + Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0),
              0
            )} مقاعد متاحة الآن`
        ]
      : [
          `${profile.profileCompleteness || 0}% profil complete`,
          `${profile.stats?.tripsCount || trips.length} voyages publies`,
          `${profile.stats?.openSeats ||
            trips.reduce(
              (sum: number, trip: any) => sum + Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0),
              0
            )} places ouvertes maintenant`
        ];
  const bookingChecklist =
    locale === "ar"
      ? [
          "راجع تاريخ البداية والنهاية وعدد المقاعد المتبقية.",
          "أكد ما يشمله السعر قبل الدفع أو تحويل العربون.",
          "استعمل الحجز أو واتساب ثم احتفظ بتأكيد الوكالة."
        ]
      : [
          "Verifiez les dates de debut/fin et le nombre de places restantes.",
          "Confirmez ce que le prix inclut avant paiement ou acompte.",
          "Utilisez la reservation ou WhatsApp puis gardez la confirmation de l'agence."
        ];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] bg-white px-5 py-4 shadow-card">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/45">{copy.travelSide}</p>
          <p className="mt-1 text-sm text-ink/60">{copy.browseAgenciesTrips}</p>
        </div>
        <Link href={withLocale("/agencies", locale)} className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
          {copy.backToAgencies}
        </Link>
      </section>

      <section className="overflow-hidden rounded-[2.75rem] bg-white shadow-card">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={coverImage}
            alt={profile.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[160px_1fr] lg:px-8">
          <div className="-mt-20 h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-white bg-sand shadow-card">
            <div className="relative h-full w-full">
              <Image src={logo} alt={profile.name} fill sizes="128px" className="object-cover" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black text-ink">{profile.name}</h1>
                  <VerificationBadge type="agency" status={profile.verificationStatus} locale={locale} />
                </div>
                <p className="mt-2 text-sm text-ink/60">{profile.city}</p>
                <p className="mt-2 text-sm text-ink/60">
                  {copy.rating}: {rating > 0 ? rating.toFixed(1) : copy.noRatings}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
                  {getAgencyVerificationLabel(profile.verificationStatus, locale)} • {copy.memberSince} {formatLocaleDate(profile.createdAt, locale)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#agency-trips" className="rounded-full bg-clay px-4 py-2 font-semibold text-white">
                  {locale === "ar" ? "شاهد الرحلات" : "Voir les voyages"}
                </a>
                {session?.user ? (
                  <>
                    {whatsappDigits ? (
                      <a
                        href={`https://wa.me/${whatsappDigits}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-forest px-4 py-2 font-semibold text-white"
                      >
                        {copy.contactAction}
                      </a>
                    ) : null}
                    {profile.phone ? (
                      <a
                        href={`tel:${String(profile.phone).replace(/\s+/g, "")}`}
                        className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink"
                      >
                        {copy.callAction}
                      </a>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-[1.5rem] border border-ink/10 bg-sand/40 px-4 py-3 text-sm text-ink/65">
                    <p>{translateApiError("Please sign in to continue", locale)}</p>
                    <Link href={loginHref} className="mt-3 inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white">
                      {copy.login}
                    </Link>
                  </div>
                )}
                {session?.user ? (
                  <>
                    <ReportForm targetType="agency" targetId={agencyId} title={copy.reportAgency} compact locale={locale} />
                    {profile.user?._id ? <ReportForm targetType="user" targetId={profile.user._id} title={copy.reportOwner} compact locale={locale} /> : null}
                  </>
                ) : null}
              </div>
            </div>
            <p className="max-w-3xl text-base leading-7 text-ink/75">
              {profile.description || copy.agencyProfileBody}
            </p>
            <div className="rounded-[1.5rem] border border-forest/10 bg-sand/35 p-4">
              <p className="text-sm font-semibold text-ink">
                {locale === "ar" ? "ماذا تعني حالة التوثيق؟" : "Que signifie ce statut de verification ?"}
              </p>
              <p className="mt-2 text-sm leading-7 text-ink/70">{verificationExplanation}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{copy.phoneNumber}</p>
          <p className="mt-3 text-lg font-bold text-ink">{profile.phone || "-"}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{copy.whatsappNumber}</p>
          <p className="mt-3 text-lg font-bold text-ink">{profile.whatsapp || "-"}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{copy.trust}</p>
          <p className="mt-3 text-lg font-bold text-ink">{profile.profileCompleteness || 0}% {copy.profileComplete}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{copy.trips}</p>
          <p className="mt-3 text-lg font-bold text-ink">{profile.stats?.tripsCount || trips.length}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{copy.openSeats}</p>
          <p className="mt-3 text-lg font-bold text-ink">
            {profile.stats?.openSeats ||
              trips.reduce(
                (sum: number, trip: any) => sum + Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0),
                0
              )}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-clay">
            {locale === "ar" ? "لماذا يمكن الوثوق بهذه الصفحة؟" : "Pourquoi cette page inspire plus confiance"}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {trustHighlights.map((item) => (
              <div key={item} className="rounded-[1.25rem] bg-sand/45 p-4 text-sm font-semibold text-ink">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-ink/65">
            {locale === "ar"
              ? "تعرض هذه الصفحة الوكالة، الرحلات المفتوحة، المقاعد المتبقية، ووسائل التواصل بشكل مباشر حتى يفهم المسافر العرض قبل اتخاذ القرار."
              : "Cette page affiche directement l'agence, les voyages ouverts, les places restantes et les canaux de contact pour aider le voyageur a comprendre l'offre avant decision."}
          </p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-clay">
            {locale === "ar" ? "قبل الحجز" : "Avant reservation"}
          </p>
          <div className="mt-4 space-y-3">
            {bookingChecklist.map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-ink/10 p-4 text-sm leading-7 text-ink/70">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="agency-trips" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">{copy.agencyTrips}</h2>
            <p className="mt-2 text-sm text-ink/60">{copy.agencyTripsBody}</p>
          </div>
          <form action="" className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name="lang" value={locale} />
            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder={copy.searchTripPlaceholder}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
              />
              <input
                type="text"
                name="city"
                defaultValue={city}
                placeholder={copy.city}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
              />
              <input
                type="text"
                name="region"
                defaultValue={region}
                placeholder={locale === "ar" ? "الجهة" : "Region"}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
              />
            </div>
            <button className="rounded-2xl bg-clay px-5 py-3 font-semibold text-white">{copy.filter}</button>
          </form>
        </div>
        {filteredTrips.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip: any) => {
              const remainingSeats = Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0);
              const tripImages =
                Array.isArray(trip.images) && trip.images.length > 0
                  ? trip.images
                  : ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"];
              const visiblePartners = Array.isArray(trip.renterPartners)
                ? trip.renterPartners
                    .map((partner: any) => ({
                      ...partner,
                      recommendedItems: Array.isArray(partner.recommendedItems)
                        ? partner.recommendedItems.filter((item: any) => {
                            const itemCity = String(item.city || item.location || "").toLowerCase();
                            const itemRegion = String(item.region || "").toLowerCase();
                            const matchesCity = !normalizedCityFilter || itemCity.includes(normalizedCityFilter);
                            const matchesRegion = !normalizedRegionFilter || itemRegion.includes(normalizedRegionFilter);
                            return matchesCity && matchesRegion;
                          })
                        : []
                    }))
                    .filter((partner: any) => {
                      const partnerCity = String(partner.city || "").toLowerCase();
                      const partnerMatchesCity = !normalizedCityFilter || partnerCity.includes(normalizedCityFilter);
                      const hasMatchingItems = Array.isArray(partner.recommendedItems) && partner.recommendedItems.length > 0;
                      return partnerMatchesCity || hasMatchingItems || (!normalizedCityFilter && !normalizedRegionFilter);
                    })
                : [];

              return (
                <article key={trip._id} className="overflow-hidden rounded-[2rem] bg-white shadow-card">
                  <div className="relative h-44">
                    <Image
                      src={tripImages[0]}
                      alt={trip.title || "Trip"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-clay">{trip.destination}</p>
                      <h3 className="mt-2 text-2xl font-black text-ink">{trip.title}</h3>
                    </div>
                    <span className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-forest">
                      {trip.price} DH
                    </span>
                  </div>
                  {tripImages.length > 1 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tripImages.slice(1, 4).map((image: string, index: number) => (
                        <div key={`${trip._id}-preview-${index}`} className="relative h-14 w-20 overflow-hidden rounded-[0.9rem] bg-sand">
                          <Image src={image} alt={trip.title || "Trip"} fill sizes="80px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-4 text-sm text-ink/70">{trip.description}</p>
                  <div className="mt-5 space-y-2 text-sm text-ink/60">
                    <p>{trip.city}</p>
                    {trip.region ? <p>{trip.region}</p> : null}
                    <p>
                      {formatLocaleDate(trip.startDate, locale)} - {formatLocaleDate(trip.endDate, locale)}
                    </p>
                    <p>{copy.openSeats}: {remainingSeats}</p>
                  </div>
                  <div className="mt-4 rounded-[1.25rem] bg-sand/45 p-4 text-sm text-ink/70">
                    <p className="font-semibold text-ink">
                      {locale === "ar" ? "قبل تأكيد الحجز" : "Avant confirmation"}
                    </p>
                    <p className="mt-2">
                      {locale === "ar"
                        ? "راجع التواريخ، عدد المقاعد المتبقية، وما إذا كانت المعدات أو الخدمات الإضافية مطلوبة لهذه الرحلة."
                        : "Verifiez les dates, le nombre de places restantes et si des equipements ou services additionnels sont requis pour ce voyage."}
                    </p>
                  </div>
                  {Array.isArray(trip.equipmentRequirements) && trip.equipmentRequirements.length > 0 ? (
                    <div className="mt-5 rounded-[1.25rem] border border-ink/10 bg-white p-4">
                      <p className="text-sm font-semibold text-ink">
                        {locale === "ar" ? "متطلبات المعدات" : "Besoins equipement"}
                      </p>
                      <p className="mt-2 text-sm text-ink/70">{trip.equipmentRequirements.join(" • ")}</p>
                    </div>
                  ) : null}
                  {visiblePartners.length > 0 ? (
                    <div className="mt-5 space-y-3 rounded-[1.5rem] border border-ink/10 bg-sand/40 p-4">
                      <p className="text-sm font-semibold text-ink">
                        {locale === "ar" ? "مزودو الكراء المقترحون" : "Prestataires location recommandes"}
                      </p>
                      <div className="space-y-3">
                        {visiblePartners.map((partner: any) => (
                          <div key={partner._id} className="rounded-[1.25rem] bg-white p-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 overflow-hidden rounded-[1rem] bg-sand">
                                <Image
                                  src={partner.logo || "https://images.unsplash.com/photo-1488646953014-85cb44e25828"}
                                  alt={partner.name || "Renter"}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-ink">{partner.name}</p>
                                  <VerificationBadge type="renter" status={partner.verificationStatus} locale={locale} />
                                  {partner.isTrustedPartner ? (
                                    <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-white">
                                      {locale === "ar" ? "شريك موثوق" : "Partenaire fiable"}
                                    </span>
                                  ) : null}
                                  {partner.isRecommended ? (
                                    <span className="rounded-full bg-clay px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-white">
                                      {locale === "ar" ? "موصى به" : "Recommande"}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs text-ink/60">{partner.city}</p>
                              </div>
                            </div>
                            {Array.isArray(partner.recommendedItems) && partner.recommendedItems.length > 0 ? (
                              <div className="mt-3 grid gap-2">
                                {partner.recommendedItems.map((item: any) => (
                                  <div key={item._id} className="rounded-[1rem] border border-ink/10 p-3 text-sm text-ink/70">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold text-ink">{item.title}</p>
                                        <p className="text-xs text-ink/55">
                                          {item.category} • {item.city || item.location} {item.region ? `• ${item.region}` : ""}
                                        </p>
                                      </div>
                                      <p className="font-bold text-clay">{item.price} DH</p>
                                    </div>
                                    <p className="mt-2 text-xs text-ink/55">
                                      {[
                                        item.itemType === "package" ? (locale === "ar" ? "باقة" : "Pack") : locale === "ar" ? "عنصر" : "Article",
                                        locale === "ar" ? `المتوفر ${item.quantityAvailable}` : `Dispo ${item.quantityAvailable}`
                                      ].join(" • ")}
                                    </p>
                                    {(item.pickupInfo || item.deliveryInfo) ? (
                                      <p className="mt-2 text-xs text-ink/55">{[item.pickupInfo, item.deliveryInfo].filter(Boolean).join(" • ")}</p>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <AgencyReservationForm
                    agencyId={agencyId}
                    tripId={trip._id}
                    tripTitle={trip.title}
                    tripPrice={Number(trip.price || 0)}
                    remainingSeats={remainingSeats}
                    isSignedIn={Boolean(session?.user)}
                    defaultName={session?.user?.name || ""}
                    defaultEmail={session?.user?.email || ""}
                    defaultCity={trip.city || profile.city || ""}
                    defaultDate={trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : ""}
                  />
                  <div className="mt-5 rounded-[1.5rem] border border-ink/10 bg-sand/40 p-4">
                    <p className="text-sm font-semibold text-ink">{rentalAccessLabels.title}</p>
                    <p className="mt-1 text-xs text-ink/60">{rentalAccessLabels.description}</p>
                    <div className="mt-3">
                      <RentalTripAccessForm
                        placeholder={rentalAccessLabels.placeholder}
                        buttonLabel={rentalAccessLabels.button}
                        invalidLabel={rentalAccessLabels.invalid}
                        className="grid gap-3 sm:grid-cols-[1fr_auto]"
                      />
                    </div>
                  </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
            {copy.noPostsBody}
          </div>
        )}
      </section>
    </main>
  );
}
