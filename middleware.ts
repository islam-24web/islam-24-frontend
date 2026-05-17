import { NextResponse, type NextRequest } from "next/server";

// Forwards pathname/query as request headers so server components (notably
// the root layout) can pick the right `<html lang>` per request — App Router
// root layouts don't receive params/searchParams directly.
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  headers.set("x-search", request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip Next.js internals, the /apps iframe shell (it owns its own <html>),
  // SEO files served by Route Handlers (robots.txt, sitemap.xml — they don't
  // need the locale header and shouldn't pay for the middleware roundtrip),
  // and any static asset extension. Explicit robots\\.txt and sitemap\\.xml
  // entries are belt-and-suspenders alongside the generic .txt/.xml extension
  // match below.
  matcher: [
    "/((?!_next|api|monitoring|apps|robots\\.txt|sitemap\\.xml|favicon\\.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml|js|css|woff2?)).*)",
  ],
};
