"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export function TravelPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      destination: String(formData.get("destination") || "").trim(),
      date: String(formData.get("date") || ""),
      description: String(formData.get("description") || "").trim(),
      phoneNumber: String(formData.get("phoneNumber") || "").trim()
    };

    try {
      const response = await fetch("/api/travel-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not publish travel post."));
      }

      event.currentTarget.reset();
      router.push(withLocale("/travel-partners", locale));
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Unexpected error."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-5 overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur"
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(40,75,63,0.12),transparent_72%)]" />
      <div className="relative">
        <span className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
          Moroccan Trip
        </span>
        <h2 className="mt-4 text-2xl font-black leading-tight text-ink">{copy.publishTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-ink/60">{copy.publishBody}</p>
      </div>
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {copy.destination}
          </span>
          <input
            name="destination"
            required
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {copy.travelDate}
          </span>
          <input
            name="date"
            type="date"
            required
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {copy.phoneNumber}
          </span>
          <input
            name="phoneNumber"
            type="tel"
            required
            placeholder={copy.phonePlaceholder}
            className="w-full rounded-[1.4rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45">
            {copy.description}
          </span>
          <textarea
            name="description"
            required
            rows={6}
            placeholder={copy.description}
            className="w-full rounded-[1.6rem] border border-ink/10 bg-sand/70 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </label>
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-clay px-5 py-3 font-semibold text-white shadow-card disabled:opacity-60"
      >
        {loading ? copy.publishing : copy.publish}
      </button>
    </form>
  );
}
