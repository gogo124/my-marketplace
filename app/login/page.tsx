import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-clay">Member access</p>
        <h1 className="text-5xl font-black leading-tight text-ink">
          Log in and manage your marketplace activity.
        </h1>
        <p className="max-w-lg text-ink/65">
          Access your listings, replies, and negotiation threads from a single dashboard.
        </p>
        <Link href="/register" className="inline-flex rounded-full border border-ink/10 px-5 py-3 font-semibold">
          Need an account?
        </Link>
      </section>
      <AuthForm mode="login" />
    </main>
  );
}
