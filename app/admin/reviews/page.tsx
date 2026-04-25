import { AdminMutationButton } from "@/components/admin-mutation-button";
import { StatusBadge } from "@/components/status-badge";
import { getAdminReviews } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await searchParams;
  const reviews = await getAdminReviews(status || undefined);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Reviews</h1>
        <p className="mt-3 text-sm text-ink/60">Review user feedback and remove abusive or low-integrity reviews when needed.</p>
        <form className="mt-4 flex flex-wrap gap-3">
          <select name="status" defaultValue={status} className="rounded-xl border border-ink/10 px-4 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending first</option>
            <option value="approved">Approved</option>
          </select>
          <button className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>
      </section>

      <section className="grid gap-4">
        {reviews.length > 0 ? reviews.map((review: any) => (
          <article key={review._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{review.listing?.title || "Listing review"}</h2>
                <p className="mt-2 text-sm text-ink/60">
                  By {review.author?.name || "User"} • {review.author?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">Rating: {review.rating}/5</p>
                <div className="mt-2"><StatusBadge kind="review" status={review.status} locale="fr" /></div>
                <p className="mt-2 text-sm text-ink/60 line-clamp-4">{review.comment}</p>
                {review.providerReply ? <p className="mt-2 text-sm text-ink/70">Reply: {review.providerReply}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {review.status !== "approved" ? (
                  <AdminMutationButton endpoint={`/api/admin/reviews/${review._id}`} method="PATCH" label="Approve review" />
                ) : null}
                <AdminMutationButton
                  endpoint={`/api/admin/reviews/${review._id}`}
                  method="DELETE"
                  label="Delete review"
                  variant="danger"
                  confirmText="Delete this review?"
                />
              </div>
            </div>
          </article>
        )) : (
          <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
            No reviews match this filter.
          </section>
        )}
      </section>
    </div>
  );
}
