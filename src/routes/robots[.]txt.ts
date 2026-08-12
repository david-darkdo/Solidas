import { createFileRoute } from "@tanstack/react-router";
import { getProductionOrigin } from "@/lib/origin";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getProductionOrigin(request);
        
        const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /account
Disallow: /account/*
Disallow: /favorites
Disallow: /favorites/*

Sitemap: ${origin}/sitemap.xml
Host: ${origin}
`;

        return new Response(robotsTxt, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "public, max-age=3600, s-maxage=18000",
          },
        });
      },
    },
  },
});
