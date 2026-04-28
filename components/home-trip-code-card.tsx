"use client";

import Link from "next/link";
import { withLocale } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/i18n";

export function HomeTripCodeCard({ locale }: { locale: SiteLocale }) {
  return (
    <div className="mt-4 space-y-3 rounded-[1.5rem] border border-dashed border-forest/15 bg-sand/20 p-4">
      <p className="text-sm font-semibold text-slate-900">{locale === "ar" ? "مساحة التريب" : "Espace Trip"}</p>
      <p className="text-sm leading-6 text-slate-500">
        {locale === "ar"
          ? "من بعد تأكيد الحجز، تدخل لمساحة التريب باش تشوف التفاصيل والمعدات المرتبطة."
          : "Apres confirmation, l'Espace Trip affiche les details et le materiel associe."}
      </p>
      <Link
        href={withLocale("/dashboard", locale)}
        className="inline-flex rounded-full bg-[#f97316] px-5 py-3 font-semibold text-white transition hover:bg-[#ea580c]"
      >
        {locale === "ar" ? "ادخل لمساحة التريب" : "Ouvrir l'Espace Trip"}
      </Link>
    </div>
  );
}
