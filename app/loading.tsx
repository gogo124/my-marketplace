export default function Loading() {
  return (
    <main className="page-shell">
      <div className="rounded-[2rem] bg-white px-6 py-10 shadow-card">
        <div className="h-4 w-32 animate-pulse rounded-full bg-sand" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded-full bg-sand" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-sand" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-sand" />
      </div>
    </main>
  );
}
