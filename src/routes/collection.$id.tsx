import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProductsByIds, detectProductUnit } from "@/lib/collection";
import { useAppSettings, waLink } from "@/lib/settings";
import { MessageCircle, Lock } from "lucide-react";
import { publicImageUrl } from "@/components/ImageUploader";

export const Route = createFileRoute("/collection/$id")({
  loader: async ({ params }) => {
    let imageUrl = "";
    try {
      const { data: items } = await supabase
        .from("collection_items")
        .select("product_id")
        .eq("collection_id", params.id)
        .limit(1);
      
      if (items && items.length > 0) {
        const { data: prod } = await supabase
          .from("products")
          .select("generated_studio_image, image_url")
          .eq("id", items[0].product_id)
          .maybeSingle();
        if (prod) {
          imageUrl = prod.generated_studio_image || prod.image_url || "";
        }
      }
    } catch (e) {
      // swallow
    }
    return { imageUrl };
  },
  head: ({ loaderData }) => {
    const title = "Shared Project Collection — Enreach Concepts";
    const desc = "Check out this curated building materials project quotation request on Enreach Concepts.";
    const img = (loaderData as any)?.imageUrl || "https://enreachconcepts.com/logo.png";
    return {
      meta: [
        { title: title },
        { name: "description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: img },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: img }
      ]
    };
  },
  component: SharedCollection,
});

function SharedCollection() {
  const { id } = Route.useParams();
  const { data: settings } = useAppSettings();
  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: c } = await supabase.from("collections").select("*").eq("id", id).maybeSingle();
      if (c) setCollection(c);

      const { data: rawItems } = await supabase
        .from("collection_items")
        .select("*")
        .eq("collection_id", id);

      const fetchedItems = rawItems ?? [];
      setItems(fetchedItems);

      const fetchedProds = await fetchProductsByIds(fetchedItems.map((i) => i.product_id));
      setProducts(fetchedProds);
    };
    load();
  }, [id]);

  const itemsWithDetails = products.map((p) => {
    const itemData = items.find((i) => i.product_id === p.id) || {};
    const unit = itemData.unit || detectProductUnit(p);
    const qty = itemData.quantity || 1;
    return {
      ...p,
      itemQty: qty,
      itemUnit: unit,
      location: itemData.installation_location,
      delivery: itemData.delivery_preference,
      installation: itemData.installation_required,
      notes: itemData.project_notes
    };
  });

  const message = [
    `Hi! I'd like to inquire about this Project Collection: ${collection?.name || "Collection"} ${collection?.version > 1 ? `(v${collection.version})` : ""}`,
    `Shared Link: ${typeof window !== "undefined" ? window.location.href : ""}`,
    "",
    "Selected Products:",
    ...itemsWithDetails.map((p, idx) => `${idx + 1}. ${p.name} (Code: ${p.code}) — ${p.itemQty} ${p.itemUnit}`),
  ].join("\n");

  return (
    <div className="container-app py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold">{collection?.name || "Shared Project Collection"}</h1>
            {collection?.version && collection.version > 1 && (
              <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 border border-primary/20">
                v{collection.version}
              </span>
            )}
            {collection?.is_locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium px-2.5 py-0.5 border border-amber-500/20">
                <Lock className="h-3 w-3" /> Submitted Request
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} product{products.length === 1 ? "" : "s"} included in this quotation request
          </p>
        </div>

        {settings?.sales_whatsapp && (
          <a
            href={waLink(settings.sales_whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition shrink-0"
          >
            <MessageCircle className="h-4 w-4" /> Inquire on WhatsApp
          </a>
        )}
      </div>

      <ul className="mt-6 space-y-3">
        {itemsWithDetails.map((p) => (
          <li key={p.id} className="rounded-xl border border-border bg-card overflow-hidden p-4 shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <Link to="/product/$slug" params={{ slug: p.slug }} className="block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/40">
                <img src={publicImageUrl(p.generated_studio_image) || publicImageUrl(p.image_url) || ""} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to="/product/$slug" params={{ slug: p.slug }} className="block truncate font-semibold text-base hover:text-primary">
                  {p.name}
                </Link>
                <p className="text-xs text-muted-foreground">Code · {p.code}</p>
                {p.location && (
                  <p className="text-xs text-primary font-medium mt-0.5">Location: {p.location}</p>
                )}
              </div>

              <div className="text-right">
                <div className="text-sm font-bold">₦{Number(p.price).toLocaleString()}</div>
                <span className="inline-block mt-1 rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5">
                  {p.itemQty} {p.itemUnit}
                </span>
              </div>
            </div>

            {(p.delivery || p.installation || p.notes) && (
              <div className="mt-3 pt-3 border-t border-border/60 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted-foreground">
                {p.delivery && <div><strong className="text-foreground">Delivery:</strong> {p.delivery}</div>}
                {p.installation && <div><strong className="text-foreground">Installation:</strong> {p.installation}</div>}
                {p.notes && <div className="sm:col-span-3"><strong className="text-foreground">Notes:</strong> {p.notes}</div>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
