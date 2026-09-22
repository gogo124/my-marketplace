"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Imported = { sourceUrl: string; title: string; description: string; shortDescription: string; article: string; location: string; duration: string; price: number; currency: string; images: string[]; metaTitle: string; metaDescription: string };

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || `activity-${Date.now()}`;
}

export function ActivityUrlImporter() {
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [imported, setImported] = useState<Imported | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function readSource() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/activities/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not read activity.");
      setImported(data.activity); setMessage("Activity information imported. Review it before creating the draft.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not read activity."); }
    finally { setBusy(false); }
  }

  async function createDraft() {
    if (!imported || !affiliateUrl.trim()) { setMessage("Add the affiliate URL before creating the activity."); return; }
    setBusy(true); setMessage("");
    try {
      const payload = { slug: slugify(imported.title), image: imported.images[0] || "", galleryImages: imported.images.slice(1, 20), ogImage: imported.images[0] || "", title: imported.title, metaTitle: imported.metaTitle, metaDescription: imported.metaDescription, shortDescription: imported.shortDescription, description: imported.article || imported.description, category: "", location: imported.location || "Morocco", affiliateUrl: affiliateUrl.trim(), price: imported.price, currency: imported.currency, discountedPrice: null, types: [], featured: false, status: "draft" };
      if (!payload.image) throw new Error("No usable image was found on the source page. Upload a Cloudinary image in the existing form before publishing.");
      const response = await fetch("/api/admin/activities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not create draft.");
      setMessage("Draft created successfully. Open it in the existing Edit form to choose type, upload Cloudinary images, and publish.");
      setImported(null); setSourceUrl(""); setAffiliateUrl(""); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create draft."); }
    finally { setBusy(false); }
  }

  return <section className="space-y-5 rounded-[2rem] border border-ink/10 bg-sand/30 p-6 shadow-card"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-clay">New import system</p><h2 className="mt-2 text-2xl font-black text-ink">Import activity from a normal URL</h2><p className="mt-2 text-sm text-ink/60">Read the public activity page, extract its available information, build a structured article, then create a draft. The affiliate URL remains separate and is still used by Book Now.</p></div><div className="grid gap-3 md:grid-cols-2"><input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="Source activity URL" className="rounded-2xl border border-ink/10 bg-white px-4 py-3" /><input type="url" value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} placeholder="Affiliate URL (Book Now)" className="rounded-2xl border border-ink/10 bg-white px-4 py-3" /></div><button type="button" disabled={busy || !sourceUrl} onClick={() => void readSource()} className="rounded-full bg-forest px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Reading..." : "Read activity"}</button>{imported ? <div className="space-y-4 rounded-2xl bg-white p-5"><h3 className="text-xl font-black">{imported.title || "Imported activity"}</h3><div className="grid gap-3 md:grid-cols-3 text-sm"><p><strong>Location:</strong> {imported.location || "—"}</p><p><strong>Duration:</strong> {imported.duration || "—"}</p><p><strong>Price:</strong> {imported.price || 0} {imported.currency}</p></div><textarea readOnly value={imported.article || imported.description} rows={8} className="w-full rounded-2xl border border-ink/10 px-4 py-3 text-sm" /><p className="text-xs text-ink/50">Found {imported.images.length} image URL(s). The existing Cloudinary image manager remains available for replacing/uploading images.</p><button type="button" disabled={busy || !affiliateUrl} onClick={() => void createDraft()} className="rounded-full bg-clay px-6 py-3 font-semibold text-white disabled:opacity-50">Create draft activity</button></div> : null}{message ? <p className="rounded-2xl bg-white p-4 text-sm font-semibold">{message}</p> : null}</section>;
}
