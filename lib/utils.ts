import { SiteLocale } from "@/lib/i18n";

export function formatPrice(price: number, locale: SiteLocale = "fr") {
  return `${new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0
  }).format(price)} DH`;
}

export function formatShortDate(value: string | Date, locale: SiteLocale = "fr") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function serializeDocument<T>(document: T): T {
  return JSON.parse(JSON.stringify(document));
}
