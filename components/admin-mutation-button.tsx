"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, siteCopy, translateApiError } from "@/lib/i18n";

type AdminMutationButtonProps = {
  endpoint: string;
  method?: "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  label: string;
  confirmText?: string;
  variant?: "danger" | "primary" | "neutral";
};

export function AdminMutationButton({
  endpoint,
  method = "PATCH",
  body,
  label,
  confirmText,
  variant = "primary"
}: AdminMutationButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (confirmText && !window.confirm(confirmText)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(endpoint, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Admin action failed."), locale));
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, locale) : translateApiError("Unexpected error.", locale)
      );
    } finally {
      setLoading(false);
    }
  }

  const className =
    variant === "danger"
      ? "bg-red-600 text-white"
      : variant === "neutral"
        ? "border border-ink/10 bg-white text-ink"
        : "bg-forest text-white";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 ${className}`}
      >
        {loading ? copy.loading : label}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
