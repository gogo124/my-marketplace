"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      if (mode === "register") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        const data = await parseApiResponse(response);

        if (!response.ok) {
          throw new Error(getApiError(data, "Registration failed."));
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push("/");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-ink/10 bg-white p-8 shadow-card">
      <div>
        <h1 className="text-3xl font-black text-ink">
          {mode === "login" ? "Welcome back" : "Create your seller account"}
        </h1>
        <p className="mt-2 text-sm text-ink/65">
          {mode === "login"
            ? "Log in to publish listings and reply to buyers."
            : "Join the marketplace to publish listings and chat securely."}
        </p>
      </div>
      {mode === "register" ? (
        <input
          name="name"
          placeholder="Full name"
          required
          className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
        />
      ) : null}
      <input
        name="email"
        type="email"
        placeholder="Email address"
        required
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        minLength={6}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-forest px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Register"}
      </button>
    </form>
  );
}
