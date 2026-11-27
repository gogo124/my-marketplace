import type { ImageLoaderProps } from "next/image";

const CLOUDINARY_HOST = "res.cloudinary.com";
const MAX_CLOUDINARY_WIDTH = 2400;

/**
 * Route Cloudinary image delivery through Cloudinary's own transformations.
 * Other image sources (including local /public assets) are returned unchanged.
 * This custom loader bypasses Vercel's built-in Image Optimization service.
 */
export default function cloudinaryImageLoader({ src, width }: ImageLoaderProps): string {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    // Keep local paths, data URLs, and other non-absolute sources untouched.
    return src;
  }

  if (url.hostname !== CLOUDINARY_HOST || !url.pathname.includes("/image/upload/")) {
    return src;
  }

  const uploadMarker = "/image/upload/";
  const uploadIndex = url.pathname.indexOf(uploadMarker);
  const insertionPoint = uploadIndex + uploadMarker.length;
  const requestedWidth = Math.min(Math.max(Math.round(width), 1), MAX_CLOUDINARY_WIDTH);
  const transformations = `f_auto,q_auto,w_${requestedWidth},c_limit`;

  // Put the automatic delivery transformations immediately after /image/upload/.
  // Existing Cloudinary transformations, version IDs, folders, and public IDs remain intact.
  url.pathname =
    url.pathname.slice(0, insertionPoint) +
    transformations +
    "/" +
    url.pathname.slice(insertionPoint);

  return url.toString();
}
