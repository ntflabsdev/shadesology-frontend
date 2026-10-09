import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_PUBLIC_ORIGIN || "https://shadesology.com";

export default function robots(): MetadataRoute.Robots {
  const siteOrigin = new URL(SITE_URL).origin;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/account/",
        "/cart/",
        "/checkout/",
        "/quote/status/",
        "/login",
        "/register",
        "/reset-password/",
        "/verify-email/",
        "/dev/",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteOrigin).toString(),
    host: siteOrigin,
  };
}
