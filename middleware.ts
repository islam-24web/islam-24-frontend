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
  // Skip Next.js internals, static assets, and the /apps iframe shell
  // (it owns its own <html> and must not be wrapped a second time).
  matcher: ["/((?!_next|api|monitoring|apps|favicon\\.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml|js|css|woff2?)).*)"],
};
