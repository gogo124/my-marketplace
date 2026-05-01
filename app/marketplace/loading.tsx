import { CardGridSkeleton, FiltersSkeleton } from "@/components/page-skeletons";

export default function Loading() {
  return (
    <main className="page-shell space-y-8">
      <section className="overflow-hidden rounded-[2.75rem] bg-[#0f3d2e] px-6 py-10 shadow-card">
        <div className="h-5 w-36 animate-pulse rounded-full bg-white/10" />
        <div className="mt-5 h-12 w-2/3 animate-pulse rounded-[1.5rem] bg-white/10" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
      </section>
      <FiltersSkeleton />
      <CardGridSkeleton />
    </main>
  );
}
