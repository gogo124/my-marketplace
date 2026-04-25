"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getDirection, resolveLocale } from "@/lib/i18n";

export function LocaleDocumentSync() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
  }, [locale]);

  return null;
}
