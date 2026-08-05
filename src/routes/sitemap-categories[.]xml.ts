// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sitemap-categories.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const now = new Date().toISOString();
        const urls: { loc: string; lastmod: string; priority: string }[] = [];

        try {
          // 1. Types
          const { data: types } = await supabase.from("product_types" as any).select("slug, updated_at");
          if (types) {
            for (const t of (types as any[])) {
              if (t.slug) {
                urls.push({ loc: `${origin}/${t.slug}`, lastmod: t.updated_at || now, priority: "0.9" });
              }
            }
          }

          // 2. Categories
          const { data: categories } = await supabase
            .from("categories" as any)
            .select("slug, updated_at, product_types(slug)");
          if (categories) {
            for (const c of (categories as any[])) {
              const typeSlug = c.product_types?.slug;
              if (typeSlug && c.slug) {
                urls.push({ loc: `${origin}/${typeSlug}/${c.slug}`, lastmod: c.updated_at || now, priority: "0.85" });
              }
            }
          }

          // 3. Subcategories
          const { data: subcategories } = await supabase
            .from("subcategories" as any)
            .select("slug, updated_at, categories(slug, product_types(slug))");
          if (subcategories) {
            for (const s of (subcategories as any[])) {
              const catSlug = s.categories?.slug;
              const typeSlug = s.categories?.product_types?.slug;
              if (typeSlug && catSlug && s.slug) {
                urls.push({ loc: `${origin}/${typeSlug}/${catSlug}/${s.slug}`, lastmod: s.updated_at || now, priority: "0.8" });
              }
            }
          }

          // 4. Families
          const { data: families } = await supabase
            .from("family_groups" as any)
            .select("slug, subcategory_id, category_id, updated_at");
          if (families) {
            const { data: allCats } = await supabase.from("categories" as any).select("id, slug, product_types(slug)");
            const { data: allSubs } = await supabase.from("subcategories" as any).select("id, slug, categories(slug, product_types(slug))");
            const catMap = new Map(allCats?.map((c: any) => [c.id, c]));
            const subMap = new Map(allSubs?.map((s: any) => [s.id, s]));

            for (const f of (families as any[])) {
              if (f.slug) {
                if (f.subcategory_id && subMap.has(f.subcategory_id)) {
                  const sub = subMap.get(f.subcategory_id);
                  const subSlug = sub?.slug;
                  const catSlug = sub?.categories?.slug;
                  const typeSlug = sub?.categories?.product_types?.slug;
                  if (typeSlug && catSlug && subSlug) {
                    urls.push({ loc: `${origin}/${typeSlug}/${catSlug}/${subSlug}/${f.slug}`, lastmod: f.updated_at || now, priority: "0.75" });
                  }
                } else if (f.category_id && catMap.has(f.category_id)) {
                  const cat = catMap.get(f.category_id);
                  const catSlug = cat?.slug;
                  const typeSlug = cat?.product_types?.slug;
                  if (typeSlug && catSlug) {
                    urls.push({ loc: `${origin}/${typeSlug}/${catSlug}/all/${f.slug}`, lastmod: f.updated_at || now, priority: "0.75" });
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Failed to generate sitemap-categories:", err);
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (u) => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=18000",
          },
        });
      },
    },
  },
});
