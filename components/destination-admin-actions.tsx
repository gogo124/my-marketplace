"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";

export default function DestinationAdminActions({ id, published }: { id: string; published: boolean }) {
  const [isPublished, setIsPublished] = useState(published);
  const [busy, setBusy] = useState(false);

  async function togglePublished() {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/destinations/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !isPublished }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update publication status.");
      setIsPublished(Boolean(data.destination?.published));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not update publication status.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this destination?\n\nThis will permanently delete this destination and its destination data. This cannot be undone.")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/destinations/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete destination.");
      window.location.reload();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not delete destination.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => void togglePublished()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 px-3 py-2 text-xs font-black disabled:opacity-50">
        {isPublished ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
        {isPublished ? "Hide" : "Show"}
      </button>
      <button type="button" onClick={() => void remove()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-50">
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
      </button>
    </div>
  );
}
