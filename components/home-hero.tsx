"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { withLocale, type SiteLocale } from "@/lib/i18n";

function text(value: any, locale: SiteLocale) {
  return value?.[locale] || value?.fr || value?.en || value?.ar || "";
}

export function HomeHero({ slides, locale, fallback }: { slides: any[]; locale: SiteLocale; fallback: any }) {
  const items = slides.length ? slides : [fallback];
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % items.length), 6500);
    return () => window.clearInterval(timer);
  }, [items.length]);
  const slide = items[active] || items[0];
  const title = slide.title ? text(slide.title, locale) : slide.title;
  const description = slide.description ? text(slide.description, locale) : slide.subtitle;
  const eyebrow = slide.eyebrow ? text(slide.eyebrow, locale) : slide.badge;
  const ctaLabel = slide.ctaLabel ? text(slide.ctaLabel, locale) : slide.primaryCta;
  const ctaUrl = slide.ctaUrl || "/destinations";
  const href = ctaUrl.startsWith("/") ? withLocale(ctaUrl, locale) : ctaUrl;

  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-[#0f3d2e] shadow-[0_35px_100px_rgba(15,61,46,0.28)] sm:rounded-[3rem]" aria-roledescription="carousel" aria-label="Moroccan Trip featured experiences">
      <div className="relative min-h-[600px] sm:min-h-[680px] xl:min-h-[720px]">
        <Image key={slide._id || active} src={slide.image || fallback.image} alt={title || "Moroccan Trip"} fill priority={active === 0} sizes="100vw" className="absolute inset-0 object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,14,10,0.94),rgba(5,35,25,0.78)_45%,rgba(9,55,40,0.28)_100%)]" />
        <div className="relative flex min-h-[600px] items-end px-5 py-8 sm:min-h-[680px] sm:px-10 sm:py-12 lg:px-14 lg:py-16 xl:min-h-[720px]">
          <div className="max-w-4xl text-white">
            {eyebrow && <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.25em] text-white/90">{eyebrow}</span>}
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-.035em] sm:text-6xl lg:text-7xl">{title}</h1>
            {description && <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{description}</p>}
            {ctaLabel && <Link href={href} target={ctaUrl.startsWith("/") ? undefined : "_blank"} rel={ctaUrl.startsWith("/") ? undefined : "noreferrer"} className="mt-7 inline-flex rounded-full bg-[#f97316] px-7 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(249,115,22,.3)] transition hover:-translate-y-0.5 hover:bg-white hover:text-[#0f3d2e]">{ctaLabel}</Link>}
          </div>
          {items.length > 1 && <div className="absolute bottom-7 right-6 flex items-center gap-2 sm:right-10"><button type="button" aria-label="Previous slide" onClick={() => setActive((active - 1 + items.length) % items.length)} className="h-10 w-10 rounded-full border border-white/20 bg-black/20 text-white backdrop-blur">‹</button>{items.map((item, index) => <button key={item._id || index} type="button" aria-label={`Go to slide ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} className={`h-2.5 rounded-full transition-all ${index === active ? "w-8 bg-white" : "w-2.5 bg-white/45"}`} />)}<button type="button" aria-label="Next slide" onClick={() => setActive((active + 1) % items.length)} className="h-10 w-10 rounded-full border border-white/20 bg-black/20 text-white backdrop-blur">›</button></div>}
        </div>
      </div>
    </section>
  );
}
