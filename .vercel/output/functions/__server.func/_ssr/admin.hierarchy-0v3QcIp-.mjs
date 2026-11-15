import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as Archive, I as Plus, It as ArrowUp, Vt as ArchiveRestore, p as Trash2, z as Pencil, zt as ArrowDown } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.hierarchy-0v3QcIp-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function reorder(table, rows, id, dir) {
	const sorted = [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
	const idx = sorted.findIndex((r) => r.id === id);
	const swapIdx = idx + dir;
	if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
	const a = sorted[idx];
	const b = sorted[swapIdx];
	const aOrder = a.sort_order ?? idx;
	const bOrder = b.sort_order ?? swapIdx;
	await supabase.from(table).update({ sort_order: bOrder }).eq("id", a.id);
	await supabase.from(table).update({ sort_order: aOrder }).eq("id", b.id);
}
var slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function HierarchyPage() {
	const [types, setTypes] = (0, import_react.useState)([]);
	const [cats, setCats] = (0, import_react.useState)([]);
	const [subs, setSubs] = (0, import_react.useState)([]);
	const [fams, setFams] = (0, import_react.useState)([]);
	const [contexts, setContexts] = (0, import_react.useState)([]);
	const load = async () => {
		const [t, c, s, f, ic] = await Promise.all([
			supabase.from("product_types").select("id,name,slug,code_prefix,installation_context_id,is_archived,sort_order").order("sort_order").order("name"),
			supabase.from("categories").select("id,name,slug,type_id,is_archived,sort_order").order("sort_order").order("name"),
			supabase.from("subcategories").select("id,name,slug,category_id,is_archived,sort_order").order("sort_order").order("name"),
			supabase.from("family_groups").select("id,name,slug,subcategory_id,is_archived,sort_order").order("sort_order").order("name"),
			supabase.from("installation_contexts").select("id,name").order("name")
		]);
		setTypes(t.data ?? []);
		setCats(c.data ?? []);
		setSubs(s.data ?? []);
		setFams(f.data ?? []);
		setContexts(ic.data ?? []);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-6 max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "Hierarchy Management"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Product Types › Categories › Subcategories › Family Groups"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				tableName: "product_types",
				onReorder: async (r, dir) => {
					await reorder("product_types", types, r.id, dir);
					load();
				},
				title: "Product Types",
				rows: types,
				extras: contexts,
				onCreate: async (name) => {
					const code_prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
					const installation_context_id = contexts[0]?.id;
					if (!installation_context_id) return toast.error("Create an installation context first.");
					const { error } = await supabase.from("product_types").insert({
						name,
						slug: slugify(name),
						code_prefix,
						installation_context_id
					});
					if (error) toast.error(error.message);
					else {
						toast.success("Created");
						load();
					}
				},
				onUpdate: async (r) => {
					const { error } = await supabase.from("product_types").update({
						name: r.name,
						slug: r.slug,
						code_prefix: r.code_prefix,
						installation_context_id: r.installation_context_id
					}).eq("id", r.id);
					if (error) toast.error(error.message);
					else {
						toast.success("Saved");
						load();
					}
				},
				onDelete: async (id) => {
					const { error } = await supabase.from("product_types").delete().eq("id", id);
					if (error) toast.error(error.message);
					else {
						toast.success("Deleted");
						load();
					}
				},
				onArchive: async (r) => {
					const { error } = await supabase.from("product_types").update({ is_archived: !r.is_archived }).eq("id", r.id);
					if (error) toast.error(error.message);
					else {
						toast.success(r.is_archived ? "Restored" : "Archived");
						load();
					}
				},
				renderExtra: (r, set) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: r.code_prefix ?? "",
					onChange: (e) => set({
						...r,
						code_prefix: e.target.value.toUpperCase()
					}),
					placeholder: "PREFIX",
					className: "w-20 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono uppercase"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: r.installation_context_id ?? "",
					onChange: (e) => set({
						...r,
						installation_context_id: e.target.value
					}),
					className: "rounded-md border border-border bg-background px-2 py-1 text-xs",
					children: contexts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.name
					}, c.id))
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				tableName: "categories",
				onReorder: async (r, dir) => {
					await reorder("categories", cats.filter((c) => c.type_id === r.type_id), r.id, dir);
					load();
				},
				title: "Categories",
				rows: cats,
				parentLabel: "Type",
				parents: types,
				parentKey: "type_id",
				onCreate: async (name, parent_id) => {
					if (!parent_id) return toast.error("Select a type");
					const { error } = await supabase.from("categories").insert({
						name,
						slug: slugify(name),
						type_id: parent_id
					});
					if (error) toast.error(error.message);
					else {
						toast.success("Created");
						load();
					}
				},
				onUpdate: async (r) => {
					const { error } = await supabase.from("categories").update({
						name: r.name,
						slug: r.slug,
						type_id: r.type_id
					}).eq("id", r.id);
					if (error) toast.error(error.message);
					else {
						toast.success("Saved");
						load();
					}
				},
				onDelete: async (id) => {
					const { error } = await supabase.from("categories").delete().eq("id", id);
					if (error) toast.error(error.message);
					else {
						toast.success("Deleted");
						load();
					}
				},
				onArchive: async (r) => {
					const { error } = await supabase.from("categories").update({ is_archived: !r.is_archived }).eq("id", r.id);
					if (error) toast.error(error.message);
					else {
						toast.success(r.is_archived ? "Restored" : "Archived");
						load();
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				tableName: "subcategories",
				onReorder: async (r, dir) => {
					await reorder("subcategories", subs.filter((s) => s.category_id === r.category_id), r.id, dir);
					load();
				},
				title: "Subcategories",
				rows: subs,
				parentLabel: "Category",
				parents: cats,
				parentKey: "category_id",
				onCreate: async (name, parent_id) => {
					if (!parent_id) return toast.error("Select a category");
					const { error } = await supabase.from("subcategories").insert({
						name,
						slug: slugify(name),
						category_id: parent_id
					});
					if (error) toast.error(error.message);
					else {
						toast.success("Created");
						load();
					}
				},
				onUpdate: async (r) => {
					const { error } = await supabase.from("subcategories").update({
						name: r.name,
						slug: r.slug,
						category_id: r.category_id
					}).eq("id", r.id);
					if (error) toast.error(error.message);
					else {
						toast.success("Saved");
						load();
					}
				},
				onDelete: async (id) => {
					const { error } = await supabase.from("subcategories").delete().eq("id", id);
					if (error) toast.error(error.message);
					else {
						toast.success("Deleted");
						load();
					}
				},
				onArchive: async (r) => {
					const { error } = await supabase.from("subcategories").update({ is_archived: !r.is_archived }).eq("id", r.id);
					if (error) toast.error(error.message);
					else {
						toast.success(r.is_archived ? "Restored" : "Archived");
						load();
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				tableName: "family_groups",
				onReorder: async (r, dir) => {
					await reorder("family_groups", fams.filter((f) => f.subcategory_id === r.subcategory_id), r.id, dir);
					load();
				},
				title: "Family Groups",
				rows: fams,
				parentLabel: "Subcategory",
				parents: subs,
				parentKey: "subcategory_id",
				onCreate: async (name, parent_id) => {
					if (!parent_id) return toast.error("Select a subcategory");
					const { error } = await supabase.from("family_groups").insert({
						name,
						slug: slugify(name),
						subcategory_id: parent_id
					});
					if (error) toast.error(error.message);
					else {
						toast.success("Created");
						load();
					}
				},
				onUpdate: async (r) => {
					const { error } = await supabase.from("family_groups").update({
						name: r.name,
						slug: r.slug,
						subcategory_id: r.subcategory_id
					}).eq("id", r.id);
					if (error) toast.error(error.message);
					else {
						toast.success("Saved");
						load();
					}
				},
				onDelete: async (id) => {
					const { error } = await supabase.from("family_groups").delete().eq("id", id);
					if (error) toast.error(error.message);
					else {
						toast.success("Deleted");
						load();
					}
				},
				onArchive: async (r) => {
					const { error } = await supabase.from("family_groups").update({ is_archived: !r.is_archived }).eq("id", r.id);
					if (error) toast.error(error.message);
					else {
						toast.success(r.is_archived ? "Restored" : "Archived");
						load();
					}
				}
			})
		]
	});
}
function Section({ title, rows, parents, parentKey, parentLabel, onCreate, onUpdate, onDelete, onArchive, onReorder, renderExtra, extras, tableName }) {
	const [name, setName] = (0, import_react.useState)("");
	const [parent, setParent] = (0, import_react.useState)("");
	const [edit, setEdit] = (0, import_react.useState)({});
	const [showArchived, setShowArchived] = (0, import_react.useState)(false);
	const startEdit = (r) => setEdit({
		...edit,
		[r.id]: { ...r }
	});
	const cancel = (id) => {
		const e = { ...edit };
		delete e[id];
		setEdit(e);
	};
	const visible = rows.filter((r) => showArchived || !r.is_archived);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-1 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: showArchived,
						onChange: (e) => setShowArchived(e.target.checked)
					}), "Show archived"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					parents && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: parent,
						onChange: (e) => setParent(e.target.value),
						className: "rounded-md border border-border bg-background px-2 py-1.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: "",
							children: [
								"— ",
								parentLabel,
								" —"
							]
						}), parents.filter((p) => !p.is_archived).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: `New ${title.slice(0, -1).toLowerCase()} name`,
						className: "flex-1 min-w-[180px] rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: async () => {
							if (!name.trim()) return;
							await onCreate(name.trim(), parent || void 0);
							setName("");
						},
						className: "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 divide-y divide-border text-sm",
				children: [visible.map((r) => {
					const e = edit[r.id];
					if (e) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center gap-2 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: e.name,
								onChange: (ev) => setEdit({
									...edit,
									[r.id]: {
										...e,
										name: ev.target.value
									}
								}),
								className: "flex-1 min-w-[160px] rounded-md border border-border bg-background px-2 py-1 text-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: e.slug ?? "",
								onChange: (ev) => setEdit({
									...edit,
									[r.id]: {
										...e,
										slug: ev.target.value
									}
								}),
								placeholder: "slug",
								className: "w-32 rounded-md border border-border bg-background px-2 py-1 text-xs"
							}),
							parents && parentKey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: e[parentKey] ?? "",
								onChange: (ev) => setEdit({
									...edit,
									[r.id]: {
										...e,
										[parentKey]: ev.target.value
									}
								}),
								className: "rounded-md border border-border bg-background px-2 py-1 text-xs",
								children: parents.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: p.id,
									children: p.name
								}, p.id))
							}),
							renderExtra?.(e, (next) => setEdit({
								...edit,
								[r.id]: next
							})),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: async () => {
									await onUpdate(e);
									cancel(r.id);
								},
								className: "rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground",
								children: "Save"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => cancel(r.id),
								className: "rounded-md border border-border px-2 py-1 text-xs",
								children: "Cancel"
							})
						]
					}, r.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: `flex flex-wrap items-center gap-2 py-2 ${r.is_archived ? "opacity-60" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 font-medium",
								children: r.name
							}),
							r.is_archived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-600",
								children: "Archived"
							}),
							r.slug && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground font-mono",
								children: r.slug
							}),
							r.code_prefix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-mono",
								children: r.code_prefix
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => startEdit(r),
								className: "rounded-md border border-border px-2 py-1 text-xs",
								title: "Edit",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3" })
							}),
							onReorder && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: async () => {
									await onReorder(r, -1);
								},
								className: "rounded-md border border-border px-2 py-1 text-xs",
								title: "Move up",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3 w-3" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: async () => {
									await onReorder(r, 1);
								},
								className: "rounded-md border border-border px-2 py-1 text-xs",
								title: "Move down",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-3 w-3" })
							})] }),
							onArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: async () => {
									await onArchive(r);
								},
								className: "rounded-md border border-border px-2 py-1 text-xs",
								title: r.is_archived ? "Restore" : "Archive",
								children: r.is_archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveRestore, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "h-3 w-3" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: async () => {
									if (confirm(`Permanently delete "${r.name}"? Products keeping this reference will be un-linked.`)) await onDelete(r.id);
								},
								className: "rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10",
								title: "Delete",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
							})
						]
					}, r.id);
				}), visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-3 text-xs text-muted-foreground",
					children: "None yet."
				})]
			})
		]
	});
}
export { HierarchyPage as component };
