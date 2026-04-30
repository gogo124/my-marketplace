"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";

export function ActivityProviderRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const isArabic = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/activity-provider/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: String(formData.get("businessName") || ""),
          city: String(formData.get("city") || ""),
          phone: String(formData.get("phone") || ""),
          whatsapp: String(formData.get("whatsapp") || ""),
          instagram: String(formData.get("instagram") || ""),
          facebook: String(formData.get("facebook") || ""),
          activityType: String(formData.get("activityType") || ""),
          description: String(formData.get("description") || "")
        })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not submit activity provider request."), locale));
      }

      event.currentTarget.reset();
      setSuccess(isArabic ? "تم إرسال طلب مزود الأنشطة بنجاح." : "Activity provider request sent successfully.");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-card space-y-4">
      <div>
        <h2 className="text-2xl font-black text-ink">{isArabic ? "طلب الوصول كمزود أنشطة" : "Request activity provider access"}</h2>
        <p className="mt-2 text-sm text-ink/60">
          {isArabic
            ? "أرسل معلومات النشاط ديالك، والإدارة غادي تراجع الطلب قبل التفعيل."
            : "Send your activity business details. The admin reviews the request before activation."}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="businessName" required placeholder={isArabic ? "اسم النشاط أو الشركة" : "Business or activity name"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="city" required placeholder={isArabic ? "المدينة" : "City"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="phone" required placeholder={isArabic ? "الهاتف" : "Phone"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="whatsapp" required placeholder="WhatsApp" className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="instagram" placeholder="Instagram" className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="facebook" placeholder="Facebook" className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
        <input name="activityType" required placeholder={isArabic ? "نوع النشاط" : "Activity type"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3 md:col-span-2" />
      </div>
      <textarea name="description" required rows={5} placeholder={isArabic ? "وصف قصير عن الخدمات والأنشطة" : "Describe your activities and services"} className="w-full rounded-[1.25rem] border border-ink/10 px-4 py-3" />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-forest">{success}</p> : null}
      <button type="submit" disabled={loading} className="rounded-full bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60">
        {loading ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : isArabic ? "إرسال الطلب" : "Send request"}
      </button>
    </form>
  );
}
