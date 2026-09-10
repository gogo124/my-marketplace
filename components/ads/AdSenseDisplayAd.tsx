"use client";

import { useEffect } from "react";

const ADSENSE_CLIENT = "ca-pub-5658493317121341";
const ADSENSE_SLOT = "1854084209";

type AdsByGoogleWindow = Window & {
  adsbygoogle?: unknown[];
};

export function AdSenseDisplayAd({ id }: { id: string }) {
  useEffect(() => {
    try {
      const win = window as AdsByGoogleWindow;
      const ads = win.adsbygoogle || [];
      ads.push({});
      win.adsbygoogle = ads;
    } catch {
      // AdSense may not be available yet.
    }
  }, []);

  return (
    <div
      className="w-full overflow-hidden rounded-[1.5rem] bg-white/80 py-2"
      aria-label="Advertisement"
    >
      <ins
        id={id}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
