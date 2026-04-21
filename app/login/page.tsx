import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="space-y-5">
        <p className="section-kicker">Member access</p>
        <h1 className="text-5xl font-black leading-[1.08]">
          Log in and manage your marketplace activity.
        </h1>
        <p className="max-w-lg leading-8 text-white/75">
          Access your listings, replies, and negotiation threads from a single dashboard.
        </p>
        <Link href="/register" className="inline-flex rounded-full border border-white/20 px-5 py-3 font-semibold text-white">
          Need an account?
        </Link>
        </div>
      </section>
      <AuthForm mode="login" />
    </main>
  );
}
