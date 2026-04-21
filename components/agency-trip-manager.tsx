"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";

type AgencyTrip = {
  _id: string;
  title?: string;
  destination?: string;
  city?: string;
  description?: string;
  price?: number;
  startDate?: string;
  endDate?: string;
  seatsTotal?: number;
  seatsBooked?: number;
  status?: "active" | "inactive";
};

type AgencyTripManagerProps = {
  trips: AgencyTrip[];
};

const emptyForm = {
  id: "",
  title: "",
  destination: "",
  city: "",
  description: "",
  price: "",
  startDate: "",
  endDate: "",
  seatsTotal: ""
};

export function AgencyTripManager({ trips }: AgencyTripManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function startEdit(trip: AgencyTrip) {
    setForm({
      id: trip._id,
      title: trip.title || "",
      destination: trip.destination || "",
      city: trip.city || "",
      description: trip.description || "",
      price: String(trip.price || ""),
      startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : "",
      endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : "",
      seatsTotal: String(trip.seatsTotal || "")
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: form.title,
        destination: form.destination,
        city: form.city,
        description: form.description,
        price: Number(form.price),
        startDate: form.startDate,
        endDate: form.endDate,
        seatsTotal: Number(form.seatsTotal)
      };

      const response = await fetch(form.id ? `/api/agency/trips/${form.id}` : "/api/agency/trips", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not save trip."));
      }

      setForm(emptyForm);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function removeTrip(id: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/agency/trips/${id}`, { method: "DELETE" });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not delete trip."));
      }

      if (form.id === id) {
        setForm(emptyForm);
      }

      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(trip: AgencyTrip) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/agency/trips/${trip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: trip.status === "inactive" ? "active" : "inactive" })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not update trip status."));
      }

      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
        <div>
          <h2 className="text-2xl font-black text-ink">{form.id ? "Edit trip" : "Add trip"}</h2>
          <p className="mt-2 text-sm text-ink/60">Publish and manage your agency trips from one place.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Trip title" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))} placeholder="Destination" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="Departure city" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" type="number" min="0" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} type="date" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} type="date" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
          <input value={form.seatsTotal} onChange={(event) => setForm((current) => ({ ...current, seatsTotal: event.target.value }))} placeholder="Total seats" type="number" min="1" className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30" />
        </div>
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          rows={4}
          placeholder="Trip description"
          className="w-full rounded-[1.5rem] border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading} className="rounded-full bg-clay px-5 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? "Saving..." : form.id ? "Update trip" : "Add trip"}
          </button>
          {form.id ? (
            <button type="button" onClick={() => setForm(emptyForm)} className="rounded-full border border-ink/10 px-5 py-3 font-semibold text-ink">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink">Trips</h2>
          <span className="text-sm text-ink/60">{trips.length} total</span>
        </div>
        {trips.length > 0 ? (
          <div className="mt-6 space-y-4">
            {trips.map((trip) => {
              const remainingSeats = Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0);

              return (
                <div key={trip._id} className="rounded-[1.5rem] border border-ink/10 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-ink">{trip.title}</h3>
                      <p className="mt-2 text-sm text-ink/60">
                        {trip.destination} • {trip.city}
                      </p>
                      <p className="mt-2 text-sm text-ink/60">
                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : ""} -{" "}
                        {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : ""}
                      </p>
                      <p className="mt-2 text-sm text-ink/60">
                        Remaining seats: {remainingSeats} / {trip.seatsTotal}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-clay">{trip.price} DH</p>
                      <p className="mt-2 text-sm text-ink/60">Status: {trip.status || "active"}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-ink/70">{trip.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => startEdit(trip)} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleStatus(trip)} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                      {trip.status === "inactive" ? "Activate" : "Deactivate"}
                    </button>
                    <button type="button" onClick={() => removeTrip(trip._id)} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/60">No trips yet. Add your first trip above.</p>
        )}
      </section>
    </div>
  );
}
