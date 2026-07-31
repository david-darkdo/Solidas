import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Trash2, Globe, Search, ChevronDown, ChevronUp, Image, Layers, Cpu, ShieldCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { runProductPipeline } from "@/lib/ai-pipeline.functions";
import { generateStandaloneLifestyleImage } from "@/lib/lifestyle-image.functions";
import { runProductDetailsEngine } from "@/lib/product-details.functions";
import { ImageUploader, ImageTile, publicImageUrl } from "@/components/ImageUploader";
import { ImageEditorModal } from "@/components/ImageEditorModal";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: RebuiltEditProductPage,
});

function RebuiltEditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hierarchy option states
  const [types, setTypes] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [fams, setFams] = useState<any[]>([]);

  // AI Pipeline States
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const [generatingLifestyle, setGeneratingLifestyle] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);

  // Photo Editor Modal State
  const [editingImage, setEditingImage] = useState<{ url: string; target: "image_url" | "generated_installed_image" } | null>(null);

  // Collapsible section toggles (Default Collapsed)
  const [showAdvancedAi, setShowAdvancedAi] = useState(false);
  const [showSeoSection, setShowSeoSection] = useState(false);
  const [showSearchSection, setShowSearchSection] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    const [pRes, tRes, cRes, sRes, fRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("product_types").select("id,name").order("name"),
      supabase.from("categories").select("id,name,type_id").order("name"),
      supabase.from("subcategories").select("id,name,category_id").order("name"),
      supabase.from("family_groups").select("id,name,subcategory_id").order("name"),
    ]);

    if (pRes.error || !pRes.data) {
      toast.error("Product not found");
      navigate({ to: "/admin/products" });
      return;
    }

    setProduct(pRes.data);
    setTypes(tRes.data || []);
    setCats(cRes.data || []);
    setSubs(sRes.data || []);
    setFams(fRes.data || []);
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  const p = product || {};

  const setField = (field: string, val: any) => {
    setProduct((prev: any) => {
      const next = { ...prev, [field]: val };
      // CRITICAL SYNC RULE: Description <-> SEO Description
      if (field === "description" || field === "short_description") {
        next.description = val;
        next.short_description = val;
        next.seo_description = val;
      } else if (field === "seo_description") {
        next.description = val;
        next.short_description = val;
        next.seo_description = val;
      }
      return next;
    });
  };

  const filteredCats = useMemo(() => cats.filter((c) => c.type_id === p.type_id), [cats, p.type_id]);
  const filteredSubs = useMemo(() => subs.filter((s) => s.category_id === p.category_id), [subs, p.category_id]);
  const filteredFams = useMemo(() => fams.filter((f) => f.subcategory_id === p.subcategory_id), [fams, p.subcategory_id]);

  const runDetailsFn = useServerFn(runProductDetailsEngine);

  const handleGenerateDetails = async () => {
    setGeneratingDetails(true);
    try {
      const res = await runDetailsFn({ data: { productId: id } });
      if (res.ok) {
        toast.success("Engine 1: Product details generated successfully!");
        await fetchProduct();
      } else {
        toast.error(res.error || "Failed to generate details");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGeneratingDetails(false);
    }
  };

  const handleGenerateLifestyle = async () => {
    if (!p.image_url) {
      toast.error("Please upload an Original Product Image first.");
      return;
    }
    setGeneratingLifestyle(true);
    try {
      const res = await generateStandaloneLifestyleImage({ data: { productId: id } });
      if (res.ok && res.imageUrl) {
        toast.success("Engine 2: Installed lifestyle image generated successfully!");
        setField("generated_installed_image", res.imageUrl);
        await fetchProduct();
      } else {
        toast.error("Failed to generate installed image");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGeneratingLifestyle(false);
    }
  };

  const handleRunFullPipeline = async () => {
    setRunningPipeline(true);
    await handleGenerateDetails();
    if (p.image_url) {
      await handleGenerateLifestyle();
    }
    setRunningPipeline(false);
    toast.success("Full AI pipeline completed!");
  };

  const save = async () => {
    if (!p.name?.trim()) return toast.error("Product name is required.");
    if (!p.image_url) return toast.error("Original product image is required.");

    setSaving(true);
    const finalSyncedDesc = (p.seo_description || p.short_description || p.generated_description || p.description || "").trim();

    const payload = {
      type_id: p.type_id || null,
      category_id: p.category_id || null,
      subcategory_id: p.subcategory_id || null,
      family_id: p.family_id || null,
      name: p.name.trim(),
      code: p.code ? p.code.trim() : null,
      production_name: p.production_name ? p.production_name.trim() : null,
      finish_name: p.finish_name ? p.finish_name.trim() : null,
      brand: p.brand ? p.brand.trim() : null,
      color: p.color ? p.color.trim() : null,
      material: p.material ? p.material.trim() : null,
      size: p.size ? p.size.trim() : null,
      price: Number(p.price) || 0,
      image_url: p.image_url,
      status: p.status || "published",
      featured_homepage: !!p.featured_homepage,
      featured_feed: !!p.featured_feed,
      hidden: !!p.hidden,
      short_description: finalSyncedDesc,
      generated_description: finalSyncedDesc,
      seo_title: p.seo_title ? p.seo_title.trim() : null,
      seo_description: finalSyncedDesc,
      seo_keywords: p.seo_keywords || [],
      canonical_slug: p.canonical_slug ? p.canonical_slug.trim() : null,
      app_keywords: p.app_keywords || [],
      app_search_keywords: p.app_keywords || [],
      generated_installed_image: p.generated_installed_image || null,
      is_published: p.status === "published",
    };

    const { error } = await supabase.from("products").update(payload as any).eq("id", id);
    if (error) {
      setSaving(false);
      return toast.error(error.message);
    }

    // Rebuild search index
    await supabase.rpc("rebuild_search_index" as any, { _product_id: id } as any);

    setSaving(false);
    toast.success("Product saved & search index updated!");
    navigate({ to: "/admin/products" });
  };

  const deleteProduct = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    navigate({ to: "/admin/products" });
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted-foreground">Loading product parameters…</div>;
  }

  const strToArr = (str: string) => (str ? str.split(",").map((s) => s.trim()).filter(Boolean) : []);
  const arrToStr = (arr: any) => (Array.isArray(arr) ? arr.join(", ") : arr || "");

  return (
    <div className="container-app py-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="rounded-full border border-border p-2 hover:bg-muted transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground uppercase">Edit Product</h1>
            <p className="text-xs text-muted-foreground font-mono">ID: {id} · {p.code || "No Code"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={deleteProduct}
            className="rounded border border-destructive/40 text-destructive px-3 py-2 text-xs font-semibold hover:bg-destructive/10 transition flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* SECTION 1: Product Information */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Section 1 — Product Information</h2>
        </div>

        {/* Classification Hierarchy */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Type *</label>
            <select
              value={p.type_id || ""}
              onChange={(e) => { setField("type_id", e.target.value); setField("category_id", null); setField("subcategory_id", null); setField("family_id", null); }}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
            >
              <option value="">Select Type</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category *</label>
            <select
              value={p.category_id || ""}
              disabled={!p.type_id}
              onChange={(e) => { setField("category_id", e.target.value); setField("subcategory_id", null); setField("family_id", null); }}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs disabled:opacity-50"
            >
              <option value="">Select Category</option>
              {filteredCats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subcategory *</label>
            <select
              value={p.subcategory_id || ""}
              disabled={!p.category_id}
              onChange={(e) => { setField("subcategory_id", e.target.value); setField("family_id", null); }}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs disabled:opacity-50"
            >
              <option value="">Select Subcategory</option>
              {filteredSubs.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Family Group *</label>
            <select
              value={p.family_id || ""}
              disabled={!p.subcategory_id}
              onChange={(e) => setField("family_id", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs disabled:opacity-50"
            >
              <option value="">Select Family Group</option>
              {filteredFams.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Attributes */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Name *</label>
            <input
              type="text"
              value={p.name || ""}
              onChange={(e) => setField("name", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Code</label>
            <input
              type="text"
              value={p.code || ""}
              onChange={(e) => setField("code", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Production / Factory Name</label>
            <input
              type="text"
              value={p.production_name || ""}
              onChange={(e) => setField("production_name", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Brand</label>
            <input
              type="text"
              value={p.brand || ""}
              onChange={(e) => setField("brand", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price (NGN) *</label>
            <input
              type="number"
              value={p.price || 0}
              onChange={(e) => setField("price", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Size / Dimension</label>
            <input
              type="text"
              value={p.size || ""}
              onChange={(e) => setField("size", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Finish</label>
            <input
              type="text"
              value={p.finish_name || p.finish || ""}
              onChange={(e) => setField("finish_name", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Material</label>
            <input
              type="text"
              value={p.material || ""}
              onChange={(e) => setField("material", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Color</label>
            <input
              type="text"
              value={p.color || ""}
              onChange={(e) => setField("color", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Images */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Image className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Section 2 — Images</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Original Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Original Manufacturer Image *</label>
              <span className="text-[10px] text-muted-foreground">Source of Truth</span>
            </div>
            {p.image_url ? (
              <ImageTile
                url={publicImageUrl(p.image_url) || p.image_url}
                onDelete={() => setField("image_url", null)}
                onEdit={() => setEditingImage({ url: publicImageUrl(p.image_url) || p.image_url, target: "image_url" })}
                badge="Original"
              />
            ) : (
              <ImageUploader multiple={false} onUploaded={(paths) => setField("image_url", paths[0])} label="Upload Original Product Image" />
            )}
          </div>

          {/* Installed Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Finished Installation Image</label>
              <span className="text-[10px] text-muted-foreground">Lifestyle Reference</span>
            </div>
            {p.generated_installed_image ? (
              <ImageTile
                url={publicImageUrl(p.generated_installed_image) || p.generated_installed_image}
                onDelete={() => setField("generated_installed_image", null)}
                onEdit={() => setEditingImage({ url: publicImageUrl(p.generated_installed_image) || p.generated_installed_image, target: "generated_installed_image" })}
                badge="Installed Scene"
              />
            ) : (
              <ImageUploader multiple={false} onUploaded={(paths) => setField("generated_installed_image", paths[0])} label="Upload Installed Image" />
            )}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateLifestyle}
                disabled={generatingLifestyle || !p.image_url}
                className="w-full flex items-center justify-center gap-2 rounded border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {generatingLifestyle ? "Engine 2 Generating Installed Image…" : "Generate Installed Image (Engine 2)"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Publishing */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Section 3 — Publishing Settings</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={p.status || "published"}
              onChange={(e) => setField("status", e.target.value)}
              className="rounded-md border border-input bg-background p-2 text-xs font-semibold"
            >
              <option value="published">Status: Published</option>
              <option value="draft">Status: Draft</option>
              <option value="review">Status: Review</option>
              <option value="archived">Status: Archived</option>
            </select>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </section>

      {/* SECTION 4: Advanced AI (Collapsed by default) */}
      <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvancedAi(!showAdvancedAi)}
          className="w-full flex items-center justify-between p-5 bg-card hover:bg-muted/40 transition text-left"
        >
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Section 4 — Advanced AI Operations</h2>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">Engine 1 & Engine 2</span>
          </div>
          {showAdvancedAi ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showAdvancedAi && (
          <div className="p-5 border-t border-border space-y-4 bg-muted/10">
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleGenerateDetails}
                disabled={generatingDetails}
                className="flex items-center justify-center gap-2 rounded border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/20 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {generatingDetails ? "Generating Details…" : "Generate Product Details (Engine 1)"}
              </button>

              <button
                type="button"
                onClick={handleGenerateLifestyle}
                disabled={generatingLifestyle || !p.image_url}
                className="flex items-center justify-center gap-2 rounded border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/20 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {generatingLifestyle ? "Generating Installed Image…" : "Generate Installed Image (Engine 2)"}
              </button>

              <button
                type="button"
                onClick={handleRunFullPipeline}
                disabled={runningPipeline}
                className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {runningPipeline ? "Running Full Pipeline…" : "Run Full Pipeline"}
              </button>
            </div>

            {/* AI Status & Log */}
            <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2 font-mono text-muted-foreground">
              <div className="flex items-center justify-between text-foreground font-semibold">
                <span>AI State: {p.processing_state || "completed"}</span>
                <span className="text-[10px] text-primary">{p.last_processed_at ? new Date(p.last_processed_at).toLocaleString() : "Never"}</span>
              </div>
              {p.error_log ? (
                <p className="text-[11px] text-destructive">{typeof p.error_log === "object" ? JSON.stringify(p.error_log) : p.error_log}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">Product details engine synced. Ready for publishing.</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 5: SEO (Collapsed by default) */}
      <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSeoSection(!showSeoSection)}
          className="w-full flex items-center justify-between p-5 bg-card hover:bg-muted/40 transition text-left"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Section 5 — Google SEO & Metadata</h2>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">Product Desc == SEO Desc</span>
          </div>
          {showSeoSection ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showSeoSection && (
          <div className="p-5 border-t border-border space-y-4 bg-muted/10">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SEO Title</label>
              <input
                type="text"
                value={p.seo_title || ""}
                onChange={(e) => setField("seo_title", e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SEO Description & Product Description (Synced)</label>
                <span className="text-[9px] text-primary font-semibold">Critical Sync Rule Active</span>
              </div>
              <textarea
                rows={3}
                value={p.seo_description || p.short_description || p.generated_description || ""}
                onChange={(e) => setField("seo_description", e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs leading-relaxed"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SEO Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={arrToStr(p.seo_keywords)}
                  onChange={(e) => setField("seo_keywords", strToArr(e.target.value))}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Canonical Slug</label>
                <input
                  type="text"
                  value={p.canonical_slug || p.slug || ""}
                  onChange={(e) => setField("canonical_slug", e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 6: Search Intelligence (Collapsed by default) */}
      <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSearchSection(!showSearchSection)}
          className="w-full flex items-center justify-between p-5 bg-card hover:bg-muted/40 transition text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Section 6 — Search Intelligence Index</h2>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">Showroom & Full Text</span>
          </div>
          {showSearchSection ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showSearchSection && (
          <div className="p-5 border-t border-border space-y-4 bg-muted/10">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search Keywords (App Keywords)</label>
              <textarea
                rows={2}
                value={arrToStr(p.app_keywords || p.app_search_keywords)}
                onChange={(e) => setField("app_keywords", strToArr(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </section>

      {/* Image Editor Modal (Crop, Rotate, Flip) */}
      {editingImage && (
        <ImageEditorModal
          isOpen={!!editingImage}
          imageUrl={editingImage.url}
          productId={p?.id}
          onClose={() => setEditingImage(null)}
          onSave={async (newUrl) => {
            const targetField = editingImage.target;
            setField(targetField, newUrl);
            if (p?.id) {
              await supabase
                .from("products")
                .update({ [targetField]: newUrl } as any)
                .eq("id", p.id);
              toast.success("Edited photo permanently saved to product database!");
            }
          }}
        />
      )}
    </div>
  );
}
