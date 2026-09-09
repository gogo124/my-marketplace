import { getAdminPageSession } from "@/lib/admin";
import { getHeroSlidesForAdmin } from "@/lib/hero-slides";
import { HeroSlideManager } from "@/components/hero-slide-manager";

export const dynamic = "force-dynamic";

export default async function AdminHeroSlidesPage() {
  await getAdminPageSession();
  const slides = await getHeroSlidesForAdmin();
  return <main className="page-shell space-y-8 pb-20"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Homepage</p><h1 className="mt-2 text-4xl font-black">Hero slides</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">Manage the visual first impression of Moroccan Trip. Upload travel photography from the admin panel and control what visitors see.</p></div><HeroSlideManager initialSlides={slides} /></main>;
}
