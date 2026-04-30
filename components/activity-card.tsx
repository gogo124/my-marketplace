"use client";

import Link from "next/link";
import { LightboxImage } from "@/components/lightbox-image";
import { formatPrice } from "@/lib/utils";
import { resolveLocale, SiteLocale, withLocale } from "@/lib/i18n";

export function ActivityCard({ activity, locale = "ar" }: { activity: any; locale?: SiteLocale }) {
  const safeLocale = resolveLocale(locale);
  const isArabic = safeLocale === "ar";
  const images = Array.isArray(activity.images) && activity.images.length > 0 ? activity.images : [];
  const image = images[0] || "/images/hero-main.jpg";
  const providerProfile = activity.provider?.activityProviderProfile || {};

  return (
    <article className="overflow-hidden rounded-[1.9rem] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,61,46,0.08)]">
      <div className="relative h-60">
        <LightboxImage
          src={image}
          alt={activity.title || "Activity"}
          images={images.length > 0 ? images : [image]}
          wrapperClassName="relative block h-full w-full overflow-hidden"
          imageClassName="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">{activity.category}</span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e]">{activity.city}</span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">{activity.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{providerProfile.businessName || activity.provider?.name || "Moroccan Trip"}</p>
          </div>
          <div className="rounded-[1rem] bg-[#fff7ed] px-4 py-3 text-right">
            <p className="text-lg font-black text-[#c2410c]">{formatPrice(Number(activity.price || 0), safeLocale)}</p>
            <p className="text-xs text-slate-500">{activity.priceType === "total" ? (isArabic ? "السعر الإجمالي" : "Total") : isArabic ? "لكل شخص" : "Per person"}</p>
          </div>
        </div>
        <p className="line-clamp-3 text-sm leading-7 text-slate-600">{activity.description}</p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          {activity.duration ? <span className="rounded-full bg-slate-50 px-3 py-1">{activity.duration}</span> : null}
          {activity.guideIncluded ? <span className="rounded-full bg-slate-50 px-3 py-1">{isArabic ? "مرشد متوفر" : "Guide included"}</span> : null}
          {activity.equipmentIncluded ? <span className="rounded-full bg-slate-50 px-3 py-1">{isArabic ? "المعدات متوفرة" : "Equipment included"}</span> : null}
        </div>
        <Link href={withLocale(`/activities/${activity._id}`, safeLocale)} className="inline-flex rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">
          {isArabic ? "عرض النشاط" : "View activity"}
        </Link>
      </div>
    </article>
  );
}
