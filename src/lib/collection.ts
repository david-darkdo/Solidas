import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GUEST_KEY = "stoneworks.guest_collection";
const GUEST_REQ_KEY = "stoneworks.guest_requirements";
const OFFLINE_ACTIONS_KEY = "stoneworks.offline_actions";
const CACHED_ITEMS_KEY_PREFIX = "stoneworks.cached_items_";

export interface ItemRequirements {
  quantity?: number;
  unit?: string;
  installation_location?: string;
  delivery_preference?: string;
  installation_required?: string;
  project_notes?: string;
}

export interface CollectionItemV2 {
  id?: string;
  collection_id: string;
  product_id: string;
  added_at: string;
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
  reference_number?: string | null;
  project_name?: string | null;
  status: string;
  is_locked: boolean;
  parent_collection_id?: string | null;
  version: number;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
  internal_notes?: string | null;
}

/** Generate a professional reference code: e.g. ENC-2026-000123 */
export function generateCollectionReference(id?: string): string {
  if (!id) return `ENC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const hexNum = id.replace(/-/g, "").substring(0, 6).toUpperCase();
  return `ENC-2026-${hexNum}`;
}

export async function updateCustomerPhoneNumber(userId: string, phoneNumber: string): Promise<void> {
  if (!userId || !phoneNumber) return;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", userId)
      .maybeSingle();

    if (profile?.id) {
      await supabase
        .from("profiles")
        .update({
          phone_number: phoneNumber,
          preferred_contact_method: "WhatsApp"
        } as any)
        .eq("id", profile.id);
    }
  } catch (err) {
    console.error("Failed to save phone number to profile:", err);
  }
}

export type GuestItem = { 
  product_id: string; 
  added_at: string;
  quantity?: number;
  unit?: string;
  installation_location?: string;
  delivery_preference?: string;
  installation_required?: string;
  project_notes?: string;
};

export type OfflineAction = {
  type: "add" | "remove";
  userId: string;
  productId: string;
  timestamp: string;
};

/**
 * Auto unit detection based on product type / category / name.
 * Default: Tiles, Flooring, Marble, Granite, Decking, Slab -> m²
 * Default: Doors, Windows, Sanitary Wares, Toilets, Basins, Faucets, Lighting -> Pieces
 */
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

// OFFLINE QUEUE UTILS
export function getOfflineActions(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(OFFLINE_ACTIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOfflineActions(actions: OfflineAction[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
}

export function queueOfflineAction(type: "add" | "remove", userId: string, productId: string) {
  const actions = getOfflineActions();
  const cleaned = actions.filter((a) => !(a.userId === userId && a.productId === productId));
  cleaned.push({
    type,
    userId,
    productId,
    timestamp: new Date().toISOString()
  });
  saveOfflineActions(cleaned);
}

export async function syncOfflineActions() {
  if (typeof window === "undefined" || !navigator.onLine) return;
  const actions = getOfflineActions();
  if (actions.length === 0) return;

  // Clear local outbox actions list so we do not double sync
  saveOfflineActions([]);

  for (const act of actions) {
    try {
      if (act.type === "add") {
        await addItemToUserCollection(act.userId, act.productId);
      } else {
        await removeItemFromUserCollection(act.userId, act.productId);
      }
    } catch (err) {
      console.error("Failed to sync offline collection action, re-queuing:", err);
      queueOfflineAction(act.type, act.userId, act.productId);
    }
  }

  window.dispatchEvent(new Event("collection:change"));
  toast.success("Synchronized offline collection changes!");
}

/** Get or create the unique active unlocked "Project Workspace" draft for the signed-in user. */
export async function ensureUserCollection(userId: string): Promise<string> {
  // Query strictly for unique unlocked active working draft
  const { data: existing } = await supabase
    .from("collections")
    .select("id")
    .eq("user_id", userId)
    .eq("is_locked", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const refNum = generateCollectionReference();
  try {
    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: userId,
        name: "Project Workspace",
        reference_number: refNum,
        status: "Draft",
        is_locked: false,
        version: 1
      } as any)
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    const { data: fallbackData } = await supabase
      .from("collections")
      .insert({ user_id: userId, name: "Project Workspace" })
      .select("id")
      .single();
    return fallbackData?.id || "";
  }
}

/** Fetch all submitted immutable history records for a user, newest first. */
export async function getUserCollectionHistory(userId: string): Promise<any[]> {
  const { data: cols } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .eq("is_locked", true)
    .order("submitted_at", { ascending: false });

  return cols || [];
}

export async function addItemToUserCollection(userId: string, product_id: string) {
  const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
  
  if (typeof window !== "undefined" && !navigator.onLine) {
    queueOfflineAction("add", userId, product_id);
    try {
      const cached = JSON.parse(window.localStorage.getItem(cacheKey) || '{"items":[]}');
      if (!cached.items.some((i: any) => i.product_id === product_id)) {
        cached.items.push({ product_id, added_at: new Date().toISOString() });
        window.localStorage.setItem(cacheKey, JSON.stringify(cached));
      }
    } catch {}
    window.dispatchEvent(new Event("collection:change"));
    return "offline_col";
  }

  const collection_id = await ensureUserCollection(userId);
  await supabase
    .from("collection_items")
    .insert({ collection_id, product_id })
    .select()
    .maybeSingle();
  return collection_id;
}

export async function removeItemFromUserCollection(userId: string, product_id: string) {
  const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;

  if (typeof window !== "undefined" && !navigator.onLine) {
    queueOfflineAction("remove", userId, product_id);
    try {
      const cached = JSON.parse(window.localStorage.getItem(cacheKey) || '{"items":[]}');
      cached.items = cached.items.filter((i: any) => i.product_id !== product_id);
      window.localStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch {}
    window.dispatchEvent(new Event("collection:change"));
    return;
  }

  const collection_id = await ensureUserCollection(userId);
  await supabase
    .from("collection_items")
    .delete()
    .eq("collection_id", collection_id)
    .eq("product_id", product_id);
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
  const { data, error } = await supabase
    .from("collection_items")
    .select("product_id, added_at, collection_id")
    .eq("collection_id", collection_id)
    .order("added_at", { ascending: false });
  if (error) throw error;
  
  const result = { collection_id, items: data ?? [] };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(cacheKey, JSON.stringify(result));
  }
  return result;
}

export async function mergeGuestIntoUser(userId: string) {
  const guest = getGuestCollection();
  if (!guest.length) return;
  const collection_id = await ensureUserCollection(userId);

  const itemsToUpsert = guest.map((g) => ({
    collection_id,
    product_id: g.product_id,
    quantity: g.quantity ?? 1,
    unit: g.unit || null,
    installation_location: g.installation_location || null,
    delivery_preference: g.delivery_preference || "Deliver to Site",
    installation_required: g.installation_required || "Not Sure",
    project_notes: g.project_notes || null
  }));

  try {
    await supabase
      .from("collection_items")
      .upsert(itemsToUpsert as any, { onConflict: "collection_id,product_id", ignoreDuplicates: false });
  } catch (err) {
    // Fallback basic upsert
    await supabase
      .from("collection_items")
      .upsert(
        guest.map((g) => ({ collection_id, product_id: g.product_id })),
        { onConflict: "collection_id,product_id", ignoreDuplicates: true },
      );
  }
  setGuestCollection([]);
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

/** Lock collection after Push to WhatsApp submission */
export async function lockAndSubmitCollection(collectionId: string): Promise<string> {
  const now = new Date().toISOString();
  const refNum = generateCollectionReference(collectionId);
  try {
    const { error } = await supabase
      .from("collections")
      .update({
        status: "Submitted",
        reference_number: refNum,
        is_locked: true,
        submitted_at: now,
        whatsapp_sent: true
      } as any)
      .eq("id", collectionId);
    
    if (error) {
      await supabase
        .from("collections")
        .update({
          whatsapp_sent: true,
          inquiry_status: "SENT" as any
        })
        .eq("id", collectionId);
    }
  } catch (err) {
    console.error("Error locking collection:", err);
  }
  return refNum;
}

/** Create an updated request by duplicating an existing locked collection */
export async function duplicateCollection(collectionId: string, userId: string): Promise<string> {
  // 1. Fetch parent collection details
  const { data: parent } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single();

  const currentVersion = parent?.version || 1;
  const nextVersion = currentVersion + 1;
  const newName = parent?.name ? `${parent.name.replace(/ \(v\d+\)$/, "")} (v${nextVersion})` : `My Collection (v${nextVersion})`;

  // 2. Insert duplicated collection with new ID and version
  let newColId: string | null = null;
  try {
    const { data: newCol, error } = await supabase
      .from("collections")
      .insert({
        user_id: userId,
        name: newName,
        project_name: parent?.project_name || null,
        status: "Draft",
        is_locked: false,
        parent_collection_id: collectionId,
        version: nextVersion,
        inquiry_status: "DRAFT" as any
      })
      .select("id")
      .single();

    if (error) throw error;
    newColId = newCol.id;
  } catch (err) {
    // Fallback if DDL columns not yet cached
    const { data: newColFallback, error: fbErr } = await supabase
      .from("collections")
      .insert({
        user_id: userId,
        name: newName
      })
      .select("id")
      .single();

    if (fbErr) throw fbErr;
    newColId = newColFallback.id;
  }

  if (!newColId) throw new Error("Failed creating duplicated collection");

  // 3. Fetch items from parent collection
  const { data: parentItems } = await supabase
    .from("collection_items")
    .select("*")
    .eq("collection_id", collectionId);

  if (parentItems && parentItems.length > 0) {
    const itemsToInsert = parentItems.map((item: any) => ({
      collection_id: newColId,
      product_id: item.product_id,
      quantity: item.quantity ?? 1,
      unit: item.unit || null,
      installation_location: item.installation_location || null,
      delivery_preference: item.delivery_preference || "Deliver to Site",
      installation_required: item.installation_required || "Not Sure",
      project_notes: item.project_notes || null
    }));

    try {
      await supabase.from("collection_items").insert(itemsToInsert);
    } catch {
      // Fallback basic insert
      const basicItems = parentItems.map((item: any) => ({
        collection_id: newColId,
        product_id: item.product_id
      }));
      await supabase.from("collection_items").insert(basicItems);
    }
  }

  // Clear guest cache or sync cache if applicable
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("collection:change"));
  }

  toast.success(`Created Updated Request (Version ${nextVersion})!`);
  return newColId;
}

/** Update individual item requirements (quantity, location, delivery, installation, notes) */
export async function updateUserItemRequirements(
  collectionId: string,
  productId: string,
  requirements: ItemRequirements
): Promise<void> {
  try {
    const { error } = await supabase
      .from("collection_items")
      .update({
        quantity: requirements.quantity,
        unit: requirements.unit,
        installation_location: requirements.installation_location,
        delivery_preference: requirements.delivery_preference,
        installation_required: requirements.installation_required,
        project_notes: requirements.project_notes
      })
      .eq("collection_id", collectionId)
      .eq("product_id", productId);

    if (error) {
      console.warn("Direct requirement update warning:", error.message);
    }
  } catch (err) {
    console.error("Failed to update item requirements:", err);
  }
}

