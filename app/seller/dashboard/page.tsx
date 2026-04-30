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
import { AgencyStatusActions } from "@/components/agency-status-actions";
import { SellerAccessRequestForm } from "@/components/seller-access-request-form";
import { SellerLeadForm } from "@/components/seller-lead-form";
import { SellerStoreActions } from "@/components/seller-store-actions";
import { StatusBadge } from "@/components/status-badge";
import { getAuthSession } from "@/lib/auth";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { getSellerAccessSnapshot, getSellerStoreSlug } from "@/lib/seller";
import { getSellerDashboardData } from "@/lib/seller-dashboard";

export default async function SellerDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; source?: string; status?: string }>;
}) {
  const { lang, source = "", status = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const dashboard = await getSellerDashboardData(session.user.id);
  const isArabic = locale === "ar";
  const sellerAccess = dashboard.sellerAccess || getSellerAccessSnapshot(dashboard.seller);
  const storePath = withLocale(`/marketplace/seller/${getSellerStoreSlug(dashboard.seller || session.user)}`, locale);
  const externalOrders = dashboard.externalOrders.filter((lead: any) => {
    const sourceMatch = source ? String(lead.source || "") === source : true;
    const statusMatch = status ? String(lead.status || "") === status : true;
    return sourceMatch && statusMatch;
  });

  if (sellerAccess.status === "none") {
    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero
          kicker={isArabic ? "مساحة البائع" : "Seller workspace"}
          title={isArabic ? "تفعيل البيع مطلوب" : "Seller access required"}
          body={
            isArabic
              ? "هذا الحساب مازال ما تفعلش للبيع. عمر الطلب في الأسفل باش تراجعو الإدارة."
              : "This account is not activated for selling yet. Submit the request below so the admin can review it."
          }
          locale={locale}
          chips={[
            `${dashboard.stats.listingsCount} ${isArabic ? "إعلان محفوظ" : "saved listings"}`,
            `${dashboard.stats.leadCount} ${isArabic ? "طلبات" : "leads"}`
          ]}
          actions={[{ href: "/dashboard", label: isArabic ? "لوحتي" : "My dashboard" }]}
        />
        <SellerAccessRequestForm />
      </div>
    );
  }

  if (sellerAccess.isPending) {
    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero
          kicker={isArabic ? "مساحة البائع" : "Seller workspace"}
          title={isArabic ? "طلبك قيد المراجعة" : "Seller request pending"}
          body={
            isArabic
              ? "تم إرسال طلب البيع وهو الآن في انتظار موافقة الإدارة."
              : "Your seller access request has been sent and is waiting for admin approval."
          }
          locale={locale}
          chips={[
            `${dashboard.stats.listingsCount} ${isArabic ? "إعلانات محفوظة" : "saved listings"}`,
            `${dashboard.stats.leadCount} ${isArabic ? "طلبات" : "leads"}`
          ]}
          actions={[{ href: "/dashboard", label: isArabic ? "لوحتي" : "My dashboard" }]}
        />
      </div>
    );
  }

  if (sellerAccess.isRejected) {
    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero
          kicker={isArabic ? "مساحة البائع" : "Seller workspace"}
          title={isArabic ? "تم رفض طلب البيع" : "Seller request rejected"}
          body={
            isArabic
              ? "تم رفض طلب البيع حالياً. تواصل مع الإدارة إذا كنت باغي توضح المعلومات أو تعاود الطلب."
              : "The seller request was rejected. Contact support or the admin if you need to clarify the submitted information."
          }
          locale={locale}
          chips={[`${dashboard.stats.listingsCount} ${isArabic ? "إعلانات محفوظة" : "saved listings"}`]}
          actions={[{ href: "/dashboard", label: isArabic ? "لوحتي" : "My dashboard" }]}
        />
      </div>
    );
  }

  if (sellerAccess.isSuspended) {
    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero
          kicker={isArabic ? "مساحة البائع" : "Seller workspace"}
          title={isArabic ? "حساب البائع موقوف" : "Seller account suspended"}
          body={
            isArabic
              ? "تم توقيف الوصول للبيع مؤقتاً. الإعلانات العمومية مخفية إلى أن تعاود الإدارة التفعيل."
              : "Seller access is suspended. Public listings stay hidden until the admin reactivates the account."
          }
          locale={locale}
          chips={[`${dashboard.stats.listingsCount} ${isArabic ? "إعلانات محفوظة" : "saved listings"}`]}
          actions={[{ href: "/dashboard", label: isArabic ? "لوحتي" : "My dashboard" }]}
        />
      </div>
    );
  }

  if (sellerAccess.isExpired) {
    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero
          kicker={isArabic ? "مساحة البائع" : "Seller workspace"}
          title={isArabic ? "اشتراك البيع منتهي" : "Seller subscription expired"}
          body={
            isArabic
              ? "انتهت صلاحية البيع. ما تقدرش تضيف أو تعاود تنشر الإعلانات حتى يتم التجديد."
              : "Seller access has expired. You cannot add or republish listings until renewal."
          }
          locale={locale}
          chips={[`${dashboard.stats.listingsCount} ${isArabic ? "إعلانات محفوظة" : "saved listings"}`]}
          actions={[{ href: "/dashboard", label: isArabic ? "لوحتي" : "My dashboard" }]}
        />
      </div>
    );
  }

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
            label: isArabic ? "Leads المنصة" : "Marketplace leads",
            value: dashboard.stats.marketplaceLeadCount,
            note: isArabic ? "طلبات ناتجة من المنصة" : "Requests coming from the platform",
            href: "/messages",
            tone: "slate"
          },
          {
            label: isArabic ? "طلبات خارجية" : "External orders",
            value: dashboard.stats.externalOrderCount,
            note: isArabic ? "واتساب، اتصال، إنستغرام أو بيع مباشر" : "WhatsApp, phone, Instagram, or offline sales",
            href: "/seller/dashboard",
            tone: "amber"
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

      <DashboardSection
        title={isArabic ? "متجري" : "My store"}
        body={isArabic ? "رابط المتجر العمومي القابل للمشاركة." : "Your public store link that you can share."}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-[1.5rem] border border-slate-100 p-4">
            <p className="text-sm text-slate-500">{isArabic ? "رابط المتجر" : "Store URL"}</p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-900">{storePath}</p>
            <div className="mt-4 rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{dashboard.seller?.sellerProfile?.businessName || dashboard.seller?.name || (isArabic ? "متجر البائع" : "Seller store")}</p>
              <p className="mt-1">{dashboard.seller?.sellerProfile?.city || dashboard.seller?.sellerProfile?.description || (isArabic ? "واجهة عمومية لمنتجاتك النشطة." : "Public storefront for your active listings.")}</p>
            </div>
          </div>
          <SellerStoreActions storePath={storePath} locale={locale} sellerName={dashboard.seller?.name || session.user.name || ""} />
        </div>
      </DashboardSection>

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
        title={isArabic ? "Leads المنصة" : "Marketplace leads"}
        body={isArabic ? "طلبات ورسائل مرتبطة بإعلانات السوق داخل المنصة." : "Buyer requests and conversations tied to marketplace listings."}
      >
          <div className="grid gap-3">
            {dashboard.marketplaceLeads.length > 0 ? (
              dashboard.marketplaceLeads.slice(0, 6).map((lead: any) => (
                <article key={lead._id} className="rounded-[1.5rem] border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{lead.listingId?.title || (isArabic ? "طلب" : "Lead")}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {(lead.source || lead.type || "listing")} • {lead.name || lead.buyerId?.name || lead.buyerId?.email || (isArabic ? "مشتري" : "Buyer")}
                      </p>
                      {lead.phone ? <p className="mt-1 text-sm text-slate-500">{lead.phone}</p> : null}
                      {lead.city ? <p className="mt-1 text-sm text-slate-500">{lead.city}</p> : null}
                      {lead.message ? <p className="mt-2 text-sm leading-6 text-slate-500">{lead.message}</p> : null}
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {lead.status || "new"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <StatusBadge kind="lead" status={lead.status} locale={locale} />
                      <AgencyStatusActions
                        endpoint="/api/leads"
                        idField="leadId"
                        itemId={String(lead._id)}
                        status={lead.status || "new"}
                        allowedStatuses={["new", "contacted", "sold", "cancelled"]}
                      />
                    </div>
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

      <DashboardSection
        title={isArabic ? "الطلبات الخارجية / اليدوية" : "External orders / manual leads"}
        body={
          isArabic
            ? "سجل بيعاً أو طلباً جاك من خارج الموقع مع فصل واضح عن Leads المنصة."
            : "Register a sale or lead that came from outside the website, clearly separated from marketplace leads."
        }
      >
        <form action="/seller/dashboard" className="mb-5 grid gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/60 p-4 md:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="lang" value={locale} />
          <select
            name="source"
            defaultValue={source}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20"
          >
            <option value="">{isArabic ? "كل المصادر" : "All sources"}</option>
            <option value="manual">{isArabic ? "يدوي" : "Manual"}</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="call">{isArabic ? "اتصال" : "Call"}</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="offline">{isArabic ? "خارج المنصة" : "Offline"}</option>
            <option value="other">{isArabic ? "مصدر آخر" : "Other"}</option>
          </select>
          <select
            name="status"
            defaultValue={status}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20"
          >
            <option value="">{isArabic ? "كل الحالات" : "All statuses"}</option>
            <option value="new">{isArabic ? "جديد" : "New"}</option>
            <option value="contacted">{isArabic ? "تم التواصل" : "Contacted"}</option>
            <option value="sold">{isArabic ? "تم البيع" : "Sold"}</option>
            <option value="cancelled">{isArabic ? "ملغى" : "Cancelled"}</option>
          </select>
          <button className="rounded-full bg-forest px-5 py-3 font-semibold text-white">
            {isArabic ? "تصفية" : "Filter"}
          </button>
        </form>
        <SellerLeadForm
          sellerId={session.user.id}
          source="manual"
          title={isArabic ? "تسجيل طلب خارجي أو بيع يدوي" : "Register external order or manual lead"}
          isSignedIn
          allowSourceSelect
          listingOptions={dashboard.listings.map((listing: any) => ({
            _id: String(listing._id),
            title: listing.title
          }))}
        />
        <div className="mt-6 grid gap-3">
          {externalOrders.length > 0 ? (
            externalOrders.map((lead: any) => (
              <article key={lead._id} className="rounded-[1.5rem] border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {lead.customProductName || lead.listingId?.title || (isArabic ? "طلب خارجي" : "External order")}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {lead.source || "manual"} • {lead.name || (isArabic ? "عميل" : "Customer")}
                    </p>
                    {lead.phone ? <p className="mt-1 text-sm text-slate-500">{lead.phone}</p> : null}
                    {lead.city ? <p className="mt-1 text-sm text-slate-500">{lead.city}</p> : null}
                    {(lead.unitPrice || lead.quantity) ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {lead.unitPrice ? `${lead.unitPrice} DH` : "-"} {lead.quantity ? `• x${lead.quantity}` : ""}
                      </p>
                    ) : null}
                    {lead.message ? <p className="mt-2 text-sm leading-6 text-slate-500">{lead.message}</p> : null}
                    {lead.notes ? <p className="mt-2 text-sm leading-6 text-slate-500">{lead.notes}</p> : null}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <StatusBadge kind="lead" status={lead.status} locale={locale} />
                    <AgencyStatusActions
                      endpoint="/api/leads"
                      idField="leadId"
                      itemId={String(lead._id)}
                      status={lead.status || "new"}
                      allowedStatuses={["new", "contacted", "sold", "cancelled"]}
                    />
                  </div>
                </div>
              </article>
            ))
          ) : (
            <DashboardEmptyState
              title={isArabic ? "لا توجد طلبات خارجية" : "No external orders"}
              body={
                isArabic
                  ? "الطلبات القادمة من واتساب أو إنستغرام أو البيع المباشر ستظهر هنا."
                  : "Orders from WhatsApp, Instagram, phone, or offline sales will appear here."
              }
              locale={locale}
            />
          )}
        </div>
      </DashboardSection>

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
