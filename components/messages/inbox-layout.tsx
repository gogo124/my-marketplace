import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { SiteLocale, formatLocaleDateTime, resolveLocale, withLocale } from "@/lib/i18n";

type InboxConversation = {
  _id: string;
  listing?: {
    title?: string;
    price?: number;
    images?: string[];
  } | null;
  participants?: Array<{
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
  }>;
  lastMessageAt?: string | Date | null;
  lastMessage?: {
    _id?: string;
    body?: string;
    createdAt?: string | Date | null;
    sender?: {
      _id?: string;
      name?: string;
      email?: string;
      avatar?: string;
    } | null;
  } | null;
  unreadCount?: number;
};

type InboxLayoutProps = {
  locale?: SiteLocale;
  currentUserId: string;
  conversations: InboxConversation[];
  children: ReactNode;
  title: string;
  body?: string;
  activeConversationId?: string;
  emptyState?: ReactNode;
};

function getPeerName(conversation: InboxConversation, currentUserId: string) {
  const peer = conversation.participants?.find((participant) => participant._id !== currentUserId);
  return peer?.name || peer?.email || "Marketplace user";
}

export function InboxLayout({
  locale = "ar",
  currentUserId,
  conversations,
  children,
  title,
  body,
  activeConversationId,
  emptyState
}: InboxLayoutProps) {
  const safeLocale = resolveLocale(locale);
  const isArabic = safeLocale === "ar";

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="space-y-4">
        <section className="rounded-[2.25rem] bg-white p-5 shadow-[0_12px_34px_rgba(15,61,46,0.08)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">
                {isArabic ? "الرسائل" : "Inbox"}
              </p>
              <h1 className="text-3xl font-black text-slate-900">{title}</h1>
            </div>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              {conversations.length}
            </span>
          </div>
          {body ? <p className="mt-4 text-sm leading-7 text-slate-500">{body}</p> : null}
          <div className="mt-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-500">
            {isArabic ? "المحادثات المرتبة حسب آخر نشاط." : "Conversations are sorted by latest activity."}
          </div>
        </section>

        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const isActive = conversation._id === activeConversationId;
              const lastMessage = conversation.lastMessage?.body || conversation.listing?.title || (isArabic ? "بدء محادثة" : "Open conversation");
              const peerName = getPeerName(conversation, currentUserId);
              const image = conversation.listing?.images?.[0] || "/images/hero-main.jpg";
              const unreadCount = conversation.unreadCount || 0;

              return (
                <Link
                  key={conversation._id}
                  href={withLocale(`/messages/${conversation._id}`, safeLocale)}
                  className={`group flex items-start gap-4 rounded-[2rem] border bg-white p-4 shadow-[0_10px_28px_rgba(15,61,46,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,61,46,0.12)] ${
                    isActive ? "border-[#f97316]/30 ring-2 ring-[#f97316]/15" : "border-slate-100"
                  }`}
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-[1.25rem] bg-slate-100">
                    <Image
                      src={image}
                      alt={conversation.listing?.title || peerName}
                      fill
                      sizes="80px"
                      className="object-cover object-center transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,61,46,0.25)_100%)]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{conversation.listing?.title || (isArabic ? "محادثة" : "Conversation")}</p>
                        <p className="mt-1 truncate text-xs uppercase tracking-[0.22em] text-slate-400">
                          {peerName}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {unreadCount > 0 ? (
                          <span className="inline-flex h-3 w-3 rounded-full bg-[#f97316]" aria-label={isArabic ? "غير مقروء" : "Unread"} />
                        ) : null}
                        <span className="text-xs text-slate-400">
                          {formatLocaleDateTime(conversation.lastMessageAt || conversation.lastMessage?.createdAt || new Date(), safeLocale)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{lastMessage}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        {conversation.listing?.price ? `${conversation.listing.price} DH` : isArabic ? "مناقشة" : "Chat"}
                      </span>
                      {unreadCount > 0 ? (
                        <span className="rounded-full bg-[#f97316]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c2410c]">
                          {isArabic ? "غير مقروء" : "Unread"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-forest/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-forest">
                          {isArabic ? "نشط" : "Active"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          emptyState || (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
              {isArabic ? "لا توجد رسائل بعد." : "No messages yet."}
            </div>
          )
        )}
      </aside>

      <section className="min-h-[70vh] rounded-[2.25rem] bg-white p-4 shadow-[0_12px_34px_rgba(15,61,46,0.08)] sm:p-6">
        {children}
      </section>
    </div>
  );
}
