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

function isValidProductionImageUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  if (trimmed.includes("parverhzjdhrzdcqajyw.supabase.co")) return false;
  return true;
}

export const Route = createFileRoute("/sitemap-images.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = getProductionOrigin();

        const [productsRes, assetsRes] = await Promise.all([
          supabase
            .from("products")
            .select(
              "id, slug, name, code, short_description, image_url, generated_studio_image, generated_installed_image, image_title, image_caption, alt_text"
            )
            .eq("processing_state", "completed")
            .eq("status", "published")
            .eq("hidden", false)
            .is("deleted_at", null)
            .order("updated_at", { ascending: false }),
          supabase.from("product_assets").select("product_id, asset_url"),
        ]);

        if (productsRes.error) {
          console.error("[sitemap-images.xml] Database query failed:", productsRes.error);
          return new Response("Error generating image sitemap", { status: 500 });
        }

        const assetsByProduct = new Map<string, string[]>();
        for (const a of assetsRes.data || []) {
          if (a.product_id && isValidProductionImageUrl(a.asset_url)) {
            const list = assetsByProduct.get(a.product_id) || [];
            list.push(a.asset_url.trim());
            assetsByProduct.set(a.product_id, list);
          }
        }

        const seenLocs = new Set<string>();
        const urls: string[] = [];

        for (const p of productsRes.data || []) {
          const slug = getCanonicalProductSlug(p);
          if (!slug || slug.startsWith("draft-")) continue;
          const loc = getCanonicalProductUrl(p, origin);
          if (seenLocs.has(loc)) continue;

          const imgSet = new Set<string>();
          if (isValidProductionImageUrl(p.generated_studio_image)) imgSet.add(p.generated_studio_image.trim());
          if (isValidProductionImageUrl(p.image_url)) imgSet.add(p.image_url.trim());
          if (isValidProductionImageUrl(p.generated_installed_image)) imgSet.add(p.generated_installed_image.trim());
          for (const extraUrl of assetsByProduct.get(p.id) || []) {
            imgSet.add(extraUrl);
          }

          if (imgSet.size === 0) continue;
          seenLocs.add(loc);

          const imgTitle = escapeXml(
            (p as any).image_title || `${p.name}${p.code ? ` (${p.code})` : ""} | SOLIDAS`
          );
          const imgCaption = escapeXml(
            (p as any).image_caption ||
              (p as any).alt_text ||
              p.short_description ||
              `${p.name} supplied by SOLIDAS TILES AND MARBLE NIG. LIMITED in Abuja.`
          );

          const imageNodes = Array.from(imgSet)
            .map(
              (imgUrl) => `    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${imgTitle}</image:title>
      <image:caption>${imgCaption}</image:caption>
    </image:image>`
            )
            .join("\n");

          urls.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
${imageNodes}
  </url>`);
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
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
