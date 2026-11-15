import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { t as useServerFn } from "./useServerFn-C4MBUhiH.mjs";
import { a as runSandboxStage } from "./ai-pipeline.functions-AhnomFSa.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Image, L as Play, M as Save, P as RotateCcw, S as Sparkles, T as ShieldCheck, _ as Star, _t as Clock, bt as CircleCheck, ct as Eye, h as ToggleLeft, j as Search, jt as Brain, m as ToggleRight, r as Zap, st as FileText, tt as History, vt as CircleX } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.ai-templates-DqvwAlbK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGE_ICONS = {
	product_details: FileText,
	lifestyle: Image,
	understanding: Brain,
	seo: Search,
	search: Zap,
	recommendation: Star,
	quality: ShieldCheck
};
var STAGE_ORDER = ["product_details", "lifestyle"];
var STAGE_LABELS = {
	product_details: {
		label: "Universal Detailed Prompt Editor (Engine 1)",
		description: "Universal text engine template — generates all product descriptions, canonical short description, SEO title, meta description, FAQ, search keywords, and recommendations in a single structured JSON payload.",
		color: "text-violet-600 bg-violet-500/10 border-violet-500/20"
	},
	lifestyle: {
		label: "Lifestyle Generation Installation Prompt Editor (Engine 2)",
		description: "Universal image generation prompt template — renders the product in a realistic installed architectural scene using original manufacturer image + product metadata.",
		color: "text-amber-600 bg-amber-500/10 border-amber-500/20"
	}
};
function AdminAiTemplatesPage() {
	const { user } = useAuth();
	const [userRole, setUserRole] = (0, import_react.useState)("admin");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [templates, setTemplates] = (0, import_react.useState)([]);
	const [selectedKey, setSelectedKey] = (0, import_react.useState)("product_details");
	const [activeTab, setActiveTab] = (0, import_react.useState)("editor");
	const [historyLogs, setHistoryLogs] = (0, import_react.useState)([]);
	const [historyLoading, setHistoryLoading] = (0, import_react.useState)(false);
	const [products, setProducts] = (0, import_react.useState)([]);
	const [selectedProductId, setSelectedProductId] = (0, import_react.useState)("");
	const [sandboxResult, setSandboxResult] = (0, import_react.useState)(null);
	const [sandboxError, setSandboxError] = (0, import_react.useState)("");
	const [testing, setTesting] = (0, import_react.useState)(false);
	const sandboxFn = useServerFn(runSandboxStage);
	const textareaRef = (0, import_react.useRef)(null);
	const isSuperAdmin = userRole === "super_admin" || userRole === "admin";
	const fetchUserRole = async () => {
		if (!user?.id) return;
		const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
		if (data?.role) setUserRole(data.role);
	};
	const loadData = async () => {
		setLoading(true);
		try {
			await fetchUserRole();
			const [prodRes, promptsRes] = await Promise.all([supabase.from("products").select("id, name, brand, image_url, processing_state").not("image_url", "is", null).order("created_at", { ascending: false }).limit(30), supabase.from("ai_prompt_templates").select("*").order("key")]);
			const allProds = prodRes.data ?? [];
			setProducts(allProds);
			if (allProds[0]?.id) setSelectedProductId(allProds[0].id);
			const rawMap = {};
			(promptsRes.data ?? []).forEach((p) => {
				if (p.key) rawMap[p.key] = p;
			});
			const merged = STAGE_ORDER.map((key) => {
				const p = rawMap[key];
				return {
					id: p?.id ?? key,
					key,
					name: p?.name ?? STAGE_LABELS[key]?.label ?? key,
					purpose: p?.purpose ?? STAGE_LABELS[key]?.description ?? "",
					prompt_text: p?.prompt_text ?? "",
					is_active: p?.is_active ?? true,
					version: p?.version ?? 1,
					updated_at: p?.updated_at
				};
			});
			setTemplates(merged);
		} catch (e) {
			toast.error(e.message ?? "Failed to load AI Control Center");
		} finally {
			setLoading(false);
		}
	};
	const loadHistory = async (templateId) => {
		if (!templateId || templateId === selectedKey) setHistoryLogs([]);
		const tmpl = templates.find((t) => t.key === selectedKey);
		if (!tmpl?.id || tmpl.id === tmpl.key) {
			setHistoryLogs([]);
			return;
		}
		setHistoryLoading(true);
		try {
			const { data, error } = await supabase.from("ai_prompt_templates_history").select("*").eq("template_id", tmpl.id).order("created_at", { ascending: false });
			if (error) throw error;
			setHistoryLogs(data ?? []);
		} catch (e) {
			toast.error(e.message ?? "Failed to load version history");
		} finally {
			setHistoryLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		loadData();
	}, []);
	const currentTemplate = templates.find((t) => t.key === selectedKey);
	(0, import_react.useEffect)(() => {
		if (activeTab === "history" && currentTemplate?.id) loadHistory(currentTemplate.id);
	}, [
		selectedKey,
		activeTab,
		currentTemplate?.id
	]);
	const handleFieldChange = (field, value) => {
		setTemplates((prev) => prev.map((t) => t.key === selectedKey ? {
			...t,
			[field]: value
		} : t));
	};
	const handleSave = async () => {
		if (!isSuperAdmin) return toast.error("Access Denied: Only admins can save prompt templates.");
		const current = templates.find((t) => t.key === selectedKey);
		if (!current) return;
		setSaving(true);
		try {
			const payload = {
				name: current.name,
				purpose: current.purpose,
				prompt_text: current.prompt_text,
				is_active: current.is_active,
				updated_by: user?.id
			};
			const { error } = await supabase.from("ai_prompt_templates").update(payload).eq("id", current.id);
			if (error) throw error;
			toast.success(`✓ ${current.name} saved — version incremented`);
			loadData();
		} catch (e) {
			toast.error(e.message ?? "Failed to save template");
		} finally {
			setSaving(false);
		}
	};
	const handleRestore = async (version) => {
		if (!isSuperAdmin) return toast.error("Only admins can restore templates.");
		if (!confirm(`Restore template to version v${version.version}? This will become the active prompt.`)) return;
		setSaving(true);
		try {
			const { error } = await supabase.from("ai_prompt_templates").update({
				name: version.name,
				prompt_text: version.prompt_text,
				is_active: version.is_active,
				updated_by: user?.id
			}).eq("id", version.template_id);
			if (error) throw error;
			toast.success(`✓ Restored to version v${version.version}`);
			loadData();
			setActiveTab("editor");
		} catch (e) {
			toast.error(e.message ?? "Failed to restore version");
		} finally {
			setSaving(false);
		}
	};
	const runSandbox = async () => {
		if (!selectedProductId || !currentTemplate) return;
		setTesting(true);
		setSandboxResult(null);
		setSandboxError("");
		try {
			const res = await sandboxFn({ data: {
				productId: selectedProductId,
				stageKey: currentTemplate.key
			} });
			if (res.ok) {
				const result = res;
				let validationResult = null;
				if (currentTemplate.key === "quality" && result.aiResponse) try {
					const m = result.aiResponse.match(/\{[\s\S]*\}/);
					if (m) validationResult = JSON.parse(m[0]);
				} catch {}
				setSandboxResult({
					...result,
					validationResult
				});
			} else setSandboxError(res.error ?? "Sandbox execution failed");
		} catch (e) {
			setSandboxError(e.message ?? "Unexpected error running sandbox");
		} finally {
			setTesting(false);
		}
	};
	const selectedProduct = products.find((p) => p.id === selectedProductId);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-10 flex items-center gap-3 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 animate-pulse text-primary" }), "Loading AI Operating System..."]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-6 max-w-7xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-2xl font-semibold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5 text-primary" }), " AI Control Center"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Universal AI Operating System — six stages, one intelligence pipeline."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [!isSuperAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs border border-amber-500/20 bg-amber-500/10 text-amber-600 rounded px-2.5 py-1 font-medium",
					children: "Read-Only View"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: handleSave,
					disabled: saving || !isSuperAdmin || !currentTemplate,
					className: "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), saving ? "Saving..." : "Save Template"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-[240px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2 mb-3",
						children: "Pipeline Stages"
					}),
					STAGE_ORDER.map((key, idx) => {
						const tmpl = templates.find((t) => t.key === key);
						const StageIcon = STAGE_ICONS[key] ?? Brain;
						const isSelected = selectedKey === key;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setSelectedKey(key);
								setSandboxResult(null);
								setSandboxError("");
							},
							className: `w-full text-left rounded-lg px-3 py-2.5 text-xs font-medium transition flex items-center gap-2.5 cursor-pointer group ${isSelected ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "border border-transparent hover:bg-card text-muted-foreground hover:text-foreground"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `flex-shrink-0 flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border ${isSelected ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30" : "bg-muted border-border text-muted-foreground"}`,
									children: idx + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageIcon, { className: "h-3.5 w-3.5 flex-shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: STAGE_LABELS[key]?.label ?? key
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `ml-auto text-[10px] rounded px-1 py-0.5 flex-shrink-0 ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`,
									children: ["v", tmpl?.version ?? 1]
								})
							]
						}, key);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 px-2 pt-3 border-t border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground leading-relaxed",
							children: "Execution order is fixed. Each stage consumes the Product Intelligence Object created by stage 1."
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden",
				children: [
					currentTemplate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `flex items-start gap-3 px-6 py-4 border-b border-border`,
						children: (() => {
							const StageIcon = STAGE_ICONS[currentTemplate.key] ?? Brain;
							const meta = STAGE_LABELS[currentTemplate.key];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `p-2 rounded-lg border ${meta?.color ?? "text-primary bg-primary/10 border-primary/20"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageIcon, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-sm font-semibold",
												children: currentTemplate.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono",
												children: ["v", currentTemplate.version]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `text-[10px] rounded px-1.5 py-0.5 font-medium ${currentTemplate.is_active ? "text-emerald-700 bg-emerald-500/10 border border-emerald-500/20" : "text-red-600 bg-red-500/10 border border-red-500/20"}`,
												children: currentTemplate.is_active ? "Active" : "Inactive"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: currentTemplate.purpose
									}),
									currentTemplate.updated_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[10px] text-muted-foreground mt-1",
										children: ["Last updated: ", new Date(currentTemplate.updated_at).toLocaleString()]
									})
								]
							})] });
						})()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex border-b border-border px-2",
						children: [
							"editor",
							"sandbox",
							"history"
						].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveTab(tab),
							className: `pb-2.5 pt-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer capitalize ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`,
							children: tab === "history" ? `Version History (${historyLogs.length})` : tab === "sandbox" ? "Sandbox Test" : "Prompt Editor"
						}, tab))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6",
						children: [
							currentTemplate && activeTab === "editor" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between bg-muted/40 border border-border rounded-lg px-4 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium",
											children: "Template Active Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground mt-0.5",
											children: "Inactive templates are skipped by the pipeline."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											disabled: !isSuperAdmin,
											onClick: () => handleFieldChange("is_active", !currentTemplate.is_active),
											className: `inline-flex items-center text-xs font-bold gap-1 transition cursor-pointer ${currentTemplate.is_active ? "text-emerald-600" : "text-red-500"} disabled:opacity-60`,
											children: [currentTemplate.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRight, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "h-5 w-5" }), currentTemplate.is_active ? "Active" : "Disabled"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "text-sm font-semibold",
													children: "Prompt Directives"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] text-muted-foreground font-mono",
													children: [currentTemplate.prompt_text.length, " chars"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "This is the live prompt sent to the AI model during pipeline execution. Every save creates a new version."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												ref: textareaRef,
												disabled: !isSuperAdmin,
												rows: 20,
												value: currentTemplate.prompt_text,
												onChange: (e) => handleFieldChange("prompt_text", e.target.value),
												placeholder: isSuperAdmin ? "Enter your prompt here. Use placeholders like {product_name}, {brand}, {product_intelligence}..." : "Contact a super admin to edit this prompt.",
												className: "w-full text-xs font-mono bg-background border border-border rounded-lg p-4 outline-none focus:border-primary resize-y leading-relaxed disabled:opacity-70"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-muted/30 border border-border rounded-lg p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] font-semibold text-muted-foreground mb-1.5",
											children: "Available Placeholders"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-1",
											children: [
												"{product_name}",
												"{brand}",
												"{finish}",
												"{material}",
												"{color}",
												"{size}",
												"{product_intelligence}",
												"{product_type}",
												"{installation_area}",
												"{installation_context}",
												"{style}",
												"{luxury_level}",
												"{visual_characteristics}",
												"{design_language}",
												"{original_image_url}",
												"{generated_image_url}",
												"{company_name}"
											].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
												className: "text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground font-mono",
												children: v
											}, v))
										})]
									})
								]
							}),
							currentTemplate && activeTab === "sandbox" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-muted/30 border border-border rounded-xl p-4 space-y-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
												className: "text-sm font-semibold flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 text-primary" }), " Sandbox Configuration"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid sm:grid-cols-2 gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-medium text-muted-foreground",
														children: "Select Product"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
														value: selectedProductId,
														onChange: (e) => {
															setSelectedProductId(e.target.value);
															setSandboxResult(null);
															setSandboxError("");
														},
														className: "w-full text-xs bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "",
															children: "Choose a product..."
														}), products.map((prod) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
															value: prod.id,
															children: [
																prod.name,
																" ",
																prod.brand ? `(${prod.brand})` : ""
															]
														}, prod.id))]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-xs font-medium text-muted-foreground",
														children: "Stage to Test"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground font-medium",
														children: STAGE_LABELS[currentTemplate.key]?.label ?? currentTemplate.key
													})]
												})]
											}),
											selectedProduct && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 border border-border rounded-lg p-3 bg-background",
												children: [selectedProduct.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: selectedProduct.image_url,
													alt: selectedProduct.name,
													className: "h-12 w-12 object-cover rounded border border-border flex-shrink-0"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-12 w-12 bg-muted rounded border border-border flex items-center justify-center flex-shrink-0",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-4 w-4 text-muted-foreground" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-semibold",
														children: selectedProduct.name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] text-muted-foreground",
														children: selectedProduct.brand || "No brand"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-[10px] text-muted-foreground capitalize mt-0.5",
														children: ["Pipeline state: ", selectedProduct.processing_state ?? "unknown"]
													})
												] })]
											}),
											currentTemplate.key === "lifestyle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-start gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-3.5 w-3.5 mt-0.5 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sandbox for Lifestyle stage shows the compiled image generation prompt only. No image is generated to avoid costs." })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: runSandbox,
												disabled: testing || !selectedProductId,
												className: "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 cursor-pointer transition",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5" }), testing ? "Running AI Stage..." : `Run ${STAGE_LABELS[currentTemplate.key]?.label ?? "Stage"}`]
											})
										]
									}),
									sandboxError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold text-red-600",
											children: "Sandbox Execution Failed"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-red-500/80 mt-1",
											children: sandboxError
										})] })]
									}),
									sandboxResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "bg-muted/30 border border-border rounded-lg p-3 text-center",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-primary mx-auto mb-1" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-xs font-bold",
																children: [sandboxResult.executionMs.toLocaleString(), "ms"]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[10px] text-muted-foreground",
																children: "Execution Time"
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "bg-muted/30 border border-border rounded-lg p-3 text-center",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary mx-auto mb-1" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-xs font-bold capitalize",
																children: sandboxResult.providerName
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[10px] text-muted-foreground",
																children: "AI Provider"
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "bg-muted/30 border border-border rounded-lg p-3 text-center",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-500 mx-auto mb-1" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-xs font-bold",
																children: "Completed"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[10px] text-muted-foreground",
																children: "Status"
															})
														]
													})
												]
											}),
											sandboxResult.stageKey === "quality" && sandboxResult.validationResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: `rounded-xl border p-4 ${sandboxResult.validationResult.passes_validation ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2 mb-3",
														children: [
															sandboxResult.validationResult.passes_validation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-600" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-red-500" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-xs font-bold",
																children: sandboxResult.validationResult.passes_validation ? "Validation Passed" : "Validation Failed"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "ml-auto text-xs font-mono",
																children: [
																	"Score: ",
																	sandboxResult.validationResult.confidence_score ?? "N/A",
																	"/100"
																]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "grid grid-cols-3 gap-2 text-[10px]",
														children: [
															"material_match",
															"geometry_match",
															"texture_match",
															"finish_match",
															"orientation_match",
															"color_match"
														].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1",
															children: [sandboxResult.validationResult?.[k] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3 w-3 text-red-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "capitalize",
																children: k.replace(/_/g, " ")
															})]
														}, k))
													}),
													sandboxResult.validationResult.failure_reasons?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-3 pt-3 border-t border-red-500/20",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-[10px] font-semibold text-red-600 mb-1",
															children: "Failure Reasons:"
														}), sandboxResult.validationResult.failure_reasons.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "text-[10px] text-red-500",
															children: ["• ", r]
														}, i))]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "bg-muted/30 border border-border rounded-xl p-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between items-center border-b border-border pb-2 mb-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-xs font-semibold flex items-center gap-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" }), sandboxResult.isImageStage ? "Compiled Image Prompt" : "Compiled Prompt Sent to AI"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px] text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono",
														children: [sandboxResult.compiledPrompt.length, " chars"]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
													className: "text-xs font-mono bg-background text-muted-foreground border border-border rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap leading-relaxed",
													children: sandboxResult.compiledPrompt
												})]
											}),
											!sandboxResult.isImageStage && sandboxResult.aiResponse && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "bg-muted/30 border border-border rounded-xl p-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between items-center border-b border-border pb-2 mb-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-xs font-semibold flex items-center gap-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), "AI Response"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-mono",
														children: "JSON Output"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
													className: "text-xs font-mono bg-background text-foreground border border-border rounded-lg p-3 overflow-auto max-h-96 whitespace-pre-wrap leading-relaxed",
													children: (() => {
														try {
															const m = sandboxResult.aiResponse.match(/\{[\s\S]*\}/);
															if (m) return JSON.stringify(JSON.parse(m[0]), null, 2);
														} catch {}
														return sandboxResult.aiResponse;
													})()
												})]
											})
										]
									})
								]
							}),
							currentTemplate && activeTab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-4",
								children: historyLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground py-8 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5 animate-spin" }), "Loading version history..."]
								}) : historyLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground py-12 border border-dashed border-border rounded-xl text-center space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-8 w-8 mx-auto text-muted-foreground/40" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: "No version history yet"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px]",
											children: "Save changes to the prompt to create your first version."
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											historyLogs.length,
											" version",
											historyLogs.length !== 1 ? "s" : "",
											" found for this template."
										]
									}), historyLogs.map((log, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-muted/30 border border-border rounded-xl p-4 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between items-start",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-xs font-bold",
														children: ["Version v", log.version]
													}), idx === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded px-1.5 py-0.5",
														children: "Previous"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-muted-foreground mt-0.5",
													children: new Date(log.created_at).toLocaleString()
												})] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => handleRestore(log),
												disabled: saving || !isSuperAdmin,
												className: "text-[10px] text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded px-2.5 py-1 font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3" }), " Restore"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
											className: "text-[10px] font-mono whitespace-pre-wrap bg-background text-muted-foreground rounded-lg border border-border p-3 max-h-36 overflow-y-auto leading-relaxed",
											children: log.prompt_text
										})]
									}, log.id))]
								})
							})
						]
					})
				]
			})]
		})]
	});
}
export { AdminAiTemplatesPage as component };
