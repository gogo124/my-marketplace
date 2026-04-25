import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/data";
import { formatLocaleDate, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

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
    <main dir={getDirection(locale)} className="page-shell space-y-6">
      <div>
        <h1 className="text-4xl font-black text-ink">{copy.inbox}</h1>
        <p className="mt-2 text-sm text-ink/60">{copy.inboxBody}</p>
      </div>
      {conversations.length > 0 ? (
        <div className="grid gap-4">
          {conversations.map((conversation: any) => {
            const peer = conversation.participants.find((participant: any) => participant._id !== session.user.id);

            return (
              <Link
                key={conversation._id}
                href={withLocale(`/messages/${conversation._id}`, locale)}
                className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-ink">{conversation.listing?.title}</h2>
                    <p className="mt-2 text-sm text-ink/60">
                      {copy.chattingWith} {peer?.name || peer?.email || copy.marketplaceUser}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-clay">
                    {formatLocaleDate(conversation.lastMessageAt, locale)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white/70 p-10 text-center text-ink/65">
          {copy.noConversations}
        </div>
      )}
    </main>
  );
}
