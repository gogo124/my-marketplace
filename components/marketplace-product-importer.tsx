"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  options: Record<string, string>;
  price?: number | null;
  stockStatus?: string;
  stockQuantity?: number | null;
  sku?: string | null;
  sourceVariantId?: string | null;
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
  return String.raw`(async()=>{
const clean=v=>typeof v==="string"?v.replace(/\s+/g," ").trim():v==null?"":String(v).replace(/\s+/g," ").trim();
const abs=v=>{try{const u=new URL(clean(v),location.href);return /^https?:$/.test(u.protocol)?u.toString():""}catch{return ""}};
const meta=k=>clean(document.querySelector('meta[property="'+k+'"],meta[name="'+k+'"]')?.content);
const text=n=>clean(n?.textContent);
const num=v=>{if(typeof v==="number"&&Number.isFinite(v))return v;let s=clean(v).replace(/[^\d,.-]/g,"");if(!s)return null;s=s.replace(/-/g,"");const c=s.lastIndexOf(","),d=s.lastIndexOf(".");if(c>=0&&d>=0)s=c>d?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"");else if(c>=0)s=c===s.length-3?s.replace(",","."):s.replace(/,/g,"");else if(d>=0&&d!==s.length-3)s=s.replace(/\.(?=\d{3}(?:$|\D))/g,"");const n=Number(s);return Number.isFinite(n)?n:null};
const stockOf=v=>/outofstock|out of stock|rupture|indisponible|épuisé|غير متوفر/i.test(clean(v))?"out_of_stock":/instock|in stock|en stock|disponible|متوفر/i.test(clean(v))?"in_stock":"unknown";
const canonicalName=k=>{const s=clean(k);if(/color|colour|couleur|couleurs|لون/i.test(s))return"Color";if(/size|taille|tailles|pointure|المقاس|الحجم/i.test(s))return"Size";return s};
const json=[];document.querySelectorAll('script[type="application/ld+json"]').forEach(n=>{try{const v=JSON.parse(n.textContent||"");const add=x=>{if(Array.isArray(x))x.forEach(add);else if(x?.["@graph"])add(x["@graph"]);else if(x&&typeof x==="object")json.push(x)};add(v)}catch{}});
const product=json.find(x=>x?.["@type"]==="Product"||(Array.isArray(x?.["@type"])&&x["@type"].includes("Product")))||{};
const publicState=[],seen=new WeakSet();
const walk=(v,depth=0)=>{if(depth>11||v==null||typeof v!=="object"||seen.has(v))return;seen.add(v);if(Array.isArray(v)){v.slice(0,1500).forEach(x=>walk(x,depth+1));return}const keys=Object.keys(v);if(keys.some(k=>/product|variant|sku|offer|color|colour|size|stock|inventory|option|attribute|variation|configurable/i.test(k)))publicState.push(v);keys.slice(0,400).forEach(k=>walk(v[k],depth+1))};
document.querySelectorAll('script:not([src])').forEach(n=>{const raw=n.textContent||"";if(!/product|variant|sku|price|gallery|color|colour|size|stock|inventory|option|attribute|variation|configurable/i.test(raw)||raw.length>3000000)return;try{walk(JSON.parse(raw))}catch{}});
const variants=[],variantKeys=new Set();
const addVariant=(options,extra={})=>{const normalized={};Object.entries(options||{}).forEach(([rawK,v])=>{const k=canonicalName(rawK),value=clean(v);if(k&&value&&value.length<=200)normalized[k]=value});if(!Object.keys(normalized).length)return;const key=Object.entries(normalized).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k.toLowerCase()+"="+v.toLowerCase()).join("|")+"|"+String(extra.sku||extra.sourceVariantId||extra.price||"");if(variantKeys.has(key))return;variantKeys.add(key);variants.push({options:normalized,price:extra.price??null,stockStatus:extra.stockStatus||"unknown",stockQuantity:extra.stockQuantity??null,sku:extra.sku||null,sourceVariantId:extra.sourceVariantId||null})};
const readOptions=item=>{if(!item||typeof item!=="object"||Array.isArray(item))return{};const out={};const add=(k,v)=>{if(v==null||Array.isArray(v)||typeof v==="object")return;const key=canonicalName(k),value=clean(v);if(key&&value)out[key]=value};const sources=[item.options,item.attributes,item.selectedOptions,item.optionValues,item.variantOptions,item.variation,item.variations];for(const source of sources){if(source&&typeof source==="object"&&!Array.isArray(source))Object.entries(source).forEach(([k,v])=>add(k,v));}[["Color",item.color??item.colour??item.couleur],["Size",item.size??item.taille??item.pointure]].forEach(([k,v])=>add(k,v));if(!Object.keys(out).length&&item.name&&item.value)add(item.name,item.value);return out};
const readVariant=item=>{if(!item||typeof item!=="object"||Array.isArray(item))return;const options=readOptions(item);if(!Object.keys(options).length)return;const price=num(item.price??item.salePrice??item.finalPrice??item.offer?.price??item.offers?.price),status=stockOf(item.availability??item.stockStatus??item.stock??item.inventory),quantity=num(item.stockQuantity??item.quantity??item.inventoryLevel?.value),sku=clean(item.sku??item.productSku??item.sellerSku)||null,id=clean(item.sourceVariantId??item.variantId??item.id??item.sku)||null;addVariant(options,{price,stockStatus:status,stockQuantity:quantity,sku,sourceVariantId:id})};
const scan=(v,depth=0)=>{if(depth>10||v==null||typeof v!=="object")return;if(Array.isArray(v)){v.slice(0,1500).forEach(x=>{if(x&&typeof x==="object")readVariant(x);scan(x,depth+1)});return}readVariant(v);Object.values(v).slice(0,400).forEach(x=>scan(x,depth+1))};
json.forEach(scan);publicState.forEach(scan);
const optionGroups={};
const addGroupValue=(name,value,disabled=false)=>{name=canonicalName(name);value=clean(value);if(!name||!value||value.length>200||/choose|select|sélection|اختار/i.test(value))return;const list=optionGroups[name]??(optionGroups[name]=[]);if(!list.some(x=>x.value.toLowerCase()===value.toLowerCase()))list.push({value,disabled:!!disabled})};
const selectorRoots=document.querySelectorAll('select,fieldset,[role="radiogroup"],[role="listbox"],[data-option],[data-attribute],[data-attribute-name]');
selectorRoots.forEach(group=>{let label=text(group.querySelector('legend,[data-label],[data-attribute-name],[data-option-name],h3,h4,label'))||clean(group.getAttribute("data-attribute-name")||group.getAttribute("data-option-name")||group.getAttribute("data-option"));if(!label&&group.tagName.toLowerCase()==="select")label=clean(group.getAttribute("name")||group.getAttribute("aria-label"));if(!label)return;const els=group.matches("select")?group.querySelectorAll("option"):group.querySelectorAll('option,button,[role="option"],input[type="radio"]+label,[data-value],[data-option-value]');els.forEach(el=>{const value=clean(el.getAttribute("data-value")||el.getAttribute("data-option-value")||el.getAttribute("value")||text(el));if(value)addGroupValue(label,value,el.hasAttribute("disabled")||el.getAttribute("aria-disabled")==="true")})});
const domGroups=Object.entries(optionGroups).filter(([,values])=>values.some(x=>!x.disabled));
const variantOptionNames=()=>[...new Set(variants.flatMap(v=>Object.keys(v.options)))];
for(const [name,values] of domGroups){const enabled=[...new Set(values.filter(x=>!x.disabled).map(x=>x.value))];if(!enabled.length)continue;const missing=variants.length>0&&variants.every(v=>!Object.keys(v.options).some(k=>k.toLowerCase()===name.toLowerCase()));if(!missing)continue;
if(variants.length===1){const base=variants[0];const copy=variants.splice(0,1)[0];enabled.forEach(value=>addVariant({...copy.options,[name]:value},{price:copy.price,stockStatus:copy.stockStatus,stockQuantity:copy.stockQuantity,sku:copy.sku,sourceVariantId:copy.sourceVariantId?copy.sourceVariantId+":"+name+":"+value:name+":"+value}));}
else {const existingNames=variantOptionNames().filter(k=>k.toLowerCase()!==name.toLowerCase());const common=existingNames.length>0&&existingNames.every(k=>new Set(variants.map(v=>v.options[k]||"")).size===1);if(common){const current=variants.splice(0,variants.length);current.forEach(copy=>enabled.forEach(value=>addVariant({...copy.options,[name]:value},{price:copy.price,stockStatus:copy.stockStatus,stockQuantity:copy.stockQuantity,sku:copy.sku,sourceVariantId:copy.sourceVariantId?copy.sourceVariantId+":"+name+":"+value:name+":"+value})));}}
}
if(!variants.length)domGroups.forEach(([name,values])=>values.filter(x=>!x.disabled).forEach(x=>addVariant({[name]:x.value},{stockStatus:"unknown",sourceVariantId:name+":"+x.value}))); 
const images=[],imageSet=new Set(),addImage=v=>{const u=abs(v);if(u&&!imageSet.has(u)){imageSet.add(u);images.push(u)}};addImage(product.image);addImage(meta("og:image"));addImage(meta("twitter:image"));document.querySelectorAll("img,source").forEach(e=>["src","data-src","data-lazy-src","data-original","data-image","data-url"].forEach(k=>addImage(e.getAttribute(k)||"")));
const offers=Array.isArray(product.offers)?product.offers[0]||{}:product.offers||{};const currentPrice=num(offers.price??product.price),originalValue=num(offers.highPrice??offers.listPrice??offers.regularPrice),originalPrice=originalValue!==null&&currentPrice!==null&&originalValue>currentPrice?originalValue:null;
const specifications={};if(Array.isArray(product.additionalProperty))product.additionalProperty.forEach(x=>{const k=clean(x?.name),v=clean(x?.value);if(k&&v)specifications[k]=v});
const payload={title:clean(product.name)||meta("og:title")||text(document.querySelector("h1"))||clean(document.title),description:clean(product.description)||meta("og:description")||meta("description")||text(document.querySelector('[class*="description"],[id*="description"]')),shortDescription:meta("og:description"),brand:clean(typeof product.brand==="object"?product.brand?.name:product.brand),model:clean(product.model||product.mpn),sku:clean(product.sku||product.mpn),category:clean(product.category),sourcePrice:currentPrice,originalPrice,currency:clean(offers.priceCurrency||product.priceCurrency)||"MAD",stockStatus:stockOf(offers.availability||product.availability),stockQuantity:null,variants:variants.slice(0,300),optionGroups:Object.fromEntries(Object.entries(optionGroups).map(([k,v])=>[k,v.map(x=>x.value)])),specifications,images:images.slice(0,20),canonicalUrl:abs(document.querySelector('link[rel="canonical"]')?.href||product.url||location.href),sourceProductId:clean(product.productID||product.sku||product.mpn)||((location.pathname.match(/(?:^|[-_.\/])(\d{6,})(?:\.html)?(?:$|[-_.\/?])/i)||[])[1]||""),extractionStrategies:["json-ld","embedded-state","dynamic-option-groups","variant-combinations","metadata"]};
if(!payload.title||payload.title.length<3){alert("Product title could not be extracted.");return}if(payload.sourcePrice===null){alert("Product price could not be extracted.");return}if(!payload.images.length){alert("No usable product images could be extracted.");return}if(!window.opener||window.opener.closed){alert("MoroccanTrip admin window is not connected. Open this page using Browser Import from MoroccanTrip Admin.");return}window.opener.postMessage({type:"moroccantrip:jumia-product",sourceUrl:location.href,payload},"*");alert("Product data sent to MoroccanTrip. Return to the admin tab.");})();`;
}

export function MarketplaceProductImporter(){
  const router=useRouter();
  const [url,setUrl]=useState("");
  const [preview,setPreview]=useState<Preview|null>(null);
  const [duplicate,setDuplicate]=useState<unknown>(null);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  const [browserMode,setBrowserMode]=useState(false);
  const [browserPayload,setBrowserPayload]=useState<BrowserPayload|null>(null);
  const [browserWindow,setBrowserWindow]=useState<Window|null>(null);

  useEffect(()=>{const handler=(event:MessageEvent)=>{if(!browserWindow||event.source!==browserWindow)return;if(event.origin!=="https://www.jumia.ma"&&event.origin!=="https://jumia.ma")return;if(event.data?.type!=="moroccantrip:jumia-product")return;const payload=event.data.payload;if(!payload)return;setBrowserPayload(payload);setNotice("Browser data received. MoroccanTrip is validating the extracted options…");void previewBrowser(payload,String(event.data.sourceUrl||""))};window.addEventListener("message",handler);return()=>window.removeEventListener("message",handler)},[browserWindow]);

  async function request(action:"preview"|"create"){setBusy(true);setError("");setNotice("");try{const r=await fetch("/api/admin/marketplace/products/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,action})});const d=await r.json();if(!r.ok&&r.status!==409){const blocked=Boolean(d?.browserImport)||d?.code==="blocked"||String(d?.error||"").toLowerCase().includes("jumia blocked automated server access");if(blocked){setError("Jumia blocked automated server access. Use the browser-assisted import below.");setBrowserMode(true);return}throw new Error(d?.error||"Import failed")}if(action==="preview"){setPreview(d.product);setDuplicate(d.existing||null);if(d.duplicate)setNotice("This product already exists. Browser Import can refresh its options and variants.")}else if(d.duplicate){setDuplicate(d.existing);setNotice("This supplier product already exists.")}else{setNotice("Product imported successfully as a draft.");setPreview(null);setUrl("");router.refresh()}}catch(e){setError(e instanceof Error?e.message:"Import failed")}finally{setBusy(false)}}

  async function previewBrowser(payload:BrowserPayload,sourceUrl:string){setBusy(true);setError("");try{const r=await fetch("/api/admin/marketplace/products/import/browser",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({supplier:"jumia",sourceUrl,product:payload,action:"preview"})});const d=await r.json();if(!r.ok&&r.status!==409)throw new Error(d?.error||"Browser import validation failed");setUrl(sourceUrl);setPreview(d.product);setDuplicate(d.existing||null);setNotice(d.duplicate?"Existing product found. The extracted options are ready to review.":"Browser data validated by MoroccanTrip.")}catch(e){setError(e instanceof Error?e.message:"Browser import validation failed")}finally{setBusy(false)}}

  function openBrowserImport(){setError("");setNotice("Jumia opened. Run the copied Browser Import Script in DevTools → Console.");const popup=window.open(url,"_blank");if(!popup){setError("Your browser blocked the new tab.");return}setBrowserWindow(popup);setBrowserMode(true)}
  async function copyScript(){try{await navigator.clipboard.writeText(browserImportScript());setNotice("Browser Import Script copied. Open the Jumia tab and paste it in Console.")}catch{setError("Could not copy the script automatically.")}}

  async function createBrowser(){if(!browserPayload||!url)return;setBusy(true);setError("");try{const r=await fetch("/api/admin/marketplace/products/import/browser",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({supplier:"jumia",sourceUrl:url,product:browserPayload,action:"create"})});const d=await r.json();if(!r.ok&&r.status!==409)throw new Error(d?.error||"Browser import failed");if(d.refreshed){setNotice(`Existing product refreshed successfully with ${d.product?.variants?.length||0} variants.`);setPreview(null);setBrowserPayload(null);setBrowserMode(false);router.refresh();return}if(d.duplicate){setDuplicate(d.existing);setNotice("Product already exists. No duplicate was created.");return}setNotice("Product imported successfully as a draft.");setPreview(null);setBrowserPayload(null);setBrowserMode(false);router.refresh()}catch(e){setError(e instanceof Error?e.message:"Browser import failed")}finally{setBusy(false)}}

  const variants=preview?.variants||[];
  const optionNames=[...new Set(variants.flatMap(v=>Object.keys(v.options||{})))];
  const optionValues=(name:string)=>[...new Set(variants.map(v=>v.options?.[name]).filter(Boolean))];

  return <section className="space-y-6 rounded-[2rem] bg-white p-5 shadow-card sm:p-8">
    <div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Source importer</p><h1 className="mt-2 text-3xl font-black">Import a supplier product</h1><p className="mt-2 max-w-3xl text-sm leading-7 text-ink/60">Paste a Jumia Morocco URL. The browser fallback detects the supplier's real product options dynamically — size, color, material, capacity, model and any other available option.</p></div>
    <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-end"><label className="text-sm font-bold">Supplier<select value="jumia" disabled className="mt-2 w-full rounded-2xl border border-ink/10 bg-sand/40 px-4 py-3"><option value="jumia">Jumia Morocco</option></select></label><label className="text-sm font-bold">Product URL<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.jumia.ma/..." className="mt-2 w-full rounded-2xl border border-ink/10 px-4 py-3"/></label><button type="button" onClick={()=>request("preview")} disabled={busy||!url.trim()} className="rounded-2xl bg-forest px-5 py-3 font-black text-white disabled:opacity-50">{busy?"Fetching…":"Import Product"}</button></div>
    {error&&<div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
    {notice&&<div className="rounded-2xl bg-sand/60 p-4 text-sm font-bold">{notice}</div>}
    {browserMode&&<div className="rounded-3xl border border-ink/10 bg-sand/30 p-5"><h2 className="font-black">Browser-assisted extraction</h2><p className="mt-2 text-sm leading-6 text-ink/60">This is used when Jumia blocks server requests. The script reads the public page state and the visible option selectors, then sends the extracted product back here.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={copyScript} className="rounded-full bg-forest px-5 py-3 text-sm font-black text-white">Copy Browser Import Script</button><button type="button" onClick={openBrowserImport} disabled={!url.trim()} className="rounded-full border border-ink/10 px-5 py-3 text-sm font-black disabled:opacity-50">Open Jumia Product</button>{browserPayload&&<button type="button" onClick={createBrowser} disabled={busy} className="rounded-full bg-clay px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busy?"Saving…":"Import / Refresh Product"}</button>}</div></div>}
    {duplicate&&<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm"><span className="font-black">Existing product detected.</span> Browser import refreshes the existing record instead of creating a duplicate.</div>}
    {preview&&<div className="space-y-5 rounded-3xl border border-ink/10 p-5"><div><p className="text-xs font-black uppercase tracking-[.2em] text-clay">Preview</p><h2 className="mt-1 text-2xl font-black">{preview.title}</h2><p className="mt-1 text-sm text-ink/60">{preview.sourcePrice} {preview.currency} · {preview.stockStatus}</p></div>{optionNames.length>0&&<div className="space-y-4"><div className="text-sm font-black">Detected options</div>{optionNames.map(name=><div key={name} className="rounded-2xl bg-sand/40 p-4"><div className="mb-2 text-sm font-black">{name}</div><div className="flex flex-wrap gap-2">{optionValues(name).map(value=><span key={value} className="rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-sm">{value}</span>)}</div></div>)}</div>}{variants.length>0&&<div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b"><tr><th className="px-3 py-3 font-black">Variant</th><th className="px-3 py-3 font-black">SKU</th><th className="px-3 py-3 font-black">Price</th><th className="px-3 py-3 font-black">Stock</th></tr></thead><tbody>{variants.slice(0,100).map((v,i)=><tr key={`${i}-${v.sku||"variant"}`} className="border-b last:border-0"><td className="px-3 py-3"><div className="flex flex-wrap gap-1.5">{Object.entries(v.options||{}).map(([k,val])=><span key={k} className="rounded-full bg-sand px-2.5 py-1 text-xs font-bold">{k}: {val}</span>)}</div></td><td className="px-3 py-3 text-xs text-ink/60">{v.sku||"—"}</td><td className="px-3 py-3">{v.price??preview.sourcePrice} {preview.currency}</td><td className="px-3 py-3">{v.stockStatus||"unknown"}</td></tr>)}</tbody></table></div>}{!browserMode&&<div className="flex flex-wrap gap-3"><button type="button" onClick={()=>request("create")} disabled={busy||!!duplicate} className="rounded-full bg-forest px-6 py-3 font-black text-white disabled:opacity-50">Import as Draft</button><button type="button" onClick={()=>{setBrowserMode(true);setNotice("Use Browser Import if the server did not expose all supplier options.")}} className="rounded-full border border-ink/10 px-6 py-3 font-black">Use Browser Import</button></div>}</div>}
  </section>;
}
