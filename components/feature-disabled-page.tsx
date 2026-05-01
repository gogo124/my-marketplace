import Link from "next/link";
import { type FeatureKey } from "@/lib/features";
import { getDirection, SiteLocale, withLocale } from "@/lib/i18n";

const featureLabels: Record<FeatureKey, { ar: string; fr: string; en: string }> = {
  agencies: { ar: "وكالات السفر", fr: "Agences", en: "Agencies" },
  trips: { ar: "الرحلات", fr: "Voyages", en: "Trips" },
  rentals: { ar: "الكراء", fr: "Location", en: "Rentals" },
  activities: { ar: "الأنشطة", fr: "Activites", en: "Activities" },
  marketplace: { ar: "المتجر", fr: "Marketplace", en: "Marketplace" },
  camping: { ar: "أماكن التخييم", fr: "Camping", en: "Camping" },
  travelPartners: { ar: "رفيق السفر", fr: "Partenaires de voyage", en: "Travel partners" }
};

export function FeatureDisabledPage({
  locale,
  feature
}: {
  locale: SiteLocale;
  feature: FeatureKey;
}) {
  const isArabic = locale === "ar";
  const isEnglish = locale === "en";
  const label = featureLabels[feature][locale];

  return (
    <main dir={getDirection(locale)} className="page-shell">
      <section className="overflow-hidden rounded-[2.75rem] bg-[linear-gradient(135deg,#0f3d2e,#14532d_55%,#f97316)] p-6 text-white shadow-[0_24px_70px_rgba(15,61,46,0.22)] sm:p-8 lg:p-10">
        <div className="max-w-3xl space-y-5">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.26em] text-white/85">
            Moroccan Trip
          </span>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            {isArabic ? `${label} غادي ترجع قريباً بشكل أقوى` : isEnglish ? `${label} will return soon in a clearer version` : `${label} revient bientot dans une version plus claire`}
          </h1>
          <p className="text-sm leading-8 text-white/85 sm:text-base">
            {isArabic
              ? "هاد القسم مخفي مؤقتاً بينما كنركزو على رفقاء السفر، أماكن التخييم، المتجر، والأنشطة الأكثر طلباً."
              : isEnglish
                ? "This section is temporarily hidden while we focus the platform on travel partners, camping, marketplace and activities."
                : "Cette section est temporairement masquee pendant que nous concentrons la plateforme sur les partenaires de voyage, le camping, le marketplace et les activites."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link href={withLocale("/travel-partners", locale)} className="rounded-full bg-white px-5 py-3 text-center font-semibold text-[#0f3d2e]">
              {isArabic ? "ابحث عن رفيق" : isEnglish ? "Find partner" : "Trouver un partenaire"}
            </Link>
            <Link href={withLocale("/camping", locale)} className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-center font-semibold text-white">
              {isArabic ? "اكتشف التخييم" : isEnglish ? "Explore camping" : "Explorer le camping"}
            </Link>
            <Link href={withLocale("/marketplace", locale)} className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-center font-semibold text-white">
              {isArabic ? "تصفح المعدات" : isEnglish ? "Browse gear" : "Parcourir l'equipement"}
            </Link>
            <Link href={withLocale("/activities", locale)} className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-center font-semibold text-white">
              {isArabic ? "شوف الأنشطة" : isEnglish ? "See activities" : "Voir les activites"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
