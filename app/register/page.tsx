import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title: locale === "ar" ? "إنشاء حساب" : "Creer un compte",
    description:
      locale === "ar"
        ? "أنشئ حسابك لبدء استكشاف الرحلات، التواصل مع الوكالات، ونشر الإعلانات أو الرحلات."
        : "Creez votre compte pour explorer les voyages, contacter les agences et publier vos annonces ou trajets.",
    path: "/register"
  });
}

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; callbackUrl?: string }>;
}) {
  const { lang, callbackUrl } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const loginHref = callbackUrl
    ? withLocale(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, locale)
    : withLocale("/login", locale);

  return (
    <main dir={getDirection(locale)} className="page-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="image-surface relative overflow-hidden rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="space-y-5">
          <p className="section-kicker">{copy.registerHeroKicker}</p>
          <h1 className="text-5xl font-black leading-[1.08]">{copy.registerHeroTitle}</h1>
          <p className="max-w-lg leading-8 text-white/75">{copy.registerHeroBody}</p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-white/85">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">{locale === "ar" ? "بدء سريع" : "Demarrage rapide"}</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">{locale === "ar" ? "بدون تعقيد" : "Sans friction"}</span>
          </div>
          <Link href={loginHref} className="inline-flex rounded-full border border-white/20 px-5 py-3 font-semibold text-white">
            {copy.alreadyRegistered}
          </Link>
        </div>
      </section>
      <AuthForm mode="register" />
    </main>
  );
}
