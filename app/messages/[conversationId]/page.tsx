import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-primitives";
import { InboxLayout } from "@/components/messages/inbox-layout";
import { ConversationReadMarker } from "@/components/messages/conversation-read-marker";
import { MessageComposer } from "@/components/message-composer";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getConversationsForUser, getMessagesForConversation } from "@/lib/data";
import Conversation from "@/models/Conversation";
import { serializeDocument } from "@/lib/utils";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
  searchParams
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { conversationId } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  await connectToDatabase();

  const conversation = await Conversation.findById(conversationId)
    .populate("listing", "title price images location")
    .populate("participants", "name email avatar")
    .lean();

  if (!conversation) {
    notFound();
  }

  const normalizedConversation = serializeDocument(conversation);
  const listing = normalizedConversation.listing as unknown as {
    _id?: string;
    title?: string;
    price?: number;
    images?: string[];
    location?: string;
  };
  const participants = normalizedConversation.participants as unknown as Array<{
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
  }>;

  if (!participants.some((participant) => participant._id === session.user.id)) {
    redirect(withLocale("/messages", locale));
  }

  const conversations = await getConversationsForUser(session.user.id);
  const messages = await getMessagesForConversation(conversationId);
  const peer = participants.find((participant) => participant._id !== session.user.id);

  return (
    <main dir={getDirection(locale)} className="page-shell">
      <InboxLayout
        locale={locale}
        currentUserId={session.user.id}
        conversations={conversations as any[]}
        title={listing?.title || copy.marketplaceChat}
        body={copy.conversation}
        activeConversationId={conversationId}
      >
        <ConversationReadMarker conversationId={conversationId} />
        <div className="flex h-full flex-col gap-5">
          <section className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative h-28 w-full overflow-hidden rounded-[1.5rem] bg-slate-100 md:h-24 md:w-36 md:flex-none">
                <Image
                  src={listing?.images?.[0] || "/images/hero-main.jpg"}
                  alt={listing?.title || copy.marketplaceChat}
                  fill
                  sizes="(max-width: 768px) 100vw, 160px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,61,46,0.24)_100%)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {copy.conversation}
                </p>
                <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                  {listing?.title || copy.marketplaceChat}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {peer?.name || peer?.email || copy.marketplaceUser}
                  {listing?.location ? ` • ${listing.location}` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0f3d2e] shadow-sm">
                    {listing?.price ? `${listing.price} DH` : copy.marketplaceChat}
                  </span>
                  <Link
                    href={withLocale(`/listings/${conversation.listing?._id || ""}`, locale)}
                    className="rounded-full bg-[#0f3d2e] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-card"
                  >
                    {locale === "ar" ? "عرض الإعلان" : "View listing"}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="flex-1 space-y-3 rounded-[2rem] border border-slate-100 bg-white p-4 sm:p-5">
            {messages.length > 0 ? (
              messages.map((message: any) => {
                const isOwn = message.sender?._id === session.user.id;

                return (
                  <div
                    key={message._id}
                    className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 sm:max-w-xl ${
                      isOwn ? "ml-auto bg-[#0f3d2e] text-white" : "bg-slate-50 text-slate-900"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-60">
                      {message.sender?.name || message.sender?.email}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6">{message.body}</p>
                  </div>
                );
              })
            ) : (
              <DashboardEmptyState
                title={copy.noMessages}
                body={locale === "ar" ? "ابدأ المحادثة برسالة قصيرة وواضحة." : "Start the conversation with a short, clear message."}
                href="/agencies"
                ctaLabel={locale === "ar" ? "تصفح الإعلانات" : "Browse listings"}
                secondaryHref="/travel-partners"
                secondaryLabel={locale === "ar" ? "رفقاء السفر" : "Travel partners"}
                locale={locale}
              />
            )}
          </section>

          <MessageComposer conversationId={conversationId} />
        </div>
      </InboxLayout>
    </main>
  );
}
