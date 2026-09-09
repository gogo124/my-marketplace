import Image from "next/image";
import Link from "next/link";
import { getAdminPageSession } from "@/lib/admin";
import { getDestinationsForAdmin } from "@/lib/destinations";
import { localizeField, resolveLocale, withLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  await getAdminPageSession();
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const destinations: any[] = await getDestinationsForAdmin();

  return <main dir={locale === "ar" ? "rtl" : "ltr"} className="page-shell space-y-8 pb-20">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Content</p><h1 className="mt-2 text-4xl font-black">Destinations</h1><p className="mt-2 text-sm text-ink/55">Manage photography, publishing, featured status and display order.</p></div>
      <Link href={withLocale("/admin/destinations/new", locale)} className="rounded-xl bg-forest px-5 py-3 text-sm font-black text-white">Create destination</Link>
    </div>
    <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-card">
      <div className="hidden grid-cols-[96px_minmax(0,1fr)_110px_100px_100px] gap-4 border-b border-ink/10 bg-sand/30 px-5 py-3 text-xs font-black uppercase tracking-wider text-ink/45 md:grid"><span>Image</span><span>Destination</span><span>Status</span><span>Featured</span><span>Order</span></div>
      <div className="divide-y divide-ink/10">
        {destinations.map((item) => <div key={item._id} className="grid gap-4 p-5 md:grid-cols-[96px_minmax(0,1fr)_110px_100px_100px] md:items-center">
          <div className="relative h-20 w-24 overflow-hidden rounded-xl bg-sand">{item.coverImage ? <Image src={item.coverImage} alt={localizeField(item.name, locale)} fill sizes="96px" className="object-cover" /> : null}</div>
          <div className="min-w-0"><h2 className="truncate font-black">{localizeField(item.name, locale)}</h2><p className="mt-1 truncate text-xs text-ink/45">{localizeField(item.location, locale)} · /{item.slug}</p><Link href={withLocale(`/admin/destinations/${item._id}`, locale)} className="mt-2 inline-flex text-sm font-bold text-clay hover:underline">Edit destination →</Link></div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${item.published ? "bg-forest/10 text-forest" : "bg-ink/5 text-ink/50"}`}>{item.published ? "Published" : "Draft"}</span>
          <span className="text-sm font-bold">{item.featured ? "Yes" : "No"}</span>
          <span className="text-sm font-bold">#{item.displayOrder ?? 0}</span>
        </div>)}
        {!destinations.length && <div className="p-12 text-center text-ink/50">No destinations yet. Create the first destination to make it available for the public discovery page.</div>}
      </div>
    </div>
  </main>;
}
