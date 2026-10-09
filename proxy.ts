import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "./i18n/config";

const LOCALE_COOKIE = "site-locale";

export function proxy(request: NextRequest) {
  const publicOrigin = process.env.SITE_PUBLIC_ORIGIN;
  if (process.env.NODE_ENV === "production" && publicOrigin) {
    const canonicalOrigin = new URL(publicOrigin);
    if (canonicalOrigin.protocol !== "https:") {
      throw new Error("SITE_PUBLIC_ORIGIN must use HTTPS in production.");
    }

    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    const isHttps = forwardedProtocol
      ? forwardedProtocol === "https"
      : request.nextUrl.protocol === "https:";
    if (!isHttps) {
      const secureUrl = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, canonicalOrigin);
      return NextResponse.redirect(secureUrl, 308);
    }
  }

  const url = request.nextUrl.clone();
  const segments = url.pathname.split("/").filter(Boolean);
  const routeLocale = segments[0];

  if (isLocale(routeLocale)) {
    if (routeLocale === DEFAULT_LOCALE) {
      url.pathname = `/${segments.slice(1).join("/")}` || "/";
      const response = NextResponse.redirect(url, 308);
      response.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
      });
      return response;
    }

    url.pathname = `/${segments.slice(1).join("/")}` || "/";
    const headers = new Headers(request.headers);
    headers.set("x-site-locale", routeLocale);
    headers.set("x-site-route-path", url.pathname);
    const response = NextResponse.rewrite(url, { request: { headers } });
    response.cookies.set(LOCALE_COOKIE, routeLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }

  const forwardedLocale = request.headers.get("x-site-locale");
  const forwardedPath = request.headers.get("x-site-route-path");
  if (isLocale(forwardedLocale ?? undefined) && forwardedPath === url.pathname) {
    const headers = new Headers(request.headers);
    return NextResponse.next({ request: { headers } });
  }

  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(savedLocale) && savedLocale !== DEFAULT_LOCALE) {
    url.pathname = `/${savedLocale}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const headers = new Headers(request.headers);
  headers.set("x-site-locale", DEFAULT_LOCALE);
  headers.set("x-site-route-path", url.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpe?g|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)"],
};
