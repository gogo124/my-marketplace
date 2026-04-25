"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginPath } from "@/lib/auth-flow";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, siteCopy, translateApiError } from "@/lib/i18n";

type AgencyReservationFormProps = {
  agencyId: string;
  tripId: string;
  tripTitle: string;
  tripPrice: number;
  remainingSeats: number;
  isSignedIn: boolean;
  defaultName?: string;
  defaultEmail?: string;
  defaultCity?: string;
  defaultDate?: string;
};

export function AgencyReservationForm({
  agencyId,
  tripId,
  tripTitle,
  tripPrice,
  remainingSeats,
  isSignedIn,
  defaultName = "",
  defaultEmail = "",
  defaultCity = "",
  defaultDate = ""
}: AgencyReservationFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const pendingMessage =
    locale === "ar"
      ? "تم إرسال الحجز بنجاح. ستظهر حالته أولاً كقيد الانتظار إلى أن تؤكده الوكالة."
      : "Reservation envoyee avec succes. Son statut reste d'abord en attente jusqu'a confirmation par l'agence.";
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

      setSuccess(pendingMessage);
      setPhoneNumber("");
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
    <form onSubmit={handleSubmit} className="mt-5 space-y-3 rounded-[1.5rem] border border-ink/10 bg-sand/40 p-4">
      <div>
        <p className="text-sm font-semibold text-ink">{copy.reserveThisTrip}</p>
        <p className="mt-1 text-xs text-ink/60">
          {tripTitle} • {remainingSeats} {copy.seatsLeft}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder={isSignedIn ? copy.yourFullName : copy.guestFullName}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <input
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          type="email"
          placeholder={copy.emailAddress}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder={copy.phoneNumber}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder={copy.city}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <input
          value={preferredDate}
          onChange={(event) => setPreferredDate(event.target.value)}
          type="date"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <input
          value={seats}
          onChange={(event) => setSeats(event.target.value)}
          type="number"
          min="1"
          max={Math.max(remainingSeats, 1)}
          placeholder={locale === "ar" ? "عدد الأشخاص" : "Nombre de personnes"}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
      </div>
      <div className="rounded-[1.25rem] bg-white p-4 text-sm text-ink/70">
        <p>
          {locale === "ar" ? "سعر الفرد" : "Prix par personne"}: <span className="font-semibold text-ink">{tripPrice} DH</span>
        </p>
        <p className="mt-1">
          {locale === "ar" ? "المجموع التقديري" : "Total estime"}: <span className="font-semibold text-clay">{totalPrice} DH</span>
        </p>
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-forest">{success}</p> : null}
      <button
        type="submit"
        disabled={loading || remainingSeats < 1}
        className="w-full rounded-2xl bg-forest px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? copy.saving : remainingSeats > 0 ? copy.reserveSeats : copy.tripFull}
      </button>
    </form>
  );
}
