import { getLeadStatusLabel, getRentalRequestStatusLabel, getReservationStatusLabel } from "@/lib/trust";
import { resolveLocale, SiteLocale } from "@/lib/i18n";

type StatusBadgeProps = {
  status?: string | null;
  locale?: SiteLocale;
  kind?: "reservation" | "rental" | "lead" | "review" | "report" | "account";
  label?: string;
};

function getStatusClass(status: string) {
  switch (status) {
    case "confirmed":
    case "approved":
    case "completed":
    case "resolved":
    case "active":
    case "sold":
    case "verified":
      return "bg-forest text-white";
    case "pending":
    case "reviewed":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "cancelled":
    case "disabled":
      return "border border-red-200 bg-red-50 text-red-700";
    default:
      return "border border-ink/10 bg-sand text-ink/70";
  }
}

function getLabel(status: string, kind: NonNullable<StatusBadgeProps["kind"]>, locale: SiteLocale) {
  switch (kind) {
    case "reservation":
      return getReservationStatusLabel(status, locale);
    case "rental":
      return getRentalRequestStatusLabel(status, locale);
    case "lead":
      return getLeadStatusLabel(status, locale);
    case "review":
      if (status === "approved") {
        return locale === "ar" ? "موافق عليه" : "Approuve";
      }
      return locale === "ar" ? "قيد المراجعة" : "En attente";
    case "report":
      if (status === "resolved") {
        return locale === "ar" ? "محلول" : "Resolue";
      }
      if (status === "reviewed") {
        return locale === "ar" ? "تمت المراجعة" : "Revise";
      }
      return locale === "ar" ? "قيد الانتظار" : "En attente";
    case "account":
      return status === "disabled" ? (locale === "ar" ? "معطل" : "Desactive") : locale === "ar" ? "نشط" : "Actif";
    default:
      return status;
  }
}

export function StatusBadge({ status, locale = "ar", kind = "reservation", label }: StatusBadgeProps) {
  const safeLocale = resolveLocale(locale);
  const safeStatus = typeof status === "string" && status.trim().length > 0 ? status : "pending";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getStatusClass(safeStatus)}`}>
      {label || getLabel(safeStatus, kind, safeLocale)}
    </span>
  );
}
