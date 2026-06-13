import type { Metadata } from "next";
import Image from "next/image";
import { ContactPageForm } from "@/components/contact-page-form";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

const CONTACT_PHONE = "+212 520-601660";
const CONTACT_WHATSAPP = "+212 775-203348";
const INSTAGRAM_NAME = "@moroccan__trip.net13";
const INSTAGRAM_URL = "https://www.instagram.com/moroccan__trip.net13?igsh=bjF3OTh6Mjg5MWNo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  return buildPageMetadata({ title: locale === "ar" ? "اتصل بنا" : "Contact Moroccan Trip", description: locale === "ar" ? "تواصل مع Moroccan Trip للدعم والشراكات والتعاون التجاري والأفلييت." : "Contact Moroccan Trip for support, partnerships, affiliate collaborations and business inquiries.", path: "/contact" });
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const ar = locale === "ar";
  const supportEmail = process.env.EMAIL_FROM?.trim() || "";
  const whatsappDigits = CONTACT_WHATSAPP.replace(/\D/g, "");
  const phoneDigits = CONTACT_PHONE.replace(/\D/g, "");
  const topics = [
    { title: ar ? "تواصل معنا" : "Contact Us", body: ar ? "أسئلة عامة، دعم، ومساعدة في استخدام المنصة." : "General questions, platform support and help finding the right experience." },
    { title: ar ? "طلبات الشراكة" : "Partnership Requests", body: ar ? "انضم إلى شبكة شركائنا في السفر والطبيعة." : "Join our growing network of trusted travel and outdoor partners." },
    { title: ar ? "تعاون الأفلييت" : "Affiliate Collaborations", body: ar ? "اعرض منتجات وخدمات مناسبة لمجتمعنا الخارجي." : "Introduce relevant products and services to our outdoor community." },
    { title: ar ? "استفسارات الأعمال" : "Business Inquiries", body: ar ? "للتعاون التجاري والحملات والفرص المهنية." : "For commercial collaborations, campaigns and professional opportunities." }
  ];

  return (
    <main dir={getDirection(locale)} className="page-shell max-w-[1440px] space-y-14 pb-24 sm:space-y-20">
      <section className="relative min-h-[560px] overflow-hidden rounded-[2.5rem] bg-[#0f3d2e] shadow-[0_35px_100px_rgba(15,61,46,.28)] sm:rounded-[3rem]"><Image src="/images/travel-partner.jpg" alt="Contact Moroccan Trip" fill priority sizes="100vw" className="object-cover object-center" /><div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(2,18,13,.97),rgba(15,61,46,.82)_58%,rgba(249,115,22,.25))]" /><div className="relative flex min-h-[560px] items-end px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16"><div className="max-w-4xl text-white"><p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.28em] backdrop-blur">{ar ? "تواصل معنا" : "Contact Moroccan Trip"}</p><h1 className="mt-6 text-4xl font-black leading-[1.03] tracking-[-.04em] sm:text-6xl lg:text-7xl">{ar ? "لنصنع تجربة خارجية أفضل معاً" : "Let us build better outdoor experiences together"}</h1><p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">{ar ? "للدعم أو الشراكات أو تعاون الأفلييت أو استفسارات الأعمال، اختر القناة المناسبة وسنتواصل معك." : "For support, partnerships, affiliate collaborations or business inquiries, choose the channel that works best for you."}</p><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex rounded-full bg-[#f97316] px-7 py-4 text-sm font-black text-white shadow-[0_18px_40px_rgba(249,115,22,.3)] hover:-translate-y-0.5 hover:bg-white hover:text-[#0f3d2e]">Instagram · {INSTAGRAM_NAME}</a></div></div></section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{topics.map((topic, index) => <article key={topic.title} className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_22px_60px_rgba(15,61,46,.1)] transition hover:-translate-y-1 sm:p-7"><span className="text-xs font-black text-[#f97316]">0{index + 1}</span><h2 className="mt-4 text-xl font-black text-slate-950 sm:text-2xl">{topic.title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{topic.body}</p></article>)}</section>

      <section className="grid gap-7 xl:grid-cols-[1.15fr_.85fr] xl:items-start"><ContactPageForm locale={locale} supportEmail={supportEmail} /><div className="space-y-6"><section className="rounded-[2.5rem] bg-[#0f3d2e] p-6 text-white shadow-[0_30px_85px_rgba(15,61,46,.2)] sm:p-8"><p className="text-xs font-black uppercase tracking-[.25em] text-orange-300">{ar ? "قنوات التواصل" : "Contact channels"}</p><h2 className="mt-4 text-3xl font-black tracking-[-.03em]">{ar ? "اختر الطريقة المناسبة لك" : "Choose the channel that suits you"}</h2><div className="mt-7 grid gap-3"><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="rounded-[1.5rem] bg-[#f97316] px-5 py-4 font-bold text-white transition hover:bg-white hover:text-[#0f3d2e]">Instagram: {INSTAGRAM_NAME}</a><a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="rounded-[1.5rem] bg-white px-5 py-4 font-bold text-[#0f3d2e] transition hover:-translate-y-0.5">WhatsApp: {CONTACT_WHATSAPP}</a><a href={`tel:${phoneDigits}`} className="rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-4 font-bold text-white">{ar ? "اتصال" : "Phone"}: {CONTACT_PHONE}</a>{supportEmail ? <a href={`mailto:${supportEmail}`} className="rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-4 font-bold text-white">Email: {supportEmail}</a> : null}</div></section><section className="relative min-h-[300px] overflow-hidden rounded-[2.5rem] shadow-[0_25px_70px_rgba(15,61,46,.16)]"><Image src="/images/activities.jpg" alt="Outdoor activities in Morocco" fill sizes="(max-width: 1280px) 100vw, 40vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#071b14]/90 via-[#071b14]/30 to-transparent" /><div className="absolute bottom-0 p-7 text-white"><p className="text-2xl font-black">{ar ? "فكرة أو شراكة جديدة؟" : "Have an idea or partnership in mind?"}</p><p className="mt-3 text-sm leading-7 text-white/75">{ar ? "أرسل لنا التفاصيل وسنوجه طلبك إلى الفريق المناسب." : "Share the details and we will route your request to the right team."}</p></div></section></div></section>
    </main>
  );
}
