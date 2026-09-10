"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { runEzoic } from "@/lib/ezoic";

export function EzoicRouteHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    runEzoic(() => {
      window.ezstandalone?.destroyAll?.();
    });
  }, [pathname]);

  return null;
}
