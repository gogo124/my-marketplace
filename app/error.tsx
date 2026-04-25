"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Global error boundary triggered.", error);
  }, [error]);

  return (
    <html>
      <body className="bg-sand">
        <main className="page-shell flex min-h-[60vh] items-center justify-center">
          <div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-card">
            <p className="text-sm uppercase tracking-[0.25em] text-clay">Server fallback</p>
            <h1 className="mt-3 text-3xl font-black text-ink">The page could not load right now.</h1>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              A temporary server issue happened during the request. Try again, or return to the home page.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-full bg-forest px-5 py-3 font-semibold text-white"
              >
                Try again
              </button>
              <Link href="/" className="rounded-full border border-ink/10 px-5 py-3 font-semibold text-ink">
                Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
