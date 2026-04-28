import Link from "next/link";
import { SiteLocale, withLocale } from "@/lib/i18n";

type WorkspaceAccessStateProps = {
  locale: SiteLocale;
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function WorkspaceAccessState({
  locale,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}: WorkspaceAccessStateProps) {
  return (
    <section className="page-shell">
      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">
          {locale === "ar" ? "الوصول للمساحة" : "Acces a l'espace"}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{body}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {primaryHref && primaryLabel ? (
            <Link
              href={withLocale(primaryHref, locale)}
              className="inline-flex items-center justify-center rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white"
            >
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link
              href={withLocale(secondaryHref, locale)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
