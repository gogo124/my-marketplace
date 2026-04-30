"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";

export function SellerAccessRequestForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const isArabic = locale === "ar";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/seller/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: String(formData.get("businessName") || ""),
          city: String(formData.get("city") || ""),
          phone: String(formData.get("phone") || ""),
          whatsapp: String(formData.get("whatsapp") || ""),
          instagram: String(formData.get("instagram") || ""),
          facebook: String(formData.get("facebook") || ""),
          description: String(formData.get("description") || ""),
          whatTheySell: String(formData.get("whatTheySell") || "")
        })
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not submit seller request."), locale));
      }

      setSuccess(
        isArabic
          ? "تم إرسال طلب البائع وهو الآن في انتظار موافقة الإدارة."
          : "Seller request sent and now waiting for admin approval."
      );
      event.currentTarget.reset();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, locale) : translateApiError("Unexpected error.", locale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card ${compact ? "" : ""}`}>
      <div>
        <h2 className="text-2xl font-black text-ink">{isArabic ? "طلب تفعيل البيع" : "Request seller access"}</h2>
        <p className="mt-2 text-sm leading-7 text-ink/60">
          {isArabic
            ? "عمر هاد الطلب بمعلومات المتجر باش تراجعو الإدارة وتفعّل ليك البيع داخل السوق."
            : "Fill in your store details so the admin can review and activate marketplace selling for your account."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="businessName"
          required
          placeholder={isArabic ? "اسم المتجر أو النشاط" : "Business or store name"}
          className="rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/20 focus:ring"
        />
        <input
          name="city"
          required
          placeholder={isArabic ? "المدينة" : "City"}
          className="rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/20 focus:ring"
        />
        <input
          name="phone"
          required
          placeholder={isArabic ? "رقم الهاتف" : "Phone"}
          className="rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/20 focus:ring"
        />
        <input
          name="whatsapp"
          required
          placeholder="WhatsApp"
          className="rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/20 focus:ring"
        />
        <input
          name="instagram"
          placeholder="Instagram"
          className="rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/20 focus:ring"
        />
        <input
          name="facebook"
          placeholder="Facebook"
          className="rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/20 focus:ring"
        />
      </div>

      <textarea
        name="description"
        required
        rows={4}
        placeholder={isArabic ? "وصف قصير عن النشاط" : "Short business description"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/20 focus:ring"
      />
      <textarea
        name="whatTheySell"
        required
        rows={3}
        placeholder={isArabic ? "شنو كتبيع؟" : "What do you sell?"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/20 focus:ring"
      />

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-forest">{success}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-forest px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : isArabic ? "إرسال الطلب" : "Send request"}
      </button>
    </form>
  );
}
