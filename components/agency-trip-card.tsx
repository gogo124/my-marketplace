"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AgencyReservationForm } from "@/components/agency-reservation-form";
import { TripMediaCarousel } from "@/components/trip-media-carousel";
import { formatLocaleDate, formatLocalePrice, resolveLocale, SiteLocale, siteCopy } from "@/lib/i18n";

type AgencyTripCardProps = {
  trip: any;
  agencyId: string;
  agencyName: string;
  agencyCity?: string;
  agencyWhatsapp?: string;
  locale?: SiteLocale;
  isSignedIn: boolean;
  defaultName?: string;
  defaultEmail?: string;
  defaultCity?: string;
};

function buildRecurringDates(startDate?: string, endDate?: string, locale: SiteLocale = "ar") {
  if (!startDate) {
    return [];
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(startDate);

  if (!Number.isFinite(start.getTime())) {
    return [];
  }

  const dates: Array<{ value: string; label: string; seats: number }> = [];
  let cursor = new Date(start);

  while (cursor <= end && dates.length < 4) {
    const nextDate = new Date(cursor);
    dates.push({
      value: nextDate.toISOString().slice(0, 10),
      label: formatLocaleDate(nextDate, locale, { weekday: "short", day: "numeric", month: "short" }),
      seats: 0
    });
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 7);
  }

  if (dates.length === 0) {
    dates.push({
      value: start.toISOString().slice(0, 10),
      label: formatLocaleDate(start, locale, { weekday: "short", day: "numeric", month: "short" }),
      seats: 0
    });
  }

  return dates;
}

export function AgencyTripCard({
  trip,
  agencyId,
  agencyName,
  agencyCity = "",
  agencyWhatsapp = "",
  locale = "ar",
  isSignedIn,
  defaultName = "",
  defaultEmail = "",
  defaultCity = ""
}: AgencyTripCardProps) {
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
  const [open, setOpen] = useState(false);
  const remainingSeats = Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0);
  const images = useMemo(
    () => (Array.isArray(trip.images) && trip.images.length > 0 ? trip.images : ["/images/agencies.jpg"]),
    [trip.images]
  );
  const recurringDates = useMemo(() => buildRecurringDates(trip.startDate, trip.endDate, safeLocale), [trip.endDate, trip.startDate, safeLocale]);
  const whatsappDigits = String(agencyWhatsapp || "").replace(/\D/g, "");
  const tripDateLabel = trip.startDate ? formatLocaleDate(trip.startDate, safeLocale) : "-";
  const programText =
    trip.description || (safeLocale === "ar" ? "تفاصيل البرنامج ستظهر هنا." : "Le detail du programme apparait ici.");

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,61,46,0.12)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <div className="border-b border-ink/5 lg:border-b-0 lg:border-e">
          <TripMediaCarousel
            images={images}
            alt={trip.title || "Trip"}
            fallback="/images/agencies.jpg"
            className="aspect-[4/3] h-full min-h-[280px] lg:min-h-[100%]"
            sizes="(max-width: 1024px) 100vw, 420px"
          />
        </div>

        <div className="space-y-5 p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                {trip.destination || copy.agencyTrips}
              </p>
              <h3 className="mt-2 text-2xl font-black text-ink lg:text-3xl">{trip.title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/65">
                {safeLocale === "ar"
                  ? "رحلة مع برنامج أوضح، تفاصيل مقروءة، ومسار مباشر نحو الحجز أو التواصل."
                  : "Un voyage avec programme plus lisible, details plus clairs et acces direct a la reservation ou au contact."}
              </p>
            </div>
            <div className="shrink-0 rounded-[1.5rem] bg-[linear-gradient(180deg,#fff7ed,#ffffff)] px-5 py-4 text-start shadow-sm xl:min-w-[220px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c2410c]">
                {safeLocale === "ar" ? "السعر" : "Prix"}
              </p>
              <p className="mt-2 text-2xl font-black text-ink">
                {formatLocalePrice(Number(trip.price || 0), safeLocale)}
              </p>
              <p className="mt-1 text-sm text-ink/55">
                {safeLocale === "ar" ? "لكل شخص" : "Par personne"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
            <div className="rounded-[1.25rem] bg-sand/45 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
                {safeLocale === "ar" ? "مدينة الانطلاق" : "Ville de depart"}
              </p>
              <p className="mt-2 font-semibold text-ink">{trip.city || agencyCity || "-"}</p>
            </div>
            <div className="rounded-[1.25rem] bg-sand/45 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
                {safeLocale === "ar" ? "تاريخ الانطلاق" : "Date de depart"}
              </p>
              <p className="mt-2 font-semibold text-ink">{tripDateLabel}</p>
            </div>
            <div className="rounded-[1.25rem] bg-sand/45 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
                {copy.openSeats}
              </p>
              <p className="mt-2 font-semibold text-ink">{remainingSeats}</p>
            </div>
            <div className="rounded-[1.25rem] bg-sand/45 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
                {safeLocale === "ar" ? "الوكالة" : "Agence"}
              </p>
              <p className="mt-2 font-semibold text-ink">{agencyName}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-ink/60">
              {safeLocale === "ar" ? "المعلومات الأساسية ظاهرة أولاً، والتفاصيل الكاملة متاحة مباشرة أسفلها." : "Les informations essentielles apparaissent d'abord, avec les details complets juste en dessous."}
            </p>
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest/90"
              aria-expanded={open}
            >
              {open ? (safeLocale === "ar" ? "إخفاء التفاصيل" : "Masquer") : safeLocale === "ar" ? "عرض التفاصيل والحجز" : "Voir details et reservation"}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="border-t border-ink/10 p-4 sm:p-5 lg:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="min-w-0 space-y-4">
              <section className="rounded-[1.5rem] border border-ink/10 bg-sand/20 p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">
                      {safeLocale === "ar" ? "برنامج الرحلة" : "Programme du voyage"}
                    </p>
                    <h4 className="mt-2 text-xl font-black text-ink">
                      {safeLocale === "ar" ? "تفاصيل مقروءة قبل الحجز" : "Des details lisibles avant reservation"}
                    </h4>
                  </div>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm">
                    {tripDateLabel}
                  </span>
                </div>
                <div className="mt-4 whitespace-pre-line text-sm leading-8 text-ink/75">
                  {programText}
                </div>
              </section>

              <details className="rounded-[1.25rem] border border-ink/10 bg-sand/20">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink">
                  {safeLocale === "ar" ? "ماذا يشمل" : "Ce qui est inclus"}
                </summary>
                <div className="px-4 pb-4 text-sm leading-7 text-ink/70">
                  <ul className="space-y-2">
                    <li>{trip.destination || copy.agencyTrips}</li>
                    <li>
                      {safeLocale === "ar"
                        ? `الانطلاق من ${trip.city || agencyCity || "-"}.`
                        : `Depart depuis ${trip.city || agencyCity || "-"}.`}
                    </li>
                    <li>
                      {safeLocale === "ar"
                        ? `عدد المقاعد المتبقية: ${remainingSeats}.`
                        : `Places restantes: ${remainingSeats}.`}
                    </li>
                  </ul>
                </div>
              </details>

              <details className="rounded-[1.25rem] border border-ink/10 bg-sand/20">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink">
                  {safeLocale === "ar" ? "ماذا تحتاج" : "A apporter"}
                </summary>
                <div className="px-4 pb-4 text-sm leading-7 text-ink/70">
                  {Array.isArray(trip.equipmentRequirements) && trip.equipmentRequirements.length > 0 ? (
                    <ul className="space-y-2">
                      {trip.equipmentRequirements.slice(0, 5).map((item: string) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{safeLocale === "ar" ? "الأساسيات فقط حسب نوع الرحلة." : "Les essentiels seulement selon le voyage."}</p>
                  )}
                </div>
              </details>

              <details className="rounded-[1.25rem] border border-ink/10 bg-sand/20">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink">
                  {safeLocale === "ar" ? "شروط الحجز" : "Conditions"}
                </summary>
                <div className="px-4 pb-4 text-sm leading-7 text-ink/70">
                  <p>
                    {safeLocale === "ar"
                      ? "بعد تأكيد الحجز، ستتواصل الوكالة عبر واتساب. من داخل مساحة التريب تقدر تشوف معدات الرحلة المرتبطة."
                      : "Apres confirmation, l'agence vous contacte via WhatsApp. Depuis l'Espace Trip, vous voyez le materiel associe."}
                  </p>
                </div>
              </details>

              <details className="rounded-[1.25rem] border border-ink/10 bg-sand/20">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink">
                  {safeLocale === "ar" ? "الوكالة" : "Agence"}
                </summary>
                <div className="space-y-3 px-4 pb-4 text-sm leading-7 text-ink/70">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-[1rem] bg-white">
                      <Image src="/images/hero-main.jpg" alt={agencyName} fill sizes="48px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{agencyName}</p>
                      <p className="text-xs text-ink/55">{agencyCity || trip.city || "-"}</p>
                    </div>
                  </div>
                  {whatsappDigits ? (
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noreferrer"
                      data-analytics-event="whatsapp_click"
                      className="inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white"
                    >
                      {safeLocale === "ar" ? "تواصل واتساب" : "Contacter sur WhatsApp"}
                    </a>
                  ) : null}
                  <div className="rounded-[1.25rem] border border-dashed border-forest/15 bg-sand/20 p-4">
                    <p className="text-sm font-semibold text-ink">
                      {safeLocale === "ar" ? "من بعد تأكيد الحجز، كتدخل لمساحة التريب من لوحة الحساب" : "Apres confirmation, l'entree se fait depuis votre tableau de bord"}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-ink/60">
                      {safeLocale === "ar"
                        ? "ما كاين حتى رمز هنا. تأكيد الوكالة هو اللي كيفتح مساحة التريب والكراء المرتبط بها."
                        : "Aucun code n'est saisi ici. La confirmation de l'agence ouvre l'espace Trip et la location associee."}
                    </p>
                  </div>
                </div>
              </details>
            </div>

            <div className="min-w-0 lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white shadow-sm">
                <div className="border-b border-ink/10 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c2410c]">
                    {safeLocale === "ar" ? "الحجز والتواصل" : "Reservation et contact"}
                  </p>
                  <h4 className="mt-2 text-2xl font-black text-ink">
                    {formatLocalePrice(Number(trip.price || 0), safeLocale)}
                  </h4>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-[1.25rem] bg-white px-4 py-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
                        {safeLocale === "ar" ? "التاريخ" : "Date"}
                      </p>
                      <p className="mt-1 font-semibold text-ink">{tripDateLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white px-4 py-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
                        {safeLocale === "ar" ? "المدينة" : "Ville"}
                      </p>
                      <p className="mt-1 font-semibold text-ink">{trip.city || agencyCity || "-"}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white px-4 py-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
                        {copy.openSeats}
                      </p>
                      <p className="mt-1 font-semibold text-ink">{remainingSeats}</p>
                    </div>
                  </div>
                  {whatsappDigits ? (
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noreferrer"
                      data-analytics-event="whatsapp_click"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-ink/10 bg-white px-5 py-3 font-semibold text-ink transition hover:border-forest hover:text-forest"
                    >
                      {safeLocale === "ar" ? "تواصل واتساب" : "Contacter sur WhatsApp"}
                    </a>
                  ) : null}
                </div>
                <div className="p-4">
                  <AgencyReservationForm
                    agencyId={agencyId}
                    agencyName={agencyName}
                    tripId={trip._id}
                    tripTitle={trip.title}
                    tripPrice={Number(trip.price || 0)}
                    remainingSeats={remainingSeats}
                    isSignedIn={isSignedIn}
                    defaultName={defaultName}
                    defaultEmail={defaultEmail}
                    defaultCity={defaultCity || trip.city || agencyCity || ""}
                    defaultDate={trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : ""}
                    availableDates={recurringDates}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
