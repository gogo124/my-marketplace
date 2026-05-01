import type { Metadata } from "next";
import { ContactPageForm } from "@/components/contact-page-form";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

const CONTACT_PHONE = "+212 520-601660";
const CONTACT_WHATSAPP = "+212 775-203348";

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
        ? "تواصل مع Moroccan Trip للمساعدة، الشراكات، والاستفسارات حول السفر والتخييم والأنشطة والمعدات."
        : "Contact Moroccan Trip for support, partnerships and questions about travel, camping, activities and gear.",
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
        <h1 className="text-5xl font-black leading-[1.08]">{isArabic ? "نحن هنا للمساعدة" : "We are here to help"}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-8 text-white/80 sm:text-base">
          {isArabic
            ? "نساعدك على التواصل، السفر، واستكشاف المغرب. واتساب، الهاتف، الإيميل، أو الفورم كلها متاحة."
            : "We help you connect, travel, and explore Morocco through WhatsApp, phone, email or the contact form."}
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ContactPageForm locale={locale} supportEmail={supportEmail} />

        <div className="space-y-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-slate-900">{isArabic ? "قنوات التواصل" : "Contact channels"}</h2>
            <div className="mt-5 grid gap-3">
              <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="rounded-[1.5rem] bg-forest px-5 py-4 font-semibold text-white">
                WhatsApp: {CONTACT_WHATSAPP}
              </a>
              <a href={`tel:${phoneDigits}`} className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900">
                {isArabic ? "اتصال" : "Phone"}: {CONTACT_PHONE}
              </a>
              {supportEmail ? (
                <a href={`mailto:${supportEmail}`} className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900">
                  Email: {supportEmail}
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-slate-900">{isArabic ? "كيف نساعدك؟" : "How we help"}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {isArabic
                ? "We help you connect, travel, and explore Morocco. استعمل هاد الصفحة للدعم، الشراكات، أو أي سؤال متعلق بالتخييم والأنشطة والمعدات."
                : "We help you connect, travel, and explore Morocco. Use this page for support, partnerships or questions about camping, activities and gear."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
