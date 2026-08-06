import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchProductsByIds,
  getGuestCollection,
  getUserCollectionItems,
  getCachedUserCollectionItems,
  getBatchCollectionWorkspaceData,
  ensureUserCollection,
  removeGuestItem,
  removeItemFromUserCollection,
  detectProductUnit,
  updateGuestItemRequirements,
  updateUserItemRequirements,
  lockAndSubmitCollection,
  generateCollectionReference,
  updateCustomerPhoneNumber,
  setGuestCollection,
  mergeGuestIntoUser,
  getUserItemRequirements,
  type ItemRequirements,
  type CollectionV2
} from "@/lib/collection";
import { useAppSettings, waLink } from "@/lib/settings";
import { toast } from "sonner";
import { MessageCircle, Share2, Trash2, Heart, ChevronDown, ChevronUp, Lock, RefreshCw, FileText, Phone, CheckCircle2, AlertCircle, History, Layers } from "lucide-react";
import { publicImageUrl } from "@/components/ImageUploader";

export const Route = createFileRoute("/collection")({
  validateSearch: (search: Record<string, unknown>): { autoPush?: boolean } => {
    return {
      autoPush: search.autoPush === "true" || search.autoPush === true ? true : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Active Project Workspace — Enreach Concepts" }] }),
  component: CollectionPage,
});

function CollectionPage() {
  const { user, loading } = useAuth();
  const search = useSearch({ from: "/collection" });
  const navigate = useNavigate();
  const { data: settings } = useAppSettings();

  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [collectionData, setCollectionData] = useState<CollectionV2 | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [lastSubmittedRef, setLastSubmittedRef] = useState<string | null>(null);
  
  // Custom double tab toggle views
  const [activeView, setActiveView] = useState<"collection" | "favorites">("collection");
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);

  // Project Requirements state per product
  const [requirementsMap, setRequirementsMap] = useState<Record<string, ItemRequirements>>({});
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phone modal & popup blocker fallback state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState<string | null>(null);

  // Remove confirmation modal state
  const [productToRemove, setProductToRemove] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (user) {
        // 1. Instant local cached render (< 16ms)
        const cached = getCachedUserCollectionItems(user.id);
        if (cached.items && cached.items.length > 0) {
          setCollectionId(cached.collection_id || null);
          setItems(cached.items);
          fetchProductsByIds(cached.items.map((i: any) => i.product_id)).then((cachedProds) => {
            if (cachedProds.length > 0) setProducts(cachedProds);
          });
        }

        // 2. Non-blocking guest merge if present
        const guestItems = getGuestCollection();
        if (guestItems.length > 0) {
          await mergeGuestIntoUser(user.id);
        }

        // 3. Parallel background sync (< 1 roundtrip)
        const batch = await getBatchCollectionWorkspaceData(user.id);
        setUserProfile(batch.profile);
        setCollectionId(batch.collectionId);
        setItems(batch.items);
        if (batch.collectionData) {
          setCollectionData({
            id: batch.collectionData.id,
            user_id: batch.collectionData.user_id,
            name: batch.collectionData.name || "Project Workspace",
            reference_number: (batch.collectionData as any).reference_number || generateCollectionReference(batch.collectionData.id),
            project_name: (batch.collectionData as any).project_name || null,
            status: (batch.collectionData as any).status || "Draft",
            is_locked: (batch.collectionData as any).is_locked ?? false,
            parent_collection_id: (batch.collectionData as any).parent_collection_id || null,
            version: (batch.collectionData as any).version || 1,
            submitted_at: (batch.collectionData as any).submitted_at || null,
            created_at: batch.collectionData.created_at,
            updated_at: batch.collectionData.updated_at,
          });
        }
        setProducts(batch.products);

        const savedUserReqs = getUserItemRequirements(user.id);
        const reqMap: Record<string, ItemRequirements> = {};
        batch.items.forEach((ci: any) => {
          const matchingProd = batch.products.find((p) => p.id === ci.product_id);
          const autoUnit = detectProductUnit(matchingProd);
          const savedReq = savedUserReqs[ci.product_id] || {};
          reqMap[ci.product_id] = {
            quantity: ci.quantity ?? savedReq.quantity ?? 1,
            unit: ci.unit || savedReq.unit || autoUnit,
            installation_location: ci.installation_location || savedReq.installation_location || "",
            delivery_preference: ci.delivery_preference || savedReq.delivery_preference || "Deliver to Site",
            installation_required: ci.installation_required || savedReq.installation_required || "Not Sure",
            project_notes: ci.project_notes || savedReq.project_notes || ""
          };
        });
        setRequirementsMap(reqMap);
      } else {
        const guest = getGuestCollection();
        setItems(guest);
        setCollectionId(null);
        setCollectionData(null);
        setUserProfile(null);
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

    if (!loading) void load();
  }, [user, loading, refreshKey]);

  // Handle autoPush parameter (Automatic WhatsApp trigger after authentication)
  useEffect(() => {
    if (search.autoPush && !loading && items.length > 0 && settings?.sales_whatsapp) {
      const timer = setTimeout(() => {
        void handlePushToWhatsAppClick();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search.autoPush, loading, items.length, settings]);

  const handleRequirementChange = (productId: string, patch: Partial<ItemRequirements>) => {
    setRequirementsMap((prev) => {
      const current = prev[productId] || {};
      const updated = { ...current, ...patch };
      if (user) {
        updateUserItemRequirements(user.id, productId, updated);
      } else {
        updateGuestItemRequirements(productId, updated);
      }
      return { ...prev, [productId]: updated };
    });
  };

  const toggleExpand = (productId: string) => {
    setExpandedMap((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const promptRemoveProduct = (product: any) => {
    setProductToRemove(product);
  };

  const confirmRemoveProduct = async () => {
    if (!productToRemove) return;
    const productId = productToRemove.id;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setItems((prev) => prev.filter((i) => i.product_id !== productId));

    if (user) {
      await removeItemFromUserCollection(user.id, productId);
    } else {
      removeGuestItem(productId);
    }
    setProductToRemove(null);
    toast.success("Item removed from collection");
  };

  // Summary Metrics Calculation
  const summaryMetrics = useMemo(() => {
    const activeProducts = activeView === "collection" ? products : favoriteProducts;
    let totalPieces = 0;
    let totalSqM = 0;
    let totalPrice = 0;
    let installerRequestedCount = 0;
    let deliveryItemsCount = 0;

    activeProducts.forEach((p) => {
      const req = requirementsMap[p.id] || {};
      const qty = req.quantity || 1;
      const unit = req.unit || detectProductUnit(p);
      const price = Number(p.price || 0);

      if (unit === "m²") totalSqM += qty;
      else totalPieces += qty;

      totalPrice += price * qty;

      if (req.installation_required && req.installation_required !== "Not Sure" && req.installation_required !== "No, Supply Only") {
        installerRequestedCount++;
      }

      if (req.delivery_preference && req.delivery_preference !== "Self Pickup") {
        deliveryItemsCount++;
      }
    });

    const qtyParts: string[] = [];
    if (totalSqM > 0) qtyParts.push(`${totalSqM.toLocaleString()} m²`);
    if (totalPieces > 0) qtyParts.push(`${totalPieces.toLocaleString()} Pcs`);
    const totalQtyString = qtyParts.join(" + ") || "0 Items";

    return {
      totalPieces,
      totalSqM,
      totalPriceFormatted: `₦${totalPrice.toLocaleString()}`,
      totalQtyString,
      installerRequestedCount,
      deliveryItemsCount,
      itemCount: activeProducts.length
    };
  }, [products, favoriteProducts, activeView, requirementsMap]);

  const handlePushToWhatsAppClick = async () => {
    const currentPhone = userProfile?.phone_number || user?.phone || user?.user_metadata?.phone;
    if (!currentPhone && user) {
      setShowPhoneModal(true);
      return;
    }
    await executePushToWhatsApp();
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (user) {
      await updateCustomerPhoneNumber(user.id, phoneInput.trim());
      setUserProfile((prev: any) => ({ ...(prev || {}), phone_number: phoneInput.trim() }));
    }

    setShowPhoneModal(false);
    toast.success("Phone number saved to profile");
    await executePushToWhatsApp();
  };

  const executePushToWhatsApp = async () => {
    if (!settings?.sales_whatsapp) {
      toast.error("Sales WhatsApp not configured");
      return;
    }

    const activeItems = activeView === "collection" ? products : favoriteProducts;
    let id = collectionId || (user ? getCachedUserCollectionItems(user.id).collection_id : "");
    const refNum = collectionData?.reference_number || generateCollectionReference(id || undefined);
    const versionStr = collectionData?.version && collectionData.version > 1 ? ` (v${collectionData.version})` : "";
    const shareUrl = id ? `${window.location.origin}/collection/${id}` : `${window.location.origin}/collection`;

    // 1. Construct WhatsApp message synchronously (< 16ms)
    const messageParts = [
      "Hello Enreach Concepts,",
      "",
      "I would like a quotation for my project.",
      "",
      `Collection Reference:`,
      `*${refNum}${versionStr}*`,
      "",
      `Collection Link:`,
      `${shareUrl}`,
      "",
      `*SELECTED PRODUCTS (${activeItems.length}):*`
    ];

    activeItems.forEach((p, idx) => {
      const req = requirementsMap[p.id] || {};
      const qty = req.quantity || 1;
      const unit = req.unit || detectProductUnit(p);
      const loc = req.installation_location ? ` | Loc: ${req.installation_location}` : "";
      const del = req.delivery_preference ? ` | Delivery: ${req.delivery_preference}` : "";
      const inst = req.installation_required && req.installation_required !== "Not Sure" ? ` | Install: ${req.installation_required}` : "";
      const notes = req.project_notes ? ` | Notes: ${req.project_notes}` : "";

      messageParts.push(
        `${idx + 1}. *${p.name}* (Code: ${p.code}) — ${qty} ${unit}${loc}${del}${inst}${notes}`
      );
    });

    messageParts.push(
      "",
      `*PROJECT SUMMARY:*`,
      `Total Est. Quantity: ${summaryMetrics.totalQtyString}`,
      `Total Est. Value: ${summaryMetrics.totalPriceFormatted}`,
      `Delivery Items: ${summaryMetrics.deliveryItemsCount}`,
      `Installer Service Requested: ${summaryMetrics.installerRequestedCount > 0 ? "Yes" : "No"}`
    );

    const msg = messageParts.join("\n");
    const url = waLink(settings.sales_whatsapp, msg);

    // 2. INSTANT WHATSAPP WINDOW LAUNCH (< 16ms) within immediate click gesture stack
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win || win.closed || typeof win.closed === "undefined") {
      setWhatsappFallbackUrl(url);
      toast("Quotation ready! Click the green button below to launch WhatsApp.");
    } else {
      toast.success("Quotation request submitted & saved to History!");
    }

    // 3. Clear active workspace state immediately (< 16ms)
    setGuestCollection([]);
    setItems([]);
    setProducts([]);
    setJustSubmitted(true);
    setLastSubmittedRef(refNum);
    setCollectionId(null);
    setCollectionData(null);

    // 4. Background non-blocking database lock & CRM inquiry logging
    (async () => {
      let targetId = id;
      if (!targetId && user) targetId = await ensureUserCollection(user.id);
      if (targetId) {
        await lockAndSubmitCollection(targetId, user?.id);
        if (user) {
          try {
            await supabase.from("whatsapp_inquiries").insert({
              collection_id: targetId,
              customer_name: user.user_metadata?.full_name || user.email || "Customer",
              customer_phone: userProfile?.phone_number || user.phone || user.user_metadata?.phone || "",
              customer_email: user.email ?? null,
              whatsapp_number: userProfile?.phone_number || user.user_metadata?.whatsapp || user.phone || null,
              inquiry_status: "NEW",
              status: "pending",
            } as never);
          } catch {}
        }
      }
    })();
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
    <div className="container-app py-6 space-y-6">
      {/* 1. PAGE TITLE & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold">Active Project Workspace</h1>
            {collectionData?.reference_number && (
              <span className="rounded-md bg-card text-foreground text-xs font-mono font-bold px-2.5 py-1 border border-border">
                {collectionData.reference_number}
              </span>
            )}
            {collectionData?.version && collectionData.version > 1 && (
              <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 border border-primary/20">
                v{collectionData.version}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Build your custom project bill of quantities, set specifications, and push directly to WhatsApp for rapid pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Link
              to="/my-collections"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2 transition"
            >
              <History className="h-4 w-4 text-primary" />
              <span>Collection History</span>
            </Link>
          )}
          {collectionId && (
            <button
              onClick={shareLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2 transition"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span>Share Link</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      {justSubmitted ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4 max-w-lg mx-auto">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-foreground">Quotation Request Submitted!</h2>
            <p className="text-xs text-muted-foreground">
              Reference: <strong className="font-mono text-foreground">{lastSubmittedRef}</strong>
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              Your quotation request was saved to your permanent Collection History. Your active project workspace is now reset and ready for your next project quotation.
            </p>
          </div>

          {whatsappFallbackUrl && (
            <div className="pt-2">
              <a
                href={whatsappFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition"
              >
                <MessageCircle className="h-4 w-4" />
                Launch WhatsApp Now
              </a>
            </div>
          )}

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setJustSubmitted(false);
                setLastSubmittedRef(null);
                setWhatsappFallbackUrl(null);
              }}
              className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              Start New Project Workspace
            </button>
            {user && (
              <Link
                to="/my-collections"
                className="rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-2 transition"
              >
                View Collection History
              </Link>
            )}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
          <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">No Active Project Workspace</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Explore our luxury surface catalogue and save products to build your project quotation.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition shadow-sm"
            >
              Browse Catalogue
            </Link>
            {user && (
              <Link
                to="/my-collections"
                className="inline-block rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-2 transition"
              >
                View Collection History
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List & Specification Inputs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Selected Products ({products.length})
              </span>
              <span className="text-xs text-muted-foreground">
                Est. Value: <strong className="text-foreground font-medium">{summaryMetrics.totalPriceFormatted}</strong>
              </span>
            </div>

            <div className="space-y-4">
              {products.map((product) => {
                const req = requirementsMap[product.id] || {};
                const isExpanded = Boolean(expandedMap[product.id]);
                const qty = req.quantity || 1;
                const unit = req.unit || detectProductUnit(product);
                const itemTotal = Number(product.price || 0) * qty;

                return (
                  <div
                    key={product.id}
                    className="rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/30 transition"
                  >
                    <div className="p-4 flex items-start gap-4">
                      <img
                        src={publicImageUrl(product.generated_studio_image) || publicImageUrl(product.image_url) || ""}
                        alt={product.name}
                        className="h-20 w-20 rounded-lg object-cover bg-muted border border-border/50 shrink-0"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to="/product/$slug"
                              params={{ slug: product.slug }}
                              className="font-semibold text-sm text-foreground hover:text-primary transition line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground font-mono">Code: {product.code}</p>
                          </div>
                          <button
                            onClick={() => promptRemoveProduct(product)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-500/10 transition"
                            title="Remove product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quantity & Unit Controls */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <div className="flex items-center border border-border rounded-lg bg-surface-2 overflow-hidden">
                            <button
                              onClick={() => handleRequirementChange(product.id, { quantity: Math.max(1, qty - 1) })}
                              className="px-2.5 py-1 text-xs font-bold text-foreground hover:bg-card transition"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-xs font-semibold font-mono border-x border-border/60 min-w-[2.5rem] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleRequirementChange(product.id, { quantity: qty + 1 })}
                              className="px-2.5 py-1 text-xs font-bold text-foreground hover:bg-card transition"
                            >
                              +
                            </button>
                          </div>

                          <select
                            value={unit}
                            onChange={(e) => handleRequirementChange(product.id, { unit: e.target.value })}
                            className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium focus:outline-none"
                          >
                            <option value="Pieces">Pieces</option>
                            <option value="m²">m²</option>
                          </select>

                          <span className="text-xs font-semibold text-primary ml-auto">
                            ₦{itemTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Specification Details Button */}
                    <div className="border-t border-border/50 bg-surface-2/40 px-4 py-2 flex items-center justify-between text-xs">
                      <button
                        onClick={() => toggleExpand(product.id)}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        <span>{isExpanded ? "Hide Specifications" : "Set Installation & Delivery Specs"}</span>
                      </button>

                      {(req.installation_location || req.delivery_preference || req.project_notes) && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Specs Configured
                        </span>
                      )}
                    </div>

                    {/* Expandable Specifications Panel */}
                    {isExpanded && (
                      <div className="border-t border-border/60 bg-surface-2/60 p-4 space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-muted-foreground font-medium mb-1">
                              Installation Location (e.g. Living Room Floor)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Master Bathroom Wall"
                              value={req.installation_location || ""}
                              onChange={(e) => handleRequirementChange(product.id, { installation_location: e.target.value })}
                              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-muted-foreground font-medium mb-1">
                              Delivery Preference
                            </label>
                            <select
                              value={req.delivery_preference || "Deliver to Site"}
                              onChange={(e) => handleRequirementChange(product.id, { delivery_preference: e.target.value })}
                              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                            >
                              <option value="Deliver to Site">Deliver to Site (Lagos/Nationwide)</option>
                              <option value="Self Pickup">Self Pickup from Showroom</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-muted-foreground font-medium mb-1">
                              Installation Service Required?
                            </label>
                            <select
                              value={req.installation_required || "Not Sure"}
                              onChange={(e) => handleRequirementChange(product.id, { installation_required: e.target.value })}
                              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                            >
                              <option value="Not Sure">Not Sure (Need Advice)</option>
                              <option value="Yes, Full Installation">Yes, Full Installation Required</option>
                              <option value="No, Supply Only">No, Supply Material Only</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-muted-foreground font-medium mb-1">
                              Special Project Notes / Cuts
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 60x120cm size, bullnose edge"
                              value={req.project_notes || ""}
                              onChange={(e) => handleRequirementChange(product.id, { project_notes: e.target.value })}
                              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quotation Summary Card & Push to WhatsApp Action */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 sticky top-20 shadow-sm">
              <div className="border-b border-border pb-3">
                <h3 className="font-display text-base font-semibold">Quotation Summary</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Est. summary bill of quantities for WhatsApp submission.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Selected Products:</span>
                  <span className="font-semibold text-foreground">{summaryMetrics.itemCount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. Total Quantity:</span>
                  <span className="font-semibold text-foreground">{summaryMetrics.totalQtyString}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Services:</span>
                  <span className="font-semibold text-foreground">{summaryMetrics.deliveryItemsCount} Items Configured</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Installer Services:</span>
                  <span className="font-semibold text-foreground">
                    {summaryMetrics.installerRequestedCount > 0 ? "Requested" : "None"}
                  </span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-foreground">Est. Total Material Cost:</span>
                  <span className="font-bold text-lg text-primary">{summaryMetrics.totalPriceFormatted}</span>
                </div>
              </div>

              <button
                onClick={handlePushToWhatsAppClick}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.99] transition shadow-md disabled:opacity-50"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Push Collection to WhatsApp</span>
              </button>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Submitting saves your project collection to your permanent History record and opens WhatsApp for direct pricing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phone Input Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
            <div className="space-y-1 text-center">
              <Phone className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-display text-lg font-bold text-foreground">Enter Phone Number</h3>
              <p className="text-xs text-muted-foreground">
                Please provide a phone number so our sales team can attach your quotation to your project account.
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-3">
              <input
                type="tel"
                placeholder="e.g. +234 801 234 5678"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="flex-1 rounded-xl border border-border bg-surface-2 py-2 text-xs font-semibold text-foreground hover:bg-card transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition shadow-sm"
                >
                  Save & Push to WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {productToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
            <div className="space-y-1 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
              <h3 className="font-display text-lg font-bold text-foreground">Remove Product?</h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to remove <strong className="text-foreground">{productToRemove.name}</strong> from your active project workspace?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToRemove(null)}
                className="flex-1 rounded-xl border border-border bg-surface-2 py-2.5 text-xs font-semibold text-foreground hover:bg-card transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveProduct}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
