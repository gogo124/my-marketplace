import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-clay">Seller onboarding</p>
        <h1 className="text-5xl font-black leading-tight text-ink">
          Join the marketplace and publish your first offer.
        </h1>
        <p className="max-w-lg text-ink/65">
          Registration uses email and password credentials stored securely with hashing.
        </p>
        <Link href="/login" className="inline-flex rounded-full border border-ink/10 px-5 py-3 font-semibold">
          Already registered?
        </Link>
      </section>
      <AuthForm mode="register" />
    </main>
  );
}
