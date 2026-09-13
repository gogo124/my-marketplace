import Link from "next/link";

const SMARTLINK_URL = "https://deeprootedpressure.com/dgs987m2z?key=965331edcd4bba698c1e4b24793e6344";

export function SmartLinkAd({ id }: { id: string }) {
  return (
    <section
      id={id}
      aria-label="Sponsored content"
      className="rounded-[1.5rem] border border-ink/10 bg-white/80 p-4 shadow-sm"
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-ink/40">
        Sponsored
      </p>
      <Link
        href={SMARTLINK_URL}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="block text-sm font-semibold text-ink/70 transition hover:text-clay"
      >
        Discover this sponsored offer
      </Link>
    </section>
  );
}
