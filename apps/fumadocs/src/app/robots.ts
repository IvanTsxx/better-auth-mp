import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const url =
    process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://better-auth-mercadopago.vercel.app";

  return {
    rules: {
      allow: "/",
      userAgent: "*",
    },
    sitemap: `${url}/sitemap.xml`,
  };
}
