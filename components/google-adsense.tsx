"use client";

import { useEffect, useRef } from "react";

type GoogleAdSenseProps = {
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function GoogleAdSense({ className = "" }: GoogleAdSenseProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense may be unavailable while the account/site is still being reviewed.
    }
  }, []);

  return (
    <div className={`mx-auto my-8 w-full max-w-5xl overflow-hidden ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5658493317121341"
        data-ad-slot="1854084209"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
