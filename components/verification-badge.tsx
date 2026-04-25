import { resolveLocale, SiteLocale } from "@/lib/i18n";
import { getAgencyVerificationLabel, getSellerVerificationLabel } from "@/lib/trust";

type VerificationBadgeProps = {
  type: "seller" | "agency" | "renter" | "place";
  status?: string | null;
  locale?: SiteLocale;
};

export function VerificationBadge({ type, status, locale = "ar" }: VerificationBadgeProps) {
  if (!status || (type === "seller" && status !== "verified")) {
    return null;
  }

  const safeLocale = resolveLocale(locale);
  const isPlace = type === "place";
  const label =
    type === "seller"
      ? getSellerVerificationLabel(status, safeLocale)
      : isPlace
        ? safeLocale === "ar"
          ? status === "approved"
            ? "مكان مراجع"
            : "قيد المراجعة"
          : status === "approved"
            ? "Lieu verifie"
            : "En revue"
        : getAgencyVerificationLabel(status, safeLocale);
  const className =
    status === "verified" || (isPlace && status === "approved")
      ? "bg-forest text-white"
      : "border border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${className}`}>
      {label}
    </span>
  );
}
