import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://better-auth-mp.vercel.app");

  return [
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 1,
      url,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${url}/dashboard`,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${url}/marketplace`,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${url}/subscriptions`,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${url}/payments`,
    },
  ];
}
