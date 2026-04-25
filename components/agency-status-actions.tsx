"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getApiError, parseApiResponse } from "@/lib/api";
import { getLeadStatusLabel, getRentalRequestStatusLabel, getReservationStatusLabel } from "@/lib/trust";
import { resolveLocale, translateApiError } from "@/lib/i18n";

type AgencyStatusActionsProps = {
  endpoint: "/api/leads" | "/api/agency/reservations" | "/api/admin/reservations" | "/api/rental-requests";
  idField: "leadId" | "reservationId" | "rentalRequestId";
  itemId: string;
  status: string;
  allowedStatuses: string[];
};

export function AgencyStatusActions({
  endpoint,
  idField,
  itemId,
  status,
  allowedStatuses
}: AgencyStatusActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(nextStatus: string) {
    setValue(nextStatus);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [idField]: itemId,
          status: nextStatus
        })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not update status."), locale));
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, locale) : translateApiError("Unexpected error.", locale)
      );
      setValue(status);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(event) => handleUpdate(event.target.value)}
        disabled={loading}
        className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-clay/30 disabled:opacity-60"
      >
        {allowedStatuses.map((allowedStatus) => (
          <option key={allowedStatus} value={allowedStatus}>
            {endpoint === "/api/leads"
              ? getLeadStatusLabel(allowedStatus, locale)
              : endpoint === "/api/rental-requests"
                ? getRentalRequestStatusLabel(allowedStatus, locale)
                : getReservationStatusLabel(allowedStatus, locale)}
          </option>
        ))}
      </select>
      {loading ? (
        <p className="text-xs text-ink/50">
          {locale === "ar" ? "جارٍ التحديث..." : "Mise a jour..."}
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
