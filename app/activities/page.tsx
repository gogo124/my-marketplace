import type { Metadata } from "next";
import { ActivityCard } from "@/components/activity-card";
import { getPublicActivities } from "@/lib/activity";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title: locale === "ar" ? "الأنشطة | Moroccan Trip" : "Activities | Moroccan Trip",
    description:
      locale === "ar"
        ? "اكتشف أنشطة ومغامرات في المغرب من مزودين نشطين داخل Moroccan Trip."
        : "Discover adventure activities in Morocco from active providers on Moroccan Trip.",
    path: "/activities",
    image: "/images/hero-main.jpg"
  });
}

export default async function ActivitiesPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string; category?: string }>;
}) {
  const { lang, q = "", city = "", category = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const result = await getPublicActivities({ q, city, category, page: 1, pageSize: 24 });

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{isArabic ? "أنشطة ومغامرات" : "Activities & adventures"}</p>
        <h1 className="mt-4 text-4xl font-black">{isArabic ? "اكتشف الأنشطة والمغامرات في المغرب" : "Discover activities and adventures in Morocco"}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
          {isArabic
            ? "Quad، Jet Ski، Hiking، Surf وغيرها من الأنشطة العلنية بمعلومات أوضح وتواصل مباشر."
            : "Quad, Jet Ski, Hiking, Surf, and more public activities with clearer information and direct contact."}
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-card">
        <form action="/activities" className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <input type="hidden" name="lang" value={locale} />
          <input name="q" defaultValue={q} placeholder={isArabic ? "ابحث عن نشاط" : "Search activities"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <input name="city" defaultValue={city} placeholder={isArabic ? "المدينة" : "City"} className="rounded-[1.25rem] border border-ink/10 px-4 py-3" />
          <select name="category" defaultValue={category} className="rounded-[1.25rem] border border-ink/10 px-4 py-3">
            <option value="">{isArabic ? "كل الفئات" : "All categories"}</option>
            {["Quad", "Skydiving", "Jet Ski", "Surf", "Hiking", "Horse Riding", "Other"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button className="rounded-[1.25rem] bg-forest px-5 py-3 font-semibold text-white">{isArabic ? "بحث" : "Search"}</button>
        </form>
      </section>

      {result.activities.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {result.activities.map((activity: any) => <ActivityCard key={activity._id} activity={activity} locale={locale} />)}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-8 text-sm text-ink/60 shadow-card">
          {isArabic ? "لا توجد أنشطة مطابقة حالياً." : "No matching activities right now."}
        </section>
      )}
    </main>
  );
}
