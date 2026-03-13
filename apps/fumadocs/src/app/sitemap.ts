import type { MetadataRoute } from "next";

import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const url =
    process.env.NEXT_PUBLIC_APP_URL || "https://better-auth-mp.vercel.app";

  return [
    {
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
      url: `${url}/en`,
    },
    {
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
      url: `${url}/es`,
    },
    ...source.getPages().map((page) => ({
      changeFrequency: "weekly" as const,
      lastModified: page.data.lastModified
        ? new Date(page.data.lastModified)
        : new Date(),
      priority: 0.8,
      url: `${url}/${page.locale}${page.url}`,
    })),
  ];
}
