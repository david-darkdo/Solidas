import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { z as publicImageUrl } from "./router-DWif86SF.mjs";
import { t as useServerFn } from "./useServerFn-C4MBUhiH.mjs";
import { i as runProductPipeline } from "./ai-pipeline.functions-AhnomFSa.mjs";
import { generateStandaloneLifestyleImage } from "./lifestyle-image.functions-oXZg0i7l.mjs";
import { runProductDetailsEngine } from "./product-details.functions-BH7zBjhc.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as Archive, F as RefreshCw, L as Play, S as Sparkles, _t as Clock, bt as CircleCheck, f as TriangleAlert } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.pipeline-_rp400nO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Kick off the full 6-step AI pipeline for a product. */
async function enqueueAiPipeline(productId) {
	const { error } = await supabase.rpc("enqueue_ai_pipeline", { _product_id: productId });
	if (error) throw error;
}
/** Retry the entire pipeline for a product (re-enqueue). */
async function retryProductPipeline(productId) {
	await supabase.from("ai_jobs").delete().eq("product_id", productId);
	await enqueueAiPipeline(productId);
}
/**
* Regenerate: guards against wasted credits by comparing the current
* generation_hash to the stored one on the product row.
*/
async function regenerateWithHashGuard(productId, opts) {
	const { data: product, error } = await supabase.from("products").select("id, generation_hash, generation_version").eq("id", productId).maybeSingle();
	if (error || !product) throw error ?? /* @__PURE__ */ new Error("Product not found");
	if (!opts?.force) {
		const { data: last } = await supabase.from("ai_jobs").select("payload, created_at").eq("product_id", productId).eq("job_type", "understanding").eq("status", "success").order("created_at", { ascending: false }).limit(1).maybeSingle();
		const previousHash = last?.payload?.hash;
		if (previousHash && previousHash === product.generation_hash) return {
			skipped: true,
			reason: "No changes detected. Regeneration may waste credits."
		};
	}
	await supabase.from("products").update({ generation_version: (product.generation_version ?? 0) + 1 }).eq("id", productId);
	await retryProductPipeline(productId);
	return { skipped: false };
}
function PipelinePage() {
	useServerFn(runProductPipeline);
	const generateLifestyleFn = useServerFn(generateStandaloneLifestyleImage);
	const runDetailsFn = useServerFn(runProductDetailsEngine);
	const [runningDetails, setRunningDetails] = (0, import_react.useState)(null);
	const [generatingLifestyle, setGeneratingLifestyle] = (0, import_react.useState)(null);
	const handleGenerateDetailsOnly = async (productId) => {
		setRunningDetails(productId);
		try {
			if ((await runDetailsFn({ data: { productId } })).ok) toast.success("Engine 1: Product details generated successfully!");
			else toast.error("Failed to generate product details.");
		} catch (e) {
			toast.error(e.message ?? "Generation failed");
		} finally {
			setRunningDetails(null);
			await loadRows();
			await loadCounts();
		}
	};
	const handleGenerateLifestyleOnly = async (productId, hasOriginalImage) => {
		if (!hasOriginalImage) {
			toast.error("Original product image is required before generating an installed image.");
			return;
		}
		setGeneratingLifestyle(productId);
		try {
			if ((await generateLifestyleFn({ data: { productId } })).ok) toast.success("Installed lifestyle image generated successfully!");
			else toast.error("Failed to generate installed image.");
		} catch (e) {
			toast.error(e.message ?? "Generation failed");
		} finally {
			setGeneratingLifestyle(null);
			await loadRows();
			await loadCounts();
		}
	};
	const [running, setRunning] = (0, import_react.useState)(null);
	const [bucket, setBucket] = (0, import_react.useState)("processing");
	const [rows, setRows] = (0, import_react.useState)([]);
	const [counts, setCounts] = (0, import_react.useState)({
		pending: 0,
		processing: 0,
		completed: 0,
		needs_review: 0,
		error: 0,
		archived: 0
	});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const loadCounts = (0, import_react.useCallback)(async () => {
		const states = [
			"pending",
			"processing",
			"completed",
			"needs_review",
			"error",
			"archived"
		];
		const next = {
			pending: 0,
			processing: 0,
			completed: 0,
			needs_review: 0,
			error: 0,
			archived: 0
		};
		for (const s of states) {
			const { count } = await supabase.from("products").select("id", {
				count: "exact",
				head: true
			}).eq("processing_state", s);
			next[s] = count ?? 0;
		}
		setCounts(next);
	}, []);
	const loadRows = (0, import_react.useCallback)(async () => {
		setLoading(true);
		const { data, error } = await supabase.from("products").select("id,name,code,status,processing_state,retry_count,error_log,generation_version,last_processed_at,image_url,generation_hash").eq("processing_state", bucket).order("last_processed_at", {
			ascending: false,
			nullsFirst: false
		}).limit(100);
		setLoading(false);
		if (error) return toast.error(error.message);
		setRows(data ?? []);
	}, [bucket]);
	(0, import_react.useEffect)(() => {
		loadCounts();
	}, [loadCounts]);
	(0, import_react.useEffect)(() => {
		loadRows();
	}, [loadRows]);
	const handleRetryProduct = async (productId) => {
		try {
			await retryProductPipeline(productId);
			toast.success("Pipeline re-queued to pending");
			await loadRows();
			await loadCounts();
		} catch (e) {
			toast.error(e.message ?? "Retry failed");
		}
	};
	const handleRegenerate = async (productId) => {
		try {
			const res = await regenerateWithHashGuard(productId);
			if (res.skipped) {
				if (!confirm(res.reason + "\n\nRegenerate anyway?")) return;
				await regenerateWithHashGuard(productId, { force: true });
			}
			toast.success("Regeneration queued successfully");
			await loadRows();
			await loadCounts();
		} catch (e) {
			toast.error(e.message ?? "Failed");
		}
	};
	const handleArchive = async (productId) => {
		if (!confirm("Archive this product? It will be hidden from the feed.")) return;
		const { error } = await supabase.from("products").update({
			processing_state: "archived",
			status: "archived"
		}).eq("id", productId);
		if (error) return toast.error(error.message);
		toast.success("Archived");
		await loadRows();
		await loadCounts();
	};
	const handleUnarchive = async (productId) => {
		const { error } = await supabase.from("products").update({
			processing_state: "draft",
			status: "draft"
		}).eq("id", productId);
		if (error) return toast.error(error.message);
		toast.success("Restored to draft");
		await loadRows();
		await loadCounts();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-6 max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border pb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold tracking-tight",
					children: "AI Operations Dashboard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Monitor jobs, failures, and regenerate or retry processes on the Universal AI Operating System."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-5",
				children: [
					{
						key: "processing",
						label: "Processing",
						icon: RefreshCw,
						color: "text-blue-500"
					},
					{
						key: "pending",
						label: "Pending",
						icon: Clock,
						color: "text-amber-500"
					},
					{
						key: "completed",
						label: "Completed",
						icon: CircleCheck,
						color: "text-primary"
					},
					{
						key: "error",
						label: "Failed",
						icon: TriangleAlert,
						color: "text-destructive"
					},
					{
						key: "archived",
						label: "Archived",
						icon: Archive,
						color: "text-muted-foreground"
					}
				].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setBucket(b.key),
					className: `rounded-xl border p-4 text-left transition cursor-pointer select-none ${bucket === b.key ? "border-primary bg-primary/5 font-semibold" : "border-border bg-card hover:border-primary/40 text-muted-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex items-center gap-2 text-xs uppercase tracking-wider ${b.color}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "h-3.5 w-3.5" }),
							" ",
							b.label
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-2xl font-bold text-foreground",
						children: counts[b.key]
					})]
				}, b.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display font-semibold capitalize text-base",
						children: [bucket, " products"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							loadRows();
							loadCounts();
						},
						className: "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary cursor-pointer transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3" }), " Refresh"]
					})]
				}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-8 text-center text-sm text-muted-foreground",
					children: "Loading products list..."
				}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-8 text-center text-sm text-muted-foreground",
					children: "No products found in this category."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: rows.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "p-4 hover:bg-muted/10 transition",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start gap-4",
							children: [
								publicImageUrl(p.image_url) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: publicImageUrl(p.image_url),
									alt: "",
									className: "h-16 w-16 rounded border border-border object-cover bg-muted"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-16 w-16 rounded border border-dashed border-border bg-muted flex items-center justify-center text-xs text-muted-foreground",
									children: "No image"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 space-y-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/admin/products/$id",
											params: { id: p.id },
											className: "block truncate font-semibold hover:text-primary text-sm",
											children: p.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono bg-muted border border-border px-1.5 py-0.5 rounded text-[10px]",
													children: p.code
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["v", p.generation_version ?? 0] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Retries: ", p.retry_count ?? 0] }),
												p.last_processed_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Last active: ", new Date(p.last_processed_at).toLocaleString()] })] })
											]
										}),
										p.error_log && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 rounded-lg bg-destructive/5 border border-destructive/10 p-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] font-mono text-destructive break-all whitespace-pre-wrap max-h-32 overflow-y-auto",
												children: typeof p.error_log === "string" ? p.error_log : JSON.stringify(p.error_log, null, 2)
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2 pt-1 sm:pt-0",
									children: [
										(bucket === "pending" || bucket === "processing" || bucket === "error") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											disabled: running === p.id,
											onClick: () => void handleGenerateDetailsOnly(p.id),
											className: "inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 cursor-pointer shadow-sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3 w-3" }),
												" ",
												runningDetails === p.id ? "Generating Details…" : "Generate Details (Engine 1)"
											]
										}),
										bucket === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => void handleRetryProduct(p.id),
											className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3" }), " Retry Pipeline"]
										}),
										bucket === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => void handleRegenerate(p.id),
											className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3" }), " Regenerate"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											disabled: generatingLifestyle === p.id || !p.image_url,
											onClick: () => void handleGenerateLifestyleOnly(p.id, !!p.image_url),
											title: !p.image_url ? "Original product image is required before generating an installed image." : "Generate Installed Image",
											className: "inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 hover:border-primary disabled:opacity-50 cursor-pointer shadow-sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }),
												" ",
												generatingLifestyle === p.id ? "Generating Image…" : "Generate Installed Image"
											]
										}),
										bucket !== "archived" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => void handleArchive(p.id),
											className: "rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer",
											children: "Archive"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => void handleUnarchive(p.id),
											className: "rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer",
											children: "Restore to Draft"
										})
									]
								})
							]
						})
					}, p.id))
				})]
			})
		]
	});
}
export { PipelinePage as component };
