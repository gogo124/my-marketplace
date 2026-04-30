import Link from "next/link";
import { ReactNode } from "react";
import { SiteLocale, formatLocaleDateTime, resolveLocale, withLocale } from "@/lib/i18n";

type MetricCard = {
  label: string;
  value: ReactNode;
  note?: string;
  href?: string;
  tone?: "forest" | "clay" | "amber" | "slate";
};

type ActionCard = {
  href: string;
  label: string;
  note?: string;
};

type DashboardHeroProps = {
  kicker?: string;
  title: string;
  body?: string;
  locale?: SiteLocale;
  actions?: ActionCard[];
  chips?: string[];
};

const toneClasses = {
  forest: "border-forest/10 bg-forest/10 text-forest",
  clay: "border-[#f97316]/10 bg-[#f97316]/10 text-[#c2410c]",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  slate: "border-slate-200 bg-slate-50 text-slate-700"
} as const;

export function DashboardHero({ kicker, title, body, locale = "ar", actions = [], chips = [] }: DashboardHeroProps) {
  const safeLocale = resolveLocale(locale);

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-forest/10 bg-[linear-gradient(135deg,#0f3d2e_0%,#123b30_55%,#173e31_100%)] px-6 py-7 text-white shadow-[0_18px_50px_rgba(15,61,46,0.18)] sm:px-8 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="relative z-10 flex flex-col gap-6">
        <div className="space-y-4">
          {kicker ? (
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/60">
              {kicker}
            </p>
          ) : null}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
            {body ? <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{body}</p> : null}
          </div>
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span key={chip} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur">
                {chip}
              </span>
            ))}
          </div>
        ) : null}

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={withLocale(action.href, safeLocale)}
                className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f3d2e] shadow-card transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function DashboardMetricGrid({ cards, locale = "ar" }: { cards: MetricCard[]; locale?: SiteLocale }) {
  const safeLocale = resolveLocale(locale);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const content = (
          <div className="flex h-full flex-col rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,61,46,0.12)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <span className={`inline-flex h-3 w-3 rounded-full border ${toneClasses[card.tone || "slate"]}`}>
              <span className="sr-only">{card.label}</span>
            </span>
          </div>
            <p className="mt-3 text-3xl font-black leading-none text-slate-900">{card.value}</p>
            {card.note ? <p className="mt-3 text-sm leading-6 text-slate-500">{card.note}</p> : null}
          </div>
        );

        return card.href ? (
          <Link key={card.label} href={withLocale(card.href, safeLocale)} className="block">
            {content}
          </Link>
        ) : (
          <div key={card.label}>{content}</div>
        );
      })}
    </section>
  );
}

export function DashboardSection({
  title,
  body,
  actions,
  children
}: {
  title: string;
  body?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2.25rem] bg-white p-5 shadow-[0_12px_34px_rgba(15,61,46,0.08)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          {body ? <p className="max-w-2xl text-sm leading-7 text-slate-500">{body}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DashboardQuickLinks({ items, locale = "ar" }: { items: ActionCard[]; locale?: SiteLocale }) {
  const safeLocale = resolveLocale(locale);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={withLocale(item.href, safeLocale)}
          className="group rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,61,46,0.12)]"
        >
          <p className="text-lg font-black text-slate-900">{item.label}</p>
          {item.note ? <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p> : null}
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0f3d2e] transition group-hover:translate-x-1">
            {safeLocale === "ar" ? "فتح" : "Open"}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      ))}
    </section>
  );
}

export function DashboardEmptyState({
  title,
  body,
  href,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  locale = "ar"
}: {
  title: string;
  body: string;
  href?: string;
  ctaLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  locale?: SiteLocale;
}) {
  const safeLocale = resolveLocale(locale);

  return (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <div className="h-3 w-3 rounded-full bg-[#f97316]" />
      </div>
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{body}</p>
      {(href && ctaLabel) || (secondaryHref && secondaryLabel) ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {href && ctaLabel ? (
            <Link href={withLocale(href, safeLocale)} className="rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white shadow-card">
              {ctaLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link href={withLocale(secondaryHref, safeLocale)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function formatDashboardDate(value: string | Date | null | undefined, locale: SiteLocale) {
  if (!value) {
    return "-";
  }

  return formatLocaleDateTime(value, locale);
}
