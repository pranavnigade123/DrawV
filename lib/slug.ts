// lib/slug.ts

/**
 * Basic slugifier: lowercases, trims, replaces non-alphanumerics with hyphens,
 * collapses repeats, and trims leading/trailing hyphens.
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Given a base slug and a list of existing slugs, returns a unique slug by
 * suffixing -2, -3, ... if needed.
 * You can adapt this to query the DB instead of passing an array.
 */
export function uniqueSlugFromList(base: string, existing: string[]): string {
  const set = new Set(existing);
  if (!set.has(base)) return base;
  let i = 2;
  while (set.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
