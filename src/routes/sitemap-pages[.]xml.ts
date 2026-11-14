import { createFileRoute } from "@tanstack/react-router";
import { getProductionOrigin } from "@/lib/origin";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = getProductionOrigin();
        const now = new Date().toISOString().split("T")[0];

        // Only canonical, indexable static pages (excludes /auth, /collection, /search, /account, /admin)
        const staticPages = [
          { path: "/", priority: "1.0", changefreq: "daily" },
          { path: "/home", priority: "0.8", changefreq: "weekly" },
          { path: "/contact", priority: "0.8", changefreq: "monthly" },
        ];

        const urls: string[] = staticPages.map(
          (page) => `  <url>
    <loc>${escapeXml(`${origin}${page.path}`)}</loc>
    <lastmod>${now}</lastmod>
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
