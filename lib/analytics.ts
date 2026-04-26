type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function getAnalyticsContext() {
  if (typeof window === "undefined") {
    return null;
  }

  return {
    path: `${window.location.pathname}${window.location.search}`,
    title: document.title,
    href: window.location.href
  };
}

export function trackAnalyticsEvent(eventName: string, payload: AnalyticsPayload = {}) {
  const context = getAnalyticsContext();

  if (!context) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page: context.path,
    timestamp: new Date().toISOString()
  });

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    keepalive: true,
    body: JSON.stringify({
      type: eventName,
      page: context.path,
      timestamp: new Date().toISOString()
    })
  }).catch(() => undefined);
}
