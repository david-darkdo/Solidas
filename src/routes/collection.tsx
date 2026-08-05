import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchProductsByIds,
  getGuestCollection,
  getUserCollectionItems,
  ensureUserCollection,
  removeGuestItem,
  removeItemFromUserCollection,
  detectProductUnit,
  updateGuestItemRequirements,
  updateUserItemRequirements,
  lockAndSubmitCollection,
  duplicateCollection,
  type ItemRequirements,
  type CollectionV2
} from "@/lib/collection";
import { useAppSettings, waLink } from "@/lib/settings";
import { toast } from "sonner";
import { MessageCircle, Share2, Trash2, Heart, ChevronDown, ChevronUp, Lock, Copy, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { publicImageUrl } from "@/components/ImageUploader";

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [{ title: "My Project Collection — Stoneworks" }] }),
  component: CollectionPage,
});

function CollectionPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useAppSettings();
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [collectionData, setCollectionData] = useState<CollectionV2 | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Custom double tab toggle views
  const [activeView, setActiveView] = useState<"collection" | "favorites">("collection");
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);

  // V2 Project Requirements state per product
  const [requirementsMap, setRequirementsMap] = useState<Record<string, ItemRequirements>>({});
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const { collection_id, items: colItems } = await getUserCollectionItems(user.id);
        setCollectionId(collection_id);
        setItems(colItems);

        // Fetch collection header info
        const { data: colInfo } = await supabase
          .from("collections")
          .select("*")
          .eq("id", collection_id)
          .maybeSingle();

        if (colInfo) {
          setCollectionData({
            id: colInfo.id,
            user_id: colInfo.user_id,
            name: colInfo.name,
            project_name: (colInfo as any).project_name || null,
            status: (colInfo as any).status || (colInfo.whatsapp_sent ? "Sent" : "Draft"),
            is_locked: (colInfo as any).is_locked ?? Boolean(colInfo.whatsapp_sent),
            parent_collection_id: (colInfo as any).parent_collection_id || null,
            version: (colInfo as any).version || 1,
            submitted_at: (colInfo as any).submitted_at || null,
            created_at: colInfo.created_at,
            updated_at: colInfo.updated_at,
          });
        }

        const prods = await fetchProductsByIds(colItems.map((i: any) => i.product_id));
        setProducts(prods);

        // Map initial requirements
        const reqMap: Record<string, ItemRequirements> = {};
        colItems.forEach((ci: any) => {
          const matchingProd = prods.find((p) => p.id === ci.product_id);
          const autoUnit = detectProductUnit(matchingProd);
          reqMap[ci.product_id] = {
            quantity: ci.quantity ?? 1,
            unit: ci.unit || autoUnit,
            installation_location: ci.installation_location || "",
            delivery_preference: ci.delivery_preference || "Deliver to Site",
            installation_required: ci.installation_required || "Not Sure",
            project_notes: ci.project_notes || ""
          };
        });
        setRequirementsMap(reqMap);
      } else {
        const guest = getGuestCollection();
        setItems(guest);
        setCollectionId(null);
        setCollectionData(null);
        const prods = await fetchProductsByIds(guest.map((g) => g.product_id));
        setProducts(prods);

        const reqMap: Record<string, ItemRequirements> = {};
        guest.forEach((gi) => {
          const matchingProd = prods.find((p) => p.id === gi.product_id);
          const autoUnit = detectProductUnit(matchingProd);
          reqMap[gi.product_id] = {
            quantity: gi.quantity ?? 1,
            unit: gi.unit || autoUnit,
            installation_location: gi.installation_location || "",
            delivery_preference: gi.delivery_preference || "Deliver to Site",
            installation_required: gi.installation_required || "Not Sure",
            project_notes: gi.project_notes || ""
          };
        });
        setRequirementsMap(reqMap);
      }
    };

    const loadFavorites = async () => {
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();
      if (!profile?.id) return;

      const { data: favs } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", profile.id);
      if (favs && favs.length > 0) {
        const prodData = await fetchProductsByIds(favs.map((f) => f.product_id));
        setFavoriteProducts(prodData);
      } else {
        setFavoriteProducts([]);
      }
    };

    if (!loading) {
      void load();
      void loadFavorites();
    }
  }, [user, loading, refreshKey]);

  // Update item requirements handler
  const handleRequirementChange = async (productId: string, field: keyof ItemRequirements, value: any) => {
    if (collectionData?.is_locked) {
      toast.error("This collection has been submitted and is locked from editing.");
      return;
    }

    const updated = {
      ...(requirementsMap[productId] || {}),
      [field]: value
    };

    setRequirementsMap((prev) => ({
      ...prev,
      [productId]: updated
    }));

    if (user && collectionId) {
      await updateUserItemRequirements(collectionId, productId, updated);
    } else {
      updateGuestItemRequirements(productId, updated);
    }
  };

  const toggleExpand = (productId: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const removeFavorite = async (productId: string) => {
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).maybeSingle();
    if (!profile?.id) return;
    await supabase.from("favorites").delete().eq("user_id", profile.id).eq("product_id", productId);
    toast.success("Removed from favorites");
    setRefreshKey((k) => k + 1);
  };

  const remove = async (productId: string) => {
    if (collectionData?.is_locked) {
      toast.error("This collection is locked after submission.");
      return;
    }
    if (user) await removeItemFromUserCollection(user.id, productId);
    else removeGuestItem(productId);
    setRefreshKey((k) => k + 1);
  };

  // Collection Summary metrics
  const summaryMetrics = useMemo(() => {
    const activeProds = activeView === "collection" ? products : favoriteProducts;
    let totalPrice = 0;
    const unitTotals: Record<string, number> = {};

    activeProds.forEach((p) => {
      const req = requirementsMap[p.id] || {};
      const qty = Number(req.quantity || 1);
      const unit = req.unit || detectProductUnit(p);
      const price = Number(p.price || 0);

      totalPrice += price * qty;
      unitTotals[unit] = (unitTotals[unit] || 0) + qty;
    });

    const qtyStringParts = Object.entries(unitTotals).map(([unit, count]) => `${count} ${unit}`);
    const totalQtyString = qtyStringParts.join(" + ") || "0 items";

    return {
      totalProducts: activeProds.length,
      totalQtyString,
      totalPriceFormatted: `₦${totalPrice.toLocaleString()}`
    };
  }, [products, favoriteProducts, requirementsMap, activeView]);

  const pushToWhatsApp = async () => {
    if (!settings?.sales_whatsapp) {
      toast.error("Sales WhatsApp not configured");
      return;
    }
    let id = collectionId;
    if (!id && user) id = await ensureUserCollection(user.id);

    setIsSubmitting(true);
    try {
      const activeItems = activeView === "collection" ? products : favoriteProducts;
      const shareUrl = id ? `${window.location.origin}/collection/${id}` : `${window.location.origin}/collection`;
      const isLocked = Boolean(collectionData?.is_locked);
      const versionStr = collectionData?.version && collectionData.version > 1 ? ` (v${collectionData.version})` : "";

      // Lock collection if not already locked
      if (id && !isLocked) {
        await lockAndSubmitCollection(id);
      }

      // Auto-create inquiry record for CRM
      if (user && id) {
        try {
          await supabase.from("whatsapp_inquiries").insert({
            collection_id: id,
            customer_name: user.user_metadata?.full_name || user.email || "Customer",
            customer_phone: user.phone || user.user_metadata?.phone || "",
            customer_email: user.email ?? null,
            whatsapp_number: user.user_metadata?.whatsapp || user.phone || null,
            inquiry_status: "NEW",
            status: "pending",
          } as never);
        } catch {
          /* non-blocking */
        }
      }

      const messageParts = [
        `*ENREACH CONCEPTS — QUOTATION REQUEST${versionStr}*`,
        `Shared Link: ${shareUrl}`,
        `Project Name: ${collectionData?.project_name || "General Selection"}`,
        "",
        `*SELECTED PRODUCTS (${activeItems.length}):*`
      ];

      activeItems.forEach((p, idx) => {
        const req = requirementsMap[p.id] || {};
        const qty = req.quantity || 1;
        const unit = req.unit || detectProductUnit(p);
        const loc = req.installation_location ? ` | Location: ${req.installation_location}` : "";
        const del = req.delivery_preference ? ` | Delivery: ${req.delivery_preference}` : "";
        const inst = req.installation_required && req.installation_required !== "Not Sure" ? ` | Install: ${req.installation_required}` : "";
        const notes = req.project_notes ? ` | Notes: ${req.project_notes}` : "";

        messageParts.push(
          `${idx + 1}. *${p.name}* (Code: ${p.code})`,
          `   Quantity: ${qty} ${unit}${loc}${del}${inst}${notes}`
        );
      });

      messageParts.push(
        "",
        `*SUMMARY:*`,
        `Total Est. Quantity: ${summaryMetrics.totalQtyString}`,
        `Total Est. Value: ${summaryMetrics.totalPriceFormatted}`
      );

      const msg = messageParts.join("\n");
      window.open(waLink(settings.sales_whatsapp, msg), "_blank", "noopener,noreferrer");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error("Error submitting quotation request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUpdatedRequest = async () => {
    if (!collectionId || !user) {
      toast.error("Please sign in to create an updated request.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newColId = await duplicateCollection(collectionId, user.id);
      setCollectionId(newColId);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error("Failed to duplicate collection for update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareLink = async () => {
    let id = collectionId;
    if (!id && user) id = await ensureUserCollection(user.id);
    if (!id) {
      toast("Sign in to share your collection by link");
      return;
    }
    const url = `${window.location.origin}/collection/${id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="container-app py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold">
              {collectionData?.name || "My Project Collection"}
            </h1>
            {collectionData?.version && collectionData.version > 1 && (
              <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 border border-primary/20">
                v{collectionData.version}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user ? "Synced to your account" : "Saved on this device — sign in to sync"}
          </p>
        </div>
        {!user && (
          <Link to="/auth" className="rounded-md border border-primary px-3.5 py-1.5 text-sm font-medium text-primary hover:bg-primary/10">
            Sign in to Save
          </Link>
        )}
      </div>

      {/* Locked Status Alert Banner */}
      {collectionData?.is_locked && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-sm">Request Submitted — Collection Locked</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                This quotation request was sent to WhatsApp on {new Date(collectionData.submitted_at || collectionData.updated_at).toLocaleDateString()}. It cannot be modified directly.
              </p>
            </div>
          </div>
          {user && (
            <button
              onClick={handleCreateUpdatedRequest}
              disabled={isSubmitting}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
              Create Updated Request
            </button>
          )}
        </div>
      )}

      {/* View Toggles Tab with Heart Icon */}
      {user && (
        <div className="flex gap-4 border-b border-border pb-2 mt-4 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveView("collection")}
            className={`pb-1.5 border-b-2 transition ${
              activeView === "collection" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            My Project Items ({products.length})
          </button>
          <button
            onClick={() => setActiveView("favorites")}
            className={`pb-1.5 border-b-2 transition flex items-center gap-1.5 ${
              activeView === "favorites" ? "border-red-500 text-red-500" : "border-transparent text-muted-foreground"
            }`}
          >
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            Favorited Hearts ({favoriteProducts.length})
          </button>
        </div>
      )}

      {(activeView === "collection" ? products : favoriteProducts).length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {activeView === "collection" ? "Your collection is empty." : "You have not favorited any products yet."}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Browse our catalogue of premium tiles, stone, and sanitary wares to add products to your project collection.
          </p>
          <Link to="/" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Browse Showroom Catalogue
          </Link>
        </div>
      ) : (
        <>
          {/* COLLECTION SUMMARY HEADER */}
          <div className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Project Collection Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg bg-surface-2/60 p-3 border border-border/50">
                <span className="text-xs text-muted-foreground block">Selected Products</span>
                <span className="font-semibold text-lg text-foreground">{summaryMetrics.totalProducts} Products</span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3 border border-border/50">
                <span className="text-xs text-muted-foreground block">Est. Total Quantity</span>
                <span className="font-semibold text-lg text-primary">{summaryMetrics.totalQtyString}</span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3 border border-border/50">
                <span className="text-xs text-muted-foreground block">Est. Total Collection Value</span>
                <span className="font-semibold text-lg text-foreground">{summaryMetrics.totalPriceFormatted}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {collectionData?.is_locked ? (
                <button
                  onClick={handleCreateUpdatedRequest}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
                >
                  <RefreshCw className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`} />
                  Create Updated Request
                </button>
              ) : (
                <button
                  onClick={pushToWhatsApp}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" /> Push to WhatsApp
                </button>
              )}

              {activeView === "collection" && (
                <button
                  onClick={shareLink}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-surface-2 transition"
                >
                  <Share2 className="h-4 w-4" /> Share Link
                </button>
              )}
            </div>
          </div>

          {/* ITEM LIST WITH COLLAPSIBLE PROJECT REQUIREMENTS */}
          <ul className="mt-6 space-y-3">
            {(activeView === "collection" ? products : favoriteProducts).map((p) => {
              const req = requirementsMap[p.id] || {};
              const detectedUnit = detectProductUnit(p);
              const isExpanded = Boolean(expandedMap[p.id]);
              const isLocked = Boolean(collectionData?.is_locked);

              return (
                <li key={p.id} className="rounded-xl border border-border bg-card overflow-hidden transition shadow-sm hover:border-primary/40">
                  {/* Main Product Card Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/40">
                      <img src={publicImageUrl(p.generated_studio_image) || publicImageUrl(p.image_url) || ""} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link to="/product/$slug" params={{ slug: p.slug }} className="block truncate font-semibold text-base hover:text-primary">
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>Code: {p.code}</span>
                        {p.brand && <span>• {p.brand}</span>}
                      </div>
                    </div>

                    {/* Price & Quantity Summary Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-right text-base font-bold text-foreground">
                        ₦{Number(p.price).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 border border-primary/20">
                          {req.quantity || 1} {req.unit || detectedUnit}
                        </span>
                        <button
                          onClick={() => toggleExpand(p.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded-md hover:bg-surface-2 transition"
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          <span className="hidden sm:inline">{isExpanded ? "Hide Details" : "Project Requirements"}</span>
                        </button>
                      </div>
                    </div>

                    {!isLocked && (
                      <button 
                        onClick={() => activeView === "collection" ? remove(p.id) : removeFavorite(p.id)} 
                        aria-label="Remove" 
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Collapsible Project Requirement Form Panel */}
                  {isExpanded && (
                    <div className="border-t border-border/60 bg-surface-2/40 p-4 sm:p-5 text-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Requirements & Specifications</h4>
                        <span className="text-xs text-muted-foreground">
                          Auto-Detected Unit: <strong className="text-foreground">{detectedUnit}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Quantity with Auto-Unit Badge */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Required Quantity</label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="1"
                              disabled={isLocked}
                              value={req.quantity || 1}
                              onChange={(e) => handleRequirementChange(p.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
                            />
                            <span className="absolute right-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                              {req.unit || detectedUnit}
                            </span>
                          </div>
                        </div>

                        {/* Installation Location */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Installation Location</label>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="e.g. Living Room Floor, Master Bath"
                            value={req.installation_location || ""}
                            onChange={(e) => handleRequirementChange(p.id, "installation_location", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
                          />
                        </div>

                        {/* Delivery Preference */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Delivery Preference</label>
                          <select
                            disabled={isLocked}
                            value={req.delivery_preference || "Deliver to Site"}
                            onChange={(e) => handleRequirementChange(p.id, "delivery_preference", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
                          >
                            <option value="Deliver to Site">Deliver to Site</option>
                            <option value="Warehouse Pickup">Warehouse Pickup</option>
                            <option value="Freight Arrangement">Freight Arrangement</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Installation Required */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Installation Required?</label>
                          <select
                            disabled={isLocked}
                            value={req.installation_required || "Not Sure"}
                            onChange={(e) => handleRequirementChange(p.id, "installation_required", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
                          >
                            <option value="Not Sure">Not Sure (Need Advice)</option>
                            <option value="Yes">Yes (Require Installation Service)</option>
                            <option value="No">No (Supply Only)</option>
                          </select>
                        </div>

                        {/* Project Notes */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Specific Requirements & Notes</label>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="e.g. Polished finish preferred, include 10% extra for waste margin"
                            value={req.project_notes || ""}
                            onChange={(e) => handleRequirementChange(p.id, "project_notes", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

