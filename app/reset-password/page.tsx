import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/reset-password-form";
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
    title: locale === "ar" ? "إعادة تعيين كلمة المرور" : "Reinitialiser le mot de passe",
    description:
      locale === "ar"
        ? "حدّث كلمة المرور الخاصة بك عبر رابط آمن مؤقت."
        : "Mettez a jour votre mot de passe via un lien securise temporaire.",
    path: "/reset-password"
  });
}

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; token?: string }>;
}) {
  const { lang, token } = await searchParams;
  const locale = resolveLocale(lang);

  return (
    <main dir={getDirection(locale)} className="page-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="image-surface relative overflow-hidden rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <div className="space-y-5">
          <p className="section-kicker">{locale === "ar" ? "رابط آمن" : "Lien securise"}</p>
          <h1 className="text-5xl font-black leading-[1.08]">
            {locale === "ar" ? "اختر كلمة مرور جديدة" : "Choisissez un nouveau mot de passe"}
          </h1>
          <p className="max-w-lg leading-8 text-white/75">
            {locale === "ar"
              ? "هذا الرابط صالح لفترة قصيرة ويُلغى مباشرة بعد الاستخدام."
              : "Ce lien reste valide peu de temps et devient inutilisable apres la reinitialisation."}
          </p>
        </div>
      </section>
      <ResetPasswordForm token={String(token || "")} locale={locale} />
    </main>
  );
}
