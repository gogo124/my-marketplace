import { CardGridSkeleton } from "@/components/page-skeletons";

export default function Loading() {
  return (
    <main className="page-shell space-y-8">
      <section className="rounded-[2.5rem] bg-white p-6 shadow-card">
        <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-12 w-2/3 animate-pulse rounded-[1.5rem] bg-slate-200" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
      </section>
      <CardGridSkeleton count={4} cardClassName="h-48" />
    </main>
  );
}
