import { createFileRoute } from '@tanstack/react-router'
import { getProductionOrigin } from "@/lib/origin";

export const Route = createFileRoute("/sitemap-images.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getProductionOrigin(request);
        const items: { loc: string; imageLoc: string; title: string; caption: string }[] = [];

        try {
          const { data: products } = await supabase
            .from("products" as any)
            .select("slug, name, alt_text, seo_description, image_url, generated_installed_image, generated_studio_image")
            .eq("status", "published")
            .eq("hidden", false)
            .is("deleted_at", null);

          if (products) {
            for (const p of (products as any[])) {
              if (!p.slug) continue;
              const productUrl = `${origin}/product/${p.slug}`;
              const title = p.name || "Enreach Concepts Product";
              const caption = p.alt_text || p.seo_description || title;

              const rawImages = [p.image_url, p.generated_installed_image, p.generated_studio_image].filter(Boolean);
              const processedUrls = Array.from(new Set(rawImages.map((img) => publicImageUrl(img)).filter(Boolean))) as string[];

              for (const imgUrl of processedUrls) {
                items.push({
                  loc: productUrl,
                  imageLoc: imgUrl,
                  title: title,
                  caption: caption,
                });
              }
            }
          }
        } catch (err) {
          console.error("Failed to generate sitemap-images:", err);
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${items
    .map(
      (item) => `
  <url>
    <loc>${item.loc}</loc>
    <image:image>
      <image:loc>${item.imageLoc}</image:loc>
      <image:title>${item.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:title>
      <image:caption>${item.caption.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:caption>
    </image:image>
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
