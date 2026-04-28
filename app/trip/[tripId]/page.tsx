import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { absoluteUrl } from "@/lib/seo";
import { formatLocaleDate, formatLocalePrice, getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { getTripSpaceData } from "@/lib/trip-space";

export const dynamic = "force-dynamic";

function buildTripSpaceSchemas(data: Awaited<ReturnType<typeof getTripSpaceData>>, locale: "ar" | "fr") {
  if (!data) {
    return [];
  }

  const tripUrl = absoluteUrl(`/trip/${data.resolvedTripId}`);
  const agencyUrl = data.agency?._id ? absoluteUrl(`/agencies/${data.agency._id}`) : absoluteUrl("/agencies");
  const rentalOffers = Array.isArray(data.rentalItems)
    ? data.rentalItems.slice(0, 6).map((item: any) => ({
        "@type": "Product",
        name: item.title,
        description: item.description || undefined,
        image: Array.isArray(item.images) && item.images[0] ? absoluteUrl(item.images[0]) : undefined,
        brand: item.renter?.name || data.agency?.name || "Moroccan Trip",
        offers: {
          "@type": "Offer",
          price: Number(item.price || 0),
          priceCurrency: "MAD",
          availability: item.availabilityStatus === "unavailable" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          url: tripUrl
        }
      }))
    : [];

  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: data.agency?.name || "Moroccan Trip",
      url: agencyUrl,
      image: data.agency?.logo ? absoluteUrl(data.agency.logo) : undefined,
      address: data.agency?.city ? { "@type": "PostalAddress", addressLocality: data.agency.city, addressCountry: "MA" } : undefined,
      description: data.agency?.description || data.trip?.description || undefined
    },
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: data.trip?.title,
      description: data.trip?.description || undefined,
      startDate: data.trip?.startDate,
      endDate: data.trip?.endDate,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: data.trip?.destination
        ? {
            "@type": "Place",
            name: data.trip.destination
          }
        : undefined,
      organizer: {
        "@type": "Organization",
        name: data.agency?.name || "Moroccan Trip",
        url: agencyUrl
      },
      url: tripUrl
    }
  ];

  if (rentalOffers.length > 0) {
    schemas.push(...rentalOffers);
  }

  if (data.agency?.rating) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@type": "TravelAgency",
        name: data.agency.name,
        url: agencyUrl
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: Number(data.agency.rating || 0),
        bestRating: 5,
        worstRating: 1
      },
      author: {
        "@type": "Organization",
        name: "Moroccan Trip"
      },
      reviewBody:
        locale === "ar"
          ? "تقييم إجمالي للوكالة داخل منصة Moroccan Trip."
          : "Note globale de l'agence sur la plateforme Moroccan Trip."
    });
  }

  return schemas;
}

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return {
    title: locale === "ar" ? "مساحة التريب" : "Espace Trip",
    description:
      locale === "ar"
        ? "مساحة خاصة بعد تأكيد الحجز."
        : "Espace prive accessible apres confirmation de reservation.",
    alternates: {
      canonical: `/trip/${tripId}`
    },
    robots: {
      index: false,
      follow: false
    },
    openGraph: {
      title: locale === "ar" ? "مساحة التريب" : "Espace Trip",
      description:
        locale === "ar"
          ? "مساحة خاصة بعد تأكيد الحجز."
          : "Espace prive accessible apres confirmation de reservation.",
      url: absoluteUrl(`/trip/${tripId}`),
      siteName: "Moroccan Trip",
      locale: locale === "ar" ? "ar_MA" : "fr_FR",
      type: "website"
    },
    twitter: {
      card: "summary",
      title: locale === "ar" ? "مساحة التريب" : "Espace Trip",
      description:
        locale === "ar"
          ? "مساحة خاصة بعد تأكيد الحجز."
          : "Espace prive accessible apres confirmation de reservation."
    }
  };
}

export default async function TripSpacePage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { tripId } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const data = await getTripSpaceData({ identifier: tripId, userId: session.user.id });

  if (!data) {
    notFound();
  }

  if (data.resolvedFromCode) {
    redirect(withLocale(`/trip/${data.resolvedTripId}`, locale));
  }

  const reservationStatus = data.accessStatus;
  const confirmed = reservationStatus === "confirmed";
  const pending = reservationStatus === "pending";
  const trip = data.trip as any;
  const agency = data.agency as any;
  const rentalItems = data.rentalItems as any[];
  const structuredData = buildTripSpaceSchemas(data, locale);
  const tripImage = Array.isArray(trip.images) && trip.images[0] ? trip.images[0] : "/images/trip-code.jpg";

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <section className="overflow-hidden rounded-[2.75rem] bg-white shadow-card">
        <div className="relative h-56 sm:h-72">
          <Image src={tripImage} alt={trip.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,18,0.08)_0%,rgba(7,24,18,0.72)_100%)]" />
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm uppercase tracking-[0.25em] text-[#f97316]">{isArabic ? "مساحة التريب" : "Espace Trip"}</p>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-slate-700">
                {reservationStatus === "confirmed"
                  ? isArabic
                    ? "مؤكد"
                    : "Confirmee"
                  : reservationStatus === "pending"
                    ? isArabic
                      ? "في الانتظار"
                      : "En attente"
                    : isArabic
                      ? "لا يوجد حجز"
                      : "Sans reservation"}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900">{trip.title}</h1>
            <p className="text-sm leading-7 text-slate-600">{trip.description}</p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="rounded-full bg-slate-50 px-3 py-1">{trip.destination}</span>
              <span className="rounded-full bg-slate-50 px-3 py-1">{formatLocaleDate(trip.startDate, locale)}</span>
              <span className="rounded-full bg-slate-50 px-3 py-1">{formatLocaleDate(trip.endDate, locale)}</span>
              <span className="rounded-full bg-slate-50 px-3 py-1">{agency?.name || "-"}</span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={withLocale("/dashboard", locale)} className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white">
                {isArabic ? "لوحتي" : "Mon tableau"}
              </Link>
              {confirmed ? (
                <Link href="#rental-items" className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  {isArabic ? "شوف المعدات" : "Voir les articles"}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="rounded-[2rem] bg-sand p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-ink/45">{isArabic ? "حالة الحجز" : "Statut reservation"}</p>
            <p className="mt-2 text-3xl font-black text-ink">
              {reservationStatus === "confirmed"
                ? isArabic
                  ? "مؤكد"
                  : "Confirmee"
                : reservationStatus === "pending"
                  ? isArabic
                    ? "قيد الانتظار"
                    : "En attente"
                  : isArabic
                    ? "غير موجود"
                    : "Absent"}
            </p>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              {reservationStatus === "confirmed"
                ? isArabic
                  ? "عندك الولوج الكامل لمساحة التريب والكراء المرتبط بها."
                  : "Vous avez acces complet a l'espace trip et a la location associee."
                : reservationStatus === "pending"
                  ? isArabic
                    ? "الحجز ديالك مازال فانتظار تأكيد الوكالة."
                    : "Votre reservation attend encore la confirmation de l'agence."
                  : isArabic
                    ? "خاصك تحجز الرحلة باش تدخل لمساحة التريب."
                    : "Vous devez reserver ce voyage pour acceder a l'espace trip."}
            </p>
          </div>
        </div>
      </section>

      {!confirmed ? (
        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f97316]">
              {pending ? (isArabic ? "بانتظار التأكيد" : "En attente de confirmation") : isArabic ? "الولوج مقيد" : "Acces limite"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {pending
                ? isArabic
                  ? "الحجز ديالك مازال فانتظار تأكيد الوكالة"
                  : "Votre reservation attend encore la confirmation de l'agence"
                : isArabic
                  ? "خاصك تحجز الرحلة باش تدخل لمساحة التريب"
                  : "Vous devez reserver ce voyage pour acceder a l'espace trip"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {pending
                ? isArabic
                  ? "منين كتأكد الوكالة الحجز، كيظهر لك زر الدخول لمساحة التريب فلوحة الحساب."
                  : "Une fois la confirmation faite, le bouton d'entree apparait dans votre tableau de bord."
                : isArabic
                  ? "سجل من صفحة الوكالة المناسبة ثم رجع بعد تأكيد الحجز."
                  : "Passez par la page de l'agence correspondante puis revenez apres confirmation."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={withLocale(`/agencies/${agency?._id || ""}`, locale)}
                className="inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 font-semibold text-white"
              >
                {isArabic ? "احجز الرحلة" : "Reserver le voyage"}
              </Link>
              <Link
                href={withLocale("/dashboard", locale)}
                className="inline-flex rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700"
              >
                {isArabic ? "لوحتي" : "Mon tableau"}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-card">
              <h2 className="text-2xl font-black text-slate-900">{isArabic ? "معلومات التريب" : "Infos trip"}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-sand p-4">
                  <p className="text-sm font-semibold text-slate-900">{isArabic ? "الوصف" : "Description"}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{trip.description || "-"}</p>
                </div>
                <div className="rounded-[1.5rem] bg-sand p-4">
                  <p className="text-sm font-semibold text-slate-900">{isArabic ? "نقطة اللقاء" : "Point de rendez-vous"}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{trip.meetingPoint || trip.city || "-"}</p>
                </div>
                <div className="rounded-[1.5rem] bg-sand p-4">
                  <p className="text-sm font-semibold text-slate-900">{isArabic ? "الثمن" : "Prix"}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {typeof trip.price === "number" ? formatLocalePrice(Number(trip.price), locale) : "-"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-sand p-4">
                  <p className="text-sm font-semibold text-slate-900">{isArabic ? "البرنامج" : "Itineraire"}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {Array.isArray(trip.itinerary) && trip.itinerary.length > 0 ? trip.itinerary.join(" • ") : trip.destination || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
                    {isArabic ? "الوكالة" : "Agence"}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">{agency?.name || "-"}</h2>
                </div>
                <span className="rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white">
                  {isArabic ? "مؤكد" : "Confirmee"}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{agency?.description || "-"}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {String(agency?.whatsapp || "").replace(/\D/g, "") ? (
                  <a
                    href={`https://wa.me/${String(agency.whatsapp).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 font-semibold text-white"
                  >
                    {isArabic ? "تواصل مع الوكالة" : "Contacter l'agence"}
                  </a>
                ) : null}
                <Link
                  href={withLocale(`/agencies/${agency?._id || ""}`, locale)}
                  className="inline-flex rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                >
                  {isArabic ? "صفحة الوكالة" : "Page agence"}
                </Link>
                <Link
                  href={withLocale("/dashboard", locale)}
                  className="inline-flex rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                >
                  {isArabic ? "رجع للوحة" : "Retour au tableau"}
                </Link>
              </div>
            </div>
          </section>

          <section id="rental-items" className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
                  {isArabic ? "معدات مناسبة لهاد التريب" : "Materiel adapte a ce trip"}
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  {isArabic ? "معدات مناسبة لهاد التريب" : "Materiel adapte a ce trip"}
                </h2>
              </div>
              <p className="text-sm text-slate-500">{rentalItems.length} {isArabic ? "عنصر" : "articles"}</p>
            </div>
            {rentalItems.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rentalItems.map((item: any) => {
                  const image = Array.isArray(item.images) && item.images[0] ? item.images[0] : "/images/rent-gear.jpg";

                  return (
                    <article key={item._id} className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50">
                      <div className="relative h-52">
                        <Image src={image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{item.renter?.name || "-"}</p>
                          </div>
                          <p className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#f97316]">
                            {formatLocalePrice(Number(item.price || 0), locale)}
                          </p>
                        </div>
                        <p className="line-clamp-3 text-sm leading-7 text-slate-600">{item.description || "-"}</p>
                        <Link
                          href={withLocale(`/rentals/trip/${data.resolvedTripId}`, locale)}
                          className="inline-flex w-full items-center justify-center rounded-full bg-forest px-4 py-3 font-semibold text-white"
                        >
                          {isArabic ? "طلب كراء" : "Demander la location"}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.75rem] border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                {isArabic ? "ما لقيْنا حتى معدات مرتبطة بهاد التريب دابا." : "Aucun materiel lie a ce trip pour le moment."}
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-3">
            {String(agency?.whatsapp || "").replace(/\D/g, "") ? (
              <a
                href={`https://wa.me/${String(agency.whatsapp).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 font-semibold text-white"
              >
                {isArabic ? "تواصل مع الوكالة" : "Contacter l'agence"}
              </a>
            ) : null}
            <Link href={withLocale("/dashboard", locale)} className="inline-flex rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {isArabic ? "لوحتي" : "Mon tableau"}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
