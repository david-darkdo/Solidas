/**
 * Authoritative Slug Normalization Function
 * 
 * Guarantees:
 * - Lowercase
 * - Trimmed whitespace
 * - Spaces converted to single hyphens
 * - Multiple hyphens collapsed
 * - Leading and trailing hyphens removed
 * - Unsafe URL characters removed
 */
export function slugify(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")          // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start of text
    .replace(/-+$/, "");            // Trim - from end of text
}
