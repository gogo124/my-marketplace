import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminMessages } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Messages</h1>
        <p className="mt-3 text-sm text-ink/60">Monitor recent conversation messages and remove abusive content when necessary.</p>
      </section>

      <section className="grid gap-4">
        {messages.map((message: any) => {
          const participants = Array.isArray(message.conversation?.participants)
            ? message.conversation.participants
                .map((participant: any) => participant?.name || participant?.email || "User")
                .join(", ")
            : "Conversation participants";

          return (
            <article key={message._id} className="rounded-[2rem] bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-ink">{message.conversation?.listing?.title || "Conversation message"}</h2>
                  <p className="mt-2 text-sm text-ink/60">
                    Sender: {message.sender?.name || "User"} • {message.sender?.email || "-"}
                  </p>
                  <p className="mt-2 text-sm text-ink/60">{participants}</p>
                  <p className="mt-2 text-sm text-ink/60 line-clamp-4">{message.body}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/45">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <AdminMutationButton
                    endpoint={`/api/admin/messages/${message._id}`}
                    method="DELETE"
                    label="Delete message"
                    variant="danger"
                    confirmText="Delete this message?"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
