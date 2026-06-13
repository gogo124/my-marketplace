"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, SiteLocale, siteCopy, translateApiError } from "@/lib/i18n";

type ReportFormProps = {
  targetType: "listing" | "agency" | "travel-post" | "user" | "review";
  targetId: string;
  title?: string;
  compact?: boolean;
  locale?: SiteLocale;
};

export function ReportForm({ targetType, targetId, title, compact = false, locale = "ar" }: ReportFormProps) {
  const router = useRouter();
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
  const formRef = useRef<HTMLFormElement | null>(null);
  const defaultReasons = [
    copy.reasonSpam,
    copy.reasonFraud,
    copy.reasonAbusive,
    copy.reasonMisleading,
    copy.reasonHarassment,
    copy.reasonOther
  ];
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(formRef.current || event.currentTarget);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: String(formData.get("reason") || ""),
          description: String(formData.get("description") || "")
        })
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not submit report."), safeLocale));
      }

      formRef.current?.reset();
      setSuccess(copy.reportSubmitted);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setError("");
          setSuccess("");
        }}
        className={`rounded-full px-4 py-2 text-sm font-semibold ${
          compact ? "border border-ink/10 bg-white text-ink" : "border border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {open ? copy.cancelReport : title || copy.report}
      </button>

      {open ? (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 rounded-[1.5rem] border border-ink/10 bg-white p-4 shadow-card">
          <select name="reason" required className="w-full rounded-xl border border-ink/10 px-4 py-3">
            <option value="">{copy.selectReason}</option>
            {defaultReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            rows={3}
            placeholder={copy.optionalDetails}
            maxLength={500}
            className="w-full rounded-xl border border-ink/10 px-4 py-3"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-forest">{success}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? copy.submitting : copy.submitReport}
          </button>
        </form>
      ) : null}
    </div>
  );
}
