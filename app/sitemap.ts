import type { MetadataRoute } from "next";
import { getAgencyProfiles } from "@/lib/agency";
import { getPublishedActivities } from "@/lib/activity";
import { getPlaces } from "@/lib/camping";
import { getPublishedAffiliateWidgets } from "@/lib/affiliate-widgets";
import { getPublishedDestinations } from "@/lib/destinations";
import { FEATURES } from "@/lib/features";
import { getPublishedResellingProducts } from "@/lib/reselling-marketplace";
import { absoluteUrl } from "@/lib/seo";

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/marketplace", changeFrequency: "daily", priority: 0.95 },
  { path: "/destinations", changeFrequency: "daily", priority: 0.95 },
  { path: "/travel-partners", changeFrequency: "weekly", priority: 0.8 },
  { path: "/camping", changeFrequency: "daily", priority: 0.9 },
  { path: "/activities", changeFrequency: "daily", priority: 0.9 },
  { path: "/agencies", changeFrequency: "weekly", priority: 0.7 },
  { path: "/trips", changeFrequency: "weekly", priority: 0.7 },
  { path: "/rentals", changeFrequency: "weekly", priority: 0.7 }
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [agencies, places, activities, products, destinations, campingWidgets, activityWidgets] = await Promise.all([
    FEATURES.agencies ? getAgencyProfiles({ limit: 200 }) : Promise.resolve([]),
    FEATURES.camping ? getPlaces({ limit: 200 }) : Promise.resolve([]),
    FEATURES.activities ? getPublishedActivities() : Promise.resolve([]),
    FEATURES.marketplace ? getPublishedResellingProducts() : Promise.resolve([]),
    getPublishedDestinations(),
    FEATURES.camping ? getPublishedAffiliateWidgets("camping") : Promise.resolve([]),
    FEATURES.activities ? getPublishedAffiliateWidgets("activities") : Promise.resolve([])
  ]);

  const includeStaticRoute = (path: string) => {
    if (path === "/") return true;
    if (path === "/destinations") return destinations.length > 0;
    if (path === "/travel-partners") return FEATURES.travelPartners;
    if (path === "/marketplace") return FEATURES.marketplace && products.length > 0;
    if (path === "/camping") return FEATURES.camping && (places.length > 0 || campingWidgets.length > 0);
    if (path === "/activities") return FEATURES.activities && (activities.length > 0 || activityWidgets.length > 0);
    if (path === "/agencies") return FEATURES.agencies && agencies.length > 0;
    if (path === "/trips") return FEATURES.trips && agencies.length > 0;
    if (path === "/rentals") return FEATURES.rentals;
    return false;
  };

  const staticEntries = STATIC_ROUTES
    .filter((route) => includeStaticRoute(route.path))
    .map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority
    }));

  const destinationEntries = destinations.map((item: any) => ({
    url: absoluteUrl(`/destinations/${item.slug}`),
    lastModified: item.updatedAt || item.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: item.featured ? 0.85 : 0.7
  }));

  const agencyEntries = agencies.map((agency: any) => ({
    url: absoluteUrl(`/agencies/${agency._id}`),
    lastModified: agency.updatedAt || agency.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  const placeEntries = places.map((place: any) => ({
    url: absoluteUrl(`/camping/${place.slug || place._id}`),
    lastModified: place.updatedAt || place.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: place.featured ? 0.85 : 0.7
  }));

  const activityEntries = activities.map((activity: any) => ({
    url: absoluteUrl(`/activities/${activity.slug || activity._id}`),
    lastModified: activity.updatedAt || activity.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: activity.featured ? 0.85 : 0.7
  }));

  const productEntries = products.map((product: any) => ({
    url: absoluteUrl(`/marketplace/${product.slug || product._id}`),
    lastModified: product.updatedAt || product.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: product.featured ? 0.9 : 0.75
  }));

  return [...staticEntries, ...destinationEntries, ...agencyEntries, ...placeEntries, ...activityEntries, ...productEntries];
}
