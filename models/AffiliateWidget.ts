"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { getSafeAffiliateEmbed } from "@/lib/affiliate-widget-embed";

type Widget = { _id?: string; name?: string; provider?: "Viator" | "GetYourGuide" | "Tripadvisor" | "Booking" | "Other"; type?: string; embedCode?: string; affiliateUrl?: string; active?: boolean };

const loadedScripts = new Set<string>();

function ProviderWidget({ widget, parsed }: { widget: Widget; parsed: Exclude<ReturnType<typeof getSafeAffiliateEmbed>, { kind: "iframe" } | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    for (const source of parsed.scripts) {
      if (loadedScripts.has(source)) continue;
      const script = document.createElement("script");
      script.src = source;
      script.async = true;
      script.dataset.moroccanTripAffiliate = "true";
      document.body.appendChild(script);
      loadedScripts.add(source);
    }
  }, [parsed.scripts]);

  return <div ref={ref} className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-card">
    {parsed.kind === "viator" ? <div {...Object.fromEntries(Object.entries(parsed.attrs).map(([key, value]) => [key, value]))} /> : null}
    {parsed.kind === "getyourguide" ? <div {...Object.fromEntries(Object.entries(parsed.attrs).map(([key, value]) => [key, value]))} /> : null}
    {parsed.kind === "booking" ? <ins className="bookingaff" {...Object.fromEntries(Object.entries(parsed.attrs).map(([key, value]) => [key, value]))} /> : null}
    {parsed.kind === "tripadvisor" ? <div {...Object.fromEntries(Object.entries(parsed.attrs).map(([key, value]) => [key, value]))} /> : null}
    <span className="sr-only">{widget.name || "Affiliate widget"}</span>
  </div>;
}

export function AffiliateWidgetRenderer({ widget }: { widget: Widget }) {
  const active = widget.active !== false;
  const provider = widget.provider || "Other";
  const embed = useMemo(() => widget.type === "affiliate_link" ? null : getSafeAffiliateEmbed(provider, widget.embedCode || ""), [provider, widget.embedCode, widget.type]);
  if (!active) return null;
  if (widget.type === "affiliate_link") {
    try {
      const url = new URL(widget.affiliateUrl || "");
      if (url.protocol !== "https:" && url.protocol !== "http:") return null;
      return <Link href={url.toString()} target="_blank" rel="nofollow sponsored noopener" className="inline-flex rounded-full bg-forest px-5 py-3 text-sm font-black text-white">View offers</Link>;
    } catch { return null; }
  }
  if (!embed) return null;
  if (embed.kind === "iframe") return <div className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-card"><iframe src={embed.src} title={widget.name || "Affiliate widget"} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" className="min-h-[320px] w-full border-0" /></div>;
  return <ProviderWidget widget={widget} parsed={embed} />;
}

export function AffiliateWidgetSection({ widgets, title = "Partner offers" }: { widgets: Widget[]; title?: string }) {
  if (!widgets.length) return null;
  return <section className="space-y-5"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Affiliate partners</p><h2 className="mt-2 text-3xl font-black tracking-[-.03em] text-ink sm:text-4xl">{title}</h2></div><div className="grid gap-6">{widgets.map((widget) => <AffiliateWidgetRenderer key={String(widget._id || widget.name)} widget={widget} />)}</div></section>;
}
