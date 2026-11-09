import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  getUserCollectionHistory,
  fetchProductsByIds,
  duplicateCollection,
  detectProductUnit
} from "@/lib/collection";
import { toast } from "sonner";
import { FileText, RefreshCw, Lock, Calendar, Layers, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { publicImageUrl } from "@/components/ImageUploader";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/my-collections")({
  head: () => ({
    meta: [
      { title: "Collection History — SOLIDAS TILES AND MARBLE NIG. LIMITED" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: MyCollectionsHistoryPage,
});

function MyCollectionsHistoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [historyCollections, setHistoryCollections] = useState<any[]>([]);
  const [collectionItemsMap, setCollectionItemsMap] = useState<Record<string, any[]>>({});
  const [productsMap, setProductsMap] = useState<Record<string, any[]>>({});
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setBusy(false);
        return;
      }

      setBusy(true);
      const cols = await getUserCollectionHistory(user.id);
      setHistoryCollections(cols);

      if (cols.length > 0) {
        const colIds = cols.map((c: any) => c.id);
        const { data: rawItems } = await supabase
          .from("collection_items")
          .select("*")
          .in("collection_id", colIds);

        const itemsByCol: Record<string, any[]> = {};
        const allProductIds = new Set<string>();

        (rawItems || []).forEach((item: any) => {
          if (!itemsByCol[item.collection_id]) itemsByCol[item.collection_id] = [];
          itemsByCol[item.collection_id].push(item);
          allProductIds.add(item.product_id);
        });

        setCollectionItemsMap(itemsByCol);

        const prods = await fetchProductsByIds(Array.from(allProductIds));
        const pMap: Record<string, any> = {};
        prods.forEach((p: any) => { pMap[p.id] = p; });

        const colProdsMap: Record<string, any[]> = {};
        Object.entries(itemsByCol).forEach(([cId, cItems]) => {
          colProdsMap[cId] = cItems.map((ci) => ({
            ...(pMap[ci.product_id] || {}),
            quantity: ci.quantity || 1,
            unit: ci.unit || detectProductUnit(pMap[ci.product_id]),
            location: ci.installation_location,
            delivery: ci.delivery_preference,
            installation: ci.installation_required,
            notes: ci.project_notes
          }));
        });

        setProductsMap(colProdsMap);
      }
      setBusy(false);
    };

    if (!loading) void load();
  }, [user, loading]);

  const toggleExpand = (colId: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [colId]: !prev[colId]
    }));
  };

  const handleCreateUpdatedRequest = async (colId: string) => {
    if (!user) return;
    setDuplicatingId(colId);
    try {
      await duplicateCollection(user.id, colId);
      toast.success("Updated request draft created in Active Workspace!");
      navigate({ to: "/collection" });
    } catch (err) {
      toast.error("Failed to duplicate collection into active draft.");
    } finally {
      setDuplicatingId(null);
    }
  };

  if (loading || busy) {
    return <AppShell><div className="container-app py-10 text-sm text-muted-foreground">Loading SOLIDAS collection history…</div></AppShell>;
  }

  if (!user) {
    return (
      <AppShell>
        <div className="container-app py-12 max-w-md text-center space-y-4 mx-auto">
          <FileText className="h-10 w-10 text-[#1E82A6] mx-auto" />
          <h2 className="font-display text-xl font-bold text-foreground">Sign In to View Collection History</h2>
          <p className="text-xs text-muted-foreground">Your submitted project quotation requests are saved to your account history as permanent immutable records.</p>
          <Link to="/auth" search={{ redirectTo: "/my-collections", autoPush: false }} className="inline-block rounded-lg bg-[#C0262D] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#9A1B21] transition shadow-sm">
            Sign In to SOLIDAS
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container-app py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/account" className="text-muted-foreground hover:text-foreground text-xs font-bold flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Account
              </Link>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mt-1">SOLIDAS Collection History</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Permanent immutable record of your submitted project quotation requests to SOLIDAS TILES AND MARBLE NIG. LIMITED.
            </p>
          </div>
          <Link to="/collection" className="inline-flex items-center gap-2 rounded-lg bg-[#1E82A6] px-4 py-2 text-xs font-bold text-white hover:bg-[#166481] transition shrink-0 shadow-sm">
            <Layers className="h-4 w-4" /> Go to Active Workspace
          </Link>
        </div>

        {historyCollections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center space-y-3">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-base text-foreground">No Submitted Quotation Requests Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              When you submit a building material collection via Push to WhatsApp, a permanent record will be stored here.
            </p>
            <Link to="/collection" className="inline-block rounded-lg bg-[#C0262D] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#9A1B21] transition shadow-sm">
              Open Active Project Workspace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {historyCollections.map((col) => {
              const prods = productsMap[col.id] || [];
              const isDuplicating = duplicatingId === col.id;
              const isExpanded = Boolean(expandedMap[col.id]);
              let totalVal = 0;
              prods.forEach((p) => { totalVal += Number(p.price || 0) * Number(p.quantity || 1); });

              return (
                <div key={col.id} className="rounded-xl border border-border bg-white overflow-hidden shadow-xs hover:border-[#1E82A6]/40 transition">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-bold text-foreground">{col.name || "Project Request"}</h3>
                        {col.reference_number && (
                          <span className="rounded-md bg-surface-2 text-[#1E82A6] text-xs font-mono font-bold px-2.5 py-0.5 border border-border">
                            {col.reference_number}
                          </span>
                        )}
                        <span className="rounded-full bg-[#1E82A6]/10 text-[#1E82A6] text-xs font-bold px-2 py-0.5 border border-[#1E82A6]/20">
                          v{col.version || 1}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#1E82A6]/10 text-[#1E82A6] text-xs font-bold px-2 py-0.5 border border-[#1E82A6]/20">
                          <Lock className="h-3 w-3" /> Immutable Record
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-[#1E82A6]" />
                          Submitted on {new Date(col.submitted_at || col.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span>• {prods.length} Materials</span>
                        <span>• Est. Total: <strong className="text-foreground font-bold">₦{totalVal.toLocaleString()}</strong></span>
                        <span>• Status: <strong className="text-foreground font-bold">{col.status || "Submitted"}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleExpand(col.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border bg-white hover:bg-surface-2 transition"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span>{isExpanded ? "Hide Details" : `View Products (${prods.length})`}</span>
                      </button>

                      <button
                        onClick={() => handleCreateUpdatedRequest(col.id)}
                        disabled={isDuplicating}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#C0262D] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A1B21] transition shadow-xs"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isDuplicating ? "animate-spin" : ""}`} />
                        Duplicate to Active Workspace
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-surface-2 p-4 sm:p-5 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#1E82A6] flex items-center justify-between">
                        <span>Materials Breakdown ({prods.length})</span>
                        <span>Est. Total: <strong className="text-foreground">₦{totalVal.toLocaleString()}</strong></span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {prods.map((p, idx) => (
                          <div key={`${col.id}-${p.id || idx}`} className="rounded-lg border border-border bg-white p-3 flex items-start gap-3">
                            <img src={publicImageUrl(p.generated_studio_image) || publicImageUrl(p.image_url) || ""} alt={p.name} className="h-12 w-12 rounded-md object-cover bg-surface-2 border border-border shrink-0" />
                            <div className="min-w-0 flex-1 text-xs space-y-0.5">
                              <p className="font-bold text-foreground truncate">{p.name}</p>
                              <p className="text-muted-foreground">Code: {p.code} — <strong className="text-[#1E82A6] font-bold">{p.quantity} {p.unit}</strong></p>
                              {p.location && <p className="text-muted-foreground truncate">Loc: {p.location}</p>}
                              {p.delivery && <p className="text-muted-foreground truncate">Delivery: {p.delivery}</p>}
                              {p.notes && <p className="text-muted-foreground italic truncate">Notes: {p.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}