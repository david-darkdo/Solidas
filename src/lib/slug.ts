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

const LEGACY_CATEGORY_SLUG_MAP: Record<string, string> = {
  "ceramics-tiles": "ceramics",
  "ceramic-tiles": "ceramics",
  "foreign-doors": "foreign",
  "exterior-doors": "foreign",
  "granite-tiles": "granite",
  "local-doors": "local",
  "marble-tiles": "marble",
};

/**
 * Normalizes category slugs, mapping legacy malformed category slugs
 * (e.g. "ceramics tiles ", "ceramics-tiles", "foreign Doors ", "foreign-doors")
 * to their clean canonical slug ("ceramics", "foreign", "granite", "local", "marble").
 */
export function normalizeCategorySlug(text: string | null | undefined): string {
  const s = slugify(text);
  return LEGACY_CATEGORY_SLUG_MAP[s] || s;
}

