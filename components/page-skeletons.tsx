export function CardGridSkeleton({
  count = 6,
  cardClassName = "h-80"
}: {
  count?: number;
  cardClassName?: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`animate-pulse rounded-[2rem] bg-white shadow-card ${cardClassName}`}>
          <div className="h-48 rounded-t-[2rem] bg-slate-200" />
          <div className="space-y-3 p-5">
            <div className="h-6 w-2/3 rounded-full bg-slate-200" />
            <div className="h-4 w-full rounded-full bg-slate-100" />
            <div className="h-4 w-4/5 rounded-full bg-slate-100" />
            <div className="h-10 w-32 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-card sm:p-6">
      <div className="grid gap-3 lg:grid-cols-4">
        <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </section>
  );
}
