"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError, withLocale } from "@/lib/i18n";

export function ResetPasswordForm({
  token,
  locale = "ar"
}: {
  token: string;
  locale?: "ar" | "fr";
}) {
  const safeLocale = resolveLocale(locale);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (password !== confirmPassword) {
        throw new Error(safeLocale === "ar" ? "كلمتا المرور غير متطابقتين." : "Les mots de passe ne correspondent pas.");
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not reset password."), safeLocale));
      }

      setSuccess(translateApiError(String(data.message || "Password updated successfully."), safeLocale));
      setPassword("");
      setConfirmPassword("");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="glass-panel space-y-4 rounded-[2.4rem] border border-white/70 p-8">
        <h2 className="text-3xl font-black text-ink">{safeLocale === "ar" ? "رابط غير صالح" : "Lien invalide"}</h2>
        <p className="text-sm leading-7 text-ink/65">
          {safeLocale === "ar"
            ? "هذا الرابط غير مكتمل. اطلب رسالة جديدة لإعادة تعيين كلمة المرور."
            : "Ce lien est incomplet. Demandez un nouvel email de reinitialisation."}
        </p>
        <Link href={withLocale("/forgot-password", safeLocale)} className="inline-flex rounded-full bg-forest px-5 py-3 font-semibold text-white">
          {safeLocale === "ar" ? "طلب رابط جديد" : "Demander un nouveau lien"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel space-y-5 rounded-[2.4rem] border border-white/70 p-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
          Moroccan Trip
        </span>
        <h2 className="text-3xl font-black text-ink">
          {safeLocale === "ar" ? "تعيين كلمة مرور جديدة" : "Definir un nouveau mot de passe"}
        </h2>
        <p className="text-sm leading-7 text-ink/65">
          {safeLocale === "ar"
            ? "اختر كلمة مرور جديدة تحتوي على 8 أحرف على الأقل مع حروف وأرقام."
            : "Choisissez un nouveau mot de passe avec au moins 8 caracteres, lettres et chiffres."}
        </p>
      </div>
      <input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        type="password"
        required
        minLength={8}
        placeholder={safeLocale === "ar" ? "كلمة المرور الجديدة" : "Nouveau mot de passe"}
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <input
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        type="password"
        required
        minLength={8}
        placeholder={safeLocale === "ar" ? "تأكيد كلمة المرور" : "Confirmer le mot de passe"}
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-forest">{success}</p>
          <Link href={withLocale("/login", safeLocale)} className="inline-flex rounded-full bg-forest px-5 py-3 font-semibold text-white">
            {safeLocale === "ar" ? "العودة إلى تسجيل الدخول" : "Retour a la connexion"}
          </Link>
        </div>
      ) : null}
      <button type="submit" disabled={loading} className="w-full rounded-[1.4rem] bg-forest px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60">
        {loading ? (safeLocale === "ar" ? "جارٍ التحديث..." : "Mise a jour...") : safeLocale === "ar" ? "تحديث كلمة المرور" : "Mettre a jour le mot de passe"}
      </button>
    </form>
  );
}
