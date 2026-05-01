"use client";

import { FormEvent, useState } from "react";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, SiteLocale, translateApiError } from "@/lib/i18n";

export function ForgotPasswordForm({ locale = "ar" }: { locale?: SiteLocale }) {
  const safeLocale = resolveLocale(locale);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not send reset email."), safeLocale));
      }

      setSuccess(
        translateApiError(
          String(data.message || "If an account exists for this email, a reset link has been sent."),
          safeLocale
        )
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel space-y-5 rounded-[2.4rem] border border-white/70 p-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
          Moroccan Trip
        </span>
        <h2 className="text-3xl font-black text-ink">
          {safeLocale === "ar" ? "نسيت كلمة المرور" : "Mot de passe oublie"}
        </h2>
        <p className="text-sm leading-7 text-ink/65">
          {safeLocale === "ar"
            ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً مؤقتاً لإعادة تعيين كلمة المرور."
            : "Entrez votre email et nous vous enverrons un lien temporaire pour reinitialiser votre mot de passe."}
        </p>
      </div>
      <label className="block text-sm font-semibold text-ink">
        {safeLocale === "ar" ? "البريد الإلكتروني" : "Adresse email"}
      </label>
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        required
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-forest">{success}</p> : null}
      <button type="submit" disabled={loading} className="w-full rounded-[1.4rem] bg-forest px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60">
        {loading ? (safeLocale === "ar" ? "جارٍ الإرسال..." : "Envoi...") : safeLocale === "ar" ? "إرسال الرابط" : "Envoyer le lien"}
      </button>
    </form>
  );
}
