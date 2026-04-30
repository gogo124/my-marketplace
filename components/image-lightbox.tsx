"use client";

import Image from "next/image";
import { useEffect } from "react";

export function ImageLightbox({
  images,
  alt,
  index,
  onClose
}: {
  images: string[];
  alt: string;
  index: number;
  onClose: () => void;
}) {
  const safeImages = images.filter(Boolean);
  const safeIndex = Math.max(0, Math.min(index, safeImages.length - 1));

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (safeImages.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur"
      >
        Close
      </button>
      <div className="relative h-[78vh] w-full max-w-6xl overflow-hidden rounded-[1.5rem] bg-black" onClick={(event) => event.stopPropagation()}>
        <Image
          src={safeImages[safeIndex]}
          alt={`${alt} ${safeIndex + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}
