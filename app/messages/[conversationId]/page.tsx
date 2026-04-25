import { notFound, redirect } from "next/navigation";
import { MessageComposer } from "@/components/message-composer";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Conversation from "@/models/Conversation";
import { getMessagesForConversation } from "@/lib/data";
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
    .populate("listing", "title")
    .populate("participants", "name email")
    .lean();

  if (!conversation) {
    notFound();
  }

  const normalizedConversation = serializeDocument(conversation);
  const listing = normalizedConversation.listing as unknown as { title?: string };

  if (!normalizedConversation.participants.some((participant: any) => participant._id === session.user.id)) {
    redirect(withLocale("/messages", locale));
  }

  const messages = await getMessagesForConversation(conversationId);

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.25em] text-ink/50">{copy.conversation}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">
          {listing?.title || copy.marketplaceChat}
        </h1>
      </div>
      <section className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
        {messages.length > 0 ? (
          messages.map((message: any) => {
            const isOwn = message.sender?._id === session.user.id;

            return (
              <div
                key={message._id}
                className={`max-w-xl rounded-[1.5rem] px-5 py-4 ${
                  isOwn ? "ml-auto bg-forest text-white" : "bg-sand text-ink"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">
                  {message.sender?.name || message.sender?.email}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6">{message.body}</p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-ink/60">{copy.noMessages}</p>
        )}
      </section>
      <MessageComposer conversationId={conversationId} />
    </main>
  );
}
