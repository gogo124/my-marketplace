import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIATOR_CAMPAIGN = "moroccantrip";
const DESTINATIONS_URL = "https://api.sandbox.viator.com/partner/destinations";

function getViatorConfig() {
  const isProduction = process.env.VERCEL_ENV === "production";
  const apiKey = isProduction
    ? process.env.VIATOR_PRODUCTION_API_KEY
    : process.env.VIATOR_SANDBOX_API_KEY;
  const baseUrl = isProduction
    ? "https://api.viator.com/partner"
    : "https://api.sandbox.viator.com/partner";
  return { apiKey, baseUrl };
}

function imageUrl(product: any): string {
  const images = Array.isArray(product?.images) ? product.images : [];
  const cover = images.find((image: any) => image?.isCover) || images[0];
  const variants = Array.isArray(cover?.variants) ? cover.variants : [];
  const preferred = variants.find((item: any) => Number(item?.width) >= 400) || variants[0];
  const value = preferred?.url || cover?.url || "";
  return typeof value === "string" && value.startsWith("https://") ? value : "";
}

function affiliateUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "viator.com" || url.hostname.endsWith(".viator.com"))
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

export async function GET(request: NextRequest) {
  const destinationName = (request.nextUrl.searchParams.get("destination") || "Marrakech").trim();
  const allowedDestinations = ["Marrakech", "Agadir", "Casablanca", "Fes", "Fez", "Tangier", "Essaouira", "Chefchaouen", "Rabat", "Ouarzazate"];
  const selected = allowedDestinations.find((name) => name.toLowerCase() === destinationName.toLowerCase());
  if (!selected) {
    return NextResponse.json({ error: "Choose a supported Moroccan destination." }, { status: 400 });
  }

  const { apiKey, baseUrl } = getViatorConfig();
  if (!apiKey) {
    return NextResponse.json({ error: "Viator API is not configured for this environment." }, { status: 503 });
  }

  const headers = {
    "exp-api-key": apiKey,
    Accept: "application/json;version=2.0",
    "Accept-Language": "en",
  };

  try {
    const destinationsResponse = await fetch(`${baseUrl}/destinations`, {
      headers,
      next: { revalidate: 86400 },
    });
    if (!destinationsResponse.ok) {
      return NextResponse.json({ error: "Viator destinations could not be loaded." }, { status: 502 });
    }
    const destinationsData = await destinationsResponse.json();
    const destinations = Array.isArray(destinationsData?.destinations) ? destinationsData.destinations : [];
    const normalized = selected.toLowerCase();
    const destination = destinations.find((item: any) => String(item?.name || "").toLowerCase() === normalized)
      || (normalized === "fez" ? destinations.find((item: any) => String(item?.name || "").toLowerCase() === "fes") : null);

    if (!destination?.destinationId) {
      return NextResponse.json({ error: `Viator does not currently return a destination ID for ${selected}.` }, { status: 404 });
    }

    const searchUrl = new URL(`${baseUrl}/products/search`);
    searchUrl.searchParams.set("campaign-value", VIATOR_CAMPAIGN);
    const productsResponse = await fetch(searchUrl, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json;version=2.0" },
      body: JSON.stringify({
        filtering: {
          destination: String(destination.destinationId),
          includeAutomaticTranslations: true,
        },
        sorting: { sort: "DEFAULT", order: "DESCENDING" },
        pagination: { start: 1, count: 12 },
        currency: "USD",
      }),
      next: { revalidate: 3600 },
    });

    if (!productsResponse.ok) {
      const status = productsResponse.status;
      return NextResponse.json(
        { error: status === 401 || status === 403 ? "Viator rejected this API key or its access level." : "Viator product search is temporarily unavailable." },
        { status: status === 429 ? 429 : 502 },
      );
    }

    const data = await productsResponse.json();
    const products = (Array.isArray(data?.products) ? data.products : []).map((product: any) => ({
      code: String(product?.productCode || ""),
      title: String(product?.title || "Viator experience"),
      image: imageUrl(product),
      price: Number(product?.pricing?.summary?.fromPrice || 0),
      currency: String(product?.pricing?.currency || "USD"),
      rating: Number(product?.reviews?.combinedAverageRating || 0),
      reviewCount: Number(product?.reviews?.totalReviews || 0),
      duration: Number(product?.duration?.fixedDurationInMinutes || 0),
      bookingUrl: affiliateUrl(product?.productUrl),
    })).filter((product: any) => product.code && product.bookingUrl);

    return NextResponse.json(
      { destination: selected, totalCount: Number(data?.totalCount || products.length), products },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json({ error: "Could not connect to Viator. Please try again shortly." }, { status: 502 });
  }
}
