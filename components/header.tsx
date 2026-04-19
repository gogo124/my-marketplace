import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function Header() {
  const session = await getAuthSession();

  return (
    <header className="border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-2xl font-black uppercase tracking-[0.2em] text-forest">
          Soukly
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-ink">
          <Link href="/listings/new" className="rounded-full bg-clay px-4 py-2 text-white">
            Sell
          </Link>
          {session?.user ? (
            <>
              <Link href="/messages" className="rounded-full border border-ink/10 px-4 py-2">
                Messages
              </Link>
              <span className="hidden text-ink/70 sm:inline">{session.user.name}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full border border-ink/10 px-4 py-2">
                Log in
              </Link>
              <Link href="/register" className="rounded-full bg-forest px-4 py-2 text-white">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
