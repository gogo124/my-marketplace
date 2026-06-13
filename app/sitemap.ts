import type { MetadataRoute } from "next";
import { getAgencyProfiles } from "@/lib/agency";
import { getPublishedActivities } from "@/lib/activity";
import { getPublishedAffiliateProducts } from "@/lib/affiliate-products";
import { getPlaces } from "@/lib/camping";
import { absoluteUrl } from "@/lib/seo";
const STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1 }, { path: "/marketplace", changeFrequency: "daily", priority: 0.95 },
  { path: "/trips", changeFrequency: "daily", priority: 0.95 }, { path: "/agencies", changeFrequency: "daily", priority: 0.95 },
  { path: "/rentals", changeFrequency: "daily", priority: 0.9 }, { path: "/travel-partners", changeFrequency: "weekly", priority: 0.8 },
  { path: "/camping", changeFrequency: "daily", priority: 0.9 }, { path: "/activities", changeFrequency: "daily", priority: 0.9 }
] as const;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const [agencies, places, activities, products] = await Promise.all([getAgencyProfiles({ limit: 200 }), getPlaces({ limit: 200 }), getPublishedActivities(), getPublishedAffiliateProducts()]); const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({ url: absoluteUrl(route.path), lastModified: new Date(), changeFrequency: route.changeFrequency, priority: route.priority })); const agencyEntries: MetadataRoute.Sitemap = agencies.map((agency: any) => ({ url: absoluteUrl(`/agencies/${agency._id}`), lastModified: agency.updatedAt || agency.createdAt || new Date(), changeFrequency: "weekly", priority: 0.7 })); const placeEntries: MetadataRoute.Sitemap = places.map((place: any) => ({ url: absoluteUrl(`/camping/${place.slug || place._id}`), lastModified: place.updatedAt || place.createdAt || new Date(), changeFrequency: "weekly", priority: place.featured ? 0.85 : 0.7 })); const activityEntries: MetadataRoute.Sitemap = activities.map((activity: any) => ({ url: absoluteUrl(`/activities/${activity.slug || activity._id}`), lastModified: activity.updatedAt || activity.createdAt || new Date(), changeFrequency: "weekly", priority: activity.featured ? 0.85 : 0.7 })); const productEntries: MetadataRoute.Sitemap = products.map((product: any) => ({ url: absoluteUrl(`/marketplace/${product.slug || product._id}`), lastModified: product.updatedAt || product.createdAt || new Date(), changeFrequency: "weekly", priority: product.featured ? 0.9 : 0.75 })); return [...staticEntries, ...agencyEntries, ...placeEntries, ...activityEntries, ...productEntries]; }
