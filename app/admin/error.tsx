"use client";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <div className="space-y-6 rounded-[2rem] bg-white p-6 shadow-card">
      <div>
        <p className="text-lg font-bold text-ink">Could not load the admin dashboard</p>
        <p className="mt-2 text-sm text-ink/60">{error.message || "An unexpected error occurred."}</p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-forest px-5 py-3 font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
