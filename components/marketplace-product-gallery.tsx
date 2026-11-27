"use client";

import Image from "next/image";
import { useState } from "react";

export function MarketplaceProductGallery({
  mainImage,
  images,
  title,
}: {
  mainImage: string;
  images?: string[];
  title: string;
}) {
  const gallery = Array.from(new Set([mainImage, ...(images ?? [])].filter(Boolean)));
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const current = gallery[active] ?? mainImage;

  return (
    <div className="space-y-4">
      <div
        className="group relative h-[480px] overflow-hidden rounded-[2.5rem] bg-slate-50"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onClick={() => setZoom((value) => !value)}
        role="button"
        tabIndex={0}
        aria-label="Zoom product image"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") setZoom((value) => !value);
        }}
      >
        <Image
          src={current}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`object-contain p-8 transition-transform duration-300 ${zoom ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"}`}
        />
        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-4 py-2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
          Click to zoom
        </span>
      </div>

      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {gallery.map((src, index) => (
            <button
              type="button"
              key={`${src}-${index}`}
              onClick={() => {
                setActive(index);
                setZoom(false);
              }}
              aria-label={`View product image ${index + 1}`}
              className={`relative h-24 overflow-hidden rounded-xl bg-slate-50 transition ${index === active ? "ring-2 ring-emerald-600" : "ring-1 ring-slate-200 hover:ring-slate-400"}`}
            >
              <Image src={src} alt="" fill sizes="100px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
