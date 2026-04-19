import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversations = await getConversationsForUser(session.user.id);

  return (
    <main className="page-shell space-y-6">
      <div>
        <h1 className="text-4xl font-black text-ink">Inbox</h1>
        <p className="mt-2 text-sm text-ink/60">Your active conversations with buyers and sellers.</p>
      </div>
      {conversations.length > 0 ? (
        <div className="grid gap-4">
          {conversations.map((conversation: any) => {
            const peer = conversation.participants.find((participant: any) => participant._id !== session.user.id);

            return (
              <Link
                key={conversation._id}
                href={`/messages/${conversation._id}`}
                className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-ink">{conversation.listing?.title}</h2>
                    <p className="mt-2 text-sm text-ink/60">
                      Chatting with {peer?.name || peer?.email || "Marketplace user"}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-clay">
                    {new Date(conversation.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white/70 p-10 text-center text-ink/65">
          No conversations yet. Message a seller from any listing page.
        </div>
      )}
    </main>
  );
}
