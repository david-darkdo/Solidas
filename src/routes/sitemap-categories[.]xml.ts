import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getProductionOrigin } from "@/lib/origin";
import { normalizeCategorySlug, slugify } from "@/lib/slug";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(dateStr?: string | null, fallback = "2026-11-05"): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toISOString().split("T")[0];
  } catch {
    return fallback;
  }
}

export const Route = createFileRoute("/sitemap-categories.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = getProductionOrigin();

        const [typesRes, catsRes, subsRes, famsRes, prodsRes] = await Promise.all([
          supabase.from("product_types").select("id, name, slug, created_at, is_archived"),
          supabase.from("categories").select("id, name, slug, type_id, created_at, is_archived"),
          supabase.from("subcategories").select("id, name, slug, category_id, created_at, is_archived"),
          supabase.from("family_groups").select("id, name, slug, subcategory_id, created_at, is_archived"),
          supabase
            .from("products")
            .select("id, type_id, category_id, subcategory_id, family_id, updated_at, created_at")
            .eq("processing_state", "completed")
            .eq("status", "published")
            .eq("hidden", false)
            .is("deleted_at", null),
        ]);

        if (typesRes.error || catsRes.error || subsRes.error || famsRes.error || prodsRes.error) {
          console.error(
            "[sitemap-categories.xml] Database query failed:",
            typesRes.error || catsRes.error || subsRes.error || famsRes.error || prodsRes.error
          );
          return new Response("Error generating category sitemap", { status: 500 });
        }

        const types = (typesRes.data || []).filter((t: any) => !t.is_archived);
        const categories = (catsRes.data || []).filter((c: any) => !c.is_archived);
        const subcategories = (subsRes.data || []).filter((s: any) => !s.is_archived);
        const families = (famsRes.data || []).filter((f: any) => !f.is_archived);
        const products = prodsRes.data || [];

        const typeStats = new Map<string, { count: number; lastmod: string }>();
        const catStats = new Map<string, { count: number; lastmod: string }>();
        const subStats = new Map<string, { count: number; lastmod: string }>();
        const famStats = new Map<string, { count: number; lastmod: string }>();

        const recordStat = (map: Map<string, { count: number; lastmod: string }>, id: string | null, ts: string) => {
          if (!id) return;
          const prev = map.get(id);
          if (!prev) {
            map.set(id, { count: 1, lastmod: ts });
          } else {
            map.set(id, {
              count: prev.count + 1,
              lastmod: ts > prev.lastmod ? ts : prev.lastmod,
            });
          }
        };

        for (const p of products) {
          const ts = formatDate(p.updated_at || p.created_at);
          recordStat(typeStats, p.type_id, ts);
          recordStat(catStats, p.category_id, ts);
          recordStat(subStats, p.subcategory_id, ts);
          recordStat(famStats, p.family_id, ts);
        }

        const typeMap = new Map(types.map((t: any) => [t.id, t]));
        const catMap = new Map(categories.map((c: any) => [c.id, c]));
        const subMap = new Map(subcategories.map((s: any) => [s.id, s]));

        const seenLocs = new Set<string>();
        const urls: string[] = [];

        const addUrl = (loc: string, lastmod: string, changefreq: string, priority: string) => {
          if (!loc || seenLocs.has(loc)) return;
          seenLocs.add(loc);
          urls.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
        };

        // 1. Product Types (only populated types with >= 1 published product)
        for (const t of types) {
          const stat = typeStats.get(t.id);
          if (!stat || stat.count === 0) continue;
          const tSlug = slugify(t.slug || t.name);
          if (!tSlug) continue;
          addUrl(`${origin}/${tSlug}`, stat.lastmod || formatDate(t.created_at), "weekly", "0.9");
        }

        // 2. Categories (only populated categories with >= 1 published product)
        for (const c of categories) {
          const stat = catStats.get(c.id);
          if (!stat || stat.count === 0) continue;
          const parentType = typeMap.get(c.type_id);
          const tSlug = slugify(parentType?.slug || parentType?.name);
          const cSlug = normalizeCategorySlug(c.slug || c.name);
          if (!tSlug || !cSlug) continue;
          addUrl(`${origin}/${tSlug}/${cSlug}`, stat.lastmod || formatDate(c.created_at), "weekly", "0.8");
        }

        // 3. Subcategories (only populated subcategories with >= 1 published product)
        for (const s of subcategories) {
          const stat = subStats.get(s.id);
          if (!stat || stat.count === 0) continue;
          const parentCat = catMap.get(s.category_id);
          const parentType = parentCat ? typeMap.get(parentCat.type_id) : null;
          const tSlug = slugify(parentType?.slug || parentType?.name);
          const cSlug = normalizeCategorySlug(parentCat?.slug || parentCat?.name);
          const sSlug = slugify(s.slug || s.name);
          if (!tSlug || !cSlug || !sSlug) continue;
          addUrl(`${origin}/${tSlug}/${cSlug}/${sSlug}`, stat.lastmod || formatDate(s.created_at), "weekly", "0.8");
        }

        // 4. Family Groups (only populated family groups with >= 1 published product and valid parent hierarchy)
        for (const f of families) {
          const stat = famStats.get(f.id);
          if (!stat || stat.count === 0) continue;
          const fSlug = slugify(f.slug || f.name);
          if (!fSlug || !f.subcategory_id) continue;

          const parentSub = subMap.get(f.subcategory_id);
          const parentCat = parentSub ? catMap.get(parentSub.category_id) : null;
          const parentType = parentCat ? typeMap.get(parentCat.type_id) : null;
          const tSlug = slugify(parentType?.slug || parentType?.name);
          const cSlug = normalizeCategorySlug(parentCat?.slug || parentCat?.name);
          const sSlug = slugify(parentSub?.slug || parentSub?.name);
          if (tSlug && cSlug && sSlug) {
            addUrl(
              `${origin}/${tSlug}/${cSlug}/${sSlug}/${fSlug}`,
              stat.lastmod || formatDate(f.created_at),
              "weekly",
              "0.7"
            );
          }
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
