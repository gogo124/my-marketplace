import type { Metadata } from "next";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://moroccantrip.net" : "http://localhost:3000");
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getSiteUrl()).toString();
}

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = "/images/hero-main.jpg"
}: MetadataInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: "Moroccan Trip",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: absoluteUrl(image),
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)]
    }
  };
}
