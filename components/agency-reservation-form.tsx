"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginPath } from "@/lib/auth-flow";
import { getApiError, parseApiResponse } from "@/lib/api";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { formatLocalePrice, resolveLocale, siteCopy, translateApiError } from "@/lib/i18n";

type AgencyReservationFormProps = {
  id?: string;
  agencyId: string;
  agencyName?: string;
  tripId: string;
  tripTitle: string;
  tripPrice: number;
  remainingSeats: number;
  isSignedIn: boolean;
  defaultName?: string;
  defaultEmail?: string;
  defaultCity?: string;
  defaultDate?: string;
  availableDates?: Array<{ value: string; label: string; status?: "available" | "almost full" | "full" }>;
};

export function AgencyReservationForm({
  id,
  agencyId,
  agencyName = "",
  tripId,
  tripTitle,
  tripPrice,
  remainingSeats,
  isSignedIn,
  defaultName = "",
  defaultEmail = "",
  defaultCity = "",
  defaultDate = "",
  availableDates = []
}: AgencyReservationFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const pendingMessage =
    locale === "ar"
      ? "تم إرسال الحجز بنجاح. ستتواصل الوكالة معك عبر واتساب."
      : "Reservation envoyee avec succes. L'agence vous contactera via WhatsApp.";
  const [customerName, setCustomerName] = useState(defaultName);
  const [customerEmail, setCustomerEmail] = useState(defaultEmail);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState(defaultCity);
  const [preferredDate, setPreferredDate] = useState(defaultDate);
  const [seats, setSeats] = useState("1");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const peopleCount = Math.min(Math.max(Number(seats || 1), 1), Math.max(remainingSeats, 1));
  const totalPrice = peopleCount * Number(tripPrice || 0);
  const showEmailField = !defaultEmail;
  const hasDateChips = availableDates.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isSignedIn) {
      setError(translateApiError("Please sign in to continue", locale));
      router.push(buildLoginPath(pathname, searchParams.toString(), locale));
      return;
    }

    setLoading(true);

    try {
      trackAnalyticsEvent("reservation_attempt", {
        agency_id: agencyId,
        trip_id: tripId,
        seats: Number(seats),
        preferred_date: preferredDate || undefined,
        total_price: totalPrice
      });

      const response = await fetch("/api/agency/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId,
          tripId,
          customerName,
          customerEmail,
          phoneNumber,
          city,
          preferredDate: preferredDate || undefined,
          seats: Number(seats)
        })
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not reserve seats."), locale));
      }

      trackAnalyticsEvent("reservation_success", {
        agency_id: agencyId,
        trip_id: tripId,
        seats: Number(seats),
        total_price: totalPrice
      });

      setSuccess(pendingMessage);
      setPhoneNumber("");
      setCity(defaultCity);
      setPreferredDate(defaultDate);
      setSeats("1");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, locale) : translateApiError("Unexpected error.", locale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-4 rounded-[1.5rem] border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{copy.reserveThisTrip}</p>
          <p className="mt-1 text-xs text-ink/60">
            {tripTitle} • {remainingSeats} {copy.seatsLeft}
          </p>
        </div>
        <p className="rounded-full bg-sand px-3 py-2 text-xs font-semibold text-ink/60">
          {locale === "ar" ? "واتساب بعد التأكيد" : "WhatsApp apres confirmation"}
        </p>
      </div>

      {hasDateChips ? (
        <div className="overflow-x-auto pb-1">
          <div className="flex w-max gap-2">
            {availableDates.map((departure) => {
              const isSelected = preferredDate === departure.value;

              return (
                <button
                  key={departure.value}
                  type="button"
                  onClick={() => setPreferredDate(departure.value)}
                  className={`min-w-[140px] rounded-[1.25rem] border px-4 py-3 text-left text-xs font-semibold transition ${
                    isSelected ? "border-forest bg-forest text-white" : "border-ink/10 bg-sand/20 text-ink hover:border-clay hover:text-clay"
                  }`}
                >
                  <span className="block">{departure.label}</span>
                  <span className={`mt-1 block text-[0.65rem] uppercase tracking-[0.18em] ${isSelected ? "text-white/75" : "text-ink/45"}`}>
                    {locale === "ar" ? "متاح" : "Disponible"} • {remainingSeats} {copy.seatsLeft}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <input
          value={preferredDate}
          onChange={(event) => setPreferredDate(event.target.value)}
          type="date"
          className="w-full rounded-2xl border border-ink/10 bg-sand/20 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder={isSignedIn ? copy.yourFullName : copy.guestFullName}
          className="w-full rounded-2xl border border-ink/10 bg-sand/20 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <input
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder={copy.phoneNumber}
          className="w-full rounded-2xl border border-ink/10 bg-sand/20 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder={copy.city}
          className="w-full rounded-2xl border border-ink/10 bg-sand/20 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <input
          value={seats}
          onChange={(event) => setSeats(event.target.value)}
          type="number"
          min="1"
          max={Math.max(remainingSeats, 1)}
          placeholder={locale === "ar" ? "عدد المقاعد" : "Nombre de places"}
          className="w-full rounded-2xl border border-ink/10 bg-sand/20 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        {showEmailField ? (
          <input
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            type="email"
            placeholder={copy.emailAddress}
            className="w-full rounded-2xl border border-ink/10 bg-sand/20 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30 sm:col-span-2"
          />
        ) : (
          <input type="hidden" value={customerEmail} readOnly />
        )}
      </div>

      <div className="grid gap-2 rounded-[1.25rem] bg-sand/30 p-3 text-sm text-ink/70 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{locale === "ar" ? "التاريخ" : "Date"}</p>
          <p className="mt-1 font-semibold text-ink">{preferredDate || "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{locale === "ar" ? "المقاعد" : "Places"}</p>
          <p className="mt-1 font-semibold text-ink">{peopleCount}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{locale === "ar" ? "المجموع" : "Total"}</p>
          <p className="mt-1 font-semibold text-clay">{formatLocalePrice(totalPrice, locale)}</p>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-forest">{success}</p> : null}

      <button
        type="submit"
        onClick={() => trackAnalyticsEvent("booking_click", { surface: "agency_trip_reservation", trip_id: tripId, agency_id: agencyId })}
        disabled={loading || remainingSeats < 1}
        className="w-full rounded-2xl bg-clay px-4 py-3 font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
      >
        {loading ? copy.saving : remainingSeats > 0 ? "تأكيد الحجز" : copy.tripFull}
      </button>
    </form>
  );
}
