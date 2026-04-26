import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { Alexandria } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { LocaleDocumentSync } from "@/components/locale-document-sync";
import { getDirection, resolveLocale, SITE_LOCALE_COOKIE } from "@/lib/i18n";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-alexandria"
});

export const metadata: Metadata = {
  title: "Moroccan Trip | Voyages organises, reservations et location liee au voyage",
  description:
    "Moroccan Trip aide les utilisateurs a reserver des voyages organises avec des agences, acceder a la location d'equipements liee au voyage et trouver des partenaires de route en option."
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
            <LocaleDocumentSync />
            <Header />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
