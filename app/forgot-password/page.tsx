import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
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
    title: locale === "ar" ? "نسيت كلمة المرور" : "Mot de passe oublie",
    description:
      locale === "ar"
        ? "اطلب رابطاً مؤقتاً لإعادة تعيين كلمة المرور الخاصة بك."
        : "Demandez un lien temporaire pour reinitialiser votre mot de passe.",
    path: "/forgot-password"
  });
}

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return (
    <main dir={getDirection(locale)} className="page-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="image-surface relative overflow-hidden rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <div className="space-y-5">
          <p className="section-kicker">{locale === "ar" ? "استعادة الوصول" : "Recuperer l'acces"}</p>
          <h1 className="text-5xl font-black leading-[1.08]">
            {locale === "ar" ? "استرجع حسابك بأمان" : "Recuperez votre compte en securite"}
          </h1>
          <p className="max-w-lg leading-8 text-white/75">
            {locale === "ar"
              ? "نرسل رابطاً قصير المدة إلى بريدك الإلكتروني، ويمكن استخدامه مرة واحدة فقط."
              : "Nous envoyons un lien a duree limitee sur votre email, utilisable une seule fois."}
          </p>
        </div>
      </section>
      <ForgotPasswordForm locale={locale} />
    </main>
  );
}
