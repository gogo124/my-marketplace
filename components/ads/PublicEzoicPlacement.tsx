"use client";

import { usePathname } from "next/navigation";
import { EzoicAd } from "@/components/ads/EzoicAd";

function isPublicAdRoute(pathname: string) {
  if (pathname === "/" || pathname === "") return true;
  if (/^\/admin(?:\/|$)/.test(pathname)) return false;
  if (/^\/dashboard(?:\/|$)/.test(pathname)) return false;
  if (/^\/account(?:\/|$)/.test(pathname)) return false;
  if (pathname === "/login" || pathname === "/register") return false;
  return pathname.startsWith("/travel-partners");
}

export function PublicEzoicPlacement() {
  const pathname = usePathname();

  if (!pathname || !isPublicAdRoute(pathname)) return null;

  return <EzoicAd id="public-lower-ad" />;
}
