"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { RentalTripAccessForm } from "@/components/rental-trip-access-form";
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

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,61,46,0.12)]">
      <div className="border-b border-ink/5">
        <TripMediaCarousel
          images={images}
          alt={trip.title || "Trip"}
          fallback="/images/agencies.jpg"
          className="aspect-square"
          sizes="(max-width: 768px) 100vw, 420px"
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              {trip.destination || copy.agencyTrips}
            </p>
            <h3 className="mt-2 line-clamp-2 text-xl font-black text-ink">{trip.title}</h3>
          </div>
          <p className="rounded-full bg-sand px-3 py-2 text-sm font-black text-clay">
            {formatLocalePrice(Number(trip.price || 0), safeLocale)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[1.25rem] bg-sand/45 p-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
              {safeLocale === "ar" ? "الانطلاق" : "Depart"}
            </p>
            <p className="mt-2 line-clamp-1 font-semibold text-ink">{trip.city || agencyCity || "-"}</p>
          </div>
          <div className="rounded-[1.25rem] bg-sand/45 p-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
              {safeLocale === "ar" ? "التاريخ" : "Date"}
            </p>
            <p className="mt-2 line-clamp-1 font-semibold text-ink">
              {trip.startDate ? formatLocaleDate(trip.startDate, safeLocale) : "-"}
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-sand/45 p-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
              {copy.openSeats}
            </p>
            <p className="mt-2 font-semibold text-ink">{remainingSeats}</p>
          </div>
          <div className="rounded-[1.25rem] bg-sand/45 p-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
              {safeLocale === "ar" ? "الوكالة" : "Agence"}
            </p>
            <p className="mt-2 line-clamp-1 font-semibold text-ink">{agencyName}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ink/60">
            {safeLocale === "ar" ? "بدون ازدحام. معلومات أساسية فقط." : "Infos essentielles uniquement."}
          </p>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest/90"
            aria-expanded={open}
          >
            {open ? (safeLocale === "ar" ? "إخفاء التفاصيل" : "Masquer") : safeLocale === "ar" ? "عرض التفاصيل" : "Voir التفاصيل"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-ink/10 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              <details open className="rounded-[1.25rem] border border-ink/10 bg-sand/20">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink">
                  {safeLocale === "ar" ? "البرنامج" : "Programme"}
                </summary>
                <div className="px-4 pb-4 text-sm leading-7 text-ink/70">
                  {trip.description || (safeLocale === "ar" ? "تفاصيل البرنامج ستظهر هنا." : "Le detail du programme apparait ici.")}
                </div>
              </details>

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
                      ? "بعد تأكيد الحجز، ستتواصل الوكالة عبر واتساب. يمكن استعمال Trip Code بعد التأكيد لعرض معدات الرحلة."
                      : "Apres confirmation, l'agence vous contacte via WhatsApp. Le Trip Code reste disponible apres validation."}
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
                  {agencyWhatsapp ? (
                    <a
                      href={`https://wa.me/${String(agencyWhatsapp).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      data-analytics-event="whatsapp_click"
                      className="inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  <RentalTripAccessForm
                    placeholder={safeLocale === "ar" ? "أدخل رمز الرحلة" : "Enter trip code"}
                    buttonLabel={safeLocale === "ar" ? "عرض المعدات" : "View equipment"}
                    invalidLabel={safeLocale === "ar" ? "رمز الرحلة غير صالح." : "Invalid trip code."}
                    className="grid gap-3 sm:grid-cols-[1fr_auto]"
                  />
                </div>
              </details>
            </div>

            <div className="lg:sticky lg:top-6">
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
      ) : null}
    </article>
  );
}
