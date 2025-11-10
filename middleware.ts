import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isAssetOrApiPath,
  isPublicPath,
  buildLoginRedirect,
  buildUnauthorizedRedirect,
} from "./lib/middleware/helpers";
import { getUserToken, isAuthenticated, isAdmin } from "./lib/middleware/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow static assets, _next, and API routes
  if (isAssetOrApiPath(pathname)) {
    return NextResponse.next();
  }

  // 2. Allow explicitly public paths (home, about, tournaments list, etc.)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getUserToken(req);

  // 3. Protect: /dashboard, /admin
  const needsAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  if (needsAuth && !isAuthenticated(token)) {
    return buildLoginRedirect(req, pathname);
  }

  // 4. Protect: /tournaments/[slug]/register 
  const isRegisterPath = /^\/tournaments\/[^/]+\/register(\/.*)?$/.test(pathname);
  if (isRegisterPath && !isAuthenticated(token)) {
    return buildLoginRedirect(req, pathname);
  }

  // 5. Admin-only routes
  if (pathname.startsWith("/admin") && !isAdmin(token)) {
    return buildUnauthorizedRedirect(req);
  }

  // 6. All other routes: allow (but can be protected per-page)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};