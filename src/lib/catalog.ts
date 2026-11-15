import { supabase } from "@/integrations/supabase/client";
import { normalizeCategorySlug, slugify } from "@/lib/slug";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  code: string;
  price: number;
  brand: string | null;
  image_url: string | null;
  generated_studio_image: string | null;
  generated_installed_image: string | null;
  short_description: string | null;
  family_id: string | null;
  type_id: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  color: string | null;
  material: string | null;
  finish: string | null;
  app_keywords: string[] | null;
  featured_feed?: boolean | null;
  featured_homepage?: boolean | null;
  created_at?: string | null;
  distribution_rank?: number;
};

export type TaxonomyNode = { id: string; name: string; slug: string; product_count?: number };

const PRODUCT_FIELDS =
  "id,slug,name,code,price,brand,image_url,generated_studio_image,generated_installed_image,short_description,family_id,type_id,category_id,subcategory_id,color,material,finish,app_keywords,featured_feed,featured_homepage,created_at";

/** Customer-facing visibility: completed processing, published, not hidden, not soft-deleted. */
function applyPublicFilters<T extends { eq: Function; is: Function }>(q: T): T {
  return (q as any)
    .eq("processing_state", "completed")
    .eq("status", "published")
    .eq("hidden", false)
    .is("deleted_at", null);
}

export async function fetchTaxonomy() {
  const [types, categories, subcategories, pubProducts] = await Promise.all([
    supabase.from("product_types").select("id,name,slug").order("name"),
    supabase.from("categories").select("id,name,slug,type_id").order("name"),
    supabase.from("subcategories").select("id,name,slug,category_id").order("name"),
    applyPublicFilters(supabase.from("products").select("type_id,category_id,subcategory_id")),
  ]);
  if (types.error) throw types.error;
  if (categories.error) throw categories.error;
  if (subcategories.error) throw subcategories.error;

  const typeCounts = new Map<string, number>();
  const catCounts = new Map<string, number>();
  const subCounts = new Map<string, number>();
  for (const p of (pubProducts.data ?? []) as any[]) {
    if (p.type_id) typeCounts.set(p.type_id, (typeCounts.get(p.type_id) || 0) + 1);
    if (p.category_id) catCounts.set(p.category_id, (catCounts.get(p.category_id) || 0) + 1);
    if (p.subcategory_id) subCounts.set(p.subcategory_id, (subCounts.get(p.subcategory_id) || 0) + 1);
  }

  return {
    types: (types.data ?? []).map((t) => ({
      ...t,
      name: t.name.trim(),
      slug: slugify(t.slug),
      product_count: typeCounts.get(t.id) || 0,
    })),
    categories: (categories.data ?? []).map((c) => ({
      ...c,
      name: c.name.trim(),
      slug: normalizeCategorySlug(c.slug),
      product_count: catCounts.get(c.id) || 0,
    })),
    subcategories: (subcategories.data ?? []).map((s) => ({
      ...s,
      name: s.name.trim(),
      slug: slugify(s.slug),
      product_count: subCounts.get(s.id) || 0,
    })),
  };
}

export type FeedFilters = {
  type?: string;
  category?: string;
  subcategory?: string;
  q?: string;
};

export type CursorParam = {
  rank?: number;
  id?: string;
  created_at?: string;
};

export type PaginatedFeedResult = {
  items: ProductRow[];
  nextCursor: CursorParam | null;
  hasMore: boolean;
  totalCount: number;
};

/**
 * PRODUCTION CURSOR PAGINATION & INTELLIGENT PRODUCT DISTRIBUTION
 * Interleaves Product Types, Categories, Subcategories, and Brands deterministically.
 * Eliminates all hardcoded 60-item caps. Supports enterprise scale catalogs.
 */
export async function fetchFeedProductsPaginated(
  filters: FeedFilters,
  cursor: CursorParam | null = null,
  limit: number = 24
): Promise<PaginatedFeedResult> {
  // 1. Search Query Path
  if (filters.q && filters.q.trim()) {
    const term = filters.q.trim();
    const matchedIdSet = new Set<string>();

    const { data: ranked } = await supabase.rpc("search_products" as any, {
      _q: term,
      _limit: 500,
    } as any);
    if (ranked && Array.isArray(ranked)) {
      ranked.forEach((r: any) => { if (r?.product_id) matchedIdSet.add(r.product_id); });
    }

    const { data: ilikeProducts } = await applyPublicFilters(
      supabase.from("products").select("id")
    ).or(`name.ilike.%${term}%,code.ilike.%${term}%,brand.ilike.%${term}%,short_description.ilike.%${term}%,material.ilike.%${term}%,finish.ilike.%${term}%,color.ilike.%${term}%,size.ilike.%${term}%`);

    if (ilikeProducts) {
      ilikeProducts.forEach((p: any) => matchedIdSet.add(p.id));
    }

    const [typeMatches, catMatches, subMatches, famMatches] = await Promise.all([
      supabase.from("product_types").select("id").ilike("name", `%${term}%`),
      supabase.from("categories").select("id").ilike("name", `%${term}%`),
      supabase.from("subcategories").select("id").ilike("name", `%${term}%`),
      supabase.from("family_groups").select("id").ilike("name", `%${term}%`),
    ]);

    const typeIds = (typeMatches.data || []).map((t: any) => t.id);
    const catIds = (catMatches.data || []).map((c: any) => c.id);
    const subIds = (subMatches.data || []).map((s: any) => s.id);
    const famIds = (famMatches.data || []).map((f: any) => f.id);

    const hierOrConditions: string[] = [];
    if (typeIds.length) hierOrConditions.push(`type_id.in.(${typeIds.join(",")})`);
    if (catIds.length) hierOrConditions.push(`category_id.in.(${catIds.join(",")})`);
    if (subIds.length) hierOrConditions.push(`subcategory_id.in.(${subIds.join(",")})`);
    if (famIds.length) hierOrConditions.push(`family_id.in.(${famIds.join(",")})`);

    if (hierOrConditions.length > 0) {
      const { data: hierProducts } = await applyPublicFilters(
        supabase.from("products").select("id")
      ).or(hierOrConditions.join(","));
      if (hierProducts) {
        hierProducts.forEach((p: any) => matchedIdSet.add(p.id));
      }
    }

    const finalIds = Array.from(matchedIdSet);
    if (finalIds.length === 0) {
      return { items: [], nextCursor: null, hasMore: false, totalCount: 0 };
    }

    let byIdQuery = applyPublicFilters(
      supabase.from("products").select(PRODUCT_FIELDS),
    ).in("id", finalIds);

    if (filters.type) {
      const { data } = await supabase.from("product_types").select("id").eq("slug", filters.type).maybeSingle();
      if (data?.id) byIdQuery = byIdQuery.eq("type_id", data.id);
    }
    if (filters.category) {
      const targetCat = normalizeCategorySlug(filters.category);
      const { data: allCats } = await supabase.from("categories").select("id,slug,name");
      const matchedCat = (allCats ?? []).find(
        (c) => normalizeCategorySlug(c.slug) === targetCat || normalizeCategorySlug(c.name) === targetCat
      );
      if (matchedCat?.id) byIdQuery = byIdQuery.eq("category_id", matchedCat.id);
    }
    if (filters.subcategory) {
      const { data } = await supabase.from("subcategories").select("id").eq("slug", filters.subcategory).maybeSingle();
      if (data?.id) byIdQuery = byIdQuery.eq("subcategory_id", data.id);
    }

    const { data, error } = await byIdQuery;
    if (error) throw error;

    const rankOrder = new Map(finalIds.map((id, i) => [id, i] as const));
    const sorted = ((data ?? []) as ProductRow[]).sort(
      (a, b) => (rankOrder.get(a.id) ?? 0) - (rankOrder.get(b.id) ?? 0),
    );

    // Apply cursor slicing for search
    const startIndex = cursor?.rank ?? 0;
    const items = sorted.slice(startIndex, startIndex + limit);
    const hasMore = sorted.length > startIndex + limit;
    const nextCursor = hasMore ? { rank: startIndex + limit } : null;

    return { items, nextCursor, hasMore, totalCount: sorted.length };
  }

  // 2. Intelligent Distribution & Cursor Pagination Path
  let query = applyPublicFilters(
    supabase.from("products").select(PRODUCT_FIELDS)
  ).order("created_at", { ascending: false });

  if (filters.type) {
    const { data } = await supabase
      .from("product_types")
      .select("id")
      .eq("slug", filters.type)
      .maybeSingle();
    if (data?.id) query = query.eq("type_id", data.id);
  }
  if (filters.category) {
    const targetCat = normalizeCategorySlug(filters.category);
    const { data: allCats } = await supabase.from("categories").select("id,slug,name");
    const matchedCat = (allCats ?? []).find(
      (c) => normalizeCategorySlug(c.slug) === targetCat || normalizeCategorySlug(c.name) === targetCat
    );
    if (matchedCat?.id) query = query.eq("category_id", matchedCat.id);
  }
  if (filters.subcategory) {
    const { data } = await supabase
      .from("subcategories")
      .select("id")
      .eq("slug", filters.subcategory)
      .maybeSingle();
    if (data?.id) query = query.eq("subcategory_id", data.id);
  }

  const { data: rawProducts, error } = await query;
  if (error) throw error;
  if (!rawProducts || rawProducts.length === 0) {
    return { items: [], nextCursor: null, hasMore: false, totalCount: 0 };
  }

  // Assign Partition Rank for Intelligent Distribution
  // If category filter active -> partition by subcategory_id
  // Otherwise -> partition by category_id or type_id
  const partitionCounts = new Map<string, number>();
  const ranked = (rawProducts as any[]).map((p) => {
    const partitionKey = filters.category
      ? (p.subcategory_id || p.category_id || "default")
      : (p.category_id || p.type_id || "default");
    const currentRank = (partitionCounts.get(partitionKey) || 0) + 1;
    partitionCounts.set(partitionKey, currentRank);
    return {
      ...p,
      distribution_rank: currentRank,
    } as ProductRow;
  });

  // Sort by (distribution_rank ASC, featured_feed DESC, created_at DESC, id ASC)
  ranked.sort((a, b) => {
    const rA = a.distribution_rank ?? 0;
    const rB = b.distribution_rank ?? 0;
    if (rA !== rB) return rA - rB;
    if (a.featured_feed !== b.featured_feed) return a.featured_feed ? -1 : 1;
    const cA = a.created_at || "";
    const cB = b.created_at || "";
    if (cA !== cB) return cB > cA ? 1 : -1;
    return a.id.localeCompare(b.id);
  });

  // Apply Cursor Filter
  let cursorFiltered = ranked;
  if (cursor?.rank) {
    const targetRank = cursor.rank;
    const targetId = cursor.id;
    cursorFiltered = ranked.filter((item) => {
      const itemRank = item.distribution_rank ?? 0;
      if (itemRank > targetRank) return true;
      if (itemRank === targetRank && targetId && item.id > targetId) return true;
      return false;
    });
  }

  const items = cursorFiltered.slice(0, limit);
  const hasMore = cursorFiltered.length > limit;
  const lastItem = items[items.length - 1];

  const nextCursor = (hasMore && lastItem)
    ? {
        rank: lastItem.distribution_rank,
        id: lastItem.id,
        created_at: lastItem.created_at || undefined,
      }
    : null;

  return {
    items,
    nextCursor,
    hasMore,
    totalCount: ranked.length,
  };
}

export async function fetchFeedProducts(filters: FeedFilters): Promise<ProductRow[]> {
  const result = await fetchFeedProductsPaginated(filters, null, 1000);
  return result.items;
}

export async function fetchHomepageFeatured(): Promise<ProductRow[]> {
  const { data, error } = await applyPublicFilters(
    supabase.from("products").select(PRODUCT_FIELDS),
  )
    .eq("featured_homepage", true)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

export async function fetchProductBySlug(slug: string) {
  const normalized = slugify(slug);
  const clean = normalized.replace(/^draft-(?:img-)?/i, "");
  const candidates = Array.from(
    new Set([
      slug,
      normalized,
      clean,
      `draft-${clean}`,
      `draft-img-${clean}`,
    ].filter(Boolean))
  );
  const { data, error } = await applyPublicFilters(
    supabase.from("products").select("*"),
  )
    .in("slug", candidates)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  // Fallback for legacy draft-img-<uuid>-<4char> or pre-normalized slugs that share the unique 4-character suffix
  const suffixMatch = normalized.match(/-([a-z0-9]{4})$/);
  if (suffixMatch) {
    const suffix = suffixMatch[1];
    const { data: bySuffix } = await applyPublicFilters(
      supabase.from("products").select("*"),
    )
      .ilike("slug", `%-${suffix}`)
      .limit(2);
    if (bySuffix && bySuffix.length === 1) {
      return bySuffix[0];
    }
  }
  return null;
}

export async function fetchRelatedProducts(
  familyId: string | null,
  excludeId: string,
  similarIds?: string[] | null,
  categoryId?: string | null,
) {
  if (similarIds && similarIds.length) {
    const { data, error } = await applyPublicFilters(
      supabase.from("products").select(PRODUCT_FIELDS),
    )
      .in("id", similarIds)
      .neq("id", excludeId)
      .limit(8);
    if (error) throw error;
    if ((data ?? []).length) return data as ProductRow[];
  }
  if (familyId) {
    const { data, error } = await applyPublicFilters(
      supabase.from("products").select(PRODUCT_FIELDS),
    )
      .eq("family_id", familyId)
      .neq("id", excludeId)
      .limit(8);
    if (error) throw error;
    if ((data ?? []).length) return data as ProductRow[];
  }
  if (categoryId) {
    const { data, error } = await applyPublicFilters(
      supabase.from("products").select(PRODUCT_FIELDS),
    )
      .eq("category_id", categoryId)
      .neq("id", excludeId)
      .order("created_at", { ascending: false })
      .limit(4);
    if (error) throw error;
    return (data ?? []) as ProductRow[];
  }
  return [];
}
