export default function TripSpaceLoading() {
  return (
    <main className="page-shell space-y-8" aria-busy="true" aria-live="polite">
      <section className="overflow-hidden rounded-[2.75rem] bg-white shadow-card">
        <div className="h-56 animate-pulse bg-slate-200 sm:h-72" />
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="h-9 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-9 w-32 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="rounded-[2rem] bg-sand p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-12 w-40 animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="h-28 animate-pulse rounded-[1.5rem] bg-slate-100" />
            <div className="h-28 animate-pulse rounded-[1.5rem] bg-slate-100" />
            <div className="h-28 animate-pulse rounded-[1.5rem] bg-slate-100" />
            <div className="h-28 animate-pulse rounded-[1.5rem] bg-slate-100" />
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-5 h-28 animate-pulse rounded-[1.5rem] bg-slate-100" />
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="h-6 w-56 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-100" />
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-100" />
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-100" />
        </div>
      </section>
    </main>
  );
}
