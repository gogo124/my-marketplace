import { redirect } from "next/navigation";
import { NewListingForm } from "@/components/new-listing-form";
import { getAuthSession } from "@/lib/auth";

export default async function NewListingPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
        <div className="absolute left-0 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="space-y-5">
          <p className="section-kicker">Sell</p>
          <h1 className="text-5xl font-black leading-[1.08]">
            Publish your product or service for sale with direct contact.
          </h1>
          <p className="max-w-lg leading-8 text-white/75">
            Add price, phone, WhatsApp, images, and a clear description in one place.
          </p>
        </div>
      </section>
      <NewListingForm />
    </main>
  );
}
