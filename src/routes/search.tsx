import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { fetchFeedProducts } from "@/lib/catalog";
import { Search as SearchIcon } from "lucide-react";

type SearchParams = {
  q: string;
  type?: string;
  category?: string;
  subcategory?: string;
};

function validateSearch(s: Record<string, unknown>): SearchParams {
  const pick = (k: string) => {
    const v = s[k];
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };
  return {
    q: typeof s.q === "string" ? s.q : "",
    type: pick("type"),
    category: pick("category"),
    subcategory: pick("subcategory"),
  };
}

export const Route = createFileRoute("/search")({
  validateSearch: validateSearch,
  head: () => ({
    links: [
      { rel: "canonical", href: "https://solidas.com.ng/search" },
    ],
    meta: [
      { title: "Search Materials & Tiles | SOLIDAS" },
      { name: "description", content: "Search across the Solidas Tiles and Marble catalogue for premium tiles, granite, marble, security doors, and sanitary ware." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const results = useQuery(
    queryOptions({
      queryKey: ["search", search],
      queryFn: () => fetchFeedProducts(search),
      enabled: search.q.trim().length > 0,
    }),
  );

  return (
    <AppShell>
      <div className="container-app pt-4">
        <h1 className="font-display text-xs uppercase tracking-[0.18em] text-accent">
          Search
        </h1>
        <p className="font-display text-2xl font-semibold tracking-tight">
          Find materials by name, code, color or finish
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            navigate({
              to: "/search",
              search: { ...search, q: String(data.get("q") || "") },
            });
          }}
          className="relative mt-4"
        >
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={search.q}
            autoFocus
            placeholder='Try "carrara", "oak", "matte"…'
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
          />
        </form>

        {(search.type || search.category || search.subcategory) && (
          <p className="mt-3 text-xs text-muted-foreground">
            Limited to filters: {[search.type, search.category, search.subcategory].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {search.q.trim() === "" ? (
            <p className="col-span-full text-sm text-muted-foreground">
              Type something to start searching.
            </p>
          ) : results.isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (results.data ?? []).length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">
              No matches. Try a different word.
            </p>
          ) : (
            (results.data ?? []).map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
