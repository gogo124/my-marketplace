import type { Metadata } from "next";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://www.moroccantrip.net" : "http://localhost:3000");
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getSiteUrl()).toString();
}

type SiteLocale = "ar" | "fr" | "en";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  locale?: SiteLocale;
  indexable?: boolean;
};

function normalizeTitle(value: string) {
  const withoutBrand = value.replace(/\s*\|\s*Moroccan\s*Trip\s*$/i, "").trim();
  const branded = /\bMoroccan\s*Trip\b/i.test(withoutBrand)
    ? withoutBrand
    : `${withoutBrand} | Moroccan Trip`;

  if (branded.length <= 60) return branded;
  const shortened = branded.slice(0, 57);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 38 ? lastSpace : 57).trim()}…`;
}

function normalizeDescription(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 160) return cleaned;

  const shortened = cleaned.slice(0, 157);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 120 ? lastSpace : 157).trim()}…`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = "/images/hero-main.jpg",
  locale,
  indexable = true
}: MetadataInput): Metadata {
  const finalTitle = normalizeTitle(title);
  const finalDescription = normalizeDescription(description);
  const canonicalPath = locale && locale !== "ar" ? `${path}?lang=${locale}` : path;
  const languages = locale
    ? {
        ar: absoluteUrl(path),
        fr: absoluteUrl(`${path}?lang=fr`),
        en: absoluteUrl(`${path}?lang=en`),
        "x-default": absoluteUrl(path)
      }
    : undefined;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords,
    alternates: {
      canonical: canonicalPath,
      ...(languages ? { languages } : {})
    },
    robots: {
      index: indexable,
      follow: true
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: absoluteUrl(canonicalPath),
      siteName: "Moroccan Trip",
      locale: locale === "ar" ? "ar_MA" : locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
      images: [
        {
          url: absoluteUrl(image),
          alt: finalTitle
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [absoluteUrl(image)]
    }
  };
}
