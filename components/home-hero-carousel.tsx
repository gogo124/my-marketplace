"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { withLocale, type SiteLocale } from "@/lib/i18n";

type Localized = { ar?: string; fr?: string; en?: string };
type Slide = { _id: string; image: string; mobileImage?: string; eyebrow?: Localized; title: Localized; description?: Localized; ctaLabel?: Localized; ctaUrl?: string };
function text(value: Localized | undefined, locale: SiteLocale) { return String(value?.[locale] || value?.en || value?.fr || value?.ar || "").trim(); }

export function HomeHeroCarousel({ slides, locale }: { slides: Slide[]; locale: SiteLocale }) {
  const [active, setActive] = useState(0);
  const hasSlides = slides.length > 0;
  useEffect(() => { if (slides.length < 2) return; const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500); return () => window.clearInterval(timer); }, [slides.length]);
  if (!hasSlides) return null;
  const slide = slides[active] || slides[0];
  const title = text(slide.title, locale);
  const eyebrow = text(slide.eyebrow, locale);
  const description = text(slide.description, locale);
  const ctaLabel = text(slide.ctaLabel, locale);
  const href = slide.ctaUrl?.startsWith("/") ? withLocale(slide.ctaUrl, locale) : slide.ctaUrl || withLocale("/destinations", locale);
  const isExternal = /^https?:\/\//i.test(href);
  return <section className="relative overflow-hidden rounded-[2.25rem] bg-[#0f3d2e] shadow-[0_35px_100px_rgba(15,61,46,0.28)] sm:rounded-[3rem]" aria-roledescription="carousel" aria-label="Morocco travel highlights">
    <div className="relative min-h-[620px] sm:min-h-[690px] lg:min-h-[720px]">
      {slides.map((item, index) => <div key={item._id} className={`absolute inset-0 transition-opacity duration-1000 ${index === active ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={index !== active}>
        <picture><source media="(max-width: 767px)" srcSet={item.mobileImage || item.image} /><Image src={item.image} alt={text(item.title, locale)} fill priority={index === 0} sizes="100vw" className="object-cover object-center" /></picture>
      </div>)}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,14,10,0.94),rgba(5,35,25,0.78)_46%,rgba(9,55,40,0.25)_100%)]" />
      <div className="relative flex min-h-[620px] items-end px-5 py-8 sm:min-h-[690px] sm:px-10 sm:py-12 lg:min-h-[720px] lg:px-14 lg:py-16">
        <div className="max-w-4xl space-y-6 text-white">
          {eyebrow && <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.26em]">{eyebrow}</span>}
          <div><h1 className="max-w-4xl text-4xl font-black leading-[1.03] tracking-[-.035em] sm:text-6xl lg:text-7xl">{title}</h1>{description && <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{description}</p>}</div>
          {ctaLabel && (isExternal ? <a href={href} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-[#f97316] px-7 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(249,115,22,.28)] hover:-translate-y-0.5">{ctaLabel}</a> : <Link href={href} className="inline-flex rounded-full bg-[#f97316] px-7 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(249,115,22,.28)] hover:-translate-y-0.5">{ctaLabel}</Link>)}
        </div>
        {slides.length > 1 && <div className="absolute bottom-7 end-5 flex items-center gap-2 sm:end-10 lg:end-14" aria-label="Choose slide">{slides.map((item, index) => <button key={item._id} type="button" aria-label={`Slide ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${index === active ? "w-9 bg-white" : "w-2 bg-white/45 hover:bg-white/75"}`} />)}</div>}
      </div>
    </div>
  </section>;
}
