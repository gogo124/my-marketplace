"use client";

import { FormEvent, useState } from "react";
import { resolveLocale, SiteLocale } from "@/lib/i18n";
import { getApiError, parseApiResponse } from "@/lib/api";

export function ContactPageForm({
  locale = "ar",
  supportEmail = ""
}: {
  locale?: SiteLocale;
  supportEmail?: string;
}) {
  const safeLocale = resolveLocale(locale);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const requestType = String(formData.get("requestType") || "").trim();
    const message = String(formData.get("message") || "").trim();

    setSubmitting(true);
    setStatus("");
    try {
      const response = await fetch("/api/contact-messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, phone, requestType, message }) });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(getApiError(data, "Could not save your message."));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save your message.");
      setSubmitting(false);
      return;
    }

    if (!supportEmail) {
      setStatus(
        safeLocale === "ar"
          ? "استعمل واتساب أو الاتصال المباشر لأن البريد الإلكتروني غير مفعل حالياً."
          : safeLocale === "fr"
            ? "Utilisez WhatsApp ou l'appel direct car l'email n'est pas active pour le moment."
            : "Use WhatsApp or direct calling because email is not active right now."
      );
      setSubmitting(false);
      event.currentTarget.reset();
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
    setSubmitting(false);
    event.currentTarget.reset();
    setStatus(
      safeLocale === "ar"
        ? "تم تجهيز رسالتك داخل البريد الإلكتروني."
        : safeLocale === "fr"
          ? "Votre message a ete prepare dans votre application email."
          : "Your message has been prepared in your email application."
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[2.5rem] border border-white/80 bg-white p-6 shadow-[0_30px_85px_rgba(15,61,46,.12)] sm:p-9">
      <div>
        <p className="text-xs font-black uppercase tracking-[.25em] text-clay">Moroccan Trip</p>
        <h2 className="mt-4 text-3xl font-black tracking-[-.03em] text-slate-950 sm:text-4xl">{safeLocale === "ar" ? "أرسل طلبك" : safeLocale === "fr" ? "Envoyer votre demande" : "Send your request"}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          {safeLocale === "ar"
            ? "اكتب تفاصيل الطلب، ثم نوجّهك إلى البريد الإلكتروني إذا كان مفعلًا."
            : safeLocale === "fr"
              ? "Renseignez votre demande puis nous vous redirigerons vers l'email si ce canal est actif."
              : "Fill in your request and we will route you to email if that channel is active."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder={safeLocale === "ar" ? "الاسم" : safeLocale === "fr" ? "Nom" : "Name"} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/60 px-5 py-4 outline-none transition focus:border-clay focus:bg-white focus:ring-2 focus:ring-clay/15" />
        <input name="email" type="email" required placeholder={safeLocale === "ar" ? "البريد الإلكتروني" : "Email"} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/60 px-5 py-4 outline-none transition focus:border-clay focus:bg-white focus:ring-2 focus:ring-clay/15" />
        <input name="phone" placeholder={safeLocale === "ar" ? "الهاتف" : safeLocale === "fr" ? "Telephone" : "Phone"} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/60 px-5 py-4 outline-none transition focus:border-clay focus:bg-white focus:ring-2 focus:ring-clay/15" />
        <select name="requestType" required className="rounded-[1.25rem] border border-slate-200 bg-slate-50/60 px-5 py-4 outline-none transition focus:border-clay focus:bg-white focus:ring-2 focus:ring-clay/15">
          <option value="">{safeLocale === "ar" ? "نوع الطلب" : safeLocale === "fr" ? "Type de demande" : "Request type"}</option>
          <option value="user support">{safeLocale === "ar" ? "دعم المستخدم" : safeLocale === "fr" ? "Support utilisateur" : "User support"}</option>
          <option value="seller request">{safeLocale === "ar" ? "طلب بائع" : safeLocale === "fr" ? "Demande vendeur" : "Seller request"}</option>
          <option value="agency request">{safeLocale === "ar" ? "طلب وكالة" : safeLocale === "fr" ? "Demande agence" : "Agency request"}</option>
          <option value="renter request">{safeLocale === "ar" ? "طلب مزود كراء" : safeLocale === "fr" ? "Demande loueur" : "Rental provider request"}</option>
          <option value="report problem">{safeLocale === "ar" ? "الإبلاغ عن مشكلة" : safeLocale === "fr" ? "Signaler un probleme" : "Report a problem"}</option>
          <option value="partnership">{safeLocale === "ar" ? "شراكة" : safeLocale === "fr" ? "Partenariat" : "Partnership"}</option>
          <option value="affiliate collaboration">{safeLocale === "ar" ? "تعاون أفلييت" : "Affiliate collaboration"}</option>
          <option value="business inquiry">{safeLocale === "ar" ? "استفسار أعمال" : "Business inquiry"}</option>
        </select>
      </div>
      <textarea
        name="message"
        required
        rows={6}
        placeholder={safeLocale === "ar" ? "اكتب رسالتك" : safeLocale === "fr" ? "Ecrivez votre message" : "Write your message"}
        className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50/60 px-5 py-4 outline-none transition focus:border-clay focus:bg-white focus:ring-2 focus:ring-clay/15"
      />
      {status ? <p className="text-sm font-medium text-forest">{status}</p> : null}
      <button type="submit" disabled={submitting} className="w-full rounded-full bg-forest px-6 py-4 font-bold text-white shadow-[0_16px_35px_rgba(15,61,46,.2)] transition hover:-translate-y-0.5 hover:bg-clay sm:w-auto disabled:opacity-60">
        {submitting ? (safeLocale === "ar" ? "جار الإرسال..." : "Sending...") : safeLocale === "ar" ? "متابعة" : safeLocale === "fr" ? "Continuer" : "Continue"}
      </button>
    </form>
  );
}
