"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { normalizeInternalRedirect } from "@/lib/auth-flow";
import { resolveLocale, siteCopy, translateApiError, withLocale } from "@/lib/i18n";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const callbackUrl = searchParams.get("callbackUrl") || withLocale("/", locale);
  const copy = siteCopy[locale];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const website = String(formData.get("website") || "");
    const formStartedAt = Number(formData.get("formStartedAt") || startedAt);

    try {
      if (mode === "register") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, website, formStartedAt })
        });

        const data = await parseApiResponse(response);

        if (!response.ok) {
          throw new Error(translateApiError(getApiError(data, "Registration failed."), locale));
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      const redirectTarget = normalizeInternalRedirect(result?.url || callbackUrl, withLocale("/", locale));
      window.location.assign(redirectTarget);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, locale) : translateApiError("Unexpected error.", locale)
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);

    try {
      await signIn("google", { callbackUrl });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, locale) : translateApiError("Unexpected error.", locale)
      );
      setGoogleLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel space-y-5 rounded-[2.4rem] border border-white/70 p-8"
    >
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
          Moroccan Trip
        </span>
        <h1 className="text-3xl font-black text-ink">
          {mode === "login" ? copy.welcomeBack : copy.createSellerAccount}
        </h1>
        <p className="text-sm leading-7 text-ink/65">
          {mode === "login"
            ? copy.loginFormBody
            : copy.registerFormBody}
        </p>
      </div>
      {mode === "register" ? (
        <>
          <input
            name="name"
            placeholder={copy.fullName}
            required
            className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
          />
          <input type="hidden" name="formStartedAt" value={startedAt} />
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
        </>
      ) : null}
      <input
        name="email"
        type="email"
        placeholder={copy.emailAddress}
        required
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <input
        name="password"
        type="password"
        placeholder={copy.password}
        required
        minLength={8}
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white/80 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="w-full rounded-[1.4rem] border border-ink/10 bg-white px-4 py-3 font-semibold text-ink shadow-card disabled:opacity-60"
      >
        {googleLoading ? copy.connectingGoogle : copy.continueWithGoogle}
      </button>
      <p className="text-center text-xs uppercase tracking-[0.2em] text-ink/40">{copy.or}</p>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || googleLoading}
        className="w-full rounded-[1.4rem] bg-forest px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60"
      >
        {loading ? copy.pleaseWait : mode === "login" ? copy.login : copy.register}
      </button>
    </form>
  );
}
