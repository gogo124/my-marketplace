"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";

export function RentalTripAccessForm({
  label,
  placeholder,
  buttonLabel,
  invalidLabel,
  className = "grid gap-3 border-b border-ink/10 pb-5 lg:grid-cols-[1fr_auto]"
}: {
  label?: string;
  placeholder: string;
  buttonLabel: string;
  invalidLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const [tripCode, setTripCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rentals/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripCode })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, invalidLabel), locale));
      }

      if (typeof data.redirectTo !== "string") {
        throw new Error(translateApiError("Unexpected error.", locale));
      }

      router.push(data.redirectTo);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="lang" value={locale} />
      <div className="space-y-2">
        {label ? <label className="block text-sm font-semibold text-ink">{label}</label> : null}
        <input
          type="text"
          value={tripCode}
          onChange={(event) => setTripCode(event.target.value.toUpperCase())}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
        />
      </div>
      <button disabled={loading} className="rounded-2xl bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? "..." : buttonLabel}
      </button>
      {error ? <p className="text-sm font-medium text-red-600 lg:col-span-2">{error}</p> : null}
    </form>
  );
}
