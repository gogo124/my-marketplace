import type { Metadata } from "next";
import { FeatureDisabledPage } from "@/components/feature-disabled-page";
import AgenciesPage from "@/app/agencies/page";
import { FEATURES } from "@/lib/features";
import { buildPageMetadata } from "@/lib/seo";
import { resolveLocale } from "@/lib/i18n";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; city?: string }>;
}): Promise<Metadata> {
  const { lang, city = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const cityLabel = city ? ` - ${city}` : "";

  return buildPageMetadata({
    title: locale === "ar" ? `التريبات المنظمة${cityLabel}` : `Trips organises${cityLabel}`,
    description:
      locale === "ar"
        ? "تصفح التريبات المنظمة، قارن الوكالات والمقاعد المتاحة، ثم انتقل إلى الحجز بسرعة."
        : "Browse organised trips, compare agencies and open seats, then move quickly to reservation.",
    path: "/trips",
    image: "/images/agencies.jpg"
  });
}

export default async function TripsPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string; destination?: string; verified?: string; rating?: string; sort?: string }>;
}) {
  if (!FEATURES.trips) {
    const params = await searchParams;
    const locale = resolveLocale(params.lang);
    return <FeatureDisabledPage locale={locale} feature="trips" />;
  }

  return AgenciesPage({ searchParams } as any);
}
