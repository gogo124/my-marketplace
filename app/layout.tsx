import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { cookies, headers } from "next/headers";
import { Alexandria } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { LocaleDocumentSync } from "@/components/locale-document-sync";
import { PublicEzoicPlacement } from "@/components/ads/PublicEzoicPlacement";
import { EzoicRouteHandler } from "@/components/ads/EzoicRouteHandler";
import { getDirection, resolveLocale, SITE_LOCALE_COOKIE } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-alexandria"
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Moroccan Trip | رحلات وتخييم وكراء معدات في المغرب", template: "%s | Moroccan Trip" },
  description: "اكتشف رحلات منظمة، أماكن تخييم، كراء وشراء معدات camping، ورفيق سفر في المغرب عبر منصة Moroccan Trip.",
  keywords: ["Moroccan Trip", "trip Morocco", "camping Morocco", "تخييم المغرب", "رحلات منظمة المغرب", "كراء معدات التخييم", "أماكن التخييم في المغرب", "رفيق سفر المغرب", "voyage Maroc", "camping Maroc", "location equipement camping", "trip space"],
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/favicon.ico" }, { url: "/icon-32.png", sizes: "32x32", type: "image/png" }, { url: "/icon-48.png", sizes: "48x48", type: "image/png" }], apple: "/apple-touch-icon.png" },
  category: "travel",
  openGraph: { type: "website", locale: "fr_FR", title: "Moroccan Trip | رحلات وتخييم وكراء معدات في المغرب", description: "اكتشف رحلات منظمة، أماكن تخييم، كراء وشراء معدات camping، ورفيق سفر في المغرب عبر منصة Moroccan Trip.", siteName: "Moroccan Trip", images: [{ url: "/images/hero-main.jpg", width: 1600, height: 900, alt: "Moroccan Trip" }] },
  twitter: { card: "summary_large_image", title: "Moroccan Trip | رحلات وتخييم وكراء معدات في المغرب", description: "اكتشف رحلات منظمة، أماكن تخييم، كراء وشراء معدات camping، ورفيق سفر في المغرب.", images: ["/images/hero-main.jpg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const locale = resolveLocale(requestHeaders.get("x-site-locale") || cookieStore.get(SITE_LOCALE_COOKIE)?.value);
  const siteUrl = getSiteUrl();
  const organizationSchema = { "@context": "https://schema.org", "@type": "Organization", name: "Moroccan Trip", url: siteUrl, logo: `${siteUrl}/logo.jpeg`, sameAs: [], description: locale === "ar" ? "منصة مغربية للرحلات المنظمة، التخييم، كراء وشراء المعدات، ورفيق السفر." : "Plateforme marocaine pour voyages organises, camping, location et achat de materiel, et compagnon de voyage." };

  return (
    <html lang={locale} dir={getDirection(locale)}>
      <head>
        <Script
          id="ezoic-cmp"
          src="https://cmp.gatekeeperconsent.com/min.js"
          strategy="beforeInteractive"
          data-cfasync="false"
        />
        <Script
          id="ezoic-cmp-2"
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          strategy="beforeInteractive"
          data-cfasync="false"
        />
        <Script
          id="ezoic-sa"
          src="https://www.ezojs.com/ezoic/sa.min.js"
          strategy="afterInteractive"
        />
        <Script id="ezoic-init" strategy="afterInteractive">
          {`
            window.ezstandalone = window.ezstandalone || {};
            window.ezstandalone.cmd = window.ezstandalone.cmd || [];
          `}
        </Script>
        <Script
          id="ezoic-analytics"
          src="https://ezoicanalytics.com/analytics.js"
          strategy="afterInteractive"
        />
        <Script id="monetag-tag-11763471" strategy="afterInteractive">
          {`(function(s){s.dataset.zone='11763471',s.src='https://nap5k.com/tag.min.js'})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
        </Script>
      </head>
      <body className={`${alexandria.variable} bg-app text-slate-900`}>
        <a href="#main-content" className="skip-link">{locale === "ar" ? "تجاوز إلى المحتوى" : "Aller au contenu"}</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <AuthProvider>
          <EzoicRouteHandler />
          <Suspense fallback={null}><AnalyticsTracker /><LocaleDocumentSync /><Header /></Suspense>
          <div id="main-content">{children}</div>
          <PublicEzoicPlacement />
          <SiteFooter lang={locale} />
        </AuthProvider>
      </body>
    </html>
  );
}
