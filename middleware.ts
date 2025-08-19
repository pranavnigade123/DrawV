// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAssetOrApiPath, isPublicPath, buildLoginRedirect, buildUnauthorizedRedirect } from "./lib/middleware/helpers";
import { getUserToken, isAuthenticated, isAdmin } from "./lib/middleware/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow assets and API by default (mutations are protected server-side)
  if (isAssetOrApiPath(pathname)) {
    return NextResponse.next();
  }

  // Allow public pages
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Protected areas
  const needsAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  const token = await getUserToken(req);
  if (needsAuth && !isAuthenticated(token)) {
    return buildLoginRedirect(req, pathname);
  }

  // Admin-only area
  if (pathname.startsWith("/admin") && !isAdmin(token)) {
    return buildUnauthorizedRedirect(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
