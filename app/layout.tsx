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
  title: {
    default: "Moroccan Trip | Voyages, agences, camping et equipements au Maroc",
    template: "%s | Moroccan Trip"
  },
  description:
    "Moroccan Trip reunit voyages organises, agences verifiees, equipements, lieux de camping et partenaires de route dans une experience plus claire et plus fiable.",
  keywords: [
    "Moroccan Trip",
    "voyage Maroc",
    "agence voyage Maroc",
    "camping Maroc",
    "location equipement",
    "trip code",
    "partenaire voyage"
  ],
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png"
  },
  category: "travel",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Moroccan Trip | Voyages, agences, camping et equipements au Maroc",
    description:
      "Une plateforme marocaine plus claire pour decouvrir des agences, reserver des voyages, louer ou acheter du materiel et trouver les bons spots de camping.",
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
      "Agences verifiees, voyages organises, camping et equipements au Maroc.",
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Moroccan Trip",
    url: siteUrl,
    logo: `${siteUrl}/logo.jpeg`,
    sameAs: [],
    description:
      locale === "ar"
        ? "منصة مغربية تجمع الرحلات المنظمة، الوكالات، التخييم والمعدات في تجربة أوضح وأسهل."
        : "Plateforme marocaine qui reunit voyages organises, agences, camping et equipements dans une experience plus simple."
  };

  return (
    <html lang={locale} dir={getDirection(locale)}>
      <body className={`${alexandria.variable} bg-app text-slate-900`}>
        <a href="#main-content" className="skip-link">
          {locale === "ar" ? "تجاوز إلى المحتوى" : "Aller au contenu"}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <AuthProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
            <LocaleDocumentSync />
            <Header />
          </Suspense>
          <div id="main-content">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
