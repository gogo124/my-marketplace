"use client";

import { FormEvent, useState } from "react";
import { resolveLocale } from "@/lib/i18n";

export function ContactPageForm({
  locale = "ar",
  supportEmail = ""
}: {
  locale?: "ar" | "fr";
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
          : "Utilisez WhatsApp ou l'appel direct car l'email n'est pas active pour le moment."
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
        : "Votre message a ete prepare dans votre application email."
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
      <div>
        <h2 className="text-2xl font-black text-slate-900">{safeLocale === "ar" ? "أرسل طلبك" : "Envoyer votre demande"}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          {safeLocale === "ar"
            ? "اكتب تفاصيل الطلب، ثم نوجّهك إلى البريد الإلكتروني إذا كان مفعلًا."
            : "Renseignez votre demande puis nous vous redirigerons vers l'email si ce canal est actif."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder={safeLocale === "ar" ? "الاسم" : "Nom"} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20" />
        <input name="email" type="email" required placeholder={safeLocale === "ar" ? "البريد الإلكتروني" : "Email"} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20" />
        <input name="phone" placeholder={safeLocale === "ar" ? "الهاتف" : "Telephone"} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20" />
        <select name="requestType" required className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20">
          <option value="">{safeLocale === "ar" ? "نوع الطلب" : "Type de demande"}</option>
          <option value="user support">{safeLocale === "ar" ? "دعم المستخدم" : "Support utilisateur"}</option>
          <option value="seller request">{safeLocale === "ar" ? "طلب بائع" : "Demande vendeur"}</option>
          <option value="agency request">{safeLocale === "ar" ? "طلب وكالة" : "Demande agence"}</option>
          <option value="renter request">{safeLocale === "ar" ? "طلب مزود كراء" : "Demande loueur"}</option>
          <option value="report problem">{safeLocale === "ar" ? "الإبلاغ عن مشكلة" : "Signaler un probleme"}</option>
          <option value="partnership">{safeLocale === "ar" ? "شراكة" : "Partenariat"}</option>
        </select>
      </div>
      <textarea
        name="message"
        required
        rows={6}
        placeholder={safeLocale === "ar" ? "اكتب رسالتك" : "Ecrivez votre message"}
        className="w-full rounded-[1.5rem] border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/20"
      />
      {status ? <p className="text-sm font-medium text-forest">{status}</p> : null}
      <button type="submit" className="rounded-full bg-forest px-5 py-3 font-semibold text-white">
        {safeLocale === "ar" ? "متابعة" : "Continuer"}
      </button>
    </form>
  );
}
