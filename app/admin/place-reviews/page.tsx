import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminPlaceReviews } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPlaceReviewsPage() {
  const reviews = await getAdminPlaceReviews();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Place Reviews</h1>
        <p className="mt-3 text-sm text-ink/60">Approve or delete camping place reviews.</p>
      </section>

      <section className="grid gap-4">
        {reviews.map((review: any) => (
          <article key={review._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{review.place?.name || "Place review"}</h2>
                <p className="mt-2 text-sm text-ink/60">
                  {review.place?.city || "-"} • {review.rating}/5 • {review.status}
                </p>
                <p className="mt-2 text-sm text-ink/60">By {review.author?.name || "User"} • {review.author?.email || "-"}</p>
                <p className="mt-2 text-sm text-ink/60 line-clamp-4">{review.comment}</p>
                {review.providerReply ? <p className="mt-2 text-sm text-ink/70">Reply: {review.providerReply}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {review.status !== "approved" ? (
                  <AdminMutationButton endpoint={`/api/admin/place-reviews/${review._id}`} method="PATCH" label="Approve review" />
                ) : null}
                <AdminMutationButton
                  endpoint={`/api/admin/place-reviews/${review._id}`}
                  method="DELETE"
                  label="Delete review"
                  variant="danger"
                  confirmText="Delete this place review?"
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
