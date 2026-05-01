export const FEATURES = {
  agencies: false,
  trips: false,
  rentals: false,
  activities: true,
  marketplace: true,
  camping: true,
  travelPartners: true
} as const;

export type FeatureKey = keyof typeof FEATURES;

const FEATURE_PATH_PREFIXES: Record<FeatureKey, string[]> = {
  agencies: ["/agencies"],
  trips: ["/trips"],
  rentals: ["/rentals"],
  activities: ["/activities"],
  marketplace: ["/marketplace"],
  camping: ["/camping"],
  travelPartners: ["/travel-partners"]
};

export function isFeatureEnabled(feature: FeatureKey) {
  return FEATURES[feature];
}

export function getFeatureForPublicPath(path: string): FeatureKey | null {
  const normalizedPath = path.split("?")[0];

  for (const [feature, prefixes] of Object.entries(FEATURE_PATH_PREFIXES) as [FeatureKey, string[]][]) {
    if (prefixes.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))) {
      return feature;
    }
  }

  return null;
}

export function isPublicPathEnabled(path: string) {
  const feature = getFeatureForPublicPath(path);
  return feature ? FEATURES[feature] : true;
}
