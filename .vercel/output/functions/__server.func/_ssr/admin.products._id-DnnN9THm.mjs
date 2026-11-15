import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { t as useServerFn } from "./useServerFn-C4MBUhiH.mjs";
import { i as runProductPipeline } from "./ai-pipeline.functions-AhnomFSa.mjs";
import { generateStandaloneLifestyleImage } from "./lifestyle-image.functions-oXZg0i7l.mjs";
import { runProductDetailsEngine } from "./product-details.functions-BH7zBjhc.mjs";
import { I as ImageTile, L as ImageUploader, n as Route$1, z as publicImageUrl } from "./router-DWif86SF.mjs";
import { n as triggerSitemapUpdate, t as ImageEditorModal } from "./seo-publisher-BXmy5OdW.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Image, Ct as ChevronUp, Et as ChevronDown, Rt as ArrowLeft, S as Sparkles, T as ShieldCheck, Z as Layers, it as Globe, j as Search, mt as Cpu } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.products._id-DnnN9THm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RebuiltEditProductPage() {
	const { id } = Route$1.useParams();
	useNavigate();
	const [p, setP] = (0, import_react.useState)(null);
	const [types, setTypes] = (0, import_react.useState)([]);
	const [cats, setCats] = (0, import_react.useState)([]);
	const [subs, setSubs] = (0, import_react.useState)([]);
	const [fams, setFams] = (0, import_react.useState)([]);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [isDirty, setIsDirty] = (0, import_react.useState)(false);
	const [generatingDetails, setGeneratingDetails] = (0, import_react.useState)(false);
	const [generatingLifestyle, setGeneratingLifestyle] = (0, import_react.useState)(false);
	const [runningPipeline, setRunningPipeline] = (0, import_react.useState)(false);
	const [editingImage, setEditingImage] = (0, import_react.useState)(null);
	const [showAdvancedAi, setShowAdvancedAi] = (0, import_react.useState)(false);
	const [showSeoSection, setShowSeoSection] = (0, import_react.useState)(false);
	const [showSearchSection, setShowSearchSection] = (0, import_react.useState)(false);
	const runDetailsFn = useServerFn(runProductDetailsEngine);
	const generateLifestyleFn = useServerFn(generateStandaloneLifestyleImage);
	const runPipelineFn = useServerFn(runProductPipeline);
	const load = (0, import_react.useCallback)(async () => {
		const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
		if (error) return toast.error(error.message);
		if (!data) return toast.error("Product not found");
		setP(data);
	}, [id]);
	(0, import_react.useEffect)(() => {
		load();
		(async () => {
			const [t, c, s, f] = await Promise.all([
				supabase.from("product_types").select("id,name").order("name"),
				supabase.from("categories").select("id,name,type_id").order("name"),
				supabase.from("subcategories").select("id,name,category_id").order("name"),
				supabase.from("family_groups").select("id,name,subcategory_id").order("name")
			]);
			setTypes(t.data ?? []);
			setCats(c.data ?? []);
			setSubs(s.data ?? []);
			setFams(f.data ?? []);
		})();
	}, [id, load]);
	const filteredCats = (0, import_react.useMemo)(() => cats.filter((c) => c.type_id === p?.type_id), [cats, p?.type_id]);
	const filteredSubs = (0, import_react.useMemo)(() => subs.filter((s) => s.category_id === p?.category_id), [subs, p?.category_id]);
	const filteredFams = (0, import_react.useMemo)(() => fams.filter((f) => f.subcategory_id === p?.subcategory_id), [fams, p?.subcategory_id]);
	if (!p) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-10 text-sm text-muted-foreground font-mono",
		children: "Loading product data…"
	});
	const setField = (key, value) => {
		setP((prev) => {
			const next = {
				...prev,
				[key]: value
			};
			if (key === "short_description" || key === "generated_description") {
				next.short_description = value;
				next.generated_description = value;
				next.seo_description = value;
			} else if (key === "seo_description") {
				next.seo_description = value;
				next.short_description = value;
				next.generated_description = value;
			}
			return next;
		});
		setIsDirty(true);
	};
	const handleGenerateDetails = async () => {
		setGeneratingDetails(true);
		try {
			if ((await runDetailsFn({ data: { productId: id } })).ok) {
				toast.success("Engine 1: Product details & SEO description generated!");
				await load();
			} else toast.error("Failed to generate product details.");
		} catch (e) {
			toast.error(e.message ?? "Generation failed");
		} finally {
			setGeneratingDetails(false);
		}
	};
	const handleGenerateLifestyle = async () => {
		if (!p.image_url) {
			toast.error("Original product image is required before generating an installed image.");
			return;
		}
		setGeneratingLifestyle(true);
		try {
			if ((await generateLifestyleFn({ data: { productId: id } })).ok) {
				toast.success("Engine 2: Installed lifestyle image generated!");
				await load();
			} else toast.error("Failed to generate installed image.");
		} catch (e) {
			toast.error(e.message ?? "Generation failed");
		} finally {
			setGeneratingLifestyle(false);
		}
	};
	const handleRunFullPipeline = async () => {
		setRunningPipeline(true);
		try {
			if ((await runPipelineFn({ data: { productId: id } })).ok) {
				toast.success("Full AI pipeline completed!");
				await load();
			} else toast.error("Pipeline run failed.");
		} catch (e) {
			toast.error(e.message ?? "Pipeline run failed");
		} finally {
			setRunningPipeline(false);
		}
	};
	const save = async () => {
		setSaving(true);
		const syncedDesc = p.seo_description || p.short_description || p.generated_description || null;
		const payload = {
			...p,
			short_description: syncedDesc,
			generated_description: syncedDesc,
			seo_description: syncedDesc,
			is_published: p.status === "published",
			price: Number(p.price) || 0,
			processing_state: "completed"
		};
		delete payload.id;
		delete payload.created_at;
		delete payload.updated_at;
		delete payload.similar_product_ids;
		const { error } = await supabase.from("products").update(payload).eq("id", id);
		if (error) {
			setSaving(false);
			return toast.error(error.message);
		}
		await supabase.rpc("rebuild_search_index", { _product_id: id });
		await triggerSitemapUpdate(id);
		setSaving(false);
		setIsDirty(false);
		toast.success("Product changes saved, search index & sitemaps updated!");
		await load();
	};
	const arrToStr = (v) => Array.isArray(v) ? v.join(", ") : v ?? "";
	const strToArr = (v) => v.split(",").map((s) => s.trim()).filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 max-w-5xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/products",
						className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Back to library"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-bold tracking-tight text-foreground uppercase",
						children: p.name || "Edit Product"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mt-0.5 font-mono",
						children: [
							"ID: ",
							id,
							" · Code: ",
							p.code
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: save,
						disabled: saving,
						className: "rounded bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm",
						children: saving ? "Saving…" : "Save Changes"
					})
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
								value: p.type_id || "",
								onChange: (e) => setField("type_id", e.target.value),
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
								value: p.category_id || "",
								onChange: (e) => setField("category_id", e.target.value),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs",
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
								value: p.subcategory_id || "",
								onChange: (e) => setField("subcategory_id", e.target.value),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs",
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
								value: p.family_id || "",
								onChange: (e) => setField("family_id", e.target.value),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs",
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
								value: p.name || "",
								onChange: (e) => setField("name", e.target.value),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: "Product Code"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: p.code || "",
							onChange: (e) => setField("code", e.target.value),
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
								value: p.brand || "",
								onChange: (e) => setField("brand", e.target.value),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Price (NGN) *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: p.price || 0,
								onChange: (e) => setField("price", e.target.value),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Size / Dimension"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: p.size || "",
								onChange: (e) => setField("size", e.target.value),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Finish"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: p.finish_name || p.finish || "",
								onChange: (e) => setField("finish_name", e.target.value),
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
							value: p.material || "",
							onChange: (e) => setField("material", e.target.value),
							className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: "Color"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: p.color || "",
							onChange: (e) => setField("color", e.target.value),
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
						}), p.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageTile, {
							url: publicImageUrl(p.image_url) || p.image_url,
							onDelete: () => setField("image_url", null),
							onEdit: () => setEditingImage({
								url: publicImageUrl(p.image_url) || p.image_url,
								target: "image_url"
							}),
							badge: "Original"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
							multiple: false,
							onUploaded: (paths) => setField("image_url", paths[0]),
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
							p.generated_installed_image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageTile, {
								url: publicImageUrl(p.generated_installed_image) || p.generated_installed_image,
								onDelete: () => setField("generated_installed_image", null),
								onEdit: () => setEditingImage({
									url: publicImageUrl(p.generated_installed_image) || p.generated_installed_image,
									target: "generated_installed_image"
								}),
								badge: "Installed Scene"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
								multiple: false,
								onUploaded: (paths) => setField("generated_installed_image", paths[0]),
								label: "Upload Installed Image"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: handleGenerateLifestyle,
									disabled: generatingLifestyle || !p.image_url,
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: p.status || "published",
							onChange: (e) => setField("status", e.target.value),
							className: "rounded-md border border-input bg-background p-2 text-xs font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "published",
									children: "Status: Published"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "draft",
									children: "Status: Draft"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "review",
									children: "Status: Review"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "archived",
									children: "Status: Archived"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: save,
						disabled: saving,
						className: "rounded bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm",
						children: saving ? "Saving…" : "Save Changes"
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
								onClick: handleGenerateDetails,
								disabled: generatingDetails,
								className: "flex items-center justify-center gap-2 rounded border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/20 transition disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), generatingDetails ? "Generating Details…" : "Generate Product Details (Engine 1)"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleGenerateLifestyle,
								disabled: generatingLifestyle || !p.image_url,
								className: "flex items-center justify-center gap-2 rounded border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/20 transition disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), generatingLifestyle ? "Generating Installed Image…" : "Generate Installed Image (Engine 2)"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleRunFullPipeline,
								disabled: runningPipeline,
								className: "flex items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), runningPipeline ? "Running Full Pipeline…" : "Run Full Pipeline"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-background p-3 text-xs space-y-2 font-mono text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-foreground font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["AI State: ", p.processing_state || "completed"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-primary",
								children: p.last_processed_at ? new Date(p.last_processed_at).toLocaleString() : "Never"
							})]
						}), p.error_log ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-destructive",
							children: typeof p.error_log === "object" ? JSON.stringify(p.error_log) : p.error_log
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: "Product details engine synced. Ready for publishing."
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
							value: p.seo_title || "",
							onChange: (e) => setField("seo_title", e.target.value),
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
							value: p.seo_description || p.short_description || p.generated_description || "",
							onChange: (e) => setField("seo_description", e.target.value),
							className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs leading-relaxed"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "SEO Keywords (Comma Separated)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: arrToStr(p.seo_keywords),
								onChange: (e) => setField("seo_keywords", strToArr(e.target.value)),
								className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Canonical Slug"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: p.canonical_slug || p.slug || "",
								onChange: (e) => setField("canonical_slug", e.target.value),
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
				}), showSearchSection && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-5 border-t border-border space-y-4 bg-muted/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
						children: "Search Keywords (App Keywords)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						rows: 2,
						value: arrToStr(p.app_keywords || p.app_search_keywords),
						onChange: (e) => setField("app_keywords", strToArr(e.target.value)),
						className: "mt-1 w-full rounded-md border border-input bg-background p-2 text-xs font-mono"
					})] })
				})]
			}),
			editingImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageEditorModal, {
				isOpen: !!editingImage,
				imageUrl: editingImage.url,
				productId: p?.id,
				onClose: () => setEditingImage(null),
				onSave: async (newUrl) => {
					const targetField = editingImage.target;
					setField(targetField, newUrl);
					if (p?.id) {
						await supabase.from("products").update({ [targetField]: newUrl }).eq("id", p.id);
						toast.success("Edited photo permanently saved to product database!");
					}
				}
			})
		]
	});
}
export { RebuiltEditProductPage as component };
