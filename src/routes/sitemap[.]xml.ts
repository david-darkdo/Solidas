import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getProductionOrigin } from "@/lib/origin";

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

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getProductionOrigin(request);

        const latestProdRes = await supabase
          .from("products")
          .select("updated_at, created_at")
          .eq("processing_state", "completed")
          .eq("status", "published")
          .eq("hidden", false)
          .is("deleted_at", null)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const latestProductDate = formatDate(
          latestProdRes.data?.updated_at || latestProdRes.data?.created_at,
          "2026-11-05"
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${origin}/sitemap-pages.xml</loc>
    <lastmod>${latestProductDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/sitemap-categories.xml</loc>
    <lastmod>${latestProductDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/sitemap-products.xml</loc>
    <lastmod>${latestProductDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/sitemap-images.xml</loc>
    <lastmod>${latestProductDate}</lastmod>
  </sitemap>
</sitemapindex>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=18000",
          },
        });
      },
    },
  },
});
