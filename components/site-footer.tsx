import Link from "next/link";
import { getDirection, resolveLocale, withLocale, type SiteLocale } from "@/lib/i18n";

const labels: Record<SiteLocale, { guide: string; explore: string; about: string; contact: string; disclaimer: string; rights: string; }> = {
  ar: { guide: "دليل المغرب للسفر والتجربة", explore: "اكتشف الوجهات، التخييم والأنشطة والمعدات في مكان واحد.", about: "من نحن", contact: "تواصل معنا", disclaimer: "روابط الحجز والشراء الخارجية تابعة لجهات شريكة؛ Moroccan Trip لا يعالج الحجوزات أو المدفوعات عبر هذه الروابط.", rights: "جميع الحقوق محفوظة." },
  fr: { guide: "Votre guide du Maroc", explore: "Découvrez destinations, camping, activités et équipements au même endroit.", about: "À propos", contact: "Contact", disclaimer: "Les liens externes de réservation et d’achat redirigent vers des partenaires. Moroccan Trip ne traite pas les réservations ni les paiements via ces liens.", rights: "Tous droits réservés." },
  en: { guide: "Your Morocco travel guide", explore: "Discover destinations, camping, activities and gear in one place.", about: "About", contact: "Contact", disclaimer: "External booking and shopping links redirect to partners. Moroccan Trip does not process reservations or payments through these links.", rights: "All rights reserved." }
};

export function SiteFooter({ lang }: { lang?: string }) {
  const locale = resolveLocale(lang);
  const copy = labels[locale];
  return (
    <footer dir={getDirection(locale)} className="mt-20 border-t border-emerald-950/10 bg-[#0b2b22] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_.8fr_.8fr] lg:py-16">
        <div>
          <Link href={withLocale("/", locale)} className="text-xl font-black tracking-tight">Moroccan Trip</Link>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">{copy.explore}</p>
          <p className="mt-5 max-w-2xl text-xs leading-6 text-white/50">{copy.disclaimer}</p>
        </div>
        <nav aria-label={locale === "ar" ? "روابط الاستكشاف" : "Explore"} className="flex flex-col gap-3 text-sm">
          <Link className="text-white/75 hover:text-white" href={withLocale("/destinations", locale)}>{locale === "ar" ? "الوجهات" : locale === "fr" ? "Destinations" : "Destinations"}</Link>
          <Link className="text-white/75 hover:text-white" href={withLocale("/camping", locale)}>{locale === "ar" ? "التخييم" : "Camping"}</Link>
          <Link className="text-white/75 hover:text-white" href={withLocale("/activities", locale)}>{locale === "ar" ? "الأنشطة" : locale === "fr" ? "Activités" : "Activities"}</Link>
          <Link className="text-white/75 hover:text-white" href={withLocale("/marketplace", locale)}>{locale === "ar" ? "المتجر" : "Marketplace"}</Link>
        </nav>
        <nav aria-label={locale === "ar" ? "روابط الموقع" : "Site"} className="flex flex-col gap-3 text-sm">
          <Link className="text-white/75 hover:text-white" href={withLocale("/about", locale)}>{copy.about}</Link>
          <Link className="text-white/75 hover:text-white" href={withLocale("/contact", locale)}>{copy.contact}</Link>
          <Link className="text-white/75 hover:text-white" href={withLocale("/travel-partners", locale)}>{locale === "ar" ? "رفيق سفر" : locale === "fr" ? "Partenaire de voyage" : "Travel Partner"}</Link>
        </nav>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/45 sm:px-6">© {new Date().getFullYear()} Moroccan Trip · {copy.rights}</div>
    </footer>
  );
}
