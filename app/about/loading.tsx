export default function AboutLoading() {
  return (
    <main className="page-shell space-y-6">
      <section className="h-64 animate-pulse rounded-[2.75rem] bg-[#0f3d2e]" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[2rem] bg-white shadow-card" />
        ))}
      </section>
    </main>
  );
}
