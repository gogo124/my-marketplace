import { CardGridSkeleton, FiltersSkeleton } from "@/components/page-skeletons";

export default function Loading() {
  return (
    <main className="page-shell space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <div className="h-5 w-36 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-12 w-2/3 animate-pulse rounded-[1.5rem] bg-white/10" />
        <div className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
      </section>
      <FiltersSkeleton />
      <CardGridSkeleton />
    </main>
  );
}
