import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { Alexandria } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Header } from "@/components/header";
import { LocaleDocumentSync } from "@/components/locale-document-sync";
import { getDirection, resolveLocale, SITE_LOCALE_COOKIE } from "@/lib/i18n";
import "./globals.css";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-alexandria"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Moroccan Trip | Voyages organises, reservations et location liee au voyage",
  description:
    "Moroccan Trip aide les utilisateurs a reserver des voyages organises avec des agences, acceder a la location d'equipements liee au voyage et trouver des partenaires de route en option.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Moroccan Trip | Voyages organises, reservations et location liee au voyage",
    description:
      "Une plateforme marocaine pour les voyages organises, la location d'equipement, les annonces et les partenaires de route.",
    siteName: "Moroccan Trip",
    images: [
      {
        url: "/images/hero-main.jpg",
        width: 1600,
        height: 900,
        alt: "Moroccan Trip"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Moroccan Trip",
    description:
      "Voyages organises, reservations, location d'equipements et partenaires de route au Maroc.",
    images: ["/images/hero-main.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const locale = resolveLocale(
    requestHeaders.get("x-site-locale") || cookieStore.get(SITE_LOCALE_COOKIE)?.value
  );

  return (
    <html lang={locale} dir={getDirection(locale)}>
      <body className={alexandria.variable}>
        <AuthProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
            <LocaleDocumentSync />
            <Header />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
