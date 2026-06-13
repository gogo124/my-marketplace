import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export default async function UserDashboardPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams; const locale = resolveLocale(lang); const session = await getAuthSession(); if (!session?.user?.id) redirect(withLocale("/login", locale)); const isArabic = locale === "ar";
  const links = [
    { href: "/marketplace", title: isArabic ? "متجر الأفلييت" : "Affiliate Marketplace", body: isArabic ? "تصفح المنتجات المختارة وانتقل إلى متاجر الشركاء." : "Browse curated products and continue to partner stores." },
    { href: "/travel-partners", title: isArabic ? "رفقاء السفر" : "Travel Partners", body: isArabic ? "اكتشف مجتمع المسافرين." : "Discover the traveler community." },
    { href: "/camping", title: isArabic ? "أماكن التخييم" : "Camping", body: isArabic ? "استكشف أماكن التخييم." : "Explore camping destinations." },
    { href: "/activities", title: isArabic ? "الأنشطة" : "Activities", body: isArabic ? "اكتشف الأنشطة المتاحة." : "Discover available activities." }
  ];
  return <main dir={getDirection(locale)} className="page-shell space-y-8"><section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card"><p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">Moroccan Trip</p><h1 className="mt-3 text-4xl font-black">{isArabic ? `مرحباً ${session.user.name || ""}` : `Welcome ${session.user.name || ""}`}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{isArabic ? "اكتشف المنتجات والتجارب من مكان واحد." : "Discover products and experiences from one place."}</p></section><section className="grid gap-5 md:grid-cols-2">{links.map((link) => <Link key={link.href} href={withLocale(link.href, locale)} className="rounded-[2rem] bg-white p-6 shadow-card transition hover:-translate-y-1"><h2 className="text-2xl font-black text-ink">{link.title}</h2><p className="mt-3 text-sm leading-7 text-ink/60">{link.body}</p><span className="mt-5 inline-flex rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">{isArabic ? "فتح" : "Open"}</span></Link>)}</section></main>;
}
