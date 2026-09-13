export type AffiliateWidgetProvider = "Viator" | "GetYourGuide" | "Tripadvisor" | "Booking" | "Other";
type ParsedTag = { attrs: Record<string, string> };
export type SafeAffiliateEmbed =
  | { kind: "iframe"; src: string }
  | { kind: "viator"; attrs: Record<string, string>; scripts: string[] }
  | { kind: "getyourguide"; attrs: Record<string, string>; scripts: string[] }
  | { kind: "booking"; attrs: Record<string, string>; scripts: string[] }
  | { kind: "tripadvisor"; attrs: Record<string, string>; scripts: string[] };

const TRUSTED_SCRIPT_HOSTS: Record<AffiliateWidgetProvider, string[]> = {
  Viator: ["www.viator.com"],
  GetYourGuide: ["widget.getyourguide.com", "www.getyourguide.com"],
  Tripadvisor: ["www.tripadvisor.com"],
  Booking: ["aff.bstatic.com", "www.booking.com"],
  Other: [],
};

function parseAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attributePattern = /([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(source))) attrs[match[1].toLowerCase()] = match[3];
  return attrs;
}

function findOpeningTag(value: string, tag: string, predicate?: (attrs: Record<string, string>) => boolean): ParsedTag | null {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value))) {
    const attrs = parseAttributes(match[1]);
    if (!predicate || predicate(attrs)) return { attrs };
  }
  return null;
}

function extractScripts(value: string): string[] | null {
  const sources: string[] = [];
  const pattern = /<script\\b([^>]*)>([\\s\\S]*?)<\\/script\\s*>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value))) {
    const attrs = parseAttributes(match[1]);
    const src = attrs.src?.trim();
    if (!src || match[2].trim()) return null;
    sources.push(src);
  }
  if (/<script\\b/i.test(value) && !sources.length) return null;
  return sources;
}

function isTrustedScript(provider: AffiliateWidgetProvider, source: string): boolean {
  try {
    const url = new URL(source);
    if (url.protocol !== "https:") return false;
    return TRUSTED_SCRIPT_HOSTS[provider].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function iframeSource(value: string): string | null {
  const match = value.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (!match) return null;
  try {
    const url = new URL(match[1]);
    return url.protocol === "https:" ? url.toString() : null;
  } catch { return null; }
}

function onlyDataAttributes(attrs: Record<string, string>, prefix: string, allowed?: Set<string>): Record<string, string> {
  const output: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (!key.startsWith(prefix)) continue;
    if (allowed && !allowed.has(key)) continue;
    output[key] = value;
  }
  return output;
}

function getProviderWidget(provider: AffiliateWidgetProvider, value: string, scripts: string[]): SafeAffiliateEmbed | null {
  if (provider === "Viator") {
    const tag = findOpeningTag(value, "div", (attrs) => Boolean(attrs["data-vi-partner-id"] && attrs["data-vi-widget-ref"]));
    if (!tag) return null;
    const attrs = onlyDataAttributes(tag.attrs, "data-vi-");
    return attrs["data-vi-partner-id"] && attrs["data-vi-widget-ref"] ? { kind: "viator", attrs, scripts } : null;
  }

  if (provider === "GetYourGuide") {
    const tag = findOpeningTag(value, "div", (attrs) => Boolean(attrs["data-gyg-widget"] && attrs["data-gyg-partner-id"]));
    if (!tag) return null;
    const attrs = onlyDataAttributes(tag.attrs, "data-gyg-");
    if (attrs["data-gyg-href"]) {
      try {
        const href = new URL(attrs["data-gyg-href"]);
        if (href.protocol !== "https:" || !["widget.getyourguide.com", "www.getyourguide.com"].includes(href.hostname.toLowerCase())) return null;
      } catch { return null; }
    }
    return attrs["data-gyg-widget"] && attrs["data-gyg-partner-id"] ? { kind: "getyourguide", attrs, scripts } : null;
  }

  if (provider === "Booking") {
    const tag = findOpeningTag(value, "ins", (attrs) => /(^|\s)bookingaff(?:\s|$)/i.test(attrs.class || "") && Boolean(attrs["data-aid"] && attrs["data-target_aid"] && attrs["data-prod"]));
    if (!tag) return null;
    const allowed = new Set(["data-aid", "data-target_aid", "data-prod", "data-width", "data-height", "data-lang", "data-currency", "data-dest_id", "data-dest_type", "data-latitude", "data-longitude", "data-mwhsb", "data-checkin", "data-checkout", "data-hid", "data-landmark_name", "data-show_rw_logo", "data-show_rw_badge", "data-show_rw_text", "data-show_rw_border"]);
    const attrs = onlyDataAttributes(tag.attrs, "data-", allowed);
    return attrs["data-aid"] && attrs["data-target_aid"] && attrs["data-prod"] ? { kind: "booking", attrs, scripts } : null;
  }

  if (provider === "Tripadvisor") {
    const tag = findOpeningTag(value, "div", (attrs) => Object.keys(attrs).some((key) => key.startsWith("data-tripadvisor-")));
    if (!tag) return null;
    const attrs = onlyDataAttributes(tag.attrs, "data-tripadvisor-");
    return Object.keys(attrs).length ? { kind: "tripadvisor", attrs, scripts } : null;
  }

  return null;
}

export function getSafeAffiliateEmbed(provider: AffiliateWidgetProvider, value: string): SafeAffiliateEmbed | null {
  const iframe = iframeSource(value);
  const scripts = extractScripts(value);
  if (scripts === null || scripts.some((source) => !isTrustedScript(provider, source))) return null;
  if (iframe) return { kind: "iframe", src: iframe };
  return getProviderWidget(provider, value, scripts);
}

export function validateAffiliateWidgetEmbed(provider: AffiliateWidgetProvider, value: string): boolean {
  return getSafeAffiliateEmbed(provider, value) !== null;
}
