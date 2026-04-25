import type { SiteLocale } from "@/lib/i18n";
import { withLocale } from "@/lib/i18n";

export function buildCallbackPath(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

export function buildLoginPath(pathname: string, search: string, locale: SiteLocale) {
  const callbackUrl = encodeURIComponent(buildCallbackPath(pathname, search));
  return withLocale(`/login?callbackUrl=${callbackUrl}`, locale);
}

export function normalizeInternalRedirect(target: string, fallback: string) {
  if (!target) {
    return fallback;
  }

  if (target.startsWith("/")) {
    return target;
  }

  try {
    const parsed = new URL(target);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
