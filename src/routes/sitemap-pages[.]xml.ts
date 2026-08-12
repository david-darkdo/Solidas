import { createFileRoute } from "@tanstack/react-router";
import { getProductionOrigin } from "@/lib/origin";

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getProductionOrigin(request);
        const now = new Date().toISOString();

        const pages = [
          { loc: `${origin}/`, priority: "1.0", changefreq: "daily" },
          { loc: `${origin}/contact`, priority: "0.8", changefreq: "monthly" },
          { loc: `${origin}/search`, priority: "0.8", changefreq: "daily" },
          { loc: `${origin}/favorites`, priority: "0.5", changefreq: "weekly" },
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (p) => `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
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
