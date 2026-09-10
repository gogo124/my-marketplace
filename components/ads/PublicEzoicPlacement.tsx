"use client";

import { usePathname } from "next/navigation";
import { EzoicAd } from "@/components/ads/EzoicAd";

function isPrivateRoute(pathname: string) {
  return (
    /^\/admin(?:\/|$)/.test(pathname) ||
    /^\/dashboard(?:\/|$)/.test(pathname) ||
    /^\/account(?:\/|$)/.test(pathname) ||
    pathname === "/login" ||
    pathname === "/register"
  );
}

export function PublicEzoicPlacement() {
  const pathname = usePathname();

  if (!pathname || isPrivateRoute(pathname)) return null;

  if (/^\/destinations\/[^/]+$/.test(pathname)) {
    return (
      <>
        <EzoicAd id="destination-detail-ad-1" />
        <EzoicAd id="destination-detail-ad-2" />
      </>
    );
  }

  return <EzoicAd id="public-lower-ad" />;
}
