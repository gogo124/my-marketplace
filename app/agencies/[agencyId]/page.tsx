import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgencyTripCard } from "@/components/agency-trip-card";
import { ReportForm } from "@/components/report-form";
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
  const coverImage = profile.coverImage || "/images/agencies.jpg";
  const logo = profile.logo || "/images/hero-main.jpg";
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
  const pageSearch = new URLSearchParams();
  pageSearch.set("lang", locale);
  if (q) pageSearch.set("q", q);
  if (city) pageSearch.set("city", city);
  if (region) pageSearch.set("region", region);
  const loginHref = buildLoginPath(`/agencies/${agencyId}`, pageSearch.toString(), locale);
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
  const agencyHighlights =
    locale === "ar"
      ? [
          "رحلات منظمة ببرنامج واضح",
          "تواصل مباشر عبر واتساب أو الهاتف",
          `${profile.stats?.tripsCount || trips.length} رحلات منشورة`
        ]
      : [
          "Voyages organises avec programme clair",
          "Contact direct via WhatsApp ou telephone",
          `${profile.stats?.tripsCount || trips.length} voyages publies`
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
        <div className="relative h-72 overflow-hidden">
          <Image
            src={coverImage}
            alt={profile.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,18,0.08),rgba(7,24,18,0.82))]" />
        </div>
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[180px_1fr] lg:px-8">
          <div className="-mt-24 h-36 w-36 overflow-hidden rounded-[2rem] border-4 border-white bg-sand shadow-[0_20px_50px_rgba(15,61,46,0.18)]">
            <div className="relative h-full w-full">
              <Image src={logo} alt={profile.name} fill sizes="128px" className="object-cover" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black text-ink sm:text-5xl">{profile.name}</h1>
                  <VerificationBadge type="agency" status={profile.verificationStatus} locale={locale} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink/60">
                  <span className="rounded-full bg-sand px-3 py-1">{profile.city}</span>
                  <span className="rounded-full bg-sand px-3 py-1">
                    {copy.rating}: {rating > 0 ? rating.toFixed(1) : copy.noRatings}
                  </span>
                  <span className="rounded-full bg-sand px-3 py-1">
                    {getAgencyVerificationLabel(profile.verificationStatus, locale)}
                  </span>
                  <span className="rounded-full bg-sand px-3 py-1">
                    {copy.memberSince} {formatLocaleDate(profile.createdAt, locale)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {agencyHighlights.map((item) => (
                    <span key={item} className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-ink/60">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#agency-trips" className="rounded-full bg-clay px-4 py-2 font-semibold text-white transition hover:brightness-105">
                  {locale === "ar" ? "شاهد الرحلات" : "Voir les voyages"}
                </a>
                {session?.user ? (
                  <>
                    {whatsappDigits ? (
                      <a
                        href={`https://wa.me/${whatsappDigits}`}
                        target="_blank"
                        rel="noreferrer"
                        data-analytics-event="whatsapp_click"
                        className="rounded-full bg-forest px-4 py-2 font-semibold text-white transition hover:bg-forest/90"
                      >
                        {copy.contactAction}
                      </a>
                    ) : null}
                    {profile.phone ? (
                      <a
                        href={`tel:${String(profile.phone).replace(/\s+/g, "")}`}
                        className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink transition hover:border-clay hover:text-clay"
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

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">
              {locale === "ar" ? "التقييمات" : "Avis"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-ink">
              {locale === "ar" ? "نظرة سريعة على الثقة والجودة" : "Apercu rapide de la confiance"}
            </h2>
          </div>
          <span className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink">
            {copy.rating}: {rating > 0 ? rating.toFixed(1) : copy.noRatings}
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-sand/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{locale === "ar" ? "تقييم عام" : "Note globale"}</p>
            <p className="mt-2 text-2xl font-black text-ink">{rating > 0 ? rating.toFixed(1) : "4.8"}</p>
            <p className="mt-2 text-sm text-ink/60">
              {locale === "ar"
                ? "اعتماداً على نشاط الوكالة والتفاعل المباشر مع المسافرين."
                : "Base sur l'activite de l'agence et les echanges directs avec les voyageurs."}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-sand/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{locale === "ar" ? "مؤشر الثقة" : "Indice de confiance"}</p>
            <p className="mt-2 text-2xl font-black text-ink">{profile.profileCompleteness || 0}%</p>
            <p className="mt-2 text-sm text-ink/60">
              {locale === "ar"
                ? "كلما اكتمل الملف والوسائل زادت الثقة قبل الحجز."
                : "Plus le profil et les contacts sont complets, plus la confiance augmente avant reservation."}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-sand/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{locale === "ar" ? "التجربة" : "Experience"}</p>
            <p className="mt-2 text-2xl font-black text-ink">{profile.stats?.reservationsCount || 0}</p>
            <p className="mt-2 text-sm text-ink/60">
              {locale === "ar"
                ? "عدد الحجوزات المؤكدة أو المسجلة في المنصة."
                : "Nombre de reservations enregistrees ou confirmees sur la plateforme."}
            </p>
          </div>
        </div>
        {rating <= 0 ? (
          <div className="mt-5 rounded-[1.5rem] border border-dashed border-ink/10 bg-white p-4 text-sm text-ink/60">
            {locale === "ar"
              ? "لا توجد تقييمات عامة كافية بعد. هذه الصفحة تعرض إشارات الثقة الأساسية إلى أن تتراكم التقييمات."
              : "Il n'y a pas encore assez d'avis publics. Cette page affiche les signaux de confiance essentiels en attendant."}
          </div>
        ) : null}
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
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip: any) => (
              <AgencyTripCard
                key={trip._id}
                trip={trip}
                agencyId={agencyId}
                agencyName={profile.name}
                agencyCity={profile.city}
                agencyWhatsapp={profile.whatsapp}
                locale={locale}
                isSignedIn={Boolean(session?.user)}
                defaultName={session?.user?.name || ""}
                defaultEmail={session?.user?.email || ""}
                defaultCity={trip.city || profile.city || ""}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
            <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-forest/20 bg-sand/30 p-8 text-center">
              <p className="text-lg font-bold text-ink">{copy.noPostsBody}</p>
              <p className="mt-2 text-sm leading-7 text-ink/60">
                {locale === "ar"
                  ? "الوكالة لم تنشر رحلات نشطة بعد، أو لم تعد هناك رحلات مطابقة للفلتر الحالي."
                  : "L'agence n'a pas encore publie de voyages actifs, ou aucun voyage ne correspond au filtre actuel."}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
