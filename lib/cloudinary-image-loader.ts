import type { ImageLoaderProps } from "next/image";

const CLOUDINARY_HOST = "res.cloudinary.com";
const MAX_CLOUDINARY_WIDTH = 2400;
const DEFAULT_IMAGE_QUALITY = 75;

/**
 * Send Cloudinary images directly to Cloudinary for delivery-time transforms.
 * Keep Next.js optimization for every other raster image source so local assets
 * and non-Cloudinary remote images retain their existing responsive behavior.
 */
export default function cloudinaryImageLoader({ src, width }: ImageLoaderProps): string {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    // Local paths are optimized by the existing Next.js image endpoint below.
    // Data/blob URLs and SVGs are intentionally served unchanged.
    if (/^(data:|blob:)/i.test(src) || /\.svg(?:[?#]|$)/i.test(src)) {
      return src;
    }

    const params = new URLSearchParams({
      url: src,
      w: String(width),
      q: String(DEFAULT_IMAGE_QUALITY)
    });

    return `/_next/image?${params.toString()}`;
  }

  if (url.hostname !== CLOUDINARY_HOST || !url.pathname.includes("/image/upload/")) {
    // Preserve the existing Next.js optimization path for non-Cloudinary URLs.
    const params = new URLSearchParams({
      url: src,
      w: String(width),
      q: String(DEFAULT_IMAGE_QUALITY)
    });

    return `/_next/image?${params.toString()}`;
  }

  const uploadMarker = "/image/upload/";
  const uploadIndex = url.pathname.indexOf(uploadMarker);
  const insertionPoint = uploadIndex + uploadMarker.length;
  const requestedWidth = Math.min(Math.max(Math.round(width), 1), MAX_CLOUDINARY_WIDTH);
  const transformations = `f_auto,q_auto,w_${requestedWidth},c_limit`;

  // Put automatic delivery transformations immediately after /image/upload/.
  // Existing Cloudinary transformations, version IDs, folders, and public IDs remain intact.
  url.pathname =
    url.pathname.slice(0, insertionPoint) +
    transformations +
    "/" +
    url.pathname.slice(insertionPoint);

  return url.toString();
}
