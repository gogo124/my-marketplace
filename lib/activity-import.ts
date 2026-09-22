type JsonLd = Record<string, unknown>;

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function stripHtml(value: string) {
  return clean(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'"));
}

function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>|<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, "i");
  const m = html.match(re);
  return clean(m?.[1] || m?.[2]);
}

function absolute(base: string, value: string) {
  try { return new URL(value, base).toString(); } catch { return ""; }
}

function jsonLdBlocks(html: string): JsonLd[] {
  const blocks: JsonLd[] = [];
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      const values = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of values) if (item && typeof item === "object") blocks.push(item as JsonLd);
    } catch { /* ignore malformed JSON-LD */ }
  }
  return blocks;
}

function firstString(...values: unknown[]) { return values.map(clean).find(Boolean) || ""; }

function jsonValue(item: JsonLd, key: string) {
  const value = item[key];
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "name" in value) return clean((value as { name?: unknown }).name);
  return "";
}

export async function importActivityFromUrl(sourceUrl: string) {
  const parsedUrl = new URL(sourceUrl);
  if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error("Only HTTP and HTTPS activity URLs are supported.");
  const host = parsedUrl.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.startsWith("10.") || host.startsWith("192.168.") || host === "169.254.169.254" || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) throw new Error("This activity URL is not allowed.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try { response = await fetch(parsedUrl, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MoroccanTrip Activity Importer/1.0)" }, redirect: "follow", signal: controller.signal, cache: "no-store" }); }
  catch (error) { throw new Error(error instanceof Error && error.name === "AbortError" ? "The source page took too long to respond." : "Could not read the source activity page."); }
  finally { clearTimeout(timer); }
  if (!response.ok) throw new Error(`The source page returned HTTP ${response.status}.`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) throw new Error("The source URL is not an HTML page.");
  const html = (await response.text()).slice(0, 5_000_000);
  const blocks = jsonLdBlocks(html);
  const product = blocks.find((item) => /Product|TouristTrip|Trip|Offer|Event/i.test(String(item["@type"] || ""))) || blocks[0] || {};
  const offer = (product.offers && typeof product.offers === "object" ? product.offers : {}) as JsonLd;
  const address = product.location && typeof product.location === "object" ? product.location as JsonLd : {};
  const title = firstString(jsonValue(product, "name"), meta(html, "og:title"), meta(html, "twitter:title"), (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""));
  const description = firstString(jsonValue(product, "description"), meta(html, "og:description"), meta(html, "description"));
  const location = firstString(jsonValue(address, "name"), jsonValue(address, "address"), jsonValue(product, "location"));
  const category = firstString(jsonValue(product, "category"), meta(html, "category"), meta(html, "keywords").split(",")[0]);
  const price = Number.parseFloat(firstString(jsonValue(offer, "price"), jsonValue(product, "price")));
  const currency = firstString(jsonValue(offer, "priceCurrency"), meta(html, "currency"), "MAD").toUpperCase();
  const duration = firstString(jsonValue(product, "duration"), meta(html, "duration"));
  const imageValues: string[] = [];
  const addImage = (value: unknown) => { if (typeof value === "string") imageValues.push(absolute(response.url || sourceUrl, value)); else if (Array.isArray(value)) value.forEach(addImage); else if (value && typeof value === "object" && "url" in value) addImage((value as { url?: unknown }).url); };
  addImage(product.image); addImage(meta(html, "og:image"));
  for (const m of html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi)) addImage(m[1]);
  const images = [...new Set(imageValues.filter(Boolean))].slice(0, 20);
  const bodyText = stripHtml(html);
  const fullDescription = description || bodyText.slice(0, 5000);
  const shortDescription = fullDescription.slice(0, 237) + (fullDescription.length > 237 ? "..." : "");
  const article = [title && `# ${title}`, fullDescription, location && `\n## Location\n${location}`, duration && `\n## Duration\n${duration}`].filter(Boolean).join("\n\n");
  return { sourceUrl, sourceFinalUrl: response.url || sourceUrl, title, description: fullDescription, shortDescription, article, category, location, duration, price: Number.isFinite(price) ? price : 0, currency: ["MAD", "EUR", "USD"].includes(currency) ? currency : "MAD", images, metaTitle: title, metaDescription: shortDescription };
}

function isSafeRemoteImageUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}

async function uploadRemoteImage(url: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary is not configured.");
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MoroccanTrip Activity Importer/1.0)" }, cache: "no-store" });
  if (!response.ok) throw new Error("Could not download an activity image.");
  const contentType = response.headers.get("content-type") || "image/jpeg";
  if (!contentType.toLowerCase().startsWith("image/")) throw new Error("Source image is not an image.");
  const blob = await response.blob();
  if (blob.size > 12 * 1024 * 1024) throw new Error("Source image is too large.");
  const formData = new FormData();
  formData.append("file", blob, "activity-import.jpg");
  formData.append("upload_preset", uploadPreset);
  const cloud = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
  const data = await cloud.json();
  if (!cloud.ok || typeof data?.secure_url !== "string") throw new Error("Cloudinary image upload failed.");
  return data.secure_url as string;
}

export async function importActivityFromBrowserPayload(payload: Record<string, unknown>) {
  const sourceUrl = clean(payload.sourceUrl);
  const title = clean(payload.title);
  const description = clean(payload.description);
  const shortDescription = clean(payload.shortDescription) || description.slice(0, 237);
  const images = Array.isArray(payload.images) ? Array.from(new Set(payload.images.filter(isSafeRemoteImageUrl))) : [];
  if (!sourceUrl || !/^https?:$/i.test(new URL(sourceUrl).protocol)) throw new Error("Invalid source activity URL.");
  if (!title) throw new Error("The browser extractor could not find an activity title.");
  if (!images.length) throw new Error("The browser extractor could not find public activity images.");
  const uploaded: string[] = [];
  for (const image of images.slice(0, 12)) {
    try { uploaded.push(await uploadRemoteImage(image as string)); } catch { /* keep importing if one image is blocked */ }
  }
  if (!uploaded.length) throw new Error("Could not upload the public activity images to Cloudinary.");
  const priceValue = Number(payload.price);
  const currency = ["MAD", "EUR", "USD"].includes(clean(payload.currency).toUpperCase()) ? clean(payload.currency).toUpperCase() : "MAD";
  return {
    sourceUrl,
    sourceFinalUrl: clean(payload.sourceFinalUrl) || sourceUrl,
    title,
    description: description.slice(0, 5000),
    shortDescription: shortDescription.slice(0, 240),
    article: clean(payload.article).slice(0, 5000) || description.slice(0, 5000),
    category: clean(payload.category) || "Activities",
    location: clean(payload.location),
    duration: clean(payload.duration),
    price: Number.isFinite(priceValue) && priceValue >= 0 ? priceValue : 0,
    currency,
    images: uploaded,
    metaTitle: title.slice(0, 160),
    metaDescription: (clean(payload.metaDescription) || shortDescription).slice(0, 320)
  };
}
