import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchAppSettings } from "@/lib/settings";
import { getProductionOrigin } from "@/lib/origin";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-7xl font-extrabold text-[#1E82A6] font-display">404</h1>
        <h2 className="text-xl font-bold text-foreground">Material Page Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The building material, collection, or catalog view you requested is unavailable or has been relocated.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[#1E82A6] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#166481]"
          >
            Return to SOLIDAS Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Showroom Connection Error
        </h1>
        <p className="text-sm text-muted-foreground">
          We encountered an issue loading this section. Please refresh or return to the main showroom view.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-[#1E82A6] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#166481]"
          >
            Refresh View
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-surface-2"
          >
            Go to Showroom Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    try {
      const settings = await fetchAppSettings();
      return { settings };
    } catch {
      return { settings: null };
    }
  },
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    const googleVerify = settings?.google_site_verification;
    const bingVerify = settings?.bing_site_verification;
    const origin = getProductionOrigin();

    const meta = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1E82A6" },
      { title: "SOLIDAS — Premium Tiles, Marble, Security Doors & Building Materials" },
      {
        name: "description",
        content: "SOLIDAS TILES AND MARBLE NIG. LIMITED: Premium tiles, marble, granite, foreign security doors, wooden doors, PVC ceiling, & general building materials in Abuja.",
      },
      { property: "og:title", content: "SOLIDAS TILES AND MARBLE NIG. LIMITED — Architectural Digital Showroom" },
      {
        property: "og:description",
        content: "Explore premium tiles, luxury marble, security doors and architectural finishes curated by SOLIDAS TILES AND MARBLE NIG. LIMITED.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: origin },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SOLIDAS TILES AND MARBLE NIG. LIMITED" },
      { name: "twitter:description", content: "Dealers & Suppliers of General Building Materials: Tiles, Marble, Granite, Security Doors & Finishes." },
      { property: "og:image", content: `${origin}/logo.png` },
      { name: "twitter:image", content: `${origin}/logo.png` },
    ];

    if (googleVerify) {
      meta.push({ name: "google-site-verification", content: googleVerify });
    }
    if (bingVerify) {
      meta.push({ name: "msvalidate.01", content: bingVerify });
    }

    return {
      meta,
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/manifest.webmanifest?v=3" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=3" },
        { rel: "icon", href: "/favicon.ico?v=3", sizes: "any" },
        { rel: "icon", href: "/favicon.png?v=3", type: "image/png" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const origin = getProductionOrigin();
  const loaderData = Route.useLoaderData();
  const settings = loaderData?.settings;

  const sameAsLinks = [
    settings?.facebook_url,
    settings?.instagram_url,
    settings?.tiktok_url,
    settings?.youtube_url,
  ].filter(Boolean) as string[];

  const organizationSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SOLIDAS TILES AND MARBLE NIG. LIMITED",
    "alternateName": "SOLIDAS",
    "url": origin,
    "logo": `${origin}/logo.png`,
    "description": "Dealers & Suppliers of General Building Materials Such As Tiles & Marble, Granite, Crack Tiles, Foreign Security Doors, Wooden Doors, PVC Ceiling & General Contracts.",
    "telephone": "+2348035186355",
    "email": settings?.company_email || "solidastilesnmarble@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt",
      "addressLocality": "Abuja",
      "addressRegion": "FCT",
      "addressCountry": "NG"
    }
  };

  if (sameAsLinks.length > 0) {
    organizationSchema["sameAs"] = sameAsLinks;
  }

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    "name": "SOLIDAS TILES AND MARBLE NIG. LIMITED",
    "image": `${origin}/logo.png`,
    "url": origin,
    "telephone": "+2348035186355",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt",
      "addressLocality": "Abuja",
      "addressRegion": "FCT",
      "addressCountry": "NG"
    },
    "hasMap": settings?.map_url || "https://maps.app.goo.gl/noM38nVdN74A2Gpt8?g_st=ac"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SOLIDAS Digital Showroom",
    "url": origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootAppWrapper />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootAppWrapper() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [showLoader, setShowLoader] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPending) {
      timer = setTimeout(() => setShowLoader(true), 150);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timer);
  }, [isPending]);

  useEffect(() => {
    if (!user?.id) return;

    const trackView = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();
      if (!profile?.id) return;

      await supabase.from("customer_activity").insert({
        user_id: profile.id,
        activity_type: pathname === "/" ? "homepage_viewed" : "page_viewed",
        metadata: { path: pathname, timestamp: new Date().toISOString() }
      });
    };
    void trackView();

    const registerDevice = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();
      if (!profile?.id) return;

      const mockToken = `web_pwa_token_${user.id.substring(0, 8)}_${navigator.userAgent.replace(/[^a-zA-Z0-9]/g, "").substring(0, 16)}`;
      await supabase.from("communication_devices").upsert({
        user_id: profile.id,
        token: mockToken,
        device_type: "web_pwa",
        os_version: navigator.platform,
        browser: navigator.userAgent.includes("Chrome") ? "Chrome" : "Safari",
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: "token" });
    };
    void registerDevice();
  }, [user?.id, pathname]);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Full Page Breathing Logo Loading Screen */}
      {(() => {
        const isApiRoute = pathname === "/robots.txt" || pathname === "/sitemap.xml" || pathname.startsWith("/api/");
        const showGlobalLoader = (showLoader || initialLoading) && !isApiRoute;
        if (!showGlobalLoader) return null;
        return (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/40 backdrop-blur-xs transition-all duration-300 animate-fade-in">
            <style>{`
              @keyframes breathing {
                0%, 100% { transform: scale(0.95); opacity: 0.4; }
                50% { transform: scale(1.05); opacity: 0.85; }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-breathing {
                animation: breathing 2s ease-in-out infinite;
              }
              .animate-fade-in {
                animation: fadeIn 0.2s ease-out forwards;
              }
            `}</style>
            <div className="flex flex-col items-center gap-3 animate-breathing">
              <img
                src="/logo.png"
                alt="SOLIDAS Logo"
                className="h-16 w-auto object-contain"
              />
              <p className="font-display text-[10px] font-bold tracking-widest text-[#1E82A6] uppercase">
                SOLIDAS SHOWROOM
              </p>
            </div>
          </div>
        );
      })()}

      <Outlet />
    </div>
  );
}
