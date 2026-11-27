import type { ImageLoaderProps } from "next/image";

const CLOUDINARY_HOST = "res.cloudinary.com";
const MAX_CLOUDINARY_WIDTH = 2400;

/**
 * Send Cloudinary images directly to Cloudinary for delivery-time transforms.
 * Keep local and other remote images on their original URLs because a custom
 * Next.js loader does not provide the built-in /_next/image optimizer endpoint.
 */
export default function cloudinaryImageLoader({ src, width }: ImageLoaderProps): string {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    // Local paths, data/blob URLs, and SVGs are served unchanged.
    return src;
  }

  if (url.hostname !== CLOUDINARY_HOST || !url.pathname.includes("/image/upload/")) {
    // Do not route non-Cloudinary images to /_next/image under a custom loader.
    return src;
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
