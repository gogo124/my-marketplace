import { siteCopy } from "@/lib/i18n";

type TravelPostCardProps = {
  locale: "ar" | "fr";
  post: {
    _id: string;
    destination: string;
    date: string;
    description: string;
    phoneNumber: string;
    userId?: {
      name?: string;
      avatar?: string;
    };
  };
};

export function TravelPostCard({ locale, post }: TravelPostCardProps) {
  const copy = siteCopy[locale];
  const user = post.userId;
  const normalizedPhone = typeof post.phoneNumber === "string" ? post.phoneNumber.trim() : "";
  const phoneDigits = normalizedPhone.startsWith("+")
    ? `+${normalizedPhone.slice(1).replace(/\D/g, "")}`
    : normalizedPhone.replace(/\D/g, "");
  const whatsappDigits = phoneDigits.replace(/\D/g, "");
  const formattedDate = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    dateStyle: "medium"
  }).format(new Date(post.date));

  return (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-card backdrop-blur transition hover:-translate-y-1">
      <div className="absolute inset-x-6 top-0 h-20 rounded-b-[2rem] bg-[radial-gradient(circle,rgba(184,138,68,0.14),transparent_70%)]" />
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-clay">
              {copy.destination}
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight text-ink">{post.destination}</h3>
          </div>
          <div className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-forest">
            {formattedDate}
          </div>
        </div>
        <p className="line-clamp-4 text-sm leading-7 text-ink/70">{post.description}</p>
      </div>

      <div className="mt-6 space-y-4 border-t border-ink/10 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
            {user?.name?.slice(0, 1).toUpperCase() || "M"}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.postedBy}</p>
            <p className="font-semibold text-ink">{user?.name || "Moroccan Trip"}</p>
            <p className="text-sm text-ink/55">{normalizedPhone || "-"}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={whatsappDigits ? `https://wa.me/${whatsappDigits}` : "#"}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!whatsappDigits}
            className="inline-flex w-full items-center justify-center rounded-full bg-forest px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60"
          >
            {copy.contactAction}
          </a>
          <a
            href={phoneDigits ? `tel:${phoneDigits}` : "#"}
            aria-disabled={!phoneDigits}
            className="inline-flex w-full items-center justify-center rounded-full bg-clay px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60"
          >
            {copy.callAction}
          </a>
        </div>
      </div>
    </article>
  );
}
