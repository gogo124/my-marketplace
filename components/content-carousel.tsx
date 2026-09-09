"use client";

import { useId, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ContentCarousel({
  children,
  label = "Carousel",
  itemClassName = "w-[82vw] sm:w-[58vw] lg:w-[32vw]",
  showArrows = true,
}: {
  children: React.ReactNode;
  label?: string;
  itemClassName?: string;
  showArrows?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  function move(direction: 1 | -1) {
    const element = ref.current;
    if (!element) return;
    const item = element.querySelector<HTMLElement>(`[data-carousel-item="${id}"]`);
    const distance = item ? item.offsetWidth + 24 : element.clientWidth * 0.82;
    element.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        id={`carousel-${id}`}
        aria-label={label}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:ring-2 focus-visible:ring-forest/30"
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div key={index} data-carousel-item={id} className={`shrink-0 snap-start ${itemClassName}`}>
                {child}
              </div>
            ))
          : <div data-carousel-item={id} className={`shrink-0 snap-start ${itemClassName}`}>{children}</div>}
      </div>

      {showArrows ? (
        <div className="pointer-events-none absolute -top-16 end-0 flex gap-2">
          <button
            type="button"
            aria-label={`Previous ${label}`}
            onClick={() => move(-1)}
            className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Next ${label}`}
            onClick={() => move(1)}
            className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-forest text-white shadow-sm transition hover:bg-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
