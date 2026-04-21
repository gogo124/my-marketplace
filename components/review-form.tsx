"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";

export function ReviewForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          rating: Number(formData.get("rating")),
          comment: String(formData.get("comment") || "")
        })
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not submit review."));
      }

      event.currentTarget.reset();
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <h3 className="text-lg font-bold text-ink">Leave a review</h3>
      <select name="rating" required className="w-full rounded-2xl border border-ink/10 px-4 py-3">
        <option value="">Select rating</option>
        <option value="5">5</option>
        <option value="4">4</option>
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>
      </select>
      <textarea
        name="comment"
        required
        rows={4}
        placeholder="Write your review"
        className="w-full rounded-2xl border border-ink/10 px-4 py-3"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-forest px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
