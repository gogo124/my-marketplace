import { getAdminActivities } from "@/lib/activity";

export default async function AdminActivitiesPage() {
  const activities = await getAdminActivities();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Activities</h1>
        <p className="mt-3 text-sm text-ink/60">Review public activity listings and provider ownership.</p>
      </section>
      <section className="grid gap-4">
        {activities.length > 0 ? activities.map((activity: any) => (
          <article key={activity._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-xl font-bold text-ink">{activity.title}</h2>
            <p className="mt-2 text-sm text-ink/60">{activity.category} • {activity.city} • {activity.status}</p>
            <p className="mt-2 text-sm text-ink/60">Provider: {activity.provider?.name || "-"}</p>
            <p className="mt-3 text-sm text-ink/70">{activity.description}</p>
          </article>
        )) : (
          <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">No activities yet.</section>
        )}
      </section>
    </div>
  );
}
