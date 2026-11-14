import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getProductionOrigin } from "@/lib/origin";
import { getCanonicalProductSlug, getCanonicalProductUrl } from "@/lib/product-url";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export const Route = createFileRoute("/sitemap-products.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = getProductionOrigin();

        const { data: products, error } = await supabase
          .from("products")
          .select("id, slug, name, updated_at, created_at")
          .eq("processing_state", "completed")
          .eq("status", "published")
          .eq("hidden", false)
          .is("deleted_at", null)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("[sitemap-products.xml] Database query failed:", error);
          return new Response("Error generating product sitemap", { status: 500 });
        }

        const seenLocs = new Set<string>();
        const urls: string[] = [];

        for (const p of products || []) {
          const slug = getCanonicalProductSlug(p);
          if (!slug || slug.startsWith("draft-")) continue;
          const loc = getCanonicalProductUrl(p, origin);
          if (seenLocs.has(loc)) continue;
          seenLocs.add(loc);

          const lastmod = formatDate(p.updated_at || p.created_at);
          urls.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
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
