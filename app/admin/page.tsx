import Link from "next/link";
import { getAffiliateProductsForAdmin } from "@/lib/affiliate-products";
import { getActivitiesForAdmin } from "@/lib/activity";
import { getPlacesForAdmin } from "@/lib/camping";
import { getAdminPageSession, getAdminUsers } from "@/lib/admin";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams; const locale = resolveLocale(lang); await getAdminPageSession();
  const [products, users, activities, places] = await Promise.all([getAffiliateProductsForAdmin(), getAdminUsers(), getActivitiesForAdmin(), getPlacesForAdmin()]);
  const published = products.filter((product: any) => product.status === "published").length;
  const mostViewedCamping = [...places].sort((a: any, b: any) => Number(b.viewCount || 0) - Number(a.viewCount || 0)).slice(0, 5);
  const mostClickedCamping = [...places].sort((a: any, b: any) => Number(b.clickCount || 0) - Number(a.clickCount || 0)).slice(0, 5);
  const campingViews = places.reduce((sum: number, place: any) => sum + Number(place.viewCount || 0), 0);
  const campingClicks = places.reduce((sum: number, place: any) => sum + Number(place.clickCount || 0), 0);
  const productViews = products.reduce((sum: number, product: any) => sum + Number(product.viewCount || 0), 0);
  const productClicks = products.reduce((sum: number, product: any) => sum + Number(product.clickCount || 0), 0);
  const mostViewed = [...products].sort((a: any, b: any) => Number(b.viewCount || 0) - Number(a.viewCount || 0)).slice(0, 5);
  const mostClicked = [...products].sort((a: any, b: any) => Number(b.clickCount || 0) - Number(a.clickCount || 0)).slice(0, 5);
  const activityViews = activities.reduce((sum: number, activity: any) => sum + Number(activity.viewCount || 0), 0);
  const activityClicks = activities.reduce((sum: number, activity: any) => sum + Number(activity.bookClickCount || 0), 0);
  const cards = [
    { label: "Camping views", value: campingViews, href: "/admin/places" },
    { label: "Visit Now clicks", value: campingClicks, href: "/admin/places" },
    { label: locale === "ar" ? "مشاهدات المنتجات" : "Product views", value: productViews, href: "/admin/affiliate-products" },
    { label: locale === "ar" ? "نقرات الشراء" : "Buy Now clicks", value: productClicks, href: "/admin/affiliate-products" },
    { label: locale === "ar" ? "مشاهدات الأنشطة" : "Activity views", value: activityViews, href: "/admin/activities" },
    { label: locale === "ar" ? "نقرات احجز الآن" : "Book Now clicks", value: activityClicks, href: "/admin/activities" },
    { label: locale === "ar" ? "كل منتجات الأفلييت" : "Affiliate products", value: products.length, href: "/admin/affiliate-products" },
    { label: locale === "ar" ? "المنتجات المنشورة" : "Published products", value: published, href: "/admin/affiliate-products" },
    { label: locale === "ar" ? "المسودات" : "Draft products", value: products.length - published, href: "/admin/affiliate-products" },
    { label: locale === "ar" ? "المستخدمون" : "Users", value: users.length, href: "/admin/users" }
  ];
  return <div dir={getDirection(locale)} className="space-y-8"><section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card"><p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">Affiliate Marketplace</p><h1 className="mt-3 text-4xl font-black">{locale === "ar" ? "إدارة متجر الأفلييت" : "Affiliate marketplace control"}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{locale === "ar" ? "أضف المنتجات وعدّلها وانشرها من مكان واحد. لا توجد مبيعات أو طلبات داخلية." : "Add, edit, publish, and remove affiliate products from one place. There are no internal sales or orders."}</p><Link href={withLocale("/admin/affiliate-products", locale)} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-bold text-forest">{locale === "ar" ? "إدارة المنتجات" : "Manage products"}</Link></section><section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <Link key={card.label} href={withLocale(card.href, locale)} className="rounded-[2rem] bg-white p-6 shadow-card transition hover:-translate-y-1"><p className="text-sm text-ink/60">{card.label}</p><p className="mt-3 text-4xl font-black text-forest">{card.value}</p></Link>)}</section><section className="grid gap-5 lg:grid-cols-2"><div className="rounded-[2rem] bg-white p-6 shadow-card"><h2 className="text-2xl font-black">Most viewed camping places</h2><div className="mt-4 space-y-3">{mostViewedCamping.map((place: any) => <div key={place._id} className="flex justify-between rounded-xl bg-sand/40 p-3"><span className="font-bold">{place.name}</span><strong>{place.viewCount || 0}</strong></div>)}</div></div><div className="rounded-[2rem] bg-white p-6 shadow-card"><h2 className="text-2xl font-black">Most clicked camping places</h2><div className="mt-4 space-y-3">{mostClickedCamping.map((place: any) => <div key={place._id} className="flex justify-between rounded-xl bg-sand/40 p-3"><span className="font-bold">{place.name}</span><strong>{place.clickCount || 0}</strong></div>)}</div></div></section><section className="grid gap-5 lg:grid-cols-2"><div className="rounded-[2rem] bg-white p-6 shadow-card"><h2 className="text-2xl font-black">Most viewed products</h2><div className="mt-4 space-y-3">{mostViewed.map((product: any) => <div key={product._id} className="flex justify-between rounded-xl bg-sand/40 p-3"><span className="font-bold">{product.title}</span><strong>{product.viewCount || 0}</strong></div>)}</div></div><div className="rounded-[2rem] bg-white p-6 shadow-card"><h2 className="text-2xl font-black">Most clicked products</h2><div className="mt-4 space-y-3">{mostClicked.map((product: any) => <div key={product._id} className="flex justify-between rounded-xl bg-sand/40 p-3"><span className="font-bold">{product.title}</span><strong>{product.clickCount || 0}</strong></div>)}</div></div></section><section className="rounded-[2rem] bg-white p-6 shadow-card"><h2 className="text-2xl font-black text-ink">{locale === "ar" ? "تدفق العمل" : "Publishing workflow"}</h2><p className="mt-3 text-sm leading-7 text-ink/60">{locale === "ar" ? "أنشئ المنتج كمسودة، راجع الصورة والرابط والوصف، ثم غيّر حالته إلى منشور ليظهر في المتجر." : "Create a product as a draft, review its image, link, and description, then publish it to make it visible in the marketplace."}</p></section></div>;
}
