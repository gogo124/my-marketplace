import Script from "next/script";

const PROFIT_AD_ID = "container-3ed4e64617d2fd2b0b64c17a5b2bcaff";
const PROFIT_AD_SCRIPT = "https://pl30264025.profitableratecpmnetwork.com/3ed4e64617d2fd2b0b64c17a5b2bcaff/invoke.js";

export function ProfitAd() {
  return (
    <div className="w-full min-w-0 overflow-hidden" aria-label="Advertisement">
      <Script
        id="profitableratecpm-ad"
        src={PROFIT_AD_SCRIPT}
        strategy="afterInteractive"
        async
        data-cfasync="false"
      />
      <div id={PROFIT_AD_ID} className="w-full min-w-0 overflow-hidden" />
    </div>
  );
}
