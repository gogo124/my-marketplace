"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { runEzoic } from "@/lib/ezoic";

type EzoicAdProps = {
  id?: string;
  className?: string;
  label?: string;
};

let lastRequestedPath = "";

export function EzoicAd({ id, className = "", label = "Advertisement" }: EzoicAdProps) {
  const pathname = usePathname();
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current || !pathname || lastRequestedPath === pathname) return;

    requestedRef.current = true;
    lastRequestedPath = pathname;

    runEzoic(() => {
      window.ezstandalone?.showAds({});
    });
  }, [pathname]);

  return (
    <div
      id={id}
      aria-label={label}
      className={`mx-auto flex w-full max-w-5xl items-center justify-center overflow-hidden px-2 py-3 ${className}`}
      style={{ minHeight: "120px" }}
    />
  );
}
