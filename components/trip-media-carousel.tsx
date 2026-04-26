"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

type TripMediaCarouselProps = {
  images?: string[];
  alt: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function TripMediaCarousel({
  images = [],
  alt,
  fallback,
  className = "aspect-square",
  imageClassName = "object-cover object-center",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 420px"
}: TripMediaCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const media = useMemo(() => {
    const safeImages = images.filter((image): image is string => Boolean(image && image.trim()));
    return safeImages.length > 0 ? safeImages : [fallback];
  }, [fallback, images]);

  function syncIndex() {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const slideWidth = container.clientWidth || 1;
    const nextIndex = Math.round(container.scrollLeft / slideWidth);
    setActiveIndex(Math.max(0, Math.min(media.length - 1, nextIndex)));
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        onScroll={syncIndex}
        className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {media.map((src, index) => (
          <div key={`${src}-${index}`} className="relative h-full w-full flex-none snap-center">
            <Image
              src={src}
              alt={`${alt} ${index + 1}`}
              fill
              priority={priority && index === 0}
              sizes={sizes}
              loading={priority && index === 0 ? "eager" : "lazy"}
              className={imageClassName}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white">
        {activeIndex + 1}/{media.length}
      </div>
    </div>
  );
}
