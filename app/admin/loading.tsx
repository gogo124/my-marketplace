export default function AdminLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <div className="h-4 w-24 rounded-full bg-white/20" />
        <div className="mt-4 h-10 w-64 rounded-full bg-white/20" />
        <div className="mt-4 h-4 max-w-2xl rounded-full bg-white/15" />
      </section>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="h-4 w-24 rounded-full bg-sand" />
            <div className="mt-4 h-8 w-20 rounded-full bg-sand/80" />
          </div>
        ))}
      </section>
    </div>
  );
}
