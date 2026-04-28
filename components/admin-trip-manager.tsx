"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiError, parseApiResponse } from "@/lib/api";
import { translateApiError } from "@/lib/i18n";

type AdminTrip = {
  _id: string;
  tripCode?: string;
  title?: string;
  destination?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "inactive";
  agency?: {
    name?: string;
    city?: string;
    user?: {
      name?: string;
      email?: string;
    };
  };
};

export function AdminTripManager({ trips }: { trips: AdminTrip[] }) {
  const router = useRouter();
  const [tripCodes, setTripCodes] = useState<Record<string, string>>(
    Object.fromEntries(trips.map((trip) => [trip._id, trip.tripCode || ""]))
  );
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  async function saveTripCode(tripId: string) {
    setSavingId(tripId);
    setError("");

    try {
      const response = await fetch(`/api/admin/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripCode: tripCodes[tripId] || "" })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not update Trip Space access."), "fr"));
      }

      setTripCodes((current) => ({
        ...current,
        [tripId]: typeof (data as any)?.trip?.tripCode === "string" ? (data as any).trip.tripCode : ""
      }));
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : translateApiError("Unexpected error.", "fr")
      );
    } finally {
      setSavingId("");
    }
  }

  return (
    <section className="space-y-4">
      {trips.map((trip) => (
        <article key={trip._id} className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">{trip.title || "Trip"}</h2>
              <p className="mt-2 text-sm text-ink/60">
                {trip.destination || "-"} {trip.city ? `• ${trip.city}` : ""}
              </p>
              <p className="mt-2 text-sm text-ink/60">
                Agency: {trip.agency?.name || "Agency"} {trip.agency?.city ? `• ${trip.agency.city}` : ""}
              </p>
              <p className="mt-2 text-sm text-ink/60">
                Owner: {trip.agency?.user?.name || "User"} {trip.agency?.user?.email ? `• ${trip.agency.user.email}` : ""}
              </p>
              <p className="mt-2 text-sm text-ink/60">
                Status: {trip.status || "active"}
              </p>
            </div>
            <div className="w-full max-w-md space-y-3">
              <label className="block text-sm font-semibold text-ink">Trip Space access for rental flow</label>
              <input
                value={tripCodes[trip._id] || ""}
                onChange={(event) =>
                  setTripCodes((current) => ({
                    ...current,
                    [trip._id]: event.target.value.toUpperCase()
                  }))
                }
                className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
              />
              <button
                type="button"
                onClick={() => saveTripCode(trip._id)}
                disabled={savingId === trip._id}
                className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingId === trip._id ? "Saving..." : "Save Trip Space access"}
              </button>
            </div>
          </div>
        </article>
      ))}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </section>
  );
}
