import type { Metadata } from "next";

type PageSeoOptions = {
  path: string;
  title: string;
  description?: string;
  languagePaths?: Record<string, string>;
  image?: { path: string; alt: string; width?: number | null; height?: number | null };
};

export function absoluteSiteUrl(path: string): string {
  return new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").href;
}

export function pageSeo({
  path,
  title,
  description,
  languagePaths,
  image,
}: PageSeoOptions): Metadata {
  const url = absoluteSiteUrl(path);
  const imageUrl = image ? absoluteSiteUrl(image.path) : undefined;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(languagePaths
        ? {
            languages: Object.fromEntries(
              Object.entries(languagePaths).map(([language, target]) => [
                language,
                absoluteSiteUrl(target),
              ]),
            ),
          }
        : {}),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Life Steel",
      ...(image && imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                alt: image.alt,
                ...(image.width ? { width: image.width } : {}),
                ...(image.height ? { height: image.height } : {}),
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export function listingQuery(
  incoming: Record<string, string | string[] | undefined>,
  keys: readonly string[],
): string {
  const query = new URLSearchParams();
  for (const key of keys) {
    const value = incoming[key];
    if (Array.isArray(value)) {
      value
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => query.append(key, item));
      continue;
    }
    if (typeof value !== "string" || !value.trim()) continue;
    if (key === "page") {
      const page = Number(value);
      if (Number.isSafeInteger(page) && page > 1 && page <= 1000000) query.set(key, String(page));
    } else query.set(key, value.trim());
  }
  return query.size ? `?${query}` : "";
}
