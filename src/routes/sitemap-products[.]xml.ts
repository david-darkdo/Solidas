import { createFileRoute } from '@tanstack/react-router'
import { getProductionOrigin } from "@/lib/origin";

export const Route = createFileRoute("/sitemap-products.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getProductionOrigin(request);
        const now = new Date().toISOString();
        const urls: { loc: string; lastmod: string }[] = [];

        try {
          const { data: products } = await supabase
            .from("products" as any)
            .select("slug, updated_at, created_at")
            .eq("status", "published")
            .eq("hidden", false)
            .is("deleted_at", null);

          if (products) {
            for (const p of (products as any[])) {
              if (p.slug) {
                urls.push({
                  loc: `${origin}/product/${p.slug}`,
                  lastmod: p.updated_at || p.created_at || now,
                });
              }
            }
          }
        } catch (err) {
          console.error("Failed to generate sitemap-products:", err);
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
    <priority>0.9</priority>
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
