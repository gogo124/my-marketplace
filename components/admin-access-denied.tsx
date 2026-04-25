import Link from "next/link";
import { resolveLocale, SiteLocale, siteCopy, withLocale } from "@/lib/i18n";

export function AdminAccessDenied({ locale = "ar" }: { locale?: SiteLocale }) {
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];

  return (
    <main className="page-shell">
      <section className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm uppercase tracking-[0.25em] text-red-600">{copy.adminRestricted}</p>
        <h1 className="mt-3 text-3xl font-black text-ink">{copy.accessDenied}</h1>
        <p className="mt-4 text-sm leading-7 text-ink/65">
          {copy.adminOnlyMessage}
        </p>
        <Link href={withLocale("/", safeLocale)} className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 font-semibold text-white">
          {copy.backHome}
        </Link>
      </section>
    </main>
  );
}
