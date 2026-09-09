import { getAdminPageSession } from "@/lib/admin";
import { getHeroSlidesForAdmin } from "@/lib/hero-slides";
import { HeroSlideManager } from "@/components/hero-slide-manager";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  await getAdminPageSession();
  const slides = await getHeroSlidesForAdmin();
  return <main className="page-shell space-y-8 pb-20"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Content</p><h1 className="mt-2 text-4xl font-black">Homepage Hero</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">Create a premium Morocco travel hero carousel. Upload images directly to Cloudinary, control Arabic/French/English copy, CTA, order and publication status.</p></div><HeroSlideManager initialSlides={slides as any[]} /></main>;
}
