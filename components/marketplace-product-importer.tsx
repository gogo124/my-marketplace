"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  name: string;
  value: string;
  price?: number | null;
  stockStatus?: string;
  stockQuantity?: number | null;
};

type Preview = {
  supplier: string;
  sourceUrl: string;
  canonicalUrl: string;
  sourceProductId: string;
  title: string;
  description: string;
  brand: string;
  model?: string;
  sku?: string;
  category: string;
  sourcePrice: number | null;
  originalPrice: number | null;
  currency: string;
  stockStatus: string;
  stockQuantity?: number | null;
  variants: Variant[];
  specifications: Record<string, string>;
  images: string[];
};

type BrowserPayload = Record<string, unknown>;

function browserImportScript() {
  return String.raw`(async () => {
const clean = (v) => typeof v === "string" ? v.replace(/\s+/g, " ").trim() : v == null ? "" : String(v).replace(/\s+/g, " ").trim();
const abs = (v) => { try { const u = new URL(clean(v), location.href); return /^https?:$/.test(u.protocol) ? u.toString() : ""; } catch { return ""; } };
const meta = (key) => clean(document.querySelector('meta[property="' + key + '"],meta[name="' + key + '"]')?.content);
const text = (node) => clean(node?.textContent);
const num = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  let s = clean(value).replace(/[^\d,.-]/g, "");
  if (!s) return null;
  s = s.replace(/-/g, "");
  const comma = s.lastIndexOf(",");
  const dot = s.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) s = comma > dot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (comma >= 0) s = comma === s.length - 3 ? s.replace(",", ".") : s.replace(/,/g, "");
  else if (dot >= 0 && dot !== s.length - 3) s = s.replace(/\.(?=\d{3}(?:$|\D))/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const json = [];
document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
  try {
    const value = JSON.parse(node.textContent || "");
    const add = (item) => {
      if (Array.isArray(item)) item.forEach(add);
      else if (item?.["@graph"]) add(item["@graph"]);
      else if (item && typeof item === "object") json.push(item);
    };
    add(value);
  } catch {}
});

const product = json.find((item) => {
  const type = item?.["@type"];
  return type === "Product" || (Array.isArray(type) && type.includes("Product"));
}) || {};

const publicState = [];
const seenObjects = new WeakSet();
const walk = (value, depth = 0) => {
  if (depth > 8 || value == null || typeof value !== "object" || seenObjects.has(value)) return;
  seenObjects.add(value);
  if (Array.isArray(value)) { value.slice(0, 500).forEach((item) => walk(item, depth + 1)); return; }
  const keys = Object.keys(value);
  if (keys.some((key) => /product|variant|sku|offer|color|colour|size|stock|inventory|image|gallery/i.test(key))) publicState.push(value);
  keys.slice(0, 250).forEach((key) => walk(value[key], depth + 1));
};

document.querySelectorAll('script:not([src])').forEach((node) => {
  const raw = node.textContent || "";
  if (!/product|variant|sku|price|gallery|color|colour|size|stock|inventory/i.test(raw)) return;
  try { walk(JSON.parse(raw)); } catch {}
});

const images = [];
const imageSet = new Set();
const addImage = (value) => {
  const url = abs(value);
  if (!url || imageSet.has(url)) return;
  imageSet.add(url);
  images.push(url);
};
const addSrcset = (value) => clean(value).split(",").map((item) => item.trim()).filter(Boolean).forEach((item) => addImage(item.split(/\s+/)[0]));
const imageFields = ["image", "images", "src", "url", "imageUrl", "imageURL", "largeImage", "largeImageUrl", "originalImage", "originalUrl", "fullImage", "fullImageUrl", "zoomImage", "zoomUrl"];
const addImageObject = (value) => {
  if (typeof value === "string") addImage(value);
  else if (Array.isArray(value)) value.forEach(addImageObject);
  else if (value && typeof value === "object") imageFields.forEach((key) => value[key] && addImageObject(value[key]));
};
addImageObject(product.image);
addImage(meta("og:image"));
addImage(meta("twitter:image"));
publicState.forEach((item) => imageFields.forEach((key) => item[key] && addImageObject(item[key])));
document.querySelectorAll("img,source").forEach((element) => {
  addSrcset(element.getAttribute("srcset") || element.getAttribute("data-srcset") || "");
  ["data-src", "data-lazy-src", "data-original", "data-image", "data-url", "src"].forEach((key) => addImage(element.getAttribute(key) || ""));
});

const variants = [];
const addVariant = (name, value, extra = {}) => {
  name = clean(name); value = clean(value);
  if (!name || !value || value.length > 200) return;
  const key = name.toLowerCase() + "\u0000" + value.toLowerCase() + "\u0000" + String(extra.price ?? "");
  if (variants.some((item) => item._key === key)) return;
  variants.push({ name, value, price: extra.price ?? null, stockStatus: extra.stockStatus || "unknown", stockQuantity: extra.stockQuantity ?? null, _key: key });
};
const stockOf = (value) => /outofstock|out of stock|rupture|indisponible|épuisé|غير متوفر/i.test(clean(value)) ? "out_of_stock" : /instock|in stock|en stock|disponible|متوفر/i.test(clean(value)) ? "in_stock" : "unknown";
const readVariant = (item) => {
  if (!item || typeof item !== "object") return;
  const price = num(item.price ?? item.salePrice ?? item.finalPrice ?? item.offer?.price ?? item.offers?.price);
  const status = stockOf(item.availability ?? item.stockStatus ?? item.stock ?? item.inventory);
  const quantity = num(item.stockQuantity ?? item.quantity ?? item.inventoryLevel?.value);
  if (item.color ?? item.colour ?? item.couleur) addVariant("Color", item.color ?? item.colour ?? item.couleur, { price, stockStatus: status, stockQuantity: quantity });
  if (item.size ?? item.taille ?? item.pointure) addVariant("Size", item.size ?? item.taille ?? item.pointure, { price, stockStatus: status, stockQuantity: quantity });
  const name = item.name ?? item.label ?? item.option;
  const value = item.value ?? item.optionValue;
  if (name && value) addVariant(name, value, { price, stockStatus: status, stockQuantity: quantity });
};
json.forEach((item) => { if (Array.isArray(item.hasVariant)) item.hasVariant.forEach(readVariant); if (Array.isArray(item.variants)) item.variants.forEach(readVariant); });
publicState.slice(0, 500).forEach(readVariant);

const optionLabel = /color|colour|couleur|couleurs|لون|size|taille|tailles|pointure|المقاس|الحجم/i;
document.querySelectorAll('select,[role="radiogroup"],[role="listbox"],fieldset,[data-option],[data-attribute]').forEach((group) => {
  const label = text(group.querySelector("legend,label,[data-label],[data-attribute-name],h3,h4"));
  if (!optionLabel.test(label)) return;
  group.querySelectorAll('option,button,[role="option"],input[type="radio"]+label,[data-value],[data-option-value]').forEach((element) => {
    const value = clean(element.getAttribute("data-value") || element.getAttribute("data-option-value") || text(element));
    if (!value || /choose|select|sélection|اختار/i.test(value)) return;
    const isSize = /size|taille|pointure|المقاس|الحجم/i.test(label);
    addVariant(isSize ? "Size" : "Color", value, { stockStatus: element.hasAttribute("disabled") ? "out_of_stock" : "unknown" });
  });
});

const offers = Array.isArray(product.offers) ? product.offers[0] || {} : product.offers || {};
const currentPrice = num(offers.price ?? product.price);
const originalPriceValue = num(offers.highPrice ?? offers.listPrice ?? offers.regularPrice);
const originalPrice = originalPriceValue !== null && currentPrice !== null && originalPriceValue > currentPrice ? originalPriceValue : null;
const currency = clean(offers.priceCurrency ?? product.priceCurrency) || "MAD";
const stockStatus = stockOf(offers.availability ?? product.availability ?? document.body.innerText.slice(0, 20000));
const title = clean(product.name) || meta("og:title") || meta("twitter:title") || text(document.querySelector("h1")) || clean(document.title);
const description = clean(product.description) || meta("og:description") || meta("description") || text(document.querySelector('[class*="description"],[id*="description"],[data-testid*="description"]'));
const brand = clean(typeof product.brand === "object" ? product.brand?.name : product.brand);
const model = clean(product.model || product.mpn);
const sku = clean(product.sku || product.mpn);
const category = clean(product.category);
const sourceProductId = clean(product.productID || product.sku || product.mpn) || ((location.pathname.match(/(?:^|[-_.\/])(\d{6,})(?:\.html)?(?:$|[-_.\/?])/i) || [])[1] || "");
const canonicalUrl = abs(document.querySelector('link[rel="canonical"]')?.href || product.url || location.href);

const specifications = {};
const addSpec = (key, value) => {
  key = clean(key); value = clean(value);
  if (!key || !value || key.length > 120 || value.length > 500) return;
  if (!Object.keys(specifications).some((item) => item.toLowerCase() === key.toLowerCase())) specifications[key] = value;
};
if (Array.isArray(product.additionalProperty)) product.additionalProperty.forEach((item) => addSpec(item?.name, item?.value));
document.querySelectorAll("table tr").forEach((row) => { const cells = [...row.querySelectorAll("th,td")].map(text).filter(Boolean); if (cells.length >= 2) addSpec(cells[0], cells.slice(1).join(" — ")); });
document.querySelectorAll("dl").forEach((dl) => { const keys = [...dl.querySelectorAll("dt")]; const values = [...dl.querySelectorAll("dd")]; keys.forEach((key, index) => addSpec(text(key), text(values[index]))); });
document.querySelectorAll('[class*="specification"],[id*="specification"],[class*="attribute"],[id*="attribute"]').forEach((box) => box.querySelectorAll("li").forEach((li) => { const match = text(li).match(/^([^:：]{2,80})[:：]\s*(.+)$/); if (match) addSpec(match[1], match[2]); }));

const payload = {
  title,
  description: description || title,
  shortDescription: meta("og:description") || description.slice(0, 280),
  brand,
  model,
  sku,
  category,
  sourcePrice: currentPrice,
  originalPrice,
  currency,
  stockStatus,
  stockQuantity: null,
  variants: variants.map(({ _key, ...item }) => item).slice(0, 100),
  specifications: Object.fromEntries(Object.entries(specifications).slice(0, 50)),
  images: images.slice(0, 20),
  canonicalUrl,
  sourceProductId,
  extractionStrategies: ["json-ld", "embedded-state", "metadata", "gallery-dom", "variant-dom", "specification-dom"]
};

if (!payload.title || payload.title.length < 3) { alert("Product title could not be extracted."); return; }
if (payload.sourcePrice === null) { alert("Product price could not be extracted."); return; }
if (!payload.images.length) { alert("No usable product images could be extracted."); return; }
if (!window.opener || window.opener.closed) { alert("MoroccanTrip admin window is not connected. Please open this Jumia page using the Browser Import button from MoroccanTrip Admin."); return; }
window.opener.postMessage({ type: "moroccantrip:jumia-product", sourceUrl: location.href, payload }, "*");
alert("Product data sent to MoroccanTrip. Return to the admin tab and review the preview.");
})();`;
}

export function MarketplaceProductImporter() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [duplicate, setDuplicate] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [browserMode, setBrowserMode] = useState(false);
  const [browserPayload, setBrowserPayload] = useState<BrowserPayload | null>(null);
  const [browserWindow, setBrowserWindow] = useState<Window | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!browserWindow || event.source !== browserWindow) return;
      if (event.origin !== "https://www.jumia.ma" && event.origin !== "https://jumia.ma") return;
      if (event.data?.type !== "moroccantrip:jumia-product") return;
      const payload = event.data.payload;
      const sourceUrl = String(event.data.sourceUrl || "");
      if (!payload || !sourceUrl) return;
      setBrowserPayload(payload);
      setNotice("Browser data received. MoroccanTrip is validating it server-side…");
      void previewBrowser(payload, sourceUrl);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [browserWindow]);

  async function request(action: "preview" | "create") {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/marketplace/products/import", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, action })
      });
      const data = await response.json();
      if (!response.ok && response.status !== 409) {
        const blocked = Boolean(data?.browserImport) || data?.code === "blocked" || String(data?.error || "").toLowerCase().includes("jumia blocked automated server access");
        if (blocked) { setError("Jumia blocked automated server access. Use the browser-assisted import below."); setBrowserMode(true); return; }
        throw new Error(data?.error || "Import failed.");
      }
      if (action === "preview") {
        setPreview(data.product); setDuplicate(data.existing || null);
        if (data.duplicate) setNotice("This supplier product is already imported. No duplicate will be created.");
      } else if (data.duplicate) {
        setDuplicate(data.existing); setNotice("This supplier product already exists.");
      } else {
        setNotice("Product imported successfully as a draft."); setPreview(null); setUrl(""); router.refresh();
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Import failed"); }
    finally { setBusy(false); }
  }

  async function previewBrowser(payload: BrowserPayload, sourceUrl: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/marketplace/products/import/browser", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplier: "jumia", sourceUrl, product: payload, action: "preview" })
      });
      const data = await response.json();
      if (!response.ok && response.status !== 409) throw new Error(data?.error || "Browser import validation failed.");
      setUrl(sourceUrl); setPreview(data.product); setDuplicate(data.existing || null);
      setNotice(data.duplicate ? "This supplier product is already imported. No duplicate will be created." : "Browser data validated by MoroccanTrip. Review the complete preview before importing.");
    } catch (err) { setError(err instanceof Error ? err.message : "Browser import validation failed"); }
    finally { setBusy(false); }
  }

  function openBrowserImport() {
    setError(""); setNotice("Open the Jumia tab, then run the Browser Import Script from DevTools → Console.");
    const popup = window.open(url, "_blank");
    if (!popup) { setError("Your browser blocked the new tab. Allow pop-ups for MoroccanTrip and try again."); return; }
    setBrowserWindow(popup); setBrowserMode(true);
  }

  async function copyScript() {
    try { await navigator.clipboard.writeText(browserImportScript()); setNotice("Browser Import Script copied. In the Jumia tab, open DevTools → Console, paste it, then press Enter."); }
    catch { setError("Could not copy the script automatically. Select and copy the script manually."); }
  }

  async function createBrowser() {
    if (!browserPayload || !url) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/marketplace/products/import/browser", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplier: "jumia", sourceUrl: url, product: browserPayload, action: "create" })
      });
      const data = await response.json();
      if (!response.ok && response.status !== 409) throw new Error(data?.error || "Browser import failed.");
      if (data.duplicate) { setDuplicate(data.existing); setNotice("This supplier product already exists. No duplicate was created."); return; }
      setNotice("Product imported successfully as a draft."); setPreview(null); setBrowserPayload(null); setBrowserMode(false); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Browser import failed"); }
    finally { setBusy(false); }
  }

  return (
    <section className="space-y-6 rounded-[2rem] bg-white p-5 shadow-card sm:p-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[.25em] text-clay">Source importer</p>
        <h1 className="mt-2 text-3xl font-black">Import a supplier product</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/60">Paste a public Jumia Morocco product URL. MoroccanTrip first attempts automatic server import, then offers a browser-assisted fallback if Jumia blocks automated access.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-end">
        <label className="text-sm font-bold">Supplier
          <select value="jumia" disabled className="mt-2 w-full rounded-2xl border border-ink/10 bg-sand/40 px-4 py-3"><option value="jumia">Jumia Morocco</option></select>
        </label>
        <label className="text-sm font-bold">Product URL
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://www.jumia.ma/..." className="mt-2 w-full rounded-2xl border border-ink/10 px-4 py-3" />
        </label>
        <button type="button" onClick={() => request("preview")} disabled={busy || !url.trim()} className="rounded-2xl bg-forest px-5 py-3 font-black text-white disabled:opacity-50">{busy ? "Fetching…" : "Import Product"}</button>
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
      {notice && <div className="rounded-2xl bg-sand/60 p-4 text-sm font-bold">{notice}</div>}

      {browserMode && (
        <div className="space-y-4 rounded-3xl border border-ink/10 bg-sand/30 p-5">
          <div>
            <h2 className="text-lg font-black">Browser-assisted Jumia import</h2>
            <p className="mt-1 text-sm leading-6 text-ink/70">This fallback reads only public data from the normal Jumia page. It does not bypass CAPTCHA, Cloudflare, authentication, rate limits, or other access controls.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openBrowserImport} disabled={!url.trim()} className="rounded-2xl bg-forest px-5 py-3 font-black text-white disabled:opacity-50">Open Jumia &amp; Import From Browser</button>
            <button type="button" onClick={copyScript} className="rounded-2xl border border-ink/10 px-5 py-3 font-black">Copy Browser Import Script</button>
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-ink/70">
            <li>Open the Jumia product tab.</li>
            <li>Copy the script, then open DevTools → Console on the Jumia page.</li>
            <li>Paste the script and press Enter.</li>
            <li>Return here and review the server-validated preview.</li>
          </ol>
          <textarea readOnly value={browserImportScript()} onFocus={(event) => event.currentTarget.select()} className="h-40 w-full rounded-2xl border border-ink/10 bg-white p-3 font-mono text-xs" aria-label="Browser import script" />
        </div>
      )}

      {preview && (
        <div className="space-y-6 border-t border-ink/10 pt-6">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="space-y-3">
              <div className="aspect-square overflow-hidden rounded-3xl bg-sand">
                {preview.images[0] && <img src={preview.images[0]} alt={preview.title} className="h-full w-full object-contain" />}
              </div>
              {preview.images.length > 1 && <div className="grid grid-cols-5 gap-2">{preview.images.slice(0, 10).map((image, index) => <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-xl border border-ink/10 bg-sand"><img src={image} alt={`${preview.title} ${index + 1}`} className="h-full w-full object-cover" /></a>)}</div>}
              <p className="text-xs text-ink/50">{preview.images.length} image{preview.images.length === 1 ? "" : "s"} extracted · thumbnails open the source image</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-clay">{preview.brand || "Jumia"} · {preview.category || "Product"}</p>
                <h2 className="mt-2 text-2xl font-black">{preview.title}</h2>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-sand px-3 py-1.5 font-black">{preview.sourcePrice} {preview.currency}</span>
                {preview.originalPrice !== null && <span className="rounded-full border border-ink/10 px-3 py-1.5 font-bold line-through">{preview.originalPrice} {preview.currency}</span>}
                <span className="rounded-full border border-ink/10 px-3 py-1.5 font-bold">{preview.stockStatus}{preview.stockQuantity != null ? ` · ${preview.stockQuantity}` : ""}</span>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                {preview.brand && <div><b>Brand:</b> {preview.brand}</div>}
                {preview.model && <div><b>Model:</b> {preview.model}</div>}
                {preview.sku && <div><b>SKU:</b> {preview.sku}</div>}
                {preview.sourceProductId && <div><b>Product ID:</b> {preview.sourceProductId}</div>}
                {preview.canonicalUrl && <div className="break-all sm:col-span-2"><b>Canonical:</b> {preview.canonicalUrl}</div>}
              </div>
              <p className="text-sm leading-7 text-ink/70">{preview.description}</p>
            </div>
          </div>

          {preview.variants.length > 0 && <div><h3 className="font-black">Variants</h3><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{preview.variants.map((variant, index) => <div key={`${variant.name}-${variant.value}-${index}`} className="rounded-xl border border-ink/10 bg-sand/30 p-3 text-sm"><b>{variant.name}</b><div>{variant.value}</div>{variant.price != null && <div className="mt-1 font-bold">{variant.price} {preview.currency}</div>}<div className="mt-1 text-xs text-ink/50">{variant.stockStatus || "unknown"}{variant.stockQuantity != null ? ` · ${variant.stockQuantity}` : ""}</div></div>)}</div></div>}

          {Object.keys(preview.specifications || {}).length > 0 && <div><h3 className="font-black">Specifications</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(preview.specifications).map(([key, value]) => <div key={key} className="rounded-xl bg-sand/50 p-3 text-sm"><b>{key}</b><span className="mx-2">·</span>{value}</div>)}</div></div>}

          <div className="flex flex-wrap gap-3">
            {duplicate ? <Link href="/admin/marketplace/products" className="rounded-2xl border border-ink/10 px-5 py-3 font-black">Open products</Link> : browserPayload ? <button type="button" onClick={createBrowser} disabled={busy} className="rounded-2xl bg-forest px-5 py-3 font-black text-white disabled:opacity-50">{busy ? "Creating…" : "Confirm Browser Import"}</button> : <button type="button" onClick={() => request("create")} disabled={busy} className="rounded-2xl bg-forest px-5 py-3 font-black text-white disabled:opacity-50">{busy ? "Creating…" : "Confirm Import"}</button>}
            <button type="button" onClick={() => { setPreview(null); setDuplicate(null); setBrowserPayload(null); }} className="rounded-2xl border border-ink/10 px-5 py-3 font-black">Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}
