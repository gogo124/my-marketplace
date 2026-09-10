"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { runEzoic } from "@/lib/ezoic";

type EzoicAdProps = {
  id?: string;
  className?: string;
  label?: string;
};

export function EzoicAd({ id = "ezoic-ad", className = "", label = "Advertisement" }: EzoicAdProps) {
  const pathname = usePathname();
  const handledPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || handledPath.current === pathname) return;

    handledPath.current = pathname;
    runEzoic(() => {
      window.ezstandalone?.showAds({ anchor: id });
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
