"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { runEzoic } from "@/lib/ezoic";

type EzoicAdProps = {
  id?: string;
  className?: string;
  label?: string;
};

const requestedPlacements = new Set<string>();
const initializedPaths = new Set<string>();

export function EzoicAd({ id = "ezoic-ad", className = "", label = "Advertisement" }: EzoicAdProps) {
  const pathname = usePathname();
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current || !pathname) return;

    const placementKey = `${pathname}:${id}`;
    if (requestedPlacements.has(placementKey)) return;

    requestedRef.current = true;
    requestedPlacements.add(placementKey);

    runEzoic(() => {
      if (!initializedPaths.has(pathname)) {
        window.ezstandalone?.destroyAll?.();
        initializedPaths.add(pathname);
      }
      window.ezstandalone?.showAds({});
    });
  }, [id, pathname]);

  return (
    <div
      id={id}
      aria-label={label}
      className={`mx-auto flex w-full max-w-5xl items-center justify-center overflow-hidden px-2 py-3 ${className}`}
      style={{ minHeight: "120px" }}
    />
  );
}
