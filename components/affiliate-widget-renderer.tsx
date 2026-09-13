import Link from "next/link";

type Widget = { _id?: string; name?: string; type?: string; embedCode?: string; affiliateUrl?: string; active?: boolean };

function iframeSource(embedCode: string) {
  const match = embedCode.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (!match) return null;
  try {
    const url = new URL(match[1]);
    return url.protocol === "https:" ? url.toString() : null;
  } catch { return null; }
}

export function AffiliateWidgetRenderer({ widget }: { widget: Widget }) {
  if (!widget.active) return null;
  if (widget.type === "affiliate_link") {
    try {
      const url = new URL(widget.affiliateUrl || "");
      if (url.protocol !== "https:" && url.protocol !== "http:") return null;
      return <Link href={url.toString()} target="_blank" rel="nofollow sponsored noopener" className="inline-flex rounded-full bg-forest px-5 py-3 text-sm font-black text-white">View offers</Link>;
    } catch { return null; }
  }
  const src = iframeSource(widget.embedCode || "");
  if (!src) return null;
  return <div className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-card"><iframe src={src} title={widget.name || "Affiliate widget"} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" className="min-h-[320px] w-full border-0" /></div>;
}

export function AffiliateWidgetSection({ widgets, title = "Partner offers" }: { widgets: Widget[]; title?: string }) {
  if (!widgets.length) return null;
  return <section className="space-y-5"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Affiliate partners</p><h2 className="mt-2 text-3xl font-black tracking-[-.03em] text-ink sm:text-4xl">{title}</h2></div><div className="grid gap-6">{widgets.map((widget) => <AffiliateWidgetRenderer key={String(widget._id || widget.name)} widget={widget} />)}</div></section>;
}
