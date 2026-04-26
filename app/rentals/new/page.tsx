import { redirect } from "next/navigation";
import { RentalListingForm } from "@/components/new-listing-form";
import { getAuthSession } from "@/lib/auth";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export default async function NewRentalPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(withLocale("/login", locale));
  }

  return (
    <main dir={getDirection(locale)} className="page-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="image-surface relative overflow-hidden rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <div className="absolute right-0 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="space-y-5">
          <p className="section-kicker">{copy.rent}</p>
          <h1 className="text-5xl font-black leading-[1.08]">{copy.listingCreateRentalTitle}</h1>
          <p className="max-w-lg leading-8 text-white/75">{copy.listingCreateRentalBody}</p>
        </div>
      </section>
      <RentalListingForm />
    </main>
  );
}
