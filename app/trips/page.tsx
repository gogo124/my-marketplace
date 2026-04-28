import type { Metadata } from "next";
import AgenciesPage from "@/app/agencies/page";
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

export default function TripsPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string; destination?: string; verified?: string; rating?: string; sort?: string }>;
}) {
  return AgenciesPage({ searchParams } as any);
}
