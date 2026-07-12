import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("transitops_session");
  const { pathname } = request.nextUrl;

  // List of path prefixes that represent authenticated routes
  const authenticatedPrefixes = [
    "/dashboard",
    "/fleet",
    "/drivers",
    "/trips",
    "/maintenance",
    "/fuel-expenses",
    "/analytics",
    "/settings"
  ];

  const isAuthRoute = authenticatedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!session && isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/fleet/:path*",
    "/drivers/:path*",
    "/trips/:path*",
    "/maintenance/:path*",
    "/fuel-expenses/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
