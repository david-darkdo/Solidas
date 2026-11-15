import { i as __toESM } from "../_runtime.mjs";
import { t as useServerFn } from "./useServerFn-C4MBUhiH.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { runProductDetailsEngine } from "./product-details.functions-BH7zBjhc.mjs";
import { generateStandaloneLifestyleImage } from "./lifestyle-image.functions-oXZg0i7l.mjs";
import { I as ImageTile, L as ImageUploader, z as publicImageUrl } from "./router-DWif86SF.mjs";
import { n as triggerSitemapUpdate, t as ImageEditorModal } from "./seo-publisher-BXmy5OdW.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Image, Ct as ChevronUp, Et as ChevronDown, S as Sparkles, T as ShieldCheck, Z as Layers, it as Globe, j as Search, mt as Cpu } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.products.new-DoYcNK9H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RebuiltNewProductPage() {
	const navigate = useNavigate();
	const [types, setTypes] = (0, import_react.useState)([]);
	const [cats, setCats] = (0, import_react.useState)([]);
	const [subs, setSubs] = (0, import_react.useState)([]);
	const [fams, setFams] = (0, import_react.useState)([]);
	const [type_id, setType] = (0, import_react.useState)("");
	const [category_id, setCat] = (0, import_react.useState)("");
	const [subcategory_id, setSub] = (0, import_react.useState)("");
	const [family_id, setFam] = (0, import_react.useState)("");
	const [previewCode, setPreviewCode] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [isAiMode, setIsAiMode] = (0, import_react.useState)(true);
	const [generatingDetails, setGeneratingDetails] = (0, import_react.useState)(false);
	const [generatingLifestyle, setGeneratingLifestyle] = (0, import_react.useState)(false);
	const [runningPipeline, setRunningPipeline] = (0, import_react.useState)(false);
	const [editingImage, setEditingImage] = (0, import_react.useState)(null);
	const [showAdvancedAi, setShowAdvancedAi] = (0, import_react.useState)(false);
	const [showSeoSection, setShowSeoSection] = (0, import_react.useState)(false);
	const [showSearchSection, setShowSearchSection] = (0, import_react.useState)(false);
	const [originalPath, setOriginalPath] = (0, import_react.useState)(null);
	const [installedPath, setInstalledPath] = (0, import_react.useState)(null);
	const [aiIntelligence, setAiIntelligence] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		code: "",
		production_name: "",
		finish_name: "",
		brand: "",
		color: "",
		material: "",
		size: "",
		price: "0",
		status: "published",
		featured_homepage: false,
		featured_feed: false,
		hidden: false,
		description: "",
		seo_title: "",
		seo_description: "",
		seo_keywords: "",
		canonical_slug: "",
		meta_keywords: "",
		search_keywords: "",
		alternative_terms: "",
		synonyms: "",
		related_terms: "",
		misspellings: ""
	});
	(0, import_react.useEffect)(() => {
		(async () => {
			const [t, c, s, f] = await Promise.all([
				supabase.from("product_types").select("id,name,code_prefix").order("name"),
				supabase.from("categories").select("id,name,type_id").order("name"),
				supabase.from("subcategories").select("id,name,category_id").order("name"),
				supabase.from("family_groups").select("id,name,subcategory_id").order("name")
			]);
			setTypes(t.data ?? []);
			setCats(c.data ?? []);
			setSubs(s.data ?? []);
			setFams(f.data ?? []);
		})();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!type_id) return setPreviewCode("");
		(async () => {
			const { data } = await supabase.rpc("generate_product_code", { _type_id: type_id });
			if (typeof data === "string") {
				setPreviewCode(data);
				setForm((f) => ({
					...f,
					code: f.code || data
				}));
			}
		})();
	}, [type_id]);
	const filteredCats = (0, import_react.useMemo)(() => cats.filter((c) => c.type_id === type_id), [cats, type_id]);
	const filteredSubs = (0, import_react.useMemo)(() => subs.filter((s) => s.category_id === category_id), [subs, category_id]);
	const filteredFams = (0, import_react.useMemo)(() => fams.filter((f) => f.subcategory_id === subcategory_id), [fams, subcategory_id]);
	const handleSeoDescriptionChange = (val) => {
		setForm((prev) => ({
			...prev,
			description: val,
			seo_description: val
		}));
	};
	const runDetailsFn = useServerFn(runProductDetailsEngine);
	const handleGenerateDetailsOnNew = async () => {
		if (!form.name.trim()) {
			toast.error("Please enter a Product Name first before generating details.");
			return;
		}
		setGeneratingDetails(true);
		try {
			const tempSlug = `draft-${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
			const { data: tempProduct, error: tempErr } = await supabase.from("products").insert({
				name: form.name.trim(),
				code: form.code || previewCode || "TEMP-001",
				type_id: type_id || null,
				category_id: category_id || null,
				subcategory_id: subcategory_id || null,
				family_id: family_id || null,
				production_name: form.production_name || null,
				finish_name: form.finish_name || null,
				brand: form.brand || null,
				color: form.color || null,
				material: form.material || null,
				size: form.size || null,
				price: Number(form.price) || 0,
				status: "draft",
				processing_state: "pending",
				slug: tempSlug,
				image_url: originalPath || null
			}).select("id").single();
			if (tempErr || !tempProduct?.id) throw new Error(tempErr?.message || "Failed to initialize temporary draft");
			const res = await runDetailsFn({ data: { productId: tempProduct.id } });
			if (res.ok && res.details) {
				const d = res.details;
				setAiIntelligence(d);
				const syncedDesc = d.seo_description || d.meta_description || d.short_description || d.generated_description || "";
				const seoKw = Array.isArray(d.seo_keywords) ? d.seo_keywords.join(", ") : d.seo_keywords || "";
				const searchKw = Array.isArray(d.search_keywords) ? d.search_keywords.join(", ") : d.search_keywords || "";
				setForm((prev) => ({
					...prev,
					description: syncedDesc || prev.description,
					seo_title: d.seo_title || prev.seo_title,
					seo_description: syncedDesc || prev.seo_description,
					seo_keywords: seoKw || prev.seo_keywords,
					canonical_slug: d.canonical_slug || prev.canonical_slug,
					search_keywords: searchKw || prev.search_keywords,
					alternative_terms: Array.isArray(d.alternative_terms) ? d.alternative_terms.join(", ") : d.alternative_terms || "",
					synonyms: Array.isArray(d.synonyms) ? d.synonyms.join(", ") : d.synonyms || "",
					related_terms: Array.isArray(d.related_terms) ? d.related_terms.join(", ") : d.related_terms || "",
					misspellings: Array.isArray(d.misspellings) ? d.misspellings.join(", ") : d.misspellings || ""
				}));
				toast.success("Engine 1: Product details generated! Form fields & SEO Description synced!");
			}
			await supabase.from("products").delete().eq("id", tempProduct.id);
		} catch (e) {
			toast.error(e.message || "Failed to generate product details");
		} finally {
			setGeneratingDetails(false);
		}
	};
	const handleGenerateLifestyleOnNew = async () => {
		if (!originalPath) {
			toast.error("Please upload an Original Product Image first.");
			return;
		}
		setGeneratingLifestyle(true);
		try {
			const tempSlug = `draft-img-${(form.name || "installed").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
			const { data: tempProduct, error: tempErr } = await supabase.from("products").insert({
				name: form.name.trim() || "Sample Product",
				code: form.code || previewCode || "TEMP-002",
				type_id: type_id || null,
				category_id: category_id || null,
				subcategory_id: subcategory_id || null,
				family_id: family_id || null,
				production_name: form.production_name || null,
				finish_name: form.finish_name || null,
				brand: form.brand || null,
				size: form.size || null,
				price: Number(form.price) || 0,
				status: "draft",
				processing_state: "pending",
				slug: tempSlug,
				image_url: originalPath
			}).select("id").single();
			if (tempErr || !tempProduct?.id) throw new Error(tempErr?.message || "Failed to create draft for lifestyle generation");
			const res = await generateStandaloneLifestyleImage({ data: { productId: tempProduct.id } });
			if (res.ok && res.imageUrl) {
				setInstalledPath(res.imageUrl);
				toast.success("Engine 2: Installed lifestyle image generated successfully!");
			} else toast.error("Failed to generate installed image");
			await supabase.from("products").delete().eq("id", tempProduct.id);
		} catch (e) {
			toast.error(e.message || "Failed to generate installed image");
		} finally {
			setGeneratingLifestyle(false);
		}
	};
	const handleRunFullPipelineOnNew = async () => {
		if (!form.name.trim()) return toast.error("Product name required");
		setRunningPipeline(true);
		await handleGenerateDetailsOnNew();
		if (originalPath) await handleGenerateLifestyleOnNew();
		setRunningPipeline(false);
		toast.success("Full AI pipeline completed for product details & lifestyle image!");
	};
	const create = async (targetStatus) => {
		if (!type_id || !category_id || !subcategory_id || !family_id) {
			toast.error("Please complete the classification hierarchy (Type, Category, Subcategory, Family Group).");
			return;
		}
		if (!form.name.trim()) return toast.error("Product name is required.");
		if (!originalPath) return toast.error("Original Product Image is required.");
		setSaving(true);
		const slug = `${(form.canonical_slug || form.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
		const seoKeywordsArray = form.seo_keywords ? form.seo_keywords.split(",").map((k) => k.trim()).filter(Boolean) : [];
		const searchKeywordsArray = Array.from(/* @__PURE__ */ new Set([
			...form.search_keywords ? form.search_keywords.split(",").map((k) => k.trim()) : [],
			...form.alternative_terms ? form.alternative_terms.split(",").map((k) => k.trim()) : [],
			...form.synonyms ? form.synonyms.split(",").map((k) => k.trim()) : [],
			...form.related_terms ? form.related_terms.split(",").map((k) => k.trim()) : [],
			...form.misspellings ? form.misspellings.split(",").map((k) => k.trim()) : []
		])).filter(Boolean);
		const finalStatus = targetStatus || form.status;
		const finalSyncedDesc = form.description.trim() || form.seo_description.trim() || null;
		const payload = {
			type_id,
			category_id,
			subcategory_id,
			family_id,
			name: form.name.trim(),
			code: form.code.trim() || null,
			production_name: form.production_name.trim() || null,
			finish_name: form.finish_name.trim() || null,
			brand: form.brand.trim() || null,
			color: form.color.trim() || null,
			material: form.material.trim() || null,
			size: form.size.trim() || null,
			price: Number(form.price) || 0,
			image_url: originalPath,
			image_mode: isAiMode ? "ai" : "manual",
			status: finalStatus,
			processing_state: "completed",
			featured_homepage: form.featured_homepage,
			featured_feed: form.featured_feed,
			hidden: form.hidden,
			short_description: finalSyncedDesc,
			generated_description: finalSyncedDesc,
			seo_title: form.seo_title.trim() || null,
			seo_description: finalSyncedDesc,
			seo_keywords: seoKeywordsArray,
			canonical_slug: form.canonical_slug.trim() || null,
			faq: aiIntelligence?.faq || null,
			structured_data: aiIntelligence?.structured_data || null,
			app_keywords: searchKeywordsArray,
			app_search_keywords: searchKeywordsArray,
			seo_title_manual: !isAiMode,
			seo_description_manual: !isAiMode,
			seo_keywords_manual: !isAiMode,
			slug,
			is_published: finalStatus === "published",
			generated_installed_image: installedPath || null
		};
		const { data, error } = await supabase.from("products").insert(payload).select("id").single();
		if (error) {
			setSaving(false);
			return toast.error(error.message);
		}
		if (data?.id) {
			await supabase.from("product_assets").insert([{
				product_id: data.id,
				asset_type: "original",
				asset_url: originalPath,
				is_primary: true,
				generated_by_ai: false
			}, ...installedPath ? [{
				product_id: data.id,
				asset_type: "installed",
				asset_url: installedPath,
				is_primary: false,
				generated_by_ai: true
			}] : []]);
			await supabase.rpc("rebuild_search_index", { _product_id: data.id });
			await triggerSitemapUpdate(data.id);
		}
		setSaving(false);
		toast.success("Product published, search index built & sitemaps updated!");
		navigate({ to: "/admin/products" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 max-w-5xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold tracking-tight text-foreground uppercase",
					children: "Upload New Product"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: "Build V3 — Universal AI Operating System Architecture"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => create("draft"),
						disabled: saving,
						className: "rounded border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition",
						children: "Save Draft"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => create("published"),
						disabled: saving,
						className: "rounded bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm",
						children: saving ? "Publishing…" : "Publish Product"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5 shadow-sm space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-border pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-bold uppercase tracking-wider text-foreground",
							children: "Section 1 — Product Information"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2 md:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Product Type *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: type_id,
								onChange: (e) => {
									setType(e.target.value);
									setCat("");
									setSub("");
									setFam("");
								},
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select Type…"
								}), types.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t.id,
									children: t.name
								}, t.id))]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Category *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: category_id,
								onChange: (e) => {
									setCat(e.target.value);
									setSub("");
									setFam("");
								},
								disabled: !type_id,
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select Category…"
								}), filteredCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Subcategory *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: subcategory_id,
								onChange: (e) => {
									setSub(e.target.value);
									setFam("");
								},
								disabled: !category_id,
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select Subcategory…"
								}), filteredSubs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.name
								}, s.id))]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Family Group *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: family_id,
								onChange: (e) => setFam(e.target.value),
								disabled: !subcategory_id,
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select Family…"
								}), filteredFams.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: f.id,
									children: f.name
								}, f.id))]
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Product Name *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "e.g. Statuario White Polished Porcelain Tile",
								value: form.name,
								onChange: (e) => setForm((f) => ({
									...f,
									name: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: "Product Code"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: previewCode ? `Auto: ${previewCode}` : "Code",
							value: form.code,
							onChange: (e) => setForm((f) => ({
								...f,
								code: e.target.value
							})),
							className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-mono"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Brand"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "e.g. Virony",
								value: form.brand,
								onChange: (e) => setForm((f) => ({
									...f,
									brand: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Price (NGN) *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: form.price,
								onChange: (e) => setForm((f) => ({
									...f,
									price: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Size / Dimension"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "e.g. 60x120 cm",
								value: form.size,
								onChange: (e) => setForm((f) => ({
									...f,
									size: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Finish"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "e.g. Polished / Matt",
								value: form.finish_name,
								onChange: (e) => setForm((f) => ({
									...f,
									finish_name: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: "Material"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "e.g. Porcelain / Marble",
							value: form.material,
							onChange: (e) => setForm((f) => ({
								...f,
								material: e.target.value
							})),
							className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: "Color"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "e.g. White / Grey Veins",
							value: form.color,
							onChange: (e) => setForm((f) => ({
								...f,
								color: e.target.value
							})),
							className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5 shadow-sm space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-border pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-bold uppercase tracking-wider text-foreground",
						children: "Section 2 — Images"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-semibold text-foreground",
								children: "Original Manufacturer Image *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "Source of Truth"
							})]
						}), originalPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageTile, {
							url: publicImageUrl(originalPath) || originalPath,
							onDelete: () => setOriginalPath(null),
							onEdit: () => setEditingImage({
								url: publicImageUrl(originalPath) || originalPath,
								target: "original"
							}),
							badge: "Original"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
							multiple: false,
							onUploaded: (paths) => setOriginalPath(paths[0]),
							label: "Upload Original Product Image"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-semibold text-foreground",
									children: "Finished Installation Image"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: "Lifestyle Reference"
								})]
							}),
							installedPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageTile, {
								url: publicImageUrl(installedPath) || installedPath,
								onDelete: () => setInstalledPath(null),
								onEdit: () => setEditingImage({
									url: publicImageUrl(installedPath) || installedPath,
									target: "installed"
								}),
								badge: "Installed Scene"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
								multiple: false,
								onUploaded: (paths) => setInstalledPath(paths[0]),
								label: "Upload Installed Image"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: handleGenerateLifestyleOnNew,
									disabled: generatingLifestyle || !originalPath,
									className: "w-full flex items-center justify-center gap-2 rounded border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition disabled:opacity-50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), generatingLifestyle ? "Engine 2 Generating Installed Image…" : "Generate Installed Image (Engine 2)"]
								})
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5 shadow-sm space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-border pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-bold uppercase tracking-wider text-foreground",
						children: "Section 3 — Publishing Settings"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setIsAiMode(!isAiMode),
							className: `relative inline-flex h-6 w-11 items-center rounded-full transition ${isAiMode ? "bg-primary" : "bg-muted"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition ${isAiMode ? "translate-x-6" : "translate-x-1"}` })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-foreground",
							children: isAiMode ? "AI Mode Active (Auto Intelligence Routing)" : "Manual Mode (Direct Metadata Entry)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => create("draft"),
							disabled: saving,
							className: "rounded border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition",
							children: "Save Draft"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => create("published"),
							disabled: saving,
							className: "rounded bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm",
							children: saving ? "Publishing…" : "Publish Product"
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card shadow-sm overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowAdvancedAi(!showAdvancedAi),
					className: "w-full flex items-center justify-between p-5 bg-card hover:bg-muted/40 transition text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "h-4 w-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-sm font-bold uppercase tracking-wider text-foreground",
								children: "Section 4 — Advanced AI Operations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono",
								children: "Engine 1 & Engine 2"
							})
						]
					}), showAdvancedAi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })]
				}), showAdvancedAi && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-t border-border space-y-4 bg-muted/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleGenerateDetailsOnNew,
								disabled: generatingDetails || !form.name.trim(),
								className: "flex items-center justify-center gap-2 rounded border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/20 transition disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), generatingDetails ? "Generating Details…" : "Generate Product Details (Engine 1)"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleGenerateLifestyleOnNew,
								disabled: generatingLifestyle || !originalPath,
								className: "flex items-center justify-center gap-2 rounded border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/20 transition disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), generatingLifestyle ? "Generating Installed Image…" : "Generate Installed Image (Engine 2)"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleRunFullPipelineOnNew,
								disabled: runningPipeline || !form.name.trim(),
								className: "flex items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), runningPipeline ? "Running Full Pipeline…" : "Run Full Pipeline"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-background p-3 text-xs space-y-2 font-mono text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-foreground font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AI Pipeline Execution Log" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-primary",
								children: aiIntelligence ? "Payload Received" : "Idle"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: aiIntelligence ? `Generated title: "${aiIntelligence.seo_title || "OK"}" | Synced description length: ${(form.description || "").length} chars` : "No AI execution log generated yet. Click above to run Engine 1 or Engine 2."
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card shadow-sm overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowSeoSection(!showSeoSection),
					className: "w-full flex items-center justify-between p-5 bg-card hover:bg-muted/40 transition text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-sm font-bold uppercase tracking-wider text-foreground",
								children: "Section 5 — Google SEO & Metadata"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono",
								children: "Product Desc == SEO Desc"
							})
						]
					}), showSeoSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })]
				}), showSeoSection && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-t border-border space-y-4 bg-muted/10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: "SEO Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: form.seo_title,
							onChange: (e) => setForm((f) => ({
								...f,
								seo_title: e.target.value
							})),
							className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "SEO Description & Product Description (Synced)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[9px] text-primary font-semibold",
								children: "Critical Sync Rule Active"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 3,
							value: form.seo_description,
							onChange: (e) => handleSeoDescriptionChange(e.target.value),
							className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs leading-relaxed"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "SEO Keywords (Comma Separated)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: form.seo_keywords,
								onChange: (e) => setForm((f) => ({
									...f,
									seo_keywords: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Canonical Slug"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: form.canonical_slug,
								onChange: (e) => setForm((f) => ({
									...f,
									canonical_slug: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-mono"
							})] })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card shadow-sm overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowSearchSection(!showSearchSection),
					className: "w-full flex items-center justify-between p-5 bg-card hover:bg-muted/40 transition text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-sm font-bold uppercase tracking-wider text-foreground",
								children: "Section 6 — Search Intelligence Index"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono",
								children: "Showroom & Full Text"
							})
						]
					}), showSearchSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })]
				}), showSearchSection && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-t border-border space-y-4 bg-muted/10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: "Search Keywords"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 2,
							value: form.search_keywords,
							onChange: (e) => setForm((f) => ({
								...f,
								search_keywords: e.target.value
							})),
							className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Alternative Names"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: form.alternative_terms,
								onChange: (e) => setForm((f) => ({
									...f,
									alternative_terms: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Synonyms & Customer Phrases"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: form.synonyms,
								onChange: (e) => setForm((f) => ({
									...f,
									synonyms: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Related Terms"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: form.related_terms,
								onChange: (e) => setForm((f) => ({
									...f,
									related_terms: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Common Misspellings"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: form.misspellings,
								onChange: (e) => setForm((f) => ({
									...f,
									misspellings: e.target.value
								})),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] })]
						})
					]
				})]
			}),
			editingImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageEditorModal, {
				isOpen: !!editingImage,
				imageUrl: editingImage.url,
				onClose: () => setEditingImage(null),
				onSave: (newUrl) => {
					if (editingImage.target === "original") setOriginalPath(newUrl);
					else setInstalledPath(newUrl);
				}
			})
		]
	});
}
export { RebuiltNewProductPage as component };
