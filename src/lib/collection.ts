import { supabase } from "@/integrations/supabase/client";

export interface GuestItem {
  product_id: string;
  added_at: string;
  quantity?: number;
  unit?: string;
  installation_location?: string;
  delivery_preference?: string;
  installation_required?: string;
  project_notes?: string;
}

export interface ItemRequirements {
  quantity?: number;
  unit?: string;
  installation_location?: string;
  delivery_preference?: string;
  installation_required?: string;
  project_notes?: string;
}

export interface CollectionV2 {
  id: string;
  user_id: string;
  name: string;
  reference_number?: string;
  project_name?: string | null;
  status: string;
  is_locked: boolean;
  parent_collection_id?: string | null;
  version: number;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

const GUEST_KEY = "stoneworks.guest_collection_v2";
const GUEST_REQ_KEY = "stoneworks.guest_requirements_v2";
const USER_REQ_KEY_PREFIX = "stoneworks.user_requirements_v2_";
const CACHED_ITEMS_KEY_PREFIX = "stoneworks.cached_user_items_";

export function generateCollectionReference(colId?: string): string {
  const year = new Date().getFullYear();
  const hex = (colId || Math.random().toString(36)).substring(0, 6).toUpperCase();
  return `ENC-${year}-${hex}`;
}

export function detectProductUnit(product: any): "m²" | "Pieces" {
  if (!product) return "Pieces";
  const name = String(product.name || "").toLowerCase();
  const brand = String(product.brand || "").toLowerCase();
  const desc = String(product.short_description || "").toLowerCase();
  const text = `${name} ${brand} ${desc}`;

  const sqMKeywords = [
    "tile", "flooring", "marble", "granite", "decking", "slab", "paving",
    "stone", "cladding", "terrazzo", "porcelain", "quartz", "paver", "wall tile", "floor tile"
  ];

  if (sqMKeywords.some((kw) => text.includes(kw))) {
    return "m²";
  }

  return "Pieces";
}

export function getGuestCollection(): GuestItem[] {
  if (typeof window === "undefined") return [];
  try {
    const rawItems: GuestItem[] = JSON.parse(window.localStorage.getItem(GUEST_KEY) || "[]");
    const rawReqs: Record<string, ItemRequirements> = JSON.parse(window.localStorage.getItem(GUEST_REQ_KEY) || "{}");
    return rawItems.map(item => ({
      ...item,
      ...(rawReqs[item.product_id] || {})
    }));
  } catch {
    return [];
  }
}

export function setGuestCollection(items: GuestItem[]) {
  if (typeof window === "undefined") return;
  const baseItems = items.map(i => ({ product_id: i.product_id, added_at: i.added_at }));
  const reqMap: Record<string, ItemRequirements> = {};
  items.forEach(i => {
    if (i.quantity || i.installation_location || i.delivery_preference || i.installation_required || i.project_notes) {
      reqMap[i.product_id] = {
        quantity: i.quantity,
        unit: i.unit,
        installation_location: i.installation_location,
        delivery_preference: i.delivery_preference,
        installation_required: i.installation_required,
        project_notes: i.project_notes
      };
    }
  });
  window.localStorage.setItem(GUEST_KEY, JSON.stringify(baseItems));
  window.localStorage.setItem(GUEST_REQ_KEY, JSON.stringify(reqMap));
  window.dispatchEvent(new Event("collection:change"));
}

export function updateGuestItemRequirements(product_id: string, reqs: ItemRequirements) {
  if (typeof window === "undefined") return;
  try {
    const rawReqs: Record<string, ItemRequirements> = JSON.parse(window.localStorage.getItem(GUEST_REQ_KEY) || "{}");
    rawReqs[product_id] = {
      ...(rawReqs[product_id] || {}),
      ...reqs
    };
    window.localStorage.setItem(GUEST_REQ_KEY, JSON.stringify(rawReqs));
    window.dispatchEvent(new Event("collection:change"));
  } catch (e) {
    console.error("Failed updating guest item requirements:", e);
  }
}

export function addGuestItem(product_id: string) {
  const items = getGuestCollection();
  if (items.some((i) => i.product_id === product_id)) return items;
  const next = [...items, { product_id, added_at: new Date().toISOString() }];
  setGuestCollection(next);
  return next;
}

export function removeGuestItem(product_id: string) {
  const next = getGuestCollection().filter((i) => i.product_id !== product_id);
  setGuestCollection(next);
  return next;
}

export function getUserItemRequirements(userId: string): Record<string, ItemRequirements> {
  if (typeof window === "undefined") return {};
  try {
    const reqKey = `${USER_REQ_KEY_PREFIX}${userId}`;
    return JSON.parse(window.localStorage.getItem(reqKey) || "{}");
  } catch {
    return {};
  }
}

export function updateUserItemRequirements(userId: string, productId: string, reqs: ItemRequirements) {
  if (typeof window === "undefined") return;
  try {
    const reqKey = `${USER_REQ_KEY_PREFIX}${userId}`;
    const rawMap = getUserItemRequirements(userId);
    rawMap[productId] = {
      ...(rawMap[productId] || {}),
      ...reqs
    };
    window.localStorage.setItem(reqKey, JSON.stringify(rawMap));
    window.dispatchEvent(new Event("collection:change"));
  } catch (e) {
    console.error("Failed updating user item requirements:", e);
  }
}

/** Guaranteed active collection generator (Schema-Safe against PGRST100) */
export async function ensureUserCollection(userId: string): Promise<string> {
  if (!userId) return "";
  try {
    // Select standard columns to prevent PGRST100 errors on missing remote columns
    const { data: existing } = await supabase
      .from("collections")
      .select("id, name, user_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) return existing.id;
  } catch (err) {
    console.warn("Failed selecting existing collection:", err);
  }

  try {
    const { data: newCol, error } = await supabase
      .from("collections")
      .insert({
        user_id: userId,
        name: "Project Workspace"
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to insert new collection:", error);
      return "";
    }
    return newCol?.id || "";
  } catch (err) {
    console.error("Exception creating user collection:", err);
    return "";
  }
}

export async function getUserCollectionItems(userId: string) {
  const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;

  if (typeof window !== "undefined" && !navigator.onLine) {
    try {
      const cached = JSON.parse(window.localStorage.getItem(cacheKey) || "null");
      if (cached) return cached;
    } catch {}
  }

  const collection_id = await ensureUserCollection(userId);
  if (!collection_id) return { collection_id: "", items: [] };

  const { data, error } = await supabase
    .from("collection_items")
    .select("product_id, added_at, collection_id")
    .eq("collection_id", collection_id)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching collection_items:", error);
    return { collection_id, items: [] };
  }

  const result = { collection_id, items: data ?? [] };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(cacheKey, JSON.stringify(result));
  }
  return result;
}

export async function addItemToUserCollection(userId: string, product_id: string) {
  const collection_id = await ensureUserCollection(userId);
  if (!collection_id) return "";

  try {
    const { error } = await supabase
      .from("collection_items")
      .upsert({ collection_id, product_id }, { onConflict: "collection_id,product_id", ignoreDuplicates: true });
    
    if (error) {
      await supabase.from("collection_items").insert({ collection_id, product_id });
    }
  } catch (err) {
    console.error("Failed to add item to user collection:", err);
  }

  const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
  if (typeof window !== "undefined") {
    try {
      const cached = JSON.parse(window.localStorage.getItem(cacheKey) || '{"items":[]}');
      if (!cached.items.some((i: any) => i.product_id === product_id)) {
        cached.items.push({ product_id, added_at: new Date().toISOString(), collection_id });
        window.localStorage.setItem(cacheKey, JSON.stringify(cached));
      }
    } catch {}
  }

  window.dispatchEvent(new Event("collection:change"));
  return collection_id;
}

export async function removeItemFromUserCollection(userId: string, product_id: string) {
  const collection_id = await ensureUserCollection(userId);
  if (!collection_id) return;

  try {
    await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collection_id)
      .eq("product_id", product_id);
  } catch (err) {
    console.error("Failed to remove item from user collection:", err);
  }

  const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
  if (typeof window !== "undefined") {
    try {
      const cached = JSON.parse(window.localStorage.getItem(cacheKey) || '{"items":[]}');
      cached.items = cached.items.filter((i: any) => i.product_id !== product_id);
      window.localStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch {}
  }

  window.dispatchEvent(new Event("collection:change"));
}

export async function mergeGuestIntoUser(userId: string) {
  const guest = getGuestCollection();
  if (!guest.length) return;
  const collection_id = await ensureUserCollection(userId);
  if (!collection_id) return;

  for (const g of guest) {
    try {
      await supabase
        .from("collection_items")
        .upsert({ collection_id, product_id: g.product_id }, { onConflict: "collection_id,product_id", ignoreDuplicates: true });
    } catch {
      try {
        await supabase.from("collection_items").insert({ collection_id, product_id: g.product_id });
      } catch {}
    }
  }

  // Preserve guest specifications into user requirement map
  const reqKey = `${USER_REQ_KEY_PREFIX}${userId}`;
  if (typeof window !== "undefined") {
    try {
      const rawGuestReqs = JSON.parse(window.localStorage.getItem(GUEST_REQ_KEY) || "{}");
      const existingUserReqs = JSON.parse(window.localStorage.getItem(reqKey) || "{}");
      const mergedReqs = { ...existingUserReqs, ...rawGuestReqs };
      window.localStorage.setItem(reqKey, JSON.stringify(mergedReqs));
    } catch {}
  }

  setGuestCollection([]);
  window.dispatchEvent(new Event("collection:change"));
}

export async function fetchProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,slug,name,code,price,brand,image_url,generated_studio_image,short_description"
    )
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
}

export async function lockAndSubmitCollection(collectionId: string): Promise<string> {
  const refNum = generateCollectionReference(collectionId);
  try {
    await supabase
      .from("collections")
      .update({
        status: "Submitted",
        updated_at: new Date().toISOString()
      } as any)
      .eq("id", collectionId);
  } catch {}
  return refNum;
}

export async function updateCustomerPhoneNumber(userId: string, phone: string) {
  try {
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", userId)
      .maybeSingle();

    if (prof?.id) {
      await supabase
        .from("profiles")
        .update({ phone_number: phone })
        .eq("id", prof.id);
    }
  } catch (e) {
    console.error("Failed to update profile phone number:", e);
  }
}

export async function syncOfflineActions() {}
