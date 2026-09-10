import Image from "next/image";
import { safeExternalUrl } from "@/lib/destinations";

function whatsappHref(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\/wa\.me\//i.test(raw)) return safeExternalUrl(raw);
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 ? `https://wa.me/${digits}` : "";
}

export default function DestinationAgencies({ agencies, locale }: { agencies: any[]; locale: "ar" | "fr" | "en" }) {
  const copy = {
    ar: { book: "احجز الآن", instagram: "إنستغرام", whatsapp: "واتساب", title: "وكالات محلية" },
    fr: { book: "Réserver", instagram: "Instagram", whatsapp: "WhatsApp", title: "Agences locales" },
    en: { book: "Book Now", instagram: "Instagram", whatsapp: "WhatsApp", title: "Local agencies" },
  }[locale];

  const items = Array.isArray(agencies) ? agencies : [];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((agency: any, index: number) => {
        const name = String(agency?.name || "Agency").trim();
        const logo = safeExternalUrl(agency?.logo);
        const bookingUrl = safeExternalUrl(agency?.bookNowUrl || agency?.bookingUrl);
        const instagram = safeExternalUrl(agency?.instagram);
        const whatsapp = whatsappHref(agency?.whatsapp);
        return (
          <article key={agency?._id || `${name}-${index}`} className="flex min-h-[190px] flex-col rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {logo ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-sand">
                  <Image src={logo} alt={`${name} logo`} fill sizes="64px" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sand text-xl font-black text-forest" aria-hidden="true">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[.18em] text-clay">{copy.title}</p>
                <h3 className="mt-1 truncate text-xl font-black">{name}</h3>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
              {instagram ? <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label={`${name} ${copy.instagram}`} className="rounded-xl border border-ink/10 px-3 py-2 text-xs font-bold text-ink/65 hover:border-forest hover:text-forest">Instagram</a> : null}
              {whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`${name} ${copy.whatsapp}`} className="rounded-xl border border-ink/10 px-3 py-2 text-xs font-bold text-ink/65 hover:border-forest hover:text-forest">WhatsApp</a> : null}
              {bookingUrl ? <a href={bookingUrl} target="_blank" rel="noopener noreferrer" aria-label={`${copy.book} - ${name}`} className="ms-auto rounded-xl bg-forest px-5 py-2.5 text-sm font-black text-white hover:opacity-90">{copy.book}</a> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
