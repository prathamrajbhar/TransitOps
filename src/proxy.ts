/**
 * src/middleware.ts
 * Protected route enforcement using JWT session cookies.
 *
 * Per the Next.js 16 auth guide (middleware pattern):
 * https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional
 *
 * Flow:
 *  - Protected routes (/dashboard/**) → redirect to /login if no valid session
 *  - Auth routes (/login, /signup)    → redirect to /dashboard if already logged in
 *  - API routes                        → return 401 JSON if no valid session
 */
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";
import { SESSION_COOKIE_NAME } from "./lib/constants";

// ─── Route configuration ─────────────────────────────────────────

const PROTECTED_ROUTES = [
  "/dashboard",
  "/fleet",
  "/drivers",
  "/trips",
  "/maintenance",
  "/fuel-expenses",
  "/analytics",
  "/settings"
];
const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_API_PREFIX = "/api";
// These API routes are always public (no session required)
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/session",
  "/api/health",
];

// ─── Proxy handler ───────────────────────────────────────────────

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Decode the session token from cookie (no DB hit — optimistic check)
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session = null;
  let isAuthenticated = false;
  let isMockSession = false;

  if (token) {
    session = await decrypt(token);
    if (session?.userId) {
      isAuthenticated = true;
    } else {
      // Fallback for mock session JSON cookies
      try {
        const decoded = decodeURIComponent(token);
        const parsed = JSON.parse(decoded);
        if (parsed && (parsed.id || parsed.userId)) {
          isAuthenticated = true;
          isMockSession = true;
        }
      } catch {
        // Ignore parsing error
      }
    }
  }

  // ── Protected page routes ──────────────────────────────────────
  const isProtectedPage = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth page routes (redirect if already logged in) ───────────
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // ── Protected API routes ───────────────────────────────────────
  const isPublicApi = PUBLIC_API_ROUTES.includes(pathname);
  const isProtectedApi =
    pathname.startsWith(PROTECTED_API_PREFIX) && !isPublicApi;

  if (isProtectedApi && !isAuthenticated) {
    return NextResponse.json(
      { success: false, error: "Authentication required", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  // ── Refresh session on every authenticated request ─────────────
  // (Slides the 7-day expiry window forward)
  const response = NextResponse.next();
  if (isAuthenticated && token && !isMockSession) {
    // Re-set the cookie with extended expiry
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

// ─── Matcher ─────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - _next/static (static files)
     *   - _next/image  (image optimization)
     *   - favicon.ico / public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
