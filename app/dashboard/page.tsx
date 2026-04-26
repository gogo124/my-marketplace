import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardEmptyState, DashboardHero, DashboardMetricGrid, DashboardQuickLinks, DashboardSection } from "@/components/dashboard/dashboard-primitives";
import { SavedListingsSummary } from "@/components/saved-listings-summary";
import { StatusBadge } from "@/components/status-badge";
import { getAuthSession } from "@/lib/auth";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { getUserDashboardData } from "@/lib/user-dashboard";

function getConversationPeer(conversation: any, currentUserId: string) {
  return conversation.participants?.find((participant: any) => participant._id !== currentUserId);
}

export default async function UserDashboardPage({
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

  const dashboard = await getUserDashboardData(session.user.id);
  const isArabic = locale === "ar";
  const upcomingReservations = dashboard.upcomingReservations.length > 0 ? dashboard.upcomingReservations : dashboard.reservations.slice(0, 4);

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <DashboardHero
        kicker={isArabic ? "مساحة المستخدم" : "User workspace"}
        title={isArabic ? `مرحباً ${dashboard.user?.name || session.user.name || ""}` : `Welcome ${dashboard.user?.name || session.user.name || ""}`}
        body={
          isArabic
            ? "راقب الحجوزات والرسائل ورموز الرحلات والعناصر المحفوظة من مكان واحد."
            : "Track reservations, messages, trip codes, and saved items from one place."
        }
        locale={locale}
        chips={[
          `${dashboard.stats.reservationsCount} ${isArabic ? "حجز" : "reservations"}`,
          `${dashboard.stats.unreadMessagesCount} ${isArabic ? "غير مقروءة" : "unread"}`,
          `${dashboard.stats.tripCodesCount} ${isArabic ? "رمز رحلة" : "trip codes"}`
        ]}
        actions={[
          { href: "/listings", label: isArabic ? "تصفح الرحلات" : "Browse trips" },
          { href: "/rentals", label: isArabic ? "كراء المعدات" : "Rent equipment" }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <DashboardMetricGrid
          locale={locale}
          cards={[
            {
              label: isArabic ? "الرسائل غير المقروءة" : "Unread messages",
              value: dashboard.stats.unreadMessagesCount,
              note: isArabic ? "رسائل تحتاج إلى متابعة" : "Messages waiting for you",
              href: "/messages",
              tone: "forest"
            },
            {
              label: isArabic ? "حجوزاتي" : "My reservations",
              value: dashboard.stats.reservationsCount,
              note: isArabic ? "رحلات مؤكدة أو قيد الانتظار" : "Trips waiting or confirmed",
              href: "/dashboard",
              tone: "clay"
            },
            {
              label: isArabic ? "رموز الرحلات" : "Trip codes",
              value: dashboard.stats.tripCodesCount,
              note: isArabic ? "رحلات قابلة للتحقق" : "Trips with code access",
              href: "/messages",
              tone: "amber"
            },
            {
              label: isArabic ? "منشورات الرفقاء" : "Travel partner posts",
              value: dashboard.stats.travelPostsCount,
              note: isArabic ? "منشورات السفر الخاصة بك" : "Your travel partner ads",
              href: "/travel-partners",
              tone: "slate"
            }
          ]}
        />
        <SavedListingsSummary locale={locale} />
      </section>

      <DashboardQuickLinks
        locale={locale}
        items={[
          { href: "/listings", label: isArabic ? "تصفح الرحلات" : "Browse trips", note: isArabic ? "اعثر على إعلان مناسب" : "Find the right listing" },
          { href: "/rentals", label: isArabic ? "كراء المعدات" : "Rent equipment", note: isArabic ? "معدات السفر والتخييم" : "Travel and camping gear" },
          { href: "/travel-partners", label: isArabic ? "رفيق سفر" : "Find travel partner", note: isArabic ? "تواصل مع مسافرين" : "Meet other travelers" },
          { href: "/listings/new", label: isArabic ? "إضافة إعلان" : "Add listing", note: isArabic ? "عرض منتج جديد" : "Publish a new item" },
          { href: "/seller/dashboard", label: isArabic ? "لوحة البائع" : "Seller dashboard", note: isArabic ? "إعلانات البيع والرسائل" : "Sale listings and leads" }
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardSection
          title={isArabic ? "الحجوزات القادمة" : "Upcoming reservations"}
          body={isArabic ? "مواعيدك القادمة والحجوزات الأحدث." : "Your next trips and the latest bookings."}
        >
          {upcomingReservations.length > 0 ? (
            <div className="grid gap-4">
              {upcomingReservations.map((reservation: any) => (
                <article key={reservation._id} className="rounded-[1.75rem] border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:bg-slate-50">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{reservation.trip?.title || (isArabic ? "حجز" : "Reservation")}</p>
                      <p className="mt-1 text-sm text-slate-500">{reservation.agency?.name || "-"}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {reservation.seats} • {reservation.totalPrice || 0} DH
                      </p>
                      {reservation.preferredDate || reservation.trip?.startDate ? (
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                          {new Date(reservation.preferredDate || reservation.trip?.startDate).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge kind="reservation" status={reservation.status} locale={locale} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              title={isArabic ? "لا توجد حجوزات بعد" : "No reservations yet"}
              body={isArabic ? "ابدأ بحجز أول رحلة من صفحة الرحلات." : "Start by booking a trip from the listings page."}
              href="/listings"
              ctaLabel={isArabic ? "تصفح الرحلات" : "Browse trips"}
              locale={locale}
            />
          )}
        </DashboardSection>

        <DashboardSection
          title={isArabic ? "تقدم الملف الشخصي" : "Profile completion"}
          body={isArabic ? "هذه نسبة إكمال حسابك الحالية." : "This is your current account completion score."}
        >
          <div className="rounded-[2rem] border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{isArabic ? "اكتمال الملف" : "Profile completion"}</p>
                <p className="mt-2 text-4xl font-black text-slate-900">{dashboard.stats.profileCompletion}%</p>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0f3d2e] shadow-sm">
                {isArabic ? "ملفك" : "Your profile"}
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-white">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#0f3d2e_0%,#f97316_100%)]"
                style={{ width: `${dashboard.stats.profileCompletion}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              {isArabic
                ? "أكمل بياناتك الأساسية لتسهيل الحجز والتواصل."
                : "Complete your basic details to speed up booking and contact requests."}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-100 p-4">
              <p className="text-sm text-slate-500">{isArabic ? "الأماكن المحفوظة" : "Saved places"}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{dashboard.stats.savedPlacesCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-100 p-4">
              <p className="text-sm text-slate-500">{isArabic ? "طلبات الكراء" : "Rental requests"}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{dashboard.stats.rentalRequestsCount}</p>
            </div>
          </div>
        </DashboardSection>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardSection
          title={isArabic ? "الرسائل الأخيرة" : "Recent messages"}
          body={isArabic ? "آخر المحادثات المرتبطة بإعلاناتك واهتماماتك." : "Recent chats tied to your listings and reservations."}
        >
          {dashboard.conversations.length > 0 ? (
            <div className="space-y-3">
              {dashboard.conversations.slice(0, 5).map((conversation: any) => {
                const peer = getConversationPeer(conversation, session.user.id);
                const lastMessage = conversation.lastMessage?.body || (isArabic ? "بدء محادثة" : "Start a conversation");

                return (
                  <Link
                    key={conversation._id}
                    href={withLocale(`/messages/${conversation._id}`, locale)}
                    className="block rounded-[1.75rem] border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{conversation.listing?.title || (isArabic ? "محادثة" : "Conversation")}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {isArabic ? "مع" : "With"} {peer?.name || peer?.email || (isArabic ? "مستخدم" : "Marketplace user")}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{lastMessage}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {conversation.unreadCount ? (
                          <span className="inline-flex h-3 w-3 rounded-full bg-[#f97316]" />
                        ) : null}
                        <span className="text-xs text-slate-400">
                          {new Date(conversation.lastMessageAt || conversation.updatedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <DashboardEmptyState
              title={isArabic ? "لا توجد رسائل بعد" : "No messages yet"}
              body={isArabic ? "ابدأ محادثة من صفحة إعلان أو رحلة." : "Start a chat from a listing or trip page."}
              href="/listings"
              ctaLabel={isArabic ? "تصفح الإعلانات" : "Browse listings"}
              secondaryHref="/travel-partners"
              secondaryLabel={isArabic ? "الرفقاء" : "Travel partners"}
              locale={locale}
            />
          )}
        </DashboardSection>

        <DashboardSection
          title={isArabic ? "المنشورات والمراجعات" : "Your posts and reviews"}
          body={isArabic ? "متابعة سريعة لنشاطك داخل المنصة." : "A quick glance at your activity on the platform."}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-100 p-4">
              <p className="text-sm text-slate-500">{isArabic ? "المنشورات" : "Posts"}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{dashboard.stats.travelPostsCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-100 p-4">
              <p className="text-sm text-slate-500">{isArabic ? "التقييمات" : "Reviews"}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{dashboard.stats.reviewsCount}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {dashboard.reviews.length > 0 ? (
              dashboard.reviews.slice(0, 4).map((review: any) => (
                <article key={review._id} className="rounded-[1.5rem] border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{review.listing?.title || review.place?.name || (isArabic ? "مراجعة" : "Review")}</p>
                      <p className="mt-1 text-sm text-slate-500">{review.rating}/5</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-3">{review.comment}</p>
                    </div>
                    <StatusBadge kind="review" status={review.status} locale={locale} />
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">{isArabic ? "لا توجد مراجعات بعد." : "No reviews yet."}</p>
            )}
          </div>
        </DashboardSection>
      </section>
    </div>
  );
}
