import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery, useSuspenseQuery, queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { fetchFeedProductsPaginated, fetchTaxonomy, type FeedFilters, type CursorParam } from "@/lib/catalog";
import { getProductionOrigin } from "@/lib/origin";
import { ChevronDown, Loader2 } from "lucide-react";

type FeedSearch = {
  type?: string;
  category?: string;
  subcategory?: string;
};

function validateFeedSearch(s: Record<string, unknown>): FeedSearch {
  const pick = (k: string) => {
    const v = s[k];
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };
  return { type: pick("type"), category: pick("category"), subcategory: pick("subcategory") };
}

const taxonomyQuery = queryOptions({
  queryKey: ["taxonomy"],
  queryFn: fetchTaxonomy,
  staleTime: 5 * 60_000,
});

const feedInfiniteQuery = (f: FeedFilters) =>
  infiniteQueryOptions({
    queryKey: ["feed_infinite", f],
    queryFn: ({ pageParam }) => fetchFeedProductsPaginated(f, pageParam as CursorParam | null, 24),
    initialPageParam: null as CursorParam | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

export const Route = createFileRoute("/")({
  validateSearch: validateFeedSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(taxonomyQuery);
    context.queryClient.ensureInfiniteQueryData(feedInfiniteQuery(deps));
  },
  head: () => {
    const origin = getProductionOrigin();
    return {
      meta: [
        { title: "SOLIDAS Tiles & Marble Nigeria Ltd | Luxury Tiles, Marble, Granite & Security Doors in Abuja" },
        {
          name: "description",
          content: "Official digital showroom of SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei-Dei, Abuja. Browse luxury ceramic & porcelain tiles, granite, marble, and foreign security doors with instant WhatsApp quotes.",
        },
        { property: "og:title", content: "SOLIDAS Tiles & Marble Nigeria Ltd | Luxury Tiles, Marble, Granite & Security Doors in Abuja" },
        { property: "og:description", content: "Official digital showroom of SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei-Dei, Abuja. Browse luxury ceramic & porcelain tiles, granite, marble, and foreign security doors with instant WhatsApp quotes." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${origin}/` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "SOLIDAS Tiles & Marble Nigeria Ltd | Luxury Tiles, Marble, Granite & Security Doors in Abuja" },
        { name: "twitter:description", content: "Dealers & Suppliers of General Building Materials: Tiles, Marble, Granite, Security Doors & Finishes in Abuja." },
      ],
      links: [
        { rel: "canonical", href: `${origin}/` },
      ],
    };
  },
  component: FeedPage,
  errorComponent: ({ error }: { error: any }) => {
    return (
      <div className="p-6 text-sm text-[#C0262D] font-mono">
        <div>Error: {error?.message || String(error)}</div>
      </div>
    );
  },
});

function FeedPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: tax } = useSuspenseQuery(taxonomyQuery);
  const feedQuery = useInfiniteQuery(feedInfiniteQuery(search));

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const activeType = tax.types.find((t: any) => t.slug === search.type);
  const categoriesForType = activeType
    ? tax.categories.filter((c: any) => c.type_id === activeType.id)
    : [];
  const activeCategory = categoriesForType.find((c: any) => c.slug === search.category);
  const subcategoriesForCat = activeCategory
    ? tax.subcategories.filter((s: any) => s.category_id === activeCategory.id)
    : [];
  const activeSub = subcategoriesForCat.find((s: any) => s.slug === search.subcategory);

  const setType = (slug?: string) =>
    navigate({ to: "/", search: { type: slug, category: undefined, subcategory: undefined } });
  const setCategory = (slug?: string) =>
    navigate({
      to: "/",
      search: { ...search, category: slug, subcategory: undefined },
    });
  const setSub = (slug?: string) =>
    navigate({ to: "/", search: { ...search, subcategory: slug } });

  const allProducts = feedQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = feedQuery.data?.pages[0]?.totalCount ?? 0;
  const hasNextPage = feedQuery.hasNextPage;
  const isFetchingNextPage = feedQuery.isFetchingNextPage;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void feedQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasNextPage, isFetchingNextPage, feedQuery]);

  return (
    <AppShell>
      <div className="container-app pt-4 pb-12 space-y-4">
        {/* Type row */}
        <FilterRow>
          <Pill active={!search.type} onClick={() => setType(undefined)}>
            All Materials
          </Pill>
          {tax.types.map((t: any) => (
            <Pill key={t.id} active={search.type === t.slug} onClick={() => setType(t.slug)}>
              {t.name}
            </Pill>
          ))}
        </FilterRow>

        {/* Category row */}
        {activeType && (
          <FilterRow tone="muted">
            <Pill active={!search.category} onClick={() => setCategory(undefined)}>
              All Categories
            </Pill>
            {categoriesForType.map((c: any) => (
              <Pill
                key={c.id}
                active={search.category === c.slug}
                onClick={() => setCategory(c.slug)}
              >
                {c.name}
              </Pill>
            ))}
          </FilterRow>
        )}

        {/* Subcategory row */}
        {activeCategory && subcategoriesForCat.length > 0 && (
          <FilterRow tone="muted">
            <Pill active={!search.subcategory} onClick={() => setSub(undefined)}>
              All Specs
            </Pill>
            {subcategoriesForCat.map((s: any) => (
              <Pill
                key={s.id}
                active={search.subcategory === s.slug}
                onClick={() => setSub(s.slug)}
              >
                {s.name}
              </Pill>
            ))}
          </FilterRow>
        )}

        <div className="mt-5 flex items-end justify-between border-b border-border pb-3">
          <div>
            <h1 className="font-display text-xs uppercase tracking-[0.2em] font-bold text-[#1E82A6]">
              {activeSub
                ? `${activeCategory?.name} · ${activeSub.name}`
                : activeCategory
                  ? activeCategory.name
                  : activeType
                    ? activeType.name
                    : "SOLIDAS Digital Showroom Feed"}
            </h1>
            <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Architectural Materials Catalog
            </p>
          </div>
          {totalCount > 0 && (
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Showing {allProducts.length} of {totalCount} products
            </span>
          )}
        </div>

        {/* Product Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {feedQuery.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : allProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Empty state */}
        {!feedQuery.isLoading && allProducts.length === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center bg-white">
            <p className="text-sm text-muted-foreground">
              No products match these material filters yet.
            </p>
            <Link
              to="/"
              search={{}}
              className="mt-3 inline-block text-xs font-bold text-[#1E82A6] hover:underline"
            >
              Reset filters
            </Link>
          </div>
        )}

        {/* Infinite Scroll / Load More Trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="pt-8 text-center space-y-3">
            <button
              onClick={() => void feedQuery.fetchNextPage()}
              disabled={isFetchingNextPage}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:border-[#1E82A6] hover:text-[#1E82A6] transition shadow-xs disabled:opacity-50"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#1E82A6]" />
                  Loading more materials…
                </>
              ) : (
                <>
                  Load More Products ({totalCount - allProducts.length} remaining)
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Crawlable HTML Catalog Directory for Search Engine & User Discovery */}
        <section
          aria-label="Browse Showroom Categories and Specifications"
          className="mt-10 rounded-xl border border-border bg-white p-5 shadow-2xs space-y-4"
        >
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#1E82A6]">
              Browse Showroom by Material Category & Size
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct links to our full Abuja showroom collections for tiles, marble, granite, and security doors.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {tax.types.map((t: any) => {
              const cats = tax.categories.filter((c: any) => c.type_id === t.id);
              return (
                <div key={t.id} className="rounded-lg border border-border/70 bg-surface-2 p-3.5 space-y-2.5">
                  <a
                    href={`/${t.slug}`}
                    className="font-display text-sm font-bold text-foreground hover:text-[#1E82A6] transition inline-block"
                  >
                    {t.name} Catalog →
                  </a>
                  <div className="space-y-2">
                    {cats.map((c: any) => {
                      const subs = tax.subcategories.filter((s: any) => s.category_id === c.id);
                      return (
                        <div key={c.id} className="text-xs">
                          <a
                            href={`/${t.slug}/${c.slug}`}
                            className="font-semibold text-[#1E82A6] hover:underline"
                          >
                            {c.name}
                          </a>
                          {subs.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {subs.map((s: any) => (
                                <a
                                  key={s.id}
                                  href={`/${t.slug}/${c.slug}/${s.slug}`}
                                  className="rounded border border-border bg-white px-2 py-0.5 text-[11px] text-muted-foreground hover:border-[#1E82A6] hover:text-[#1E82A6] transition"
                                >
                                  {s.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function FilterRow({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <div
      className={`-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none ${
        tone === "muted" ? "opacity-95" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
        active
          ? "border-[#1E82A6] bg-[#1E82A6] text-white shadow-2xs"
          : "border-border bg-white text-muted-foreground hover:border-[#1E82A6] hover:text-[#1E82A6]"
      }`}
    >
      {children}
    </button>
  );
}
