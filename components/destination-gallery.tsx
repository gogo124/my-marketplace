"use client";

import Image from "next/image";
import { useState } from "react";

export default function DestinationGallery({ images, alt }: { images: Array<{ url: string; caption?: { ar?: string; fr?: string; en?: string } }>; alt: string }) {
  const [active, setActive] = useState<number | null>(null);
  if (!images.length) return null;
  const caption = (image: (typeof images)[number]) => image.caption?.en || image.caption?.fr || image.caption?.ar || alt;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((image, index) => (
          <button key={`${image.url}-${index}`} type="button" onClick={() => setActive(index)} className="relative aspect-square overflow-hidden rounded-2xl text-start focus:outline-none focus:ring-2 focus:ring-clay">
            <Image src={image.url} alt={caption(image)} fill sizes="(max-width: 640px) 50vw, 160px" className="object-cover transition duration-300 hover:scale-105" />
          </button>
        ))}
      </div>
      {active !== null && images[active] ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Image gallery">
          <button type="button" aria-label="Close gallery" onClick={() => setActive(null)} className="absolute right-5 top-5 rounded-full bg-white/15 px-4 py-2 text-2xl text-white">×</button>
          <button type="button" aria-label="Previous image" onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-3 rounded-full bg-white/15 px-4 py-2 text-2xl text-white sm:left-8">‹</button>
          <figure className="w-full max-w-5xl">
            <div className="relative h-[70vh] w-full"><Image src={images[active].url} alt={caption(images[active])} fill sizes="90vw" className="object-contain" /></div>
            <figcaption className="mt-3 text-center text-sm text-white/75">{caption(images[active])}</figcaption>
          </figure>
          <button type="button" aria-label="Next image" onClick={() => setActive((active + 1) % images.length)} className="absolute right-3 rounded-full bg-white/15 px-4 py-2 text-2xl text-white sm:right-8">›</button>
        </div>
      ) : null}
    </>
  );
}
