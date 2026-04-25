import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminTravelPosts } from "@/lib/admin";

export default async function AdminTravelPostsPage() {
  const posts = await getAdminTravelPosts();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Travel posts</h1>
        <p className="mt-3 text-sm text-ink/60">Moderate traveler-to-traveler posts and remove abusive content quickly.</p>
      </section>

      <section className="grid gap-4">
        {posts.map((post: any) => (
          <article key={post._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{post.destination}</h2>
                <p className="mt-2 text-sm text-ink/60">
                  By {post.userId?.name || "User"} • {post.userId?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">Travel date: {new Date(post.date).toLocaleDateString()}</p>
                <p className="mt-2 text-sm text-ink/60">{post.phoneNumber}</p>
                <p className="mt-2 text-sm text-ink/60 line-clamp-4">{post.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AdminMutationButton
                  endpoint={`/api/admin/travel-posts/${post._id}`}
                  method="DELETE"
                  label="Delete post"
                  variant="danger"
                  confirmText="Delete this travel post?"
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
