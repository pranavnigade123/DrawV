// lib/middleware/paths.ts
export const PUBLIC_PATHS = [
  "/", 
  "/about",
  "/login",
  "/register",
  "/tournaments",  // Keep this for browsing
  "/events",
  "/public-tools",
  "/veto",
  "/veto/bo1",
  "/veto/bo3",
  "/veto/bo5",
  "/theme-preview",
  "/contact",
  "/unauthorized",
  "/playmax/register",
  // REMOVED: "/tournaments/[slug]/register" - now protected
];

export function isPublicPath(pathname: string) {
  // Check exact matches or prefixes
  return PUBLIC_PATHS.some((p) => {
    if (p === "/tournaments") {
      return pathname === "/tournaments" || pathname.startsWith("/tournaments/") && !pathname.startsWith("/tournaments/") && !pathname.match(/^\/tournaments\/[^/]+\/register(\/.*)?$/);
    }
    return pathname === p || pathname.startsWith(p + "/");
  });
}