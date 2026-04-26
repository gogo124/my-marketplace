export default function Loading() {
  return (
    <main className="page-shell">
      <section className="overflow-hidden rounded-[2rem] bg-[#0f3d2e] px-5 py-8 shadow-[0_20px_60px_rgba(15,61,46,0.18)] sm:px-8 sm:py-10">
        <div className="h-5 w-36 animate-pulse rounded-full bg-white/15" />
        <div className="mt-5 h-12 w-3/4 animate-pulse rounded-[1.25rem] bg-white/15" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-white/10" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-12 animate-pulse rounded-full bg-white/10" />
          <div className="h-12 animate-pulse rounded-full bg-white/10" />
          <div className="h-12 animate-pulse rounded-full bg-white/10" />
        </div>
      </section>
      <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[1.75rem] bg-white shadow-card">
            <div className="h-36 animate-pulse bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
