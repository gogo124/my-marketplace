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
    title:
      locale === "ar"
        ? `رحلات منظمة في المغرب${cityLabel}`
        : locale === "fr"
          ? `Voyages organisés au Maroc${cityLabel}`
          : `Organized trips in Morocco${cityLabel}`,
    description:
      locale === "ar"
        ? "تصفح الرحلات المنظمة في المغرب، وقارن البرامج والوكالات والمقاعد المتاحة قبل الحجز."
        : locale === "fr"
          ? "Parcourez les voyages organisés au Maroc, comparez les programmes, agences et places disponibles."
          : "Browse organized trips in Morocco and compare itineraries, agencies and available seats before booking.",
    path: "/trips",
    image: "/images/agencies.jpg",
    locale,
    indexable: FEATURES.trips
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
