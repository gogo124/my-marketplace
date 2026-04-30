export default function ContactLoading() {
  return (
    <main className="page-shell space-y-6">
      <section className="h-64 animate-pulse rounded-[2.75rem] bg-[#0f3d2e]" />
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="h-[420px] animate-pulse rounded-[2rem] bg-white shadow-card" />
        <div className="h-[420px] animate-pulse rounded-[2rem] bg-white shadow-card" />
      </section>
    </main>
  );
}
