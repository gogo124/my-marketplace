import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminSidebar } from "@/components/admin-sidebar";
import { getAdminPageSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminPageSession();

  if (!session?.user || session.user.role !== "admin") {
    return <AdminAccessDenied />;
  }

  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <div className="space-y-8">{children}</div>
    </main>
  );
}
