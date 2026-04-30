"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginPath } from "@/lib/auth-flow";
import { getApiError, parseApiResponse } from "@/lib/api";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { resolveLocale, translateApiError } from "@/lib/i18n";

export function ActivityReservationForm({
  activityId,
  providerUserId,
  activityTitle,
  isSignedIn
}: {
  activityId: string;
  providerUserId: string;
  activityTitle: string;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const isArabic = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isSignedIn) {
      router.push(buildLoginPath(pathname, searchParams.toString(), locale));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: providerUserId,
          activityId,
          source: "activity",
          type: "inquiry",
          name: String(formData.get("name") || ""),
          phone: String(formData.get("phone") || ""),
          city: String(formData.get("city") || ""),
          quantity: String(formData.get("quantity") || ""),
          preferredDate: String(formData.get("preferredDate") || ""),
          message: String(formData.get("message") || "") || `Activity request for ${activityTitle}`
        })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not send activity request."), locale));
      }

      trackAnalyticsEvent("reservation_attempt", { surface: "activity_detail", activity_id: activityId });
      event.currentTarget.reset();
      setSuccess(isArabic ? "تم إرسال الطلب إلى مزود النشاط." : "Request sent to the activity provider.");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[1.75rem] border border-ink/10 bg-white p-5 shadow-card">
      <h3 className="text-xl font-black text-ink">{isArabic ? "احجز أو اطلب التفاصيل" : "Reserve or request details"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder={isArabic ? "الاسم" : "Name"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="phone" required placeholder={isArabic ? "الهاتف" : "Phone"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="city" placeholder={isArabic ? "المدينة" : "City"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="quantity" type="number" min="1" max="99" defaultValue="1" required placeholder={isArabic ? "عدد الأشخاص" : "People"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="preferredDate" type="date" className="rounded-[1.25rem] border border-ink/10 px-4 py-3 sm:col-span-2" />
      </div>
      <textarea name="message" rows={4} placeholder={isArabic ? "رسالة اختيارية" : "Optional message"} className="w-full rounded-[1.25rem] border border-ink/10 px-4 py-3" />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-forest">{success}</p> : null}
      <button type="submit" disabled={loading} className="w-full rounded-full bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : isArabic ? "أرسل الطلب" : "Send request"}
      </button>
    </form>
  );
}
