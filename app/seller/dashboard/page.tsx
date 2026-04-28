import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  DashboardEmptyState,
  DashboardHero,
  DashboardMetricGrid,
  DashboardQuickLinks,
  DashboardSection
} from "@/components/dashboard/dashboard-primitives";
import { StatusBadge } from "@/components/status-badge";
import { getAuthSession } from "@/lib/auth";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { getSellerDashboardData } from "@/lib/seller-dashboard";

export default async function SellerDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const dashboard = await getSellerDashboardData(session.user.id);
  const isArabic = locale === "ar";

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <DashboardHero
        kicker={isArabic ? "مساحة البائع" : "Seller workspace"}
        title={isArabic ? "لوحة البائع" : "Seller dashboard"}
        body={
          isArabic
            ? "راقب الإعلانات والطلبات والرسائل الواردة من المشترين من مكان واحد."
            : "Track your listings, buyer requests, and incoming messages from one place."
        }
        locale={locale}
        chips={[
          `${dashboard.stats.listingsCount} ${isArabic ? "إعلان" : "listings"}`,
          `${dashboard.stats.leadCount} ${isArabic ? "طلب شراء" : "buyer leads"}`,
          `${dashboard.stats.conversationCount} ${isArabic ? "محادثة" : "conversations"}`
        ]}
        actions={[
          { href: "/listings/new", label: isArabic ? "إضافة منتج" : "Add product" },
          { href: "/messages", label: isArabic ? "الرسائل" : "Messages" }
        ]}
      />

      <DashboardMetricGrid
        locale={locale}
        cards={[
          {
            label: isArabic ? "إعلاناتي" : "My listings",
            value: dashboard.stats.listingsCount,
            note: isArabic ? "كل المنتجات المنشورة" : "All published products",
            href: "/listings/new",
            tone: "forest"
          },
          {
            label: isArabic ? "النشطة" : "Active",
            value: dashboard.stats.activeListingsCount,
            note: isArabic ? "قابلة للعرض والطلب" : "Visible and requestable",
            href: "/listings/new",
            tone: "clay"
          },
          {
            label: isArabic ? "المؤرشفة" : "Archived",
            value: dashboard.stats.inactiveListingsCount,
            note: isArabic ? "مخزنة أو متوقفة" : "Paused or archived items",
            href: "/listings/new",
            tone: "amber"
          },
          {
            label: isArabic ? "طلبات المشترين" : "Buyer leads",
            value: dashboard.stats.leadCount,
            note: isArabic ? "طلبات الاتصال والمراسلة" : "Contact and chat requests",
            href: "/messages",
            tone: "slate"
          }
        ]}
      />

      <DashboardQuickLinks
        locale={locale}
        items={[
          { href: "/listings/new", label: isArabic ? "إضافة منتج" : "Add product", note: isArabic ? "أنشئ إعلاناً جديداً" : "Publish a new listing" },
          { href: "/messages", label: isArabic ? "رسائل المشترين" : "Buyer messages", note: isArabic ? "رد سريع على الاستفسارات" : "Reply to requests quickly" },
          { href: "/dashboard", label: isArabic ? "ملخصي" : "My overview", note: isArabic ? "نظرة سريعة على الأداء" : "Quick performance summary" }
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection
          title={isArabic ? "إعلانات البيع" : "Sale listings"}
          body={
            isArabic
              ? "بطاقات مختصرة تعرض الصورة والسعر والحالة والطلبات."
              : "Compact cards with image, price, status, and buyer interest."
          }
        >
          {dashboard.listings.length > 0 ? (
            <div className="grid gap-4">
              {dashboard.listings.slice(0, 6).map((listing: any) => {
                const image = listing.images?.[0] || "/images/buy-gear.jpg";
                const status = listing.status === "active" ? "active" : "inactive";

                return (
                  <article key={listing._id} className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:bg-slate-50 sm:flex-row">
                    <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-slate-100 sm:w-28 sm:flex-none">
                      <Image src={image} alt={listing.title} fill sizes="112px" className="object-cover object-center" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,61,46,0.24)_100%)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-bold text-slate-900">{listing.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {listing.location} • {listing.category}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#f97316]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#c2410c]">
                            {listing.price} DH
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                              status === "active" ? "bg-forest/10 text-forest" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {status === "active" ? (isArabic ? "نشط" : "Active") : isArabic ? "مؤرشف" : "Archived"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                          {isArabic ? "طلبات" : "Leads"}: {dashboard.leads.filter((lead: any) => String(lead.listingId?._id || lead.listingId) === String(listing._id)).length}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={withLocale(`/listings/${listing._id}`, locale)} className="rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white shadow-card">
                          {isArabic ? "عرض" : "View"}
                        </Link>
                        <Link href={withLocale("/listings/new", locale)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                          {isArabic ? "إضافة أخرى" : "Add another"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <DashboardEmptyState
              title={isArabic ? "لا توجد إعلانات بعد" : "No listings yet"}
              body={isArabic ? "ابدأ بنشر أول منتج للوصول إلى المشترين." : "Publish your first product to start getting buyer attention."}
              href="/listings/new"
              ctaLabel={isArabic ? "إضافة منتج" : "Add product"}
              locale={locale}
            />
          )}
        </DashboardSection>

        <DashboardSection
          title={isArabic ? "طلبات المشترين" : "Buyer requests"}
          body={isArabic ? "مؤشرات الاتصال والرسائل المرتبطة بإعلاناتك." : "Buyer interest and conversations around your listings."}
        >
          <div className="grid gap-3">
            {dashboard.leads.length > 0 ? (
              dashboard.leads.slice(0, 6).map((lead: any) => (
                <article key={lead._id} className="rounded-[1.5rem] border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{lead.listingId?.title || (isArabic ? "طلب" : "Lead")}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {lead.type} • {lead.buyerId?.name || lead.buyerId?.email || (isArabic ? "مشتري" : "Buyer")}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {lead.status || "new"}
                      </p>
                    </div>
                    <StatusBadge kind="lead" status={lead.status} locale={locale} />
                  </div>
                </article>
              ))
            ) : (
              <DashboardEmptyState
                title={isArabic ? "لا توجد طلبات بعد" : "No leads yet"}
                body={isArabic ? "عندما يبدأ المشترون بالتواصل ستظهر هنا." : "Buyer contact requests will appear here."}
                href="/listings/new"
                ctaLabel={isArabic ? "إضافة منتج" : "Add product"}
                locale={locale}
              />
            )}
          </div>
        </DashboardSection>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <DashboardSection
          title={isArabic ? "الرسائل الأخيرة" : "Latest messages"}
          body={isArabic ? "آخر المحادثات الواردة من العملاء." : "Latest conversations with buyers."}
        >
          {dashboard.recentMessages.length > 0 ? (
            <div className="grid gap-3">
              {dashboard.recentMessages.slice(0, 6).map((message: any) => (
                <Link
                  key={message._id}
                  href={withLocale(`/messages/${message.conversation?._id}`, locale)}
                  className="rounded-[1.5rem] border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{message.conversation?.listing?.title || (isArabic ? "محادثة" : "Conversation")}</p>
                      <p className="mt-1 text-sm text-slate-500">{message.sender?.name || message.sender?.email || (isArabic ? "مستخدم" : "User")}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{message.body}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              title={isArabic ? "لا توجد رسائل بعد" : "No messages yet"}
              body={isArabic ? "ستظهر هنا رسائل المشترين المرتبطة بإعلاناتك." : "Buyer conversations linked to your listings will appear here."}
              href="/messages"
              ctaLabel={isArabic ? "فتح الرسائل" : "Open messages"}
              locale={locale}
            />
          )}
        </DashboardSection>

        <DashboardSection
          title={isArabic ? "ملخص الأداء" : "Performance summary"}
          body={isArabic ? "مؤشرات سريعة حول نشاطك." : "A quick snapshot of your activity."}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-100 p-4">
              <p className="text-sm text-slate-500">{isArabic ? "المؤكد" : "Verified seller"}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{dashboard.stats.verifiedSellerCount ? "Yes" : "No"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-100 p-4">
              <p className="text-sm text-slate-500">{isArabic ? "المحادثات" : "Conversations"}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{dashboard.stats.conversationCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-100 p-4">
              <p className="text-sm text-slate-500">{isArabic ? "طلبات جديدة" : "New leads"}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{dashboard.stats.newLeadCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-100 p-4">
              <p className="text-sm text-slate-500">{isArabic ? "المؤرشفة" : "Archived"}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{dashboard.stats.inactiveListingsCount}</p>
            </div>
          </div>
        </DashboardSection>
      </section>
    </div>
  );
}
