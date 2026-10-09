import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

function configuredOrigins(...values: (string | undefined)[]) {
  return values.flatMap((value) => (value ?? "").split(","))
    .map((value) => {
      try {
        return new URL(value.trim()).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
}

const isProduction = process.env.NODE_ENV === "production";
const storageOrigins = configuredOrigins(
  process.env.S3_PUBLIC_BASE_URL,
  process.env.S3_PRIVATE_BASE_URL,
  process.env.PAYLOAD_ADMIN_ORIGIN,
  process.env.S3_CSP_ORIGINS,
).filter((origin) => !isProduction || origin.startsWith("https://"));
const apiOrigins = configuredOrigins(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.CSP_CONNECT_SRC,
).filter((origin) => !isProduction || origin.startsWith("https://"));
const developmentSources = process.env.NODE_ENV === "development" ? ["'unsafe-eval'", "ws:"] : [];
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://connect.facebook.net ${developmentSources.filter((source) => source === "'unsafe-eval'").join(" ")}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://cdn.shadesology.com https://images.unsplash.com https://via.placeholder.com https://www.facebook.com ${storageOrigins.join(" ")}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' https://api.stripe.com https://m.stripe.network https://connect.facebook.net https://www.facebook.com ${apiOrigins.join(" ")} ${storageOrigins.join(" ")} ${developmentSources.filter((source) => source === "ws:").join(" ")}`.trim(),
  `frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube-nocookie.com https://player.vimeo.com https://fast.wistia.net ${configuredOrigins(process.env.PAYLOAD_ADMIN_ORIGIN).join(" ")}`.trim(),
].join("; ");

const nextConfig: NextConfig = {
  distDir:
    process.env.NEXT_BUILD_DIST_DIR ||
    (process.env.PHASE1_E2E === "true" ? ".next-phase1-e2e" : ".next"),
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shadesology.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
    ];
    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
    }
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withPayload(nextConfig);
