"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ContentCarousel({
  children,
  label = "Carousel",
  itemClassName = "w-[82vw] sm:w-[58vw] lg:w-[32vw]",
  showArrows = true,
  showDots = true,
}: {
  children: React.ReactNode;
  label?: string;
  itemClassName?: string;
  showArrows?: boolean;
  showDots?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const items = Array.isArray(children) ? children : [children];
  const count = items.length;

  function goTo(index: number) {
    const element = ref.current;
    if (!element || !count) return;
    const nextIndex = Math.max(0, Math.min(index, count - 1));
    const item = element.querySelectorAll<HTMLElement>(`[data-carousel-item="${id}"]`)[nextIndex];
    if (!item) return;
    item.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActiveIndex(nextIndex);
  }

  function move(delta: 1 | -1) {
    goTo(activeIndex + delta);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const rtl = document.documentElement.dir === "rtl";
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(rtl ? -1 : 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(rtl ? 1 : -1);
    }
  }

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const carouselItems = Array.from(element.querySelectorAll<HTMLElement>(`[data-carousel-item="${id}"]`));
      if (!carouselItems.length) return;
      const target = element.getBoundingClientRect().left + element.clientWidth * 0.35;
      let closest = 0;
      let distance = Number.POSITIVE_INFINITY;
      carouselItems.forEach((item, index) => {
        const nextDistance = Math.abs(item.getBoundingClientRect().left - target);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = index;
        }
      });
      setActiveIndex(closest);
    };
    element.addEventListener("scroll", update, { passive: true });
    return () => element.removeEventListener("scroll", update);
  }, [id, count]);

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={ref}
        id={`carousel-${id}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:ring-2 focus-visible:ring-forest/30"
      >
        {items.map((child, index) => (
          <div key={index} data-carousel-item={id} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>

      {showArrows && count > 1 ? (
        <div className="pointer-events-none absolute -top-16 end-0 flex gap-2">
          <button type="button" aria-label={`Previous ${label}`} disabled={activeIndex === 0} onClick={() => move(-1)} className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label={`Next ${label}`} disabled={activeIndex >= count - 1} onClick={() => move(1)} className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-forest text-white shadow-sm transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {showDots && count > 1 ? (
        <div className="mt-4 flex justify-center gap-1.5" aria-label={`${label} position`}>
          {Array.from({ length: count }).map((_, index) => (
            <button key={index} type="button" aria-label={`${label} ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => goTo(index)} className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 ${index === activeIndex ? "w-7 bg-forest" : "w-1.5 bg-ink/20 hover:bg-ink/40"}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
