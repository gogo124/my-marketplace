"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginPath } from "@/lib/auth-flow";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";

type RentalRequestFormProps = {
  tripTitle: string;
  isSignedIn: boolean;
  tripCode?: string;
  tripId?: string;
  hideTripCodeInput?: boolean;
  lockedRenterId?: string;
  lockedRentalItemId?: string;
  defaultName?: string;
  partners: Array<{
    _id: string;
    name?: string;
    recommendedItems?: Array<{ _id: string; title?: string; price?: number; quantityAvailable?: number }>;
  }>;
};

export function RentalRequestForm({
  tripTitle,
  isSignedIn,
  tripCode = "",
  tripId,
  hideTripCodeInput = false,
  lockedRenterId,
  lockedRentalItemId,
  defaultName = "",
  partners
}: RentalRequestFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const labels =
    locale === "ar"
      ? {
          title: "طلب كراء للمعدات",
          body: "أرسل طلباً بسيطاً مرتبطاً بهذه الرحلة.",
          name: "الاسم الكامل",
          phone: "رقم الهاتف",
          city: "المدينة",
          preferredDate: "التاريخ المفضل",
          notes: "ملاحظة إضافية",
          quantity: "الكمية",
          duration: "المدة بالأيام",
          renter: "مزود الكراء",
          item: "العنصر أو الباقة",
          send: "إرسال طلب الكراء",
          sending: "جارٍ الإرسال...",
          success: "تم إرسال طلب الكراء.",
          anyPartner: "أي مزود مناسب",
          anyItem: "أي عنصر مناسب",
          unitPrice: "سعر اليوم",
          total: "المجموع"
        }
      : {
          title: "Demande location equipement",
          body: "Envoyez une demande simple liee a ce voyage.",
          name: "Nom complet",
          phone: "Telephone",
          city: "Ville",
          preferredDate: "Date preferee",
          notes: "Note optionnelle",
          quantity: "Quantite",
          duration: "Duree en jours",
          renter: "Loueur",
          item: "Article ou pack",
          send: "Envoyer la demande",
          sending: "Envoi...",
          success: "La demande de location a ete envoyee.",
          anyPartner: "Tout loueur adapte",
          anyItem: "Tout article adapte",
          unitPrice: "Prix / jour",
          total: "Total"
        };

  const [customerName, setCustomerName] = useState(defaultName);
  const [tripCodeValue, setTripCodeValue] = useState(tripCode);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [durationDays, setDurationDays] = useState("1");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [renterId, setRenterId] = useState(lockedRenterId || "");
  const [rentalItemId, setRentalItemId] = useState(lockedRentalItemId || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPartner = useMemo(
    () => partners.find((partner) => partner._id === renterId) || null,
    [partners, renterId]
  );
  const selectedItem = useMemo(
    () => (selectedPartner?.recommendedItems || []).find((item) => item._id === rentalItemId) || null,
    [selectedPartner, rentalItemId]
  );
  const quantityValue = Math.max(Number(quantity || 1), 1);
  const durationValue = Math.max(Number(durationDays || 1), 1);
  const unitPrice = Number(selectedItem?.price || 0);
  const totalPrice = unitPrice * quantityValue * durationValue;

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
      const response = await fetch("/api/rental-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripCode: tripId ? undefined : tripCodeValue,
          tripId: tripId || undefined,
          renterId: renterId || undefined,
          rentalItemId: rentalItemId || undefined,
          customerName,
          phoneNumber,
          city,
          quantity: Number(quantity),
          durationDays: Number(durationDays),
          preferredDate: preferredDate || undefined,
          notes,
        })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not create rental request."), locale));
      }

      setSuccess(labels.success);
      if (!hideTripCodeInput) {
        setTripCodeValue("");
      }
      setPhoneNumber("");
      setCity("");
      setQuantity("1");
      setDurationDays("1");
      setPreferredDate("");
      setNotes("");
      setRenterId(lockedRenterId || "");
      setRentalItemId(lockedRentalItemId || "");
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
        <p className="text-sm font-semibold text-ink">{labels.title}</p>
        <p className="mt-1 text-xs text-ink/60">{tripTitle} • {labels.body}</p>
      </div>
      <input
        value={customerName}
        onChange={(event) => setCustomerName(event.target.value)}
        placeholder={labels.name}
        className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
      />
      {!hideTripCodeInput ? (
        <div className="rounded-[1.25rem] border border-dashed border-ink/15 bg-white px-4 py-3 text-sm text-ink/70">
          {locale === "ar"
            ? "طلب الكراء كيتفعل من داخل مساحة التريب بعد تأكيد الحجز."
            : "La demande de location se fait depuis l'Espace Trip apres confirmation."}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder={labels.phone}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <input
          value={preferredDate}
          onChange={(event) => setPreferredDate(event.target.value)}
          type="date"
          placeholder={labels.preferredDate}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder={labels.city}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        <input
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          type="number"
          min="1"
          max="50"
          placeholder={labels.quantity}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
      </div>
      <input
        value={durationDays}
        onChange={(event) => setDurationDays(event.target.value)}
        type="number"
        min="1"
        max="60"
        placeholder={labels.duration}
        className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
      />
      {!lockedRenterId && !lockedRentalItemId ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={renterId}
            onChange={(event) => {
              setRenterId(event.target.value);
              setRentalItemId("");
            }}
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
          >
            <option value="">{labels.anyPartner}</option>
            {partners.map((partner) => (
              <option key={partner._id} value={partner._id}>
                {partner.name}
              </option>
            ))}
          </select>
          <select
            value={rentalItemId}
            onChange={(event) => setRentalItemId(event.target.value)}
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
          >
            <option value="">{labels.anyItem}</option>
            {(selectedPartner?.recommendedItems || []).map((item) => (
              <option key={item._id} value={item._id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="rounded-[1.25rem] bg-white p-4 text-sm text-ink/70">
        <p>
          {labels.unitPrice}: <span className="font-semibold text-ink">{unitPrice} DH</span>
        </p>
        <p className="mt-1">
          {labels.total}: <span className="font-semibold text-clay">{totalPrice} DH</span>
        </p>
      </div>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        placeholder={labels.notes}
        className="w-full rounded-[1.5rem] border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-forest">{success}</p> : null}
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-clay px-4 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? labels.sending : labels.send}
      </button>
    </form>
  );
}
