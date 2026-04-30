import type { Metadata } from "next";
import Link from "next/link";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title: locale === "ar" ? "من نحن" : "A propos",
    description:
      locale === "ar"
        ? "تعرف على Moroccan Trip وخدمات الرحلات المنظمة والوكالات والكراء والسوق وأماكن التخييم."
        : "Decouvrez Moroccan Trip et ses services: voyages organises, agences, location, marketplace et camping.",
    path: "/about"
  });
}

export default async function AboutPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const sections = [
    isArabic ? "رحلات منظمة مع الوكالات" : "Voyages organises avec les agences",
    isArabic ? "سوق لمعدات التخييم والسفر" : "Marketplace pour equipements camping et voyage",
    isArabic ? "كراء معدات مرتبطة بالرحلات" : "Location d'equipement liee aux voyages",
    isArabic ? "شركاء السفر والتواصل المباشر" : "Partenaires de voyage et contact direct",
    isArabic ? "أماكن التخييم واكتشاف الوجهات" : "Spots camping et decouverte des destinations"
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="section-kicker">{isArabic ? "Moroccan Trip" : "Moroccan Trip"}</p>
        <h1 className="text-5xl font-black leading-[1.08]">{isArabic ? "نبسط السفر داخل المغرب" : "Simplifier le voyage au Maroc"}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-8 text-white/80 sm:text-base">
          {isArabic
            ? "Moroccan Trip منصة تجمع الرحلات المنظمة، الوكالات، السوق، الكراء، شركاء السفر، وأماكن التخييم داخل تجربة واحدة تساعد المسافر على التخطيط والتواصل والحجز بشكل أوضح."
            : "Moroccan Trip rassemble voyages organises, agences, marketplace, location, partenaires de voyage et lieux de camping dans une experience unique pour faciliter la preparation et le contact."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <article key={section} className="rounded-[2rem] bg-white p-6 shadow-card">
            <p className="text-lg font-black text-slate-900">{section}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2.25rem] bg-white p-6 shadow-card">
        <h2 className="text-2xl font-black text-slate-900">{isArabic ? "ما الذي نقدمه؟" : "Ce que la plateforme propose"}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-100 p-5">
            <p className="text-lg font-black text-slate-900">{isArabic ? "المسافر" : "Voyageur"}</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {isArabic
                ? "يستكشف الوكالات والرحلات، يرسل الحجوزات، يستعمل trip code ويفتح مساحة التريب، ويجد معدات أو شركاء سفر عند الحاجة."
                : "Il explore les agences et voyages, envoie des reservations, utilise le trip code, ouvre son Trip Space et trouve du materiel ou des partenaires selon son besoin."}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-100 p-5">
            <p className="text-lg font-black text-slate-900">{isArabic ? "المنصة" : "La plateforme"}</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {isArabic
                ? "الهدف هو جعل السفر داخل المغرب أسهل: اكتشاف واضح، تواصل مباشر، وحجز أو طلب من نفس المسار."
                : "L'objectif est de rendre le voyage au Maroc plus simple avec une decouverte claire, un contact direct et des demandes ou reservations dans le meme parcours."}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={withLocale("/agencies", locale)} className="rounded-full bg-forest px-5 py-3 font-semibold text-white">
            {isArabic ? "تصفح الوكالات" : "Voir les agences"}
          </Link>
          <Link href={withLocale("/contact", locale)} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900">
            {isArabic ? "تواصل معنا" : "Nous contacter"}
          </Link>
        </div>
      </section>
    </main>
  );
}
