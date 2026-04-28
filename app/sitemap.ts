import type { MetadataRoute } from "next";
import { getAgencyProfiles } from "@/lib/agency";
import { getPlaces } from "@/lib/camping";
import { getListings } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/trips", changeFrequency: "daily", priority: 0.95 },
  { path: "/agencies", changeFrequency: "daily", priority: 0.95 },
  { path: "/rentals", changeFrequency: "daily", priority: 0.9 },
  { path: "/travel-partners", changeFrequency: "weekly", priority: 0.8 },
  { path: "/camping", changeFrequency: "daily", priority: 0.9 }
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [agencies, places, listings] = await Promise.all([
    getAgencyProfiles({ limit: 200 }),
    getPlaces({ limit: 200 }),
    getListings({ limit: 200 })
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));

  const agencyEntries: MetadataRoute.Sitemap = (agencies || []).map((agency: any) => ({
    url: absoluteUrl(`/agencies/${agency._id}`),
    lastModified: agency.updatedAt || agency.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7
  }));

  const placeEntries: MetadataRoute.Sitemap = (places || []).map((place: any) => ({
    url: absoluteUrl(`/camping/${place._id}`),
    lastModified: place.updatedAt || place.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7
  }));

  const listingEntries: MetadataRoute.Sitemap = (listings || []).map((listing: any) => ({
    url: absoluteUrl(`/listings/${listing._id}`),
    lastModified: listing.updatedAt || listing.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticEntries, ...agencyEntries, ...placeEntries, ...listingEntries];
}
