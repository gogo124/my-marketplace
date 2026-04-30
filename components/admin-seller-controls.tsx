"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";

type AdminSellerControlsProps = {
  userId: string;
  sellerStatus?: string | null;
  sellerPlan?: "free" | "monthly" | null;
  sellerExpiresAt?: string | Date | null;
};

function toDateInputValue(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function AdminSellerControls({ userId, sellerStatus, sellerPlan, sellerExpiresAt }: AdminSellerControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const isArabic = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<"free" | "monthly" | "">(sellerPlan || "");
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(sellerExpiresAt));

  async function runPatch(body: Record<string, unknown>) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Admin seller action failed."), locale));
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

  async function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await runPatch({
      sellerPlan: plan || null,
      sellerExpiresAt: expiresAt || null
    });
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-ink/10 bg-sand/20 p-4">
      <p className="text-sm font-semibold text-ink">{isArabic ? "إدارة البائع" : "Seller access"}</p>
      <div className="flex flex-wrap gap-2">
        {sellerStatus !== "active" ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => runPatch({ sellerStatus: "active" })}
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isArabic ? "تفعيل البيع" : "Approve seller"}
          </button>
        ) : null}
        {sellerStatus !== "rejected" ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => runPatch({ sellerStatus: "rejected" })}
            className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {isArabic ? "رفض الطلب" : "Reject seller"}
          </button>
        ) : null}
        {sellerStatus !== "suspended" ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => runPatch({ sellerStatus: "suspended" })}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isArabic ? "تعليق البائع" : "Suspend seller"}
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSettingsSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <select
          value={plan}
          onChange={(event) => setPlan(event.target.value as "free" | "monthly" | "")}
          className="rounded-xl border border-ink/10 px-4 py-2 text-sm"
        >
          <option value="">{isArabic ? "بدون خطة" : "No plan"}</option>
          <option value="free">free</option>
          <option value="monthly">monthly</option>
        </select>
        <input
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          className="rounded-xl border border-ink/10 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? (isArabic ? "جارٍ..." : "Saving...") : isArabic ? "حفظ الخطة" : "Save plan"}
        </button>
      </form>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
