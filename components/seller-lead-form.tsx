"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginPath } from "@/lib/auth-flow";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";

type SellerLeadFormProps = {
  sellerId: string;
  listingId?: string;
  source: "listing" | "seller_store" | "manual";
  title?: string;
  isSignedIn?: boolean;
  allowSourceSelect?: boolean;
  listingOptions?: Array<{ _id: string; title?: string }>;
};

export function SellerLeadForm({
  sellerId,
  listingId,
  source,
  title,
  isSignedIn = true,
  allowSourceSelect = false,
  listingOptions = []
}: SellerLeadFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const isArabic = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [manualSource, setManualSource] = useState<"manual" | "whatsapp" | "call" | "instagram" | "facebook" | "offline" | "other">("manual");
  const [manualStatus, setManualStatus] = useState<"new" | "contacted" | "sold" | "cancelled">("new");

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
          sellerId,
          source: allowSourceSelect ? manualSource : source,
          type: allowSourceSelect ? "manual" : "inquiry",
          status: allowSourceSelect ? manualStatus : "new",
          name: String(formData.get("name") || ""),
          phone: String(formData.get("phone") || ""),
          city: String(formData.get("city") || ""),
          message: String(formData.get("message") || ""),
          listingId: allowSourceSelect ? String(formData.get("listingId") || "") : listingId,
          customProductName: String(formData.get("customProductName") || ""),
          unitPrice: String(formData.get("unitPrice") || ""),
          quantity: String(formData.get("quantity") || ""),
          notes: String(formData.get("notes") || "")
        })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not save lead."), locale));
      }

      event.currentTarget.reset();
      setManualSource("manual");
      setManualStatus("new");
      setSuccess(isArabic ? "تم حفظ الطلب بنجاح." : "Lead saved successfully.");
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <div>
        <h3 className="text-lg font-bold text-ink">
          {title || (isArabic ? "إرسال استفسار" : "Send inquiry")}
        </h3>
        <p className="mt-1 text-sm text-ink/60">
          {allowSourceSelect
            ? isArabic
              ? "سجل طلب خارجي أو بيع يدوي من واتساب، إنستغرام، فيسبوك، الاتصال أو خارج المنصة."
              : "Register an external order or manual lead from WhatsApp, Instagram, Facebook, phone, or offline."
            : isArabic
              ? "سيتم حفظ هذا الطلب داخل لوحة البائع."
              : "This inquiry will be saved in the seller dashboard."}
        </p>
      </div>

      {allowSourceSelect ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={manualSource}
            onChange={(event) => setManualSource(event.target.value as "manual" | "whatsapp" | "call" | "instagram" | "facebook" | "offline" | "other")}
            className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
          >
            <option value="manual">{isArabic ? "يدوي" : "Manual"}</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="call">{isArabic ? "اتصال" : "Call"}</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="offline">{isArabic ? "خارج المنصة" : "Offline"}</option>
            <option value="other">{isArabic ? "مصدر آخر" : "Other"}</option>
          </select>
          <select
            value={manualStatus}
            onChange={(event) => setManualStatus(event.target.value as "new" | "contacted" | "sold" | "cancelled")}
            className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
          >
            <option value="new">{isArabic ? "جديد" : "New"}</option>
            <option value="contacted">{isArabic ? "تم التواصل" : "Contacted"}</option>
            <option value="sold">{isArabic ? "تم البيع" : "Sold"}</option>
            <option value="cancelled">{isArabic ? "ملغى" : "Cancelled"}</option>
          </select>
        </div>
      ) : null}

      <input
        name="name"
        required
        placeholder={isArabic ? "الاسم" : "Name"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <input
        name="phone"
        required
        placeholder={isArabic ? "الهاتف" : "Phone"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <input
        name="city"
        placeholder={isArabic ? "المدينة" : "City"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {allowSourceSelect ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            name="listingId"
            defaultValue={listingId || ""}
            className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
          >
            <option value="">{isArabic ? "إعلان المنصة اختياري" : "Optional marketplace listing"}</option>
            {listingOptions.map((listing) => (
              <option key={listing._id} value={listing._id}>
                {listing.title || listing._id}
              </option>
            ))}
          </select>
          <input
            name="customProductName"
            placeholder={isArabic ? "اسم المنتج الخارجي أو المخصص" : "Custom or external product name"}
            className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
          <input
            name="unitPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder={isArabic ? "السعر اختياري" : "Optional price"}
            className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
          <input
            name="quantity"
            type="number"
            min="1"
            step="1"
            placeholder={isArabic ? "الكمية اختيارية" : "Optional quantity"}
            className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
        </div>
      ) : null}
      <textarea
        name="message"
        required
        rows={4}
        placeholder={isArabic ? "الرسالة أو المنتج المطلوب" : "Message or requested product"}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {allowSourceSelect ? (
        <textarea
          name="notes"
          rows={3}
          placeholder={isArabic ? "ملاحظات داخلية اختيارية" : "Optional internal notes"}
          className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
        />
      ) : null}

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-forest">{success}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-clay px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ الطلب" : "Save inquiry"}
      </button>
    </form>
  );
}
