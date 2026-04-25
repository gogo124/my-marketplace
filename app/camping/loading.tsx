export default function CampingLoading() {
  return (
    <main className="page-shell space-y-8" aria-busy="true" aria-live="polite">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2.75rem] bg-forest px-6 py-10 text-white shadow-card sm:px-8">
          <div className="h-4 w-40 rounded-full bg-white/20" />
          <div className="mt-4 h-10 w-72 rounded-full bg-white/20" />
          <div className="mt-4 h-4 max-w-2xl rounded-full bg-white/15" />
        </div>
        <div className="rounded-[2.25rem] bg-white p-6 shadow-card">
          <div className="h-4 w-32 rounded-full bg-sand" />
          <div className="mt-4 h-8 w-64 rounded-full bg-sand/80" />
          <div className="mt-4 h-4 w-full rounded-full bg-sand/60" />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="h-6 w-40 rounded-full bg-sand" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 rounded-[1.5rem] bg-sand/60" />
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="h-6 w-40 rounded-full bg-sand" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 rounded-[1.5rem] bg-sand/60" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
