// lib/middleware/paths.ts
export const PUBLIC_PATHS = [
  "/",
  "/about",
  "/login",
  "/register",
  "/tournaments",
  "/events",
  "/public-tools",
  "/veto",
  "/veto/bo1",
  "/veto/bo3",
  "/veto/bo5",
  "/theme-preview",
  "/contact",
  "/unauthorized",
];

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
