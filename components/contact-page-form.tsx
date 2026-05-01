"use client";

import { FormEvent, useState } from "react";
import { resolveLocale, SiteLocale } from "@/lib/i18n";

export function ContactPageForm({
  locale = "ar",
  supportEmail = ""
}: {
  locale?: SiteLocale;
  supportEmail?: string;
}) {
  const safeLocale = resolveLocale(locale);
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const requestType = String(formData.get("requestType") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!supportEmail) {
      setStatus(
        safeLocale === "ar"
          ? "استعمل واتساب أو الاتصال المباشر لأن البريد الإلكتروني غير مفعل حالياً."
          : safeLocale === "fr"
            ? "Utilisez WhatsApp ou l'appel direct car l'email n'est pas active pour le moment."
            : "Use WhatsApp or direct calling because email is not active right now."
      );
      return;
    }

    const subject = encodeURIComponent(`Moroccan Trip contact: ${requestType || "General request"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Request type: ${requestType}`,
        "",
        message
      ].join("\n")
    );

    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    setStatus(
      safeLocale === "ar"
        ? "تم تجهيز رسالتك داخل البريد الإلكتروني."
        : safeLocale === "fr"
          ? "Votre message a ete prepare dans votre application email."
          : "Your message has been prepared in your email application."
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
      <div>
        <h2 className="text-2xl font-black text-slate-900">{safeLocale === "ar" ? "أرسل طلبك" : safeLocale === "fr" ? "Envoyer votre demande" : "Send your request"}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          {safeLocale === "ar"
            ? "اكتب تفاصيل الطلب، ثم نوجّهك إلى البريد الإلكتروني إذا كان مفعلًا."
            : safeLocale === "fr"
              ? "Renseignez votre demande puis nous vous redirigerons vers l'email si ce canal est actif."
              : "Fill in your request and we will route you to email if that channel is active."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder={safeLocale === "ar" ? "الاسم" : safeLocale === "fr" ? "Nom" : "Name"} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20" />
        <input name="email" type="email" required placeholder={safeLocale === "ar" ? "البريد الإلكتروني" : "Email"} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20" />
        <input name="phone" placeholder={safeLocale === "ar" ? "الهاتف" : safeLocale === "fr" ? "Telephone" : "Phone"} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20" />
        <select name="requestType" required className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20">
          <option value="">{safeLocale === "ar" ? "نوع الطلب" : safeLocale === "fr" ? "Type de demande" : "Request type"}</option>
          <option value="user support">{safeLocale === "ar" ? "دعم المستخدم" : safeLocale === "fr" ? "Support utilisateur" : "User support"}</option>
          <option value="seller request">{safeLocale === "ar" ? "طلب بائع" : safeLocale === "fr" ? "Demande vendeur" : "Seller request"}</option>
          <option value="agency request">{safeLocale === "ar" ? "طلب وكالة" : safeLocale === "fr" ? "Demande agence" : "Agency request"}</option>
          <option value="renter request">{safeLocale === "ar" ? "طلب مزود كراء" : safeLocale === "fr" ? "Demande loueur" : "Rental provider request"}</option>
          <option value="report problem">{safeLocale === "ar" ? "الإبلاغ عن مشكلة" : safeLocale === "fr" ? "Signaler un probleme" : "Report a problem"}</option>
          <option value="partnership">{safeLocale === "ar" ? "شراكة" : safeLocale === "fr" ? "Partenariat" : "Partnership"}</option>
        </select>
      </div>
      <textarea
        name="message"
        required
        rows={6}
        placeholder={safeLocale === "ar" ? "اكتب رسالتك" : safeLocale === "fr" ? "Ecrivez votre message" : "Write your message"}
        className="w-full rounded-[1.5rem] border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20"
      />
      {status ? <p className="text-sm font-medium text-forest">{status}</p> : null}
      <button type="submit" className="rounded-full bg-forest px-5 py-3 font-semibold text-white">
        {safeLocale === "ar" ? "متابعة" : safeLocale === "fr" ? "Continuer" : "Continue"}
      </button>
    </form>
  );
}
