"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox";

export function LightboxImage({
  src,
  alt,
  images,
  index = 0,
  wrapperClassName,
  imageClassName,
  sizes,
  priority = false,
  unoptimized = false
}: {
  src: string;
  alt: string;
  images?: string[];
  index?: number;
  wrapperClassName: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const gallery = images && images.length > 0 ? images : [src];

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={wrapperClassName}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          className={imageClassName || "object-cover"}
        />
      </button>
      {open ? <ImageLightbox images={gallery} alt={alt} index={index} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
