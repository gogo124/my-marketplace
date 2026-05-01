"use client";

import { SiteLocale } from "@/lib/i18n";
import { trackAnalyticsEvent } from "@/lib/analytics";

export function ActivityContactActions({
  activityId,
  providerUserId,
  activityTitle,
  whatsappDigits,
  phoneDigits,
  isSignedIn,
  locale
}: {
  activityId: string;
  providerUserId: string;
  activityTitle: string;
  whatsappDigits: string;
  phoneDigits: string;
  isSignedIn: boolean;
  locale: SiteLocale;
}) {
  async function trackLead(type: "whatsapp" | "call") {
    if (!isSignedIn) {
      return;
    }

    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellerId: providerUserId,
        activityId,
        type,
        source: "activity",
        message: `${type} click for ${activityTitle}`
      })
    });
  }

  async function openWhatsapp() {
    if (!whatsappDigits) {
      return;
    }

    trackAnalyticsEvent("whatsapp_click", { surface: "activity_detail", activity_id: activityId });
    await trackLead("whatsapp");
    const text = encodeURIComponent(`Salam, bghit n3rf ktar 3la activité: ${activityTitle} f Moroccan Trip.`);
    window.open(`https://wa.me/${whatsappDigits}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  async function openCall() {
    if (!phoneDigits) {
      return;
    }

    await trackLead("call");
    window.open(`tel:${phoneDigits}`, "_self");
  }

  return (
    <div className="flex flex-wrap gap-3">
      {whatsappDigits ? <button type="button" onClick={() => void openWhatsapp()} className="rounded-full bg-forest px-5 py-3 font-semibold text-white">WhatsApp</button> : null}
      {phoneDigits ? <button type="button" onClick={() => void openCall()} className="rounded-full border border-ink/10 px-5 py-3 font-semibold text-ink">{locale === "ar" ? "اتصال" : "Call"}</button> : null}
    </div>
  );
}
