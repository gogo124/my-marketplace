"use client";

import Image from "next/image";
import Link from "next/link";
import { ContentCarousel } from "@/components/content-carousel";

type Service = {
  key: "travel" | "camping" | "marketplace" | "activities";
  title: string;
  description: string;
  eyebrow: string;
  cta: string;
  image: string;
  href: string;
};

export function HomeServicesCarousel({ items }: { items: Service[] }) {
  return (
    <ContentCarousel label="Moroccan Trip services" itemClassName="w-[84vw] sm:w-[68vw] lg:w-[42vw] xl:w-[31vw]">
      {items.map((item) => (
        <article key={item.key} className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_24px_65px_rgba(15,61,46,0.12)] transition duration-300 hover:-translate-y-1">
          <div className="relative h-80 sm:h-[26rem]">
            <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 84vw, (max-width: 1024px) 68vw, (max-width: 1280px) 42vw, 31vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,26,20,0.08),rgba(12,26,20,0.78))]" />
            <div className="absolute left-4 right-4 top-4">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0f3d2e]">{item.eyebrow}</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-2xl font-black sm:text-3xl">{item.title}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">{item.description}</p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <Link href={item.href} className="inline-flex w-full items-center justify-center rounded-full bg-[#0f3d2e] px-5 py-4 text-sm font-bold text-white hover:bg-[#0c3327] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f3d2e]/40">{item.cta}</Link>
          </div>
        </article>
      ))}
    </ContentCarousel>
  );
}
