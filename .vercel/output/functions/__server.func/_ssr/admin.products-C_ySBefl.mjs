import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { z as publicImageUrl } from "./router-DWif86SF.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, g as Outlet, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Plus } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.products-C_ySBefl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductsLayout() {
	if (useRouterState({ select: (s) => s.location.pathname }) !== "/admin/products") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductLibrary, {});
}
var STATUSES = [
	"draft",
	"review",
	"published",
	"archived"
];
function ProductLibrary() {
	const navigate = useNavigate();
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [types, setTypes] = (0, import_react.useState)([]);
	const [cats, setCats] = (0, import_react.useState)([]);
	const [subs, setSubs] = (0, import_react.useState)([]);
	const [fams, setFams] = (0, import_react.useState)([]);
	const [filters, setFilters] = (0, import_react.useState)({
		type: "",
		category: "",
		subcategory: "",
		family: "",
		status: "",
		featured: "",
		hidden: "",
		ai: "",
		includeDeleted: false,
		q: ""
	});
	const load = async () => {
		setLoading(true);
		let q = supabase.from("products").select("id,code,name,production_name,finish_name,price,status,featured_homepage,featured_feed,hidden,ai_status,created_at,image_url,generated_studio_image,type_id,category_id,subcategory_id,family_id,deleted_at").order("created_at", { ascending: false }).limit(500);
		if (!filters.includeDeleted) q = q.is("deleted_at", null);
		if (filters.type) q = q.eq("type_id", filters.type);
		if (filters.category) q = q.eq("category_id", filters.category);
		if (filters.subcategory) q = q.eq("subcategory_id", filters.subcategory);
		if (filters.family) q = q.eq("family_id", filters.family);
		if (filters.status) q = q.eq("status", filters.status);
		if (filters.ai) q = q.eq("ai_status", filters.ai);
		if (filters.hidden === "yes") q = q.eq("hidden", true);
		if (filters.hidden === "no") q = q.eq("hidden", false);
		if (filters.featured === "home") q = q.eq("featured_homepage", true);
		if (filters.featured === "feed") q = q.eq("featured_feed", true);
		if (filters.q.trim()) q = q.or(`name.ilike.%${filters.q}%,code.ilike.%${filters.q}%,production_name.ilike.%${filters.q}%`);
		const { data, error } = await q;
		if (error) toast.error(error.message);
		setRows(data ?? []);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
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
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [JSON.stringify(filters)]);
	const filteredCats = (0, import_react.useMemo)(() => filters.type ? cats.filter((c) => c.type_id === filters.type) : cats, [filters.type, cats]);
	const filteredSubs = (0, import_react.useMemo)(() => filters.category ? subs.filter((s) => s.category_id === filters.category) : subs, [filters.category, subs]);
	const filteredFams = (0, import_react.useMemo)(() => filters.subcategory ? fams.filter((f) => f.subcategory_id === filters.subcategory) : fams, [filters.subcategory, fams]);
	const toggleSel = (id) => {
		setSelected((s) => {
			const n = new Set(s);
			if (n.has(id)) n.delete(id);
			else n.add(id);
			return n;
		});
	};
	const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
	const toggleAll = () => {
		if (allChecked) setSelected(/* @__PURE__ */ new Set());
		else setSelected(new Set(rows.map((r) => r.id)));
	};
	const bulk = async (label, patch) => {
		if (!selected.size) return;
		const ids = Array.from(selected);
		const { data: previous } = await supabase.from("products").select("id, status, deleted_at").in("id", ids);
		const { error } = await supabase.from("products").update(patch).in("id", ids);
		if (error) return toast.error(error.message);
		toast.success(`${label}: ${ids.length} product(s)`, { action: {
			label: "Undo",
			onClick: async () => {
				for (const prev of previous || []) await supabase.from("products").update({
					status: prev.status,
					deleted_at: prev.deleted_at
				}).eq("id", prev.id);
				toast.success("Bulk actions undone!");
				load();
			}
		} });
		setSelected(/* @__PURE__ */ new Set());
		load();
	};
	const bulkDeleteHard = async () => {
		if (!selected.size) return;
		if (!confirm(`Permanently delete ${selected.size} product(s)? This cannot be undone.`)) return;
		const ids = Array.from(selected);
		const { error } = await supabase.from("products").delete().in("id", ids);
		if (error) return toast.error(error.message);
		toast.success(`Deleted ${ids.length}`);
		setSelected(/* @__PURE__ */ new Set());
		load();
	};
	const rowAction = async (id, label, patch) => {
		const { data: prev } = await supabase.from("products").select("status, deleted_at").eq("id", id).single();
		const { error } = await supabase.from("products").update(patch).eq("id", id);
		if (error) return toast.error(error.message);
		toast.success(label, {
			description: "You can undo this action if needed.",
			action: {
				label: "Undo",
				onClick: async () => {
					await supabase.from("products").update({
						status: prev?.status,
						deleted_at: prev?.deleted_at
					}).eq("id", id);
					toast.success("Action undone!");
					load();
				}
			}
		});
		load();
	};
	const confirmPublish = (id, name) => {
		toast(`Publish "${name}"?`, {
			description: "This will make it instantly live on the showroom storefront.",
			action: {
				label: "Publish",
				onClick: () => rowAction(id, "Published", { status: "published" })
			}
		});
	};
	const duplicate = async (id) => {
		const { data } = await supabase.from("products").select("*").eq("id", id).single();
		if (!data) return;
		const { id: _id, code: _c, slug: _s, created_at: _ca, updated_at: _ua, similar_product_ids: _sim, ...rest } = data;
		const copy = {
			...rest,
			name: `${rest.name} (Copy)`,
			slug: `${rest.slug}-copy-${Math.random().toString(36).slice(2, 6)}`,
			status: "draft"
		};
		const { data: ins, error } = await supabase.from("products").insert(copy).select("id").single();
		if (error) return toast.error(error.message);
		toast.success("Duplicated");
		if (ins?.id) navigate({
			to: "/admin/products/$id",
			params: { id: ins.id }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-semibold",
					children: "Product Library"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Master command center — ",
						rows.length,
						" product(s)."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/products/new",
					className: "ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Product"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-4 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: filters.q,
						onChange: (e) => setFilters({
							...filters,
							q: e.target.value
						}),
						placeholder: "Search name / code…",
						className: "rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: filters.type,
						onChange: (v) => setFilters({
							...filters,
							type: v,
							category: "",
							subcategory: "",
							family: ""
						}),
						label: "Type",
						options: types
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: filters.category,
						onChange: (v) => setFilters({
							...filters,
							category: v,
							subcategory: "",
							family: ""
						}),
						label: "Category",
						options: filteredCats
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: filters.subcategory,
						onChange: (v) => setFilters({
							...filters,
							subcategory: v,
							family: ""
						}),
						label: "Subcategory",
						options: filteredSubs
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: filters.family,
						onChange: (v) => setFilters({
							...filters,
							family: v
						}),
						label: "Family",
						options: filteredFams
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: filters.status,
						onChange: (v) => setFilters({
							...filters,
							status: v
						}),
						label: "Status",
						options: STATUSES.map((s) => ({
							id: s,
							name: s
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: filters.featured,
						onChange: (v) => setFilters({
							...filters,
							featured: v
						}),
						label: "Featured",
						options: [{
							id: "home",
							name: "Homepage"
						}, {
							id: "feed",
							name: "Feed"
						}]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: filters.hidden,
						onChange: (v) => setFilters({
							...filters,
							hidden: v
						}),
						label: "Hidden",
						options: [{
							id: "yes",
							name: "Hidden"
						}, {
							id: "no",
							name: "Visible"
						}]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: filters.ai,
						onChange: (v) => setFilters({
							...filters,
							ai: v
						}),
						label: "AI Status",
						options: [
							"idle",
							"queued",
							"processing",
							"ready",
							"failed"
						].map((s) => ({
							id: s,
							name: s
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: filters.includeDeleted,
							onChange: (e) => setFilters({
								...filters,
								includeDeleted: e.target.checked
							})
						}), "Show soft-deleted"]
					})
				]
			}),
			selected.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 p-3 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium",
						children: [selected.size, " selected"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Published", { status: "published" }),
						children: "Publish"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Archived", { status: "archived" }),
						children: "Archive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Featured on Homepage", { featured_homepage: true }),
						children: "Feature Home"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Featured on Feed", { featured_feed: true }),
						children: "Feature Feed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Un-featured", {
							featured_homepage: false,
							featured_feed: false
						}),
						children: "Un-feature"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Hidden", { hidden: true }),
						children: "Hide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Unhidden", { hidden: false }),
						children: "Unhide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("AI Regenerate queued", {
							ai_status: "queued",
							is_ai_processing: true
						}),
						children: "Regenerate AI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Soft-deleted", { deleted_at: (/* @__PURE__ */ new Date()).toISOString() }),
						children: "Soft Delete"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => bulk("Restored", { deleted_at: null }),
						children: "Restore"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: bulkDeleteHard,
						variant: "destructive",
						children: "Permanent Delete"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-xl border border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "min-w-full text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b border-border bg-muted/30 text-left uppercase tracking-wider text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: allChecked,
									onChange: toggleAll
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Image"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Production"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Finish"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Hierarchy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Flags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "AI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Created"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
						className: "divide-y divide-border",
						children: [
							loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 13,
								className: "p-4 text-center text-muted-foreground",
								children: "Loading…"
							}) }),
							!loading && rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 13,
								className: "p-6 text-center text-muted-foreground",
								children: "No products match these filters."
							}) }),
							rows.map((r) => {
								const type = types.find((x) => x.id === r.type_id)?.name ?? "—";
								const cat = cats.find((x) => x.id === r.category_id)?.name ?? "—";
								const sub = subs.find((x) => x.id === r.subcategory_id)?.name ?? "—";
								const fam = fams.find((x) => x.id === r.family_id)?.name ?? "—";
								const img = publicImageUrl(r.generated_studio_image) || publicImageUrl(r.image_url);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: r.deleted_at ? "opacity-50" : "",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: selected.has(r.id),
												onChange: () => toggleSel(r.id)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2",
											children: img ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: img,
												alt: "",
												className: "h-10 w-10 rounded object-cover",
												loading: "lazy"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-10 rounded bg-muted" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2 font-mono",
											children: r.code
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2 font-medium",
											children: r.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2 text-muted-foreground",
											children: r.production_name ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2 text-muted-foreground",
											children: r.finish_name ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-2 text-muted-foreground",
											children: [
												type,
												" › ",
												cat,
												" › ",
												sub,
												" › ",
												fam
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-2",
											children: ["$", Number(r.price).toFixed(2)]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: r.status })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-2 space-x-1",
											children: [
												r.featured_homepage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "accent",
													children: "Home"
												}),
												r.featured_feed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "accent",
													children: "Feed"
												}),
												r.hidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "muted",
													children: "Hidden"
												}),
												r.deleted_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "destructive",
													children: "Deleted"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: "muted",
												children: r.ai_status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2 text-muted-foreground",
											children: new Date(r.created_at).toLocaleDateString()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: "/admin/products/$id",
														params: { id: r.id },
														className: "rounded border border-border px-1.5 py-0.5 hover:border-primary",
														children: "Edit"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => duplicate(r.id),
														className: "rounded border border-border px-1.5 py-0.5 hover:border-primary",
														children: "Duplicate"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => confirmPublish(r.id, r.name),
														className: "rounded border border-border px-1.5 py-0.5 hover:border-primary",
														children: "Publish"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => rowAction(r.id, "Archived", { status: "archived" }),
														className: "rounded border border-border px-1.5 py-0.5 hover:border-primary",
														children: "Archive"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => rowAction(r.id, "AI queued", {
															ai_status: "queued",
															is_ai_processing: true
														}),
														className: "rounded border border-border px-1.5 py-0.5 hover:border-primary",
														children: "Regen AI"
													}),
													r.deleted_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => rowAction(r.id, "Restored", { deleted_at: null }),
														className: "rounded border border-border px-1.5 py-0.5 hover:border-primary",
														children: "Restore"
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => rowAction(r.id, "Soft deleted", { deleted_at: (/* @__PURE__ */ new Date()).toISOString() }),
														className: "rounded border border-border px-1.5 py-0.5 text-amber-600 hover:border-amber-600",
														children: "Soft Del"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: async () => {
															if (!confirm("Permanently delete?")) return;
															const { error } = await supabase.from("products").delete().eq("id", r.id);
															if (error) return toast.error(error.message);
															toast.success("Deleted");
															load();
														},
														className: "rounded border border-destructive/40 px-1.5 py-0.5 text-destructive hover:bg-destructive/10",
														children: "Delete"
													})
												]
											})
										})
									]
								}, r.id);
							})
						]
					})]
				})
			})
		]
	});
}
function Sel({ value, onChange, label, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
		value,
		onChange: (e) => onChange(e.target.value),
		className: "rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
			value: "",
			children: ["All ", label]
		}), options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: o.id,
			children: o.name
		}, o.id))]
	});
}
function Btn({ onClick, children, variant }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: `rounded-md px-2 py-1 font-medium transition ${variant === "destructive" ? "border border-destructive/40 text-destructive hover:bg-destructive/10" : "border border-border bg-background hover:border-primary"}`,
		children
	});
}
function Badge({ children, tone }) {
	const cls = {
		muted: "border-border bg-muted text-muted-foreground",
		accent: "border-accent/40 bg-accent/10 text-accent",
		destructive: "border-destructive/40 bg-destructive/10 text-destructive"
	}[tone ?? ""] ?? "border-primary/30 bg-primary/10 text-primary";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${cls}`,
		children
	});
}
export { ProductsLayout as component };
