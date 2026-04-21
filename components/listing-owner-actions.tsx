"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ListingOwnerActions({
  listingId,
  status
}: {
  listingId: string;
  status: "active" | "inactive";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(nextStatus: "active" | "inactive") {
    setLoading(true);
    await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    router.refresh();
    setLoading(false);
  }

  async function deleteListing() {
    setLoading(true);
    await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <p className="text-sm text-ink/65">This is your listing. Manage its visibility or remove it.</p>
      <div className="grid gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus(status === "active" ? "inactive" : "active")}
          className="rounded-2xl border border-ink/10 px-4 py-3 font-semibold text-ink"
        >
          {status === "active" ? "Deactivate listing" : "Activate listing"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={deleteListing}
          className="rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white"
        >
          Delete listing
        </button>
      </div>
    </div>
  );
}
