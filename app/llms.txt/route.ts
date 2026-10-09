const SITE_URL = process.env.SITE_PUBLIC_ORIGIN || "https://shadesology.com";

export function GET() {
  const siteOrigin = new URL(SITE_URL).origin;
  const content = `# Shadesology

> Premium custom shade solutions for residential and commercial spaces.

Shadesology provides custom retractable awnings, pergolas, louvered roofs, shade sails, screens, pool covers, and related shade products.

## Product discovery
- [All products](${siteOrigin}/products)
- [Product categories](${siteOrigin}/sitemap)
- [Site sitemap](${siteOrigin}/sitemap.xml)
- [Search products and content](${siteOrigin}/search)
- [Product comparison](${siteOrigin}/compare)

## Helpful information
- [Frequently asked questions](${siteOrigin}/support/faq)
- [Support center](${siteOrigin}/support)
- [Resource library](${siteOrigin}/resources)
- [About Shadesology](${siteOrigin}/about)
- [Contact Shadesology](${siteOrigin}/contact)
- [Request a quote](${siteOrigin}/quote)

Use published product pages for current specifications and availability. Product configuration, pricing, and orderability are determined by the live storefront and may vary by customer and selection. Follow the site's robots.txt for crawler access guidance.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
