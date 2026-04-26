export default function Loading() {
  return (
    <main className="page-shell space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="image-surface animate-pulse rounded-[2.75rem] p-8 shadow-card">
          <div className="h-9 w-36 rounded-full bg-white/10" />
          <div className="mt-5 h-14 w-4/5 rounded-[1.5rem] bg-white/10" />
          <div className="mt-3 h-5 w-3/4 rounded-full bg-white/10" />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="h-24 rounded-[1.5rem] bg-white/10" />
            <div className="h-24 rounded-[1.5rem] bg-white/10" />
            <div className="h-24 rounded-[1.5rem] bg-white/10" />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="h-14 rounded-2xl bg-white" />
            <div className="h-14 rounded-2xl bg-white" />
          </div>
        </div>
        <div className="animate-pulse rounded-[2.75rem] bg-white/70 p-8 shadow-card">
          <div className="h-7 w-28 rounded-full bg-forest/15" />
          <div className="mt-5 h-10 w-3/4 rounded-2xl bg-sand" />
          <div className="mt-3 h-5 w-full rounded-full bg-sand" />
          <div className="h-4 w-32 rounded-full bg-sand" />
          <div className="mt-4 h-12 rounded-2xl bg-sand" />
          <div className="mt-4 h-12 rounded-2xl bg-sand" />
          <div className="mt-4 h-36 rounded-[1.75rem] bg-sand" />
          <div className="mt-4 h-12 rounded-full bg-clay/20" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-[2rem] bg-white/70 shadow-card" />
        <div className="h-80 animate-pulse rounded-[2rem] bg-white/70 shadow-card" />
        <div className="h-80 animate-pulse rounded-[2rem] bg-white/70 shadow-card" />
      </div>
    </main>
  );
}
