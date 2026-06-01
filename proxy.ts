import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Platform domains / subdomains that should NOT be treated as tenants.
 * In production, replace with your actual domain(s).
 */
const PLATFORM_HOSTS = new Set([
  "localhost",
  "flightdesk.in",
  "www.flightdesk.in",
  "app.flightdesk.in",
]);

const PLATFORM_SUBDOMAINS = new Set(["www", "app", "admin", "api"]);

/**
 * Paths that skip middleware entirely — static assets, API routes,
 * Next.js internals.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = (request.headers.get("host") ?? "localhost").toLowerCase();

  /* Strip port from hostname (important for local dev) */
  const host = hostname.split(":")[0];

  /* ── If this is a platform domain, continue without tenant injection ── */
  if (PLATFORM_HOSTS.has(host)) {
    return NextResponse.next();
  }

  /* ── Check if this is a subdomain of a known platform root ─────────── */
  const parts = host.split(".");
  if (parts.length >= 2) {
    const subdomain = parts[0];

    /* e.g. www.flightdesk.in, app.flightdesk.in — not a tenant */
    if (PLATFORM_SUBDOMAINS.has(subdomain)) {
      return NextResponse.next();
    }

    /* ── It's a tenant subdomain (e.g. myagency.flightdesk.in) ─────── */
    const tenantSlug = subdomain;
    const response = NextResponse.next();

    /* Inject tenant slug as a response header and as a cookie so that:
     *  - The request headers header tells layout.tsx / server components
     *  - The cookie is readable by the client-side axios interceptor
     */
    response.headers.set("x-tenant-slug", tenantSlug);
    response.cookies.set("x-tenant-slug", tenantSlug, {
      path: "/",
      sameSite: "lax",
      httpOnly: false, /* must be readable by JS for axios interceptor */
    });

    return response;
  }

  return NextResponse.next();
}
