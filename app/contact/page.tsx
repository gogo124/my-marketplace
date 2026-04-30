import type { Metadata } from "next";
import Link from "next/link";
import { ContactPageForm } from "@/components/contact-page-form";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

const CONTACT_PHONE = "+212 520-601660";
const CONTACT_WHATSAPP = "+212 775-203348";
const FACEBOOK_URL = "https://www.facebook.com/share/1FnAYQyAFw/";
const INSTAGRAM_URL = "https://www.instagram.com/moroccan____trip?igsh=MTZjaHJ1dml2cnBxbQ==";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title: locale === "ar" ? "اتصل بنا" : "Contact",
    description:
      locale === "ar"
        ? "تواصل مع Moroccan Trip للدعم، طلبات البائعين والوكالات والكراء والشراكات."
        : "Contactez Moroccan Trip pour le support, les demandes vendeurs, agences, location et partenariats.",
    path: "/contact"
  });
}

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const supportEmail = process.env.EMAIL_FROM?.trim() || "";
  const whatsappDigits = CONTACT_WHATSAPP.replace(/\D/g, "");
  const phoneDigits = CONTACT_PHONE.replace(/\D/g, "");

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="section-kicker">{isArabic ? "تواصل" : "Contact"}</p>
        <h1 className="text-5xl font-black leading-[1.08]">{isArabic ? "نحن هنا للمساعدة" : "Nous sommes disponibles pour vous aider"}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-8 text-white/80 sm:text-base">
          {isArabic
            ? "تواصل مع فريق Moroccan Trip للدعم، الشراكات، طلبات البيع، الوكالات، أو مشاكل الاستخدام."
            : "Contactez l'equipe Moroccan Trip pour le support, les partenariats, les demandes vendeurs, agences ou les problemes d'utilisation."}
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ContactPageForm locale={locale} supportEmail={supportEmail} />

        <div className="space-y-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-slate-900">{isArabic ? "قنوات التواصل" : "Canaux de contact"}</h2>
            <div className="mt-5 grid gap-3">
              <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="rounded-[1.5rem] bg-forest px-5 py-4 font-semibold text-white">
                WhatsApp: {CONTACT_WHATSAPP}
              </a>
              <a href={`tel:${phoneDigits}`} className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900">
                {isArabic ? "اتصال" : "Appel"}: {CONTACT_PHONE}
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900">
                Facebook
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900">
                Instagram
              </a>
              {supportEmail ? (
                <a href={`mailto:${supportEmail}`} className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900">
                  Email: {supportEmail}
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-slate-900">{isArabic ? "متى تستخدم هذه الصفحة؟" : "Quand utiliser cette page"}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {isArabic
                ? "للدعم، طلبات البائعين، الوكالات، مزودي الكراء، الشراكات أو الإبلاغ عن مشكلة واضحة داخل المنصة."
                : "Pour le support, les demandes vendeurs, agences, loueurs, partenariats ou le signalement d'un probleme clair dans la plateforme."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
