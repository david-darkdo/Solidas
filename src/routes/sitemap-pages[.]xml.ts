import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getProductionOrigin } from "@/lib/origin";

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

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = getProductionOrigin();

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

        const catalogLastmod = formatDate(
          latestProdRes.data?.updated_at || latestProdRes.data?.created_at,
          "2026-11-05"
        );
        const staticReleaseDate = "2026-11-05";

        // Only canonical, indexable static pages (excludes /auth, /collection, /search, /account, /admin)
        const staticPages = [
          { path: "/", lastmod: catalogLastmod, priority: "1.0", changefreq: "daily" },
          { path: "/home", lastmod: staticReleaseDate, priority: "0.8", changefreq: "weekly" },
          { path: "/contact", lastmod: staticReleaseDate, priority: "0.8", changefreq: "monthly" },
        ];

        const urls: string[] = staticPages.map(
          (page) => `  <url>
    <loc>${escapeXml(`${origin}${page.path}`)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
        );

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
