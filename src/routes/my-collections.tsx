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

export const Route = createFileRoute("/my-collections")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://solidas.com.ng/my-collections" }],
    meta: [
      { title: "My Collection History | SOLIDAS" },
      { name: "robots", content: "noindex, nofollow" },
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
        prods.forEach((p) => { pMap[p.id] = p; });

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
    return <div className="container-app py-10 text-sm text-muted-foreground">Loading collection history…</div>;
  }

  if (!user) {
    return (
      <div className="container-app py-10 max-w-md text-center space-y-4">
        <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <h2 className="font-display text-xl font-semibold">Sign in to view Collection History</h2>
        <p className="text-xs text-muted-foreground">Your submitted project quotation requests are saved to your account history as permanent immutable records.</p>
        <Link to="/auth" search={{ redirectTo: "/my-collections", autoPush: false }} className="inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/account" className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Account
            </Link>
          </div>
          <h1 className="font-display text-2xl font-semibold mt-1">My Collection History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Permanent immutable record of your submitted project quotation requests.
          </p>
        </div>
        <Link to="/collection" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shrink-0">
          <Layers className="h-4 w-4" /> Go to Active Workspace
        </Link>
      </div>

      {historyCollections.length === 0 ? (\n        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3">\n          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />\n          <h3 className="font-semibold text-base">No Submitted Quotation Requests Yet</h3>\n          <p className="text-xs text-muted-foreground max-w-md mx-auto">\n            When you submit a project collection via Push to WhatsApp, a permanent immutable record will be stored here.\n          </p>\n          <Link to="/collection" className="inline-block rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">\n            Open Active Project Workspace\n          </Link>\n        </div>\n      ) : (\n        <div className="space-y-4">\n          {historyCollections.map((col) => {\n            const prods = productsMap[col.id] || [];\n            const isDuplicating = duplicatingId === col.id;\n            const isExpanded = Boolean(expandedMap[col.id]);\n            let totalVal = 0;\n            prods.forEach((p) => { totalVal += Number(p.price || 0) * Number(p.quantity || 1); });\n\n            return (\n              <div key={col.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/40 transition">\n                {/* Header Collapsed Card Row */}\n                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">\n                  <div className="space-y-1">\n                    <div className="flex flex-wrap items-center gap-2">\n                      <h3 className="font-display text-base font-semibold">{col.name || "Project Request"}</h3>\n                      {col.reference_number && (\n                        <span className="rounded-md bg-surface-2 text-foreground text-xs font-mono font-bold px-2.5 py-0.5 border border-border">\n                          {col.reference_number}\n                        </span>\n                      )}\n                      <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 border border-primary/20">\n                        v{col.version || 1}\n                      </span>\n                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium px-2 py-0.5 border border-amber-500/20">\n                        <Lock className="h-3 w-3" /> Immutable Record\n                      </span>\n                    </div>\n                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">\n                      <span className="flex items-center gap-1">\n                        <Calendar className="h-3.5 w-3.5" />\n                        Submitted on {new Date(col.submitted_at || col.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}\n                      </span>\n                      <span>• {prods.length} Products</span>\n                      <span>• Est. Total: <strong className="text-foreground">₦{totalVal.toLocaleString()}</strong></span>\n                      <span>• Status: <strong className="text-foreground">{col.status || "Submitted"}</strong></span>\n                    </div>\n                  </div>\n\n                  <div className="flex items-center gap-2 shrink-0">\n                    <button\n                      onClick={() => toggleExpand(col.id)}\n                      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border bg-background hover:bg-surface-2 transition"\n                    >\n                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}\n                      <span>{isExpanded ? "Hide Details" : `View Products (${prods.length})`}</span>\n                    </button>\n\n                    {/* Create Updated Request (v+1) Action Button */}\n                    <button\n                      onClick={() => handleCreateUpdatedRequest(col.id)}\n                      disabled={isDuplicating}\n                      className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition shadow-sm"\n                    >\n                      <RefreshCw className={`h-3.5 w-3.5 ${isDuplicating ? "animate-spin" : ""}`} />\n                      Duplicate to Active Workspace\n                    </button>\n                  </div>\n                </div>\n\n                {/* Expandable Detailed Product Breakdown Panel */}\n                {isExpanded && (\n                  <div className="border-t border-border/70 bg-surface-2/30 p-4 sm:p-5 space-y-3">\n                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">\n                      <span>Products Breakdown ({prods.length})</span>\n                      <span>Est. Total: <strong className="text-foreground">₦{totalVal.toLocaleString()}</strong></span>\n                    </div>\n\n                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">\n                      {prods.map((p, idx) => (\n                        <div key={`${col.id}-${p.id || idx}`} className="rounded-lg border border-border bg-background p-3 flex items-start gap-3">\n                          <img src={publicImageUrl(p.generated_studio_image) || publicImageUrl(p.image_url) || ""} alt={p.name} className="h-12 w-12 rounded-md object-cover bg-muted border border-border/40 shrink-0" />\n                          <div className="min-w-0 flex-1 text-xs space-y-0.5">\n                            <p className="font-semibold text-foreground truncate">{p.name}</p>\n                            <p className="text-muted-foreground">Code: {p.code} — <strong className="text-primary">{p.quantity} {p.unit}</strong></p>\n                            {p.location && <p className="text-muted-foreground/80 truncate">Loc: {p.location}</p>}\n                            {p.delivery && <p className="text-muted-foreground/80 truncate">Delivery: {p.delivery}</p>}\n                            {p.notes && <p className="text-muted-foreground/80 italic truncate">Notes: {p.notes}</p>}\n                          </div>\n                        </div>\n                      ))}\n                    </div>\n                  </div>\n                )}\n              </div>\n            );\n          })}\n        </div>\n      )}\n    </div>\n  );\n}\n