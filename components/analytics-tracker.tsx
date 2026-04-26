"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    const query = searchParams?.toString() || "";
    const pageKey = `${pathname}${query ? `?${query}` : ""}`;

    if (lastTracked.current === pageKey) {
      return;
    }

    lastTracked.current = pageKey;

    const schedule = "requestIdleCallback" in window
      ? (window as Window & { requestIdleCallback: (callback: () => void) => number }).requestIdleCallback
      : (callback: () => void) => window.setTimeout(callback, 0);

    schedule(() => {
      trackAnalyticsEvent("page_view", {
        page_path: pathname,
        page_query: query || undefined
      });
    });
  }, [pathname, searchParams]);

  return null;
}
