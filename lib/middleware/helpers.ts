// lib/middleware/helpers.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPublicPath as isPublic } from "./paths";

export function isAssetOrApiPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    /\.(.*)$/.test(pathname)
  );
}

export function isPublicPath(pathname: string) {
  return isPublic(pathname);
}

export function buildLoginRedirect(req: NextRequest, callbackPath: string) {
  const url = new URL("/login", req.url);
  url.searchParams.set("callbackUrl", callbackPath);
  return NextResponse.redirect(url);
}

export function buildUnauthorizedRedirect(req: NextRequest) {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}
