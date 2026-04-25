import { redirect } from "next/navigation";
import { NewListingForm } from "@/components/new-listing-form";
import { getAuthSession } from "@/lib/auth";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export default async function NewListingPage({
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
      <section className="relative overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
        <div className="absolute left-0 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="space-y-5">
          <p className="section-kicker">{copy.sell}</p>
          <h1 className="text-5xl font-black leading-[1.08]">{copy.listingCreateSaleTitle}</h1>
          <p className="max-w-lg leading-8 text-white/75">{copy.listingCreateSaleBody}</p>
        </div>
      </section>
      <NewListingForm />
    </main>
  );
}
