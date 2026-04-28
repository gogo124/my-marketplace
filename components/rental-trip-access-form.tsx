"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveLocale, withLocale } from "@/lib/i18n";

export function RentalTripAccessForm({
  className = "grid gap-3 border-b border-ink/10 pb-5 lg:grid-cols-[1fr_auto]"
}: {
  className?: string;
}) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);

  return (
    <div className={className}>
      <div className="space-y-2">
        <p className="block text-sm font-semibold text-ink">{locale === "ar" ? "مساحة التريب" : "Espace Trip"}</p>
        <p className="text-sm leading-6 text-ink/60">
          {locale === "ar"
            ? "الدخول والطلب كيمشيو من بعد تأكيد الحجز داخل لوحة الحساب."
            : "L'entree et la demande passent apres confirmation depuis votre tableau de bord."}
        </p>
      </div>
      <Link
        href={withLocale("/dashboard", locale)}
        className="inline-flex items-center justify-center rounded-2xl bg-forest px-5 py-3 font-semibold text-white"
      >
        {locale === "ar" ? "ادخل لمساحة التريب" : "Ouvrir l'Espace Trip"}
      </Link>
    </div>
  );
}
