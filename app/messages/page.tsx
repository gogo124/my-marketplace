import { redirect } from "next/navigation";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-primitives";
import { InboxLayout } from "@/components/messages/inbox-layout";
import { getAuthSession } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/data";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const conversations = await getConversationsForUser(session.user.id);

  return (
    <main dir={getDirection(locale)} className="page-shell">
      <InboxLayout
        locale={locale}
        currentUserId={session.user.id}
        conversations={conversations as any[]}
        title={copy.inbox}
        body={copy.inboxBody}
        emptyState={
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
            {copy.noConversations}
          </div>
        }
      >
        <DashboardEmptyState
          title={copy.inbox}
          body={
            conversations.length > 0
              ? (locale === "ar" ? "اختر محادثة من القائمة لعرض التفاصيل." : "Select a conversation from the list to see the thread.")
              : copy.noConversations
          }
          href="/listings"
          ctaLabel={locale === "ar" ? "تصفح الإعلانات" : "Browse listings"}
          secondaryHref="/travel-partners"
          secondaryLabel={locale === "ar" ? "رفقاء السفر" : "Travel partners"}
          locale={locale}
        />
      </InboxLayout>
    </main>
  );
}
