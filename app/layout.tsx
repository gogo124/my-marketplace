import type { Metadata } from "next"
import { Suspense } from "react"
import Script from "next/script"
import { cookies, headers } from "next/headers"
import { Alexandria } from "next/font/google"
import { auth } from "@/auth"
import { Analytics } from "@vercel/analytics/next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import LocaleProvider from "@/components/locale-provider"
import { PublicEzoicPlacement } from "@/components/public-ezoic-placement"
import EzoicRouteHandler from "@/components/ezoic-route-handler"
import { getLocale, getDirection } from "@/lib/i18n"
import { getSiteMetadata } from "@/lib/seo"

const alexandria = Alexandria({
  subsets: ["arabic"],
  variable: "--font-alexandria",
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  return getSiteMetadata()
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const session = await auth()
  const locale = getLocale(cookieStore.get("locale")?.value || headerStore.get("accept-language"))
  const direction = getDirection(locale)

  return (
    <html lang={locale} dir={direction} className={alexandria.variable} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5658493317121341" />
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5658493317121341"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Script
          async
          src="https://cmp.gatekeeperconsent.com/min.js"
          strategy="beforeInteractive"
        />
        <Script
          async
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          strategy="beforeInteractive"
        />
        <Script
          async
          src="https://www.ezojs.com/ezoic/sa.min.js"
          strategy="afterInteractive"
        />
        <Script
          id="ezoic-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.ezstandalone = window.ezstandalone || {};`,
          }}
        />
        <Script
          async
          src="https://ezoicanalytics.com/analytics.js"
          strategy="afterInteractive"
        />
        <Script
          id="monetag-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(() => { const s = document.createElement('script'); s.src = 'https://fpyf8.com/88/tag.min.js'; s.dataset.zone = '11763471'; s.async = true; s.referrerPolicy = 'no-referrer-when-downgrade'; document.head.appendChild(s); })();`,
          }}
        />
      </head>
      <body>
        <LocaleProvider locale={locale}>
          <Header session={session} />
          <main>{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <PublicEzoicPlacement />
            <EzoicRouteHandler />
          </Suspense>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
