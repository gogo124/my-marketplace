import { redirect } from "next/navigation";
import { NewListingForm } from "@/components/new-listing-form";
import { getAuthSession } from "@/lib/auth";

export default async function NewListingPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="page-shell">
      <NewListingForm />
    </main>
  );
}
