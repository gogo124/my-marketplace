import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminStories } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
  const stories = await getAdminStories();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Trip Stories</h1>
        <p className="mt-3 text-sm text-ink/60">Approve or delete camping trip stories.</p>
      </section>

      <section className="grid gap-4">
        {stories.map((story: any) => (
          <article key={story._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <h2 className="text-xl font-bold text-ink">{story.title}</h2>
                <p className="mt-2 text-sm text-ink/60">
                  {story.place?.name || "Place"} • {story.place?.city || "-"} • {story.status}
                </p>
                <p className="mt-2 text-sm text-ink/60">By {story.author?.name || "User"} • {story.author?.email || "-"}</p>
                <p className="mt-2 text-sm text-ink/60 line-clamp-4">{story.body}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {story.status !== "approved" ? (
                  <AdminMutationButton endpoint={`/api/admin/stories/${story._id}`} method="PATCH" label="Approve story" />
                ) : null}
                <AdminMutationButton
                  endpoint={`/api/admin/stories/${story._id}`}
                  method="DELETE"
                  label="Delete story"
                  variant="danger"
                  confirmText="Delete this trip story?"
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
