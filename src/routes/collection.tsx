import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
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
        // Auto-merge guest items if present upon landing (e.g. after Google OAuth or email sign-in redirect)
        const guestItems = getGuestCollection();
        if (guestItems.length > 0) {
          await mergeGuestIntoUser(user.id);
        }

        // Fetch user profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("auth_id", user.id)
          .maybeSingle();

        setUserProfile(prof);

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
            name: colInfo.name || "Project Workspace",
            reference_number: (colInfo as any).reference_number || generateCollectionReference(colInfo.id),
            project_name: (colInfo as any).project_name || null,
            status: (colInfo as any).status || "Draft",
            is_locked: (colInfo as any).is_locked ?? false,
            parent_collection_id: (colInfo as any).parent_collection_id || null,
            version: (colInfo as any).version || 1,
            submitted_at: (colInfo as any).submitted_at || null,
            created_at: colInfo.created_at,
            updated_at: colInfo.updated_at,
          });
        }

        const prods = await fetchProductsByIds(colItems.map((i: any) => i.product_id));
        setProducts(prods);

        // Map initial requirements (combining item DB specifications and user local requirements)
        const savedUserReqs = getUserItemRequirements(user.id);
        const reqMap: Record<string, ItemRequirements> = {};
        colItems.forEach((ci: any) => {
          const matchingProd = prods.find((p) => p.id === ci.product_id);
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

  // Auto resume Push to WhatsApp after authentication redirect
  useEffect(() => {
    const pendingAction = typeof window !== "undefined" ? (window.localStorage.getItem("stoneworks.pending_action") || window.localStorage.getItem("stoneworks.pending_whatsapp_push")) : null;
    if (!loading && user && (search.autoPush || pendingAction === "true" || pendingAction === "push_whatsapp") && products.length > 0 && !isSubmitting) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("stoneworks.pending_action");
        window.localStorage.removeItem("stoneworks.pending_whatsapp_push");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      void pushToWhatsApp();
    }
  }, [loading, user, search.autoPush, products.length]);

  // Requirements Auto-Save Handler (on change / blur)
  const handleRequirementChange = async (productId: string, field: keyof ItemRequirements, value: any) => {
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

  const confirmRemoveProduct = async () => {
    if (!productToRemove) return;
    const pId = productToRemove.id;
    if (activeView === "collection") {
      if (user) await removeItemFromUserCollection(user.id, pId);
      else removeGuestItem(pId);
      toast.success(`Removed ${productToRemove.name} from Active Workspace`);
    } else {
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).maybeSingle();
        if (profile?.id) {
          await supabase.from("favorites").delete().eq("user_id", profile.id).eq("product_id", pId);
          toast.success(`Removed ${productToRemove.name} from Favorites`);
        }
      }
    }
    setProductToRemove(null);
    setRefreshKey((k) => k + 1);
  };

  // Comprehensive Collection Summary Metrics
  const summaryMetrics = useMemo(() => {
    const activeProds = activeView === "collection" ? products : favoriteProducts;
    let totalPrice = 0;
    let deliveryItemsCount = 0;
    let installerRequestedCount = 0;
    const unitTotals: Record<string, number> = {};

    activeProds.forEach((p) => {
      const req = requirementsMap[p.id] || {};
      const qty = Number(req.quantity || 1);
      const unit = req.unit || detectProductUnit(p);
      const price = Number(p.price || 0);

      totalPrice += price * qty;
      unitTotals[unit] = (unitTotals[unit] || 0) + qty;

      if (req.delivery_preference !== "Warehouse Pickup") {
        deliveryItemsCount++;
      }
      if (req.installation_required === "Yes") {
        installerRequestedCount++;
      }
    });

    const qtyStringParts = Object.entries(unitTotals).map(([unit, count]) => `${count} ${unit}`);
    const totalQtyString = qtyStringParts.join(" + ") || "0 items";

    return {
      totalProducts: activeProds.length,
      totalQtyString,
      totalPriceFormatted: `₦${totalPrice.toLocaleString()}`,
      deliveryItemsCount,
      installerRequestedCount
    };
  }, [products, favoriteProducts, requirementsMap, activeView]);

  // Main Push To WhatsApp Flow Orchestrator
  const pushToWhatsApp = async () => {
    if (!user) {
      window.localStorage.setItem("stoneworks.pending_action", "push_whatsapp");
      window.localStorage.setItem("stoneworks.pending_whatsapp_push", "true");
      navigate({ to: "/auth", search: { redirectTo: "/collection", autoPush: true } });
      return;
    }

    const existingPhone = userProfile?.phone_number || user.phone || user.user_metadata?.phone;
    if (!existingPhone) {
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

    let id = collectionId;
    if (!id && user) id = await ensureUserCollection(user.id);

    setIsSubmitting(true);
    setWhatsappFallbackUrl(null);

    try {
      const activeItems = activeView === "collection" ? products : favoriteProducts;
      const shareUrl = id ? `${window.location.origin}/collection/${id}` : `${window.location.origin}/collection`;
      const refNum = collectionData?.reference_number || generateCollectionReference(id || undefined);
      const versionStr = collectionData?.version && collectionData.version > 1 ? ` (v${collectionData.version})` : "";

      // 1. Lock and submit collection into History
      if (id) {
        await lockAndSubmitCollection(id);
      }

      // 2. Auto-create CRM inquiry
      if (user && id) {
        try {
          await supabase.from("whatsapp_inquiries").insert({
            collection_id: id,
            customer_name: user.user_metadata?.full_name || user.email || "Customer",
            customer_phone: userProfile?.phone_number || user.phone || user.user_metadata?.phone || "",
            customer_email: user.email ?? null,
            whatsapp_number: userProfile?.phone_number || user.user_metadata?.whatsapp || user.phone || null,
            inquiry_status: "NEW",
            status: "pending",
          } as never);
        } catch {
          /* non-blocking */
        }
      }

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

      // Attempt WhatsApp window launch
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        setWhatsappFallbackUrl(url);
        toast("Quotation ready! Click the green button below to launch WhatsApp.");
      } else {
        toast.success("Quotation request submitted & saved to History!");
      }

      // PHASE E: WORKSPACE CLEARING AFTER SUBMISSION
      setGuestCollection([]);
      setItems([]);
      setProducts([]);
      setJustSubmitted(true);
      setLastSubmittedRef(refNum);
      setCollectionId(null);
      setCollectionData(null);
    } catch (err) {
      toast.error("Error submitting quotation request");
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
          <p className="text-sm text-muted-foreground mt-1">
            {user ? "Your working project draft — add products and customize specifications." : "Saved locally — sign in to push to WhatsApp and save history."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <Link to="/my-collections" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-medium hover:bg-surface-2 transition">
              <History className="h-4 w-4 text-amber-600" /> My Collections History
            </Link>
          )}
          {!user && (
            <Link to="/auth" search={{ redirectTo: "/collection", autoPush: false }} className="rounded-md border border-primary px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition">
              Sign in to Save & Push
            </Link>
          )}
        </div>
      </div>

      {/* Popup Blocker Fallback Banner */}
      {whatsappFallbackUrl && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Quotation Request Ready!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Click below to launch WhatsApp and send your pre-formatted quote.</p>
            </div>
          </div>
          <a
            href={whatsappFallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
          >
            <MessageCircle className="h-4 w-4" /> Continue to WhatsApp
          </a>
        </div>
      )}

      {/* Post-Submission Success Message */}
      {justSubmitted && lastSubmittedRef && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-medium text-sm">Quotation Request Submitted ({lastSubmittedRef})</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Saved to your permanent history. Active workspace is cleared and ready for your next project.</p>
            </div>
          </div>
          <Link to="/my-collections" className="text-xs font-semibold text-emerald-700 hover:underline shrink-0">
            View History →
          </Link>
        </div>
      )}

      {/* View Toggles Tab with Heart Icon */}
      {user && (
        <div className="flex gap-4 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveView("collection")}
            className={`pb-1.5 border-b-2 transition ${
              activeView === "collection" ? "border-emerald-600 text-emerald-600" : "border-transparent text-muted-foreground"
            }`}
          >
            Active Working Draft ({products.length})
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

      {/* 2. SELECTED PRODUCTS LIST (PRIMARY CONTENT FIRST) */}
      {(activeView === "collection" ? products : favoriteProducts).length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-10 sm:p-14 text-center bg-card/50 space-y-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto">
            <Layers className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">No active project workspace</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Start building your next project! Browse our curated catalogue of premium tiles, natural stone, and sanitary wares to add products.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition">
              Browse Showroom Catalogue
            </Link>
            {user && (
              <Link to="/my-collections" className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-surface-2 transition">
                View Collection History
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {(activeView === "collection" ? products : favoriteProducts).map((p) => {
              const req = requirementsMap[p.id] || {};
              const detectedUnit = detectProductUnit(p);
              const isExpanded = Boolean(expandedMap[p.id]);

              // Collapsed Preview Text String
              const previewParts = [
                `Quantity: ${req.quantity || 1} ${req.unit || detectedUnit}`,
                req.installation_location ? `Loc: ${req.installation_location}` : null,
                req.delivery_preference ? `Delivery: ${req.delivery_preference}` : null,
                req.installation_required && req.installation_required !== "Not Sure" ? `Install: ${req.installation_required}` : null,
                req.project_notes ? `Notes: ${req.project_notes}` : null
              ].filter(Boolean);
              const collapsedPreview = previewParts.join(" | ");

              return (
                <li key={p.id} className="rounded-xl border-2 border-emerald-500/30 bg-card overflow-hidden transition shadow-sm shadow-emerald-500/5 hover:border-emerald-500">
                  {/* Main Product Card Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5">
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

                      {/* Collapsed Preview Badge Text */}
                      {!isExpanded && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 truncate">
                          {collapsedPreview}
                        </p>
                      )}
                    </div>

                    {/* Price & Quantity Summary Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-right text-base font-bold text-foreground">
                        ₦{Number(p.price).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-0.5 border border-emerald-500/20">
                          {req.quantity || 1} {req.unit || detectedUnit}
                        </span>
                        <button
                          onClick={() => toggleExpand(p.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 px-2 py-1 rounded-md hover:bg-surface-2 transition"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          <span>{isExpanded ? "Hide Specs" : "▼ Project Requirements"}</span>
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => setProductToRemove(p)} 
                      aria-label="Remove Product" 
                      title="Remove from Active Workspace"
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition shrink-0"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Expandable Project Requirement Form Panel (Auto-Saves on Blur/Change) */}
                  {isExpanded && (
                    <div className="border-t border-emerald-500/20 bg-surface-2/40 p-4 sm:p-5 text-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-emerald-600" /> Project Specifications & Requirements
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          Auto-Detected Unit: <strong className="text-foreground">{detectedUnit}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Quantity with Highlight on Focus & Blur Normalization */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Required Quantity</label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="1"
                              value={req.quantity ?? ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  handleRequirementChange(p.id, "quantity", "");
                                } else {
                                  handleRequirementChange(p.id, "quantity", Math.max(1, parseInt(val) || 1));
                                }
                              }}
                              onBlur={(e) => {
                                if (!e.target.value || parseInt(e.target.value) < 1) {
                                  handleRequirementChange(p.id, "quantity", 1);
                                }
                              }}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                            <span className="absolute right-2 text-xs font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                              {req.unit || detectedUnit}
                            </span>
                          </div>
                        </div>

                        {/* Installation Location */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Installation Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Kitchen Floor, Master Bath"
                            value={req.installation_location || ""}
                            onChange={(e) => handleRequirementChange(p.id, "installation_location", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        {/* Delivery Preference */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Delivery Preference</label>
                          <select
                            value={req.delivery_preference || "Deliver to Site"}
                            onChange={(e) => handleRequirementChange(p.id, "delivery_preference", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Installation Service Required?</label>
                          <select
                            value={req.installation_required || "Not Sure"}
                            onChange={(e) => handleRequirementChange(p.id, "installation_required", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="Not Sure">Not Sure (Need Technical Advice)</option>
                            <option value="Yes">Yes (Require Installation Team)</option>
                            <option value="No">No (Supply Materials Only)</option>
                          </select>
                        </div>

                        {/* Project Notes */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Specific Notes & Allowances</label>
                          <input
                            type="text"
                            placeholder="e.g. Polished finish preferred, 10% wastage allowance"
                            value={req.project_notes || ""}
                            onChange={(e) => handleRequirementChange(p.id, "project_notes", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* 3. COMPREHENSIVE COLLECTION SUMMARY (REVIEW PHASE BEFORE SUBMISSION) */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Workspace Summary Review</h2>
              {collectionData?.reference_number && (
                <span className="text-xs font-mono font-medium text-muted-foreground">Ref: {collectionData.reference_number}</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
              <div className="rounded-lg bg-surface-2/60 p-3 border border-border/50">
                <span className="text-[11px] text-muted-foreground block">Selected Products</span>
                <span className="font-semibold text-base text-foreground">{summaryMetrics.totalProducts} Items</span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3 border border-border/50">
                <span className="text-[11px] text-muted-foreground block">Est. Total Quantity</span>
                <span className="font-semibold text-base text-emerald-600">{summaryMetrics.totalQtyString}</span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3 border border-border/50">
                <span className="text-[11px] text-muted-foreground block">Est. Collection Value</span>
                <span className="font-semibold text-base text-foreground">{summaryMetrics.totalPriceFormatted}</span>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3 border border-border/50">
                <span className="text-[11px] text-muted-foreground block">Site Delivery Items</span>
                <span className="font-semibold text-base text-foreground">{summaryMetrics.deliveryItemsCount} Items</span>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-lg bg-surface-2/60 p-3 border border-border/50">
                <span className="text-[11px] text-muted-foreground block">Installer Service</span>
                <span className="font-semibold text-base text-foreground">
                  {summaryMetrics.installerRequestedCount > 0 ? `${summaryMetrics.installerRequestedCount} Requested` : "None"}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS: PUSH TO WHATSAPP & SHARE COLLECTION */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={pushToWhatsApp}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                <MessageCircle className="h-4 w-4" /> Push to WhatsApp
              </button>

              {activeView === "collection" && (
                <button
                  onClick={shareLink}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-surface-2 transition"
                >
                  <Share2 className="h-4 w-4" /> Share Link
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* REMOVE PRODUCT CONFIRMATION MODAL */}
      {productToRemove && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-destructive/10 text-destructive shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold">Remove Product?</h3>
                <p className="text-xs text-muted-foreground">Are you sure you want to remove <strong className="text-foreground">{productToRemove.name}</strong> from your Active Workspace?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToRemove(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-surface-2 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveProduct}
                className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition"
              >
                Remove Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHONE NUMBER COLLECTION MODAL */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Help us contact you about your quotation</h3>
                <p className="text-xs text-muted-foreground">Please enter your primary phone number to complete your WhatsApp submission.</p>
              </div>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +234 801 234 5678"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-surface-2 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Save & Continue to WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
