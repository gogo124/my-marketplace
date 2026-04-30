import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityContactActions } from "@/components/activity-contact-actions";
import { ActivityReservationForm } from "@/components/activity-reservation-form";
import { LightboxImage } from "@/components/lightbox-image";
import { getAuthSession } from "@/lib/auth";
import { getActivityById } from "@/lib/activity";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const activity = await getActivityById(id);

  if (!activity) {
    return buildPageMetadata({
      title: locale === "ar" ? "النشاط غير موجود" : "Activity not found",
      description: locale === "ar" ? "تعذر العثور على هذا النشاط." : "This activity could not be found.",
      path: `/activities/${id}`,
      image: "/images/hero-main.jpg"
    });
  }

  return buildPageMetadata({
    title: `${activity.title} | Moroccan Trip`,
    description: activity.description,
    path: `/activities/${id}`,
    image: activity.images?.[0] || "/images/hero-main.jpg"
  });
}

export default async function ActivityDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const [activity, session] = await Promise.all([getActivityById(id), getAuthSession()]);

  if (!activity) {
    notFound();
  }

  const images = Array.isArray(activity.images) && activity.images.length > 0 ? activity.images : [];
  const heroImage = images[0] || "/images/hero-main.jpg";
  const provider = activity.provider as any;
  const providerProfile = provider?.activityProviderProfile || {};
  const whatsappDigits = String(activity.whatsapp || providerProfile.whatsapp || "").replace(/\D/g, "");
  const phoneDigits = String(activity.phone || providerProfile.phone || "").replace(/\D/g, "");

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="overflow-hidden rounded-[2.75rem] bg-white shadow-card">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="relative min-h-[360px]">
            <LightboxImage
              src={heroImage}
              alt={activity.title}
              images={images.length > 0 ? images : [heroImage]}
              wrapperClassName="relative block h-full min-h-[360px] w-full overflow-hidden"
              imageClassName="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
          <div className="space-y-5 p-6 lg:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-clay">{activity.category}</span>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-slate-700">{activity.city}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900">{activity.title}</h1>
            <p className="text-sm text-slate-500">{activity.location || activity.city}</p>
            <div className="rounded-[1.5rem] bg-[#fff7ed] px-5 py-4">
              <p className="text-3xl font-black text-[#c2410c]">{formatPrice(Number(activity.price || 0), locale)}</p>
              <p className="text-sm text-slate-600">{activity.priceType === "total" ? (isArabic ? "السعر الإجمالي" : "Total price") : isArabic ? "لكل شخص" : "Per person"}</p>
            </div>
            <p className="text-sm leading-7 text-slate-600">{activity.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="#reserve" className="rounded-full bg-forest px-5 py-3 font-semibold text-white">{isArabic ? "احجز الآن" : "Reserve now"}</Link>
              <ActivityContactActions
                activityId={activity._id}
                providerUserId={String(provider?._id || "")}
                activityTitle={activity.title}
                whatsappDigits={whatsappDigits}
                phoneDigits={phoneDigits}
                isSignedIn={Boolean(session?.user)}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{isArabic ? "المعرض" : "Gallery"}</h2>
            {images.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((image, index) => (
                  <LightboxImage
                    key={`${image}-${index}`}
                    src={image}
                    alt={activity.title}
                    images={images}
                    index={index}
                    wrapperClassName="relative block h-52 overflow-hidden rounded-[1.5rem]"
                    imageClassName="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex h-52 items-center justify-center rounded-[1.5rem] bg-slate-100 text-sm text-slate-500">
                    {isArabic ? "صورة النشاط" : "Activity image"}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.75rem] bg-white p-5 shadow-card"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isArabic ? "المدة" : "Duration"}</p><p className="mt-2 font-bold text-slate-900">{activity.duration || "-"}</p></div>
            <div className="rounded-[1.75rem] bg-white p-5 shadow-card"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isArabic ? "الأشخاص" : "People"}</p><p className="mt-2 font-bold text-slate-900">{activity.maxPeople || "-"}</p></div>
            <div className="rounded-[1.75rem] bg-white p-5 shadow-card"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isArabic ? "الموقع" : "Location"}</p><p className="mt-2 font-bold text-slate-900">{activity.location || activity.city}</p></div>
            <div className="rounded-[1.75rem] bg-white p-5 shadow-card"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isArabic ? "المعدات" : "Equipment"}</p><p className="mt-2 font-bold text-slate-900">{activity.equipmentIncluded ? (isArabic ? "متوفرة" : "Included") : isArabic ? "غير متوفرة" : "Not included"}</p></div>
            <div className="rounded-[1.75rem] bg-white p-5 shadow-card"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isArabic ? "المرشد" : "Guide"}</p><p className="mt-2 font-bold text-slate-900">{activity.guideIncluded ? (isArabic ? "متوفر" : "Included") : isArabic ? "غير متوفر" : "Not included"}</p></div>
            <div className="rounded-[1.75rem] bg-white p-5 shadow-card"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isArabic ? "الأيام المتاحة" : "Available days"}</p><p className="mt-2 font-bold text-slate-900">{activity.availableDays || "-"}</p></div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{isArabic ? "الوصف" : "Description"}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-ink/70">{activity.description}</p>
            {activity.cancellationPolicy ? (
              <div className="mt-5 rounded-[1.5rem] bg-sand/40 p-4">
                <p className="font-semibold text-ink">{isArabic ? "سياسة الإلغاء" : "Cancellation policy"}</p>
                <p className="mt-2 text-sm leading-7 text-ink/70">{activity.cancellationPolicy}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{isArabic ? "الثقة والتنظيم" : "Trust and support"}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-700">{isArabic ? "تواصل مباشر مع مزود النشاط" : "Direct contact with the provider"}</div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-700">{isArabic ? "استجابة أسرع عبر واتساب والطلب" : "Fast follow-up through WhatsApp and requests"}</div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-700">{isArabic ? "Moroccan Trip يساعد في تنظيم الطلب" : "Moroccan Trip helps organize the request"}</div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-700">{isArabic ? "خطوات واضحة بدون تعقيد" : "Clear steps without friction"}</div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div id="reserve">
            <ActivityReservationForm
              activityId={activity._id}
              providerUserId={String(provider?._id || "")}
              activityTitle={activity.title}
              isSignedIn={Boolean(session?.user)}
            />
          </div>
          <section className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{isArabic ? "معلومات المزود" : "Provider info"}</h2>
            <p className="mt-4 text-lg font-bold text-slate-900">{providerProfile.businessName || provider?.name || "Moroccan Trip"}</p>
            <p className="mt-2 text-sm text-slate-600">{providerProfile.city || activity.city}</p>
            <div className="mt-4">
              <ActivityContactActions
                activityId={activity._id}
                providerUserId={String(provider?._id || "")}
                activityTitle={activity.title}
                whatsappDigits={whatsappDigits}
                phoneDigits={phoneDigits}
                isSignedIn={Boolean(session?.user)}
                locale={locale}
              />
            </div>
            {(providerProfile.instagram || providerProfile.facebook) ? (
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {providerProfile.instagram ? <a href={providerProfile.instagram} target="_blank" rel="noreferrer" className="text-forest">Instagram</a> : null}
                {providerProfile.facebook ? <a href={providerProfile.facebook} target="_blank" rel="noreferrer" className="text-forest">Facebook</a> : null}
              </div>
            ) : null}
          </section>
          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap gap-3">
              <Link href="#reserve" className="rounded-full bg-forest px-5 py-3 font-semibold text-white">{isArabic ? "احجز الآن" : "Reserve now"}</Link>
              <ActivityContactActions
                activityId={activity._id}
                providerUserId={String(provider?._id || "")}
                activityTitle={activity.title}
                whatsappDigits={whatsappDigits}
                phoneDigits=""
                isSignedIn={Boolean(session?.user)}
                locale={locale}
              />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
