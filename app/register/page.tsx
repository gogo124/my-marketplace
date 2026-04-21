import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="space-y-5">
        <p className="section-kicker">Seller onboarding</p>
        <h1 className="text-5xl font-black leading-[1.08]">
          Join the marketplace and publish your first offer.
        </h1>
        <p className="max-w-lg leading-8 text-white/75">
          Registration uses email and password credentials stored securely with hashing.
        </p>
        <Link href="/login" className="inline-flex rounded-full border border-white/20 px-5 py-3 font-semibold text-white">
          Already registered?
        </Link>
        </div>
      </section>
      <AuthForm mode="register" />
    </main>
  );
}
