import Image from "next/image";
import { Instagram } from "lucide-react";
import { safeExternalUrl } from "@/lib/destinations";

function whatsappHref(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\/wa\.me\//i.test(raw)) return safeExternalUrl(raw);
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 ? `https://wa.me/${digits}` : "";
}

function whatsappDisplay(value: unknown) {
  const raw = String(value || "").trim();
  if (/^https?:\/\/wa\.me\//i.test(raw)) return raw.replace(/^https?:\/\/wa\.me\//i, "+");
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.startsWith("212") ? digits : digits.startsWith("0") ? `212${digits.slice(1)}` : digits;
  return normalized.startsWith("212") && normalized.length === 12
    ? `+212 ${normalized.slice(3, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9, 12)}`
    : raw;
}

function instagramLabel(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] ? `@${parts[0].replace(/^@/, "")}` : raw;
  } catch {
    return raw.startsWith("@") ? raw : `@${raw}`;
  }
}

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M20.5 3.5A11.9 11.9 0 0 0 12.03 0C5.46 0 .11 5.35.11 11.92c0 2.1.55 4.15 1.6 5.96L.01 24l6.27-1.65a11.87 11.87 0 0 0 5.75 1.47h.01c6.56 0 11.91-5.35 11.91-11.92 0-3.18-1.24-6.17-3.45-8.4Zm-8.47 18.3h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.86 9.86 0 1 1 8.36 4.61Zm5.41-7.39c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.23-.65.08-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.25-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" /></svg>;
}

export default function DestinationAgencies({ agencies, locale }: { agencies: any[]; locale: "ar" | "fr" | "en" }) {
  const copy = {
    ar: { book: "احجز الآن", title: "وكالات محلية" },
    fr: { book: "Réserver", title: "Agences locales" },
    en: { book: "Book Now", title: "Local agencies" },
  }[locale];
  const items = Array.isArray(agencies) ? agencies : [];

  return <div className="grid gap-4 md:grid-cols-2">
    {items.map((agency: any, index: number) => {
      const name = String(agency?.name || "Agency").trim();
      const logo = safeExternalUrl(agency?.logo);
      const bookingUrl = safeExternalUrl(agency?.bookNowUrl || agency?.bookingUrl);
      const instagram = safeExternalUrl(agency?.instagram);
      const instagramText = instagramLabel(agency?.instagram);
      const whatsapp = whatsappHref(agency?.whatsapp);
      const whatsappText = whatsappDisplay(agency?.whatsapp);
      return <article key={agency?._id || `${name}-${index}`} className="flex min-h-[190px] flex-col rounded-2xl border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center gap-4">
          {logo ? <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-sand"><Image src={logo} alt={`${name} logo`} fill sizes="64px" className="object-cover" /></div> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sand text-xl font-black text-forest" aria-hidden="true">{name.charAt(0).toUpperCase()}</div>}
          <div className="min-w-0"><p className="text-xs font-black uppercase tracking-[.18em] text-clay">{copy.title}</p><h3 className="mt-1 truncate text-xl font-black">{name}</h3></div>
        </div>
        <div className="mt-auto space-y-2 pt-6">
          {instagram && instagramText ? <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex w-fit max-w-full items-center gap-2 text-sm font-bold text-ink/70 transition hover:text-forest" aria-label={`Instagram ${instagramText}`}><Instagram className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">{instagramText}</span></a> : null}
          {whatsapp && whatsappText ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex w-fit max-w-full items-center gap-2 text-sm font-bold text-ink/70 transition hover:text-forest" aria-label={`WhatsApp ${whatsappText}`}><WhatsAppIcon /><span className="truncate">{whatsappText}</span></a> : null}
          {bookingUrl ? <div className="flex justify-end pt-1"><a href={bookingUrl} target="_blank" rel="noopener noreferrer" aria-label={`${copy.book} - ${name}`} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-black text-white transition hover:opacity-90">{copy.book}</a></div> : null}
        </div>
      </article>;
    })}
  </div>;
}
