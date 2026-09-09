import { isPublicPathEnabled } from "@/lib/features";

export type NavigationLink = { href: string; label: { ar: string; fr: string }; emphasize?: boolean };
type SessionLike = { user?: { id?: string | null; role?: "user" | "agency" | "renter" | "admin" | null } | null } | null;
const filter = (links: NavigationLink[]) => links.filter((link) => isPublicPathEnabled(link.href));

export function getNavigationForUser(session: SessionLike) {
  const user = session?.user;
  const role = user?.role || "user";
  const publicDiscovery = filter([
    { href: "/travel-partners", label: { ar: "رفيق السفر", fr: "Travel Partners" }, emphasize: true },
    { href: "/camping", label: { ar: "أماكن التخييم", fr: "Camping" } },
    { href: "/marketplace", label: { ar: "متجر الأفلييت", fr: "Affiliate Marketplace" } },
    { href: "/activities", label: { ar: "الأنشطة", fr: "Activities" } },
    { href: "/destinations", label: { ar: "الوجهات", fr: "Destinations" } },
    { href: "/about", label: { ar: "من نحن", fr: "About" } },
    { href: "/contact", label: { ar: "اتصل بنا", fr: "Contact" } }
  ]);
  if (!user?.id) return { primary: publicDiscovery, secondary: [] as NavigationLink[], utilities: [] as NavigationLink[] };
  if (role === "admin") return { primary: [
    { href: "/admin", label: { ar: "لوحة الإدارة", fr: "Admin Dashboard" }, emphasize: true },
    { href: "/admin/affiliate-products", label: { ar: "منتجات الأفلييت", fr: "Affiliate Products" } },
    { href: "/admin/users", label: { ar: "المستخدمون", fr: "Users" } },
    { href: "/admin/agencies", label: { ar: "الوكالات", fr: "Agencies" } },
    { href: "/admin/activities", label: { ar: "الأنشطة", fr: "Activities" } },
    { href: "/admin/reports", label: { ar: "التقارير", fr: "Reports" } }
  ], secondary: [{ href: "/dashboard", label: { ar: "لوحتي", fr: "My Dashboard" } }], utilities: [{ href: "/", label: { ar: "الرئيسية", fr: "Home" } }] };
  if (role === "agency") return { primary: [
    { href: "/agency/dashboard", label: { ar: "لوحة الوكالة", fr: "Agency Dashboard" }, emphasize: true },
    { href: "/agency/trips", label: { ar: "رحلاتي", fr: "My Trips" } },
  ], secondary: publicDiscovery, utilities: [] as NavigationLink[] };
  if (role === "renter") return { primary: [
    { href: "/renter/dashboard", label: { ar: "لوحة الكراء", fr: "Renter Dashboard" }, emphasize: true },
    { href: "/renter/items", label: { ar: "عناصر الكراء", fr: "Rental Items" } },
  ], secondary: publicDiscovery, utilities: [] as NavigationLink[] };
  return { primary: publicDiscovery, secondary: [{ href: "/dashboard", label: { ar: "لوحتي", fr: "My Dashboard" } }], utilities: [] as NavigationLink[] };
}
