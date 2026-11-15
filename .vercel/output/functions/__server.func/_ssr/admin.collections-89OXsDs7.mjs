import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { lt as ExternalLink, st as FileText } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.collections-89OXsDs7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGES = [
	"Draft",
	"Sent",
	"Viewed",
	"Quoted",
	"Negotiating",
	"Approved",
	"Completed",
	"Cancelled"
];
function CollectionsCrmPage() {
	const { isAdmin, loading } = useAuth();
	const [rows, setRows] = (0, import_react.useState)([]);
	const [admins, setAdmins] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(true);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [selectedRow, setSelectedRow] = (0, import_react.useState)(null);
	const [selectedItems, setSelectedItems] = (0, import_react.useState)([]);
	const load = async () => {
		setBusy(true);
		const [{ data: colls }, { data: items }, { data: profs }, { data: inqs }, { data: roleRows }] = await Promise.all([
			supabase.from("collections").select("*").order("created_at", { ascending: false }),
			supabase.from("collection_items").select("*"),
			supabase.from("profiles").select("id,auth_id,full_name,email,phone_number"),
			supabase.from("whatsapp_inquiries").select("id,collection_id,assigned_admin_id,inquiry_status"),
			supabase.from("user_roles").select("user_id,role")
		]);
		const profByAuth = new Map((profs ?? []).map((p) => [p.auth_id, p]));
		const itemCount = /* @__PURE__ */ new Map();
		(items ?? []).forEach((i) => itemCount.set(i.collection_id, (itemCount.get(i.collection_id) ?? 0) + 1));
		const inqByColl = /* @__PURE__ */ new Map();
		(inqs ?? []).forEach((i) => inqByColl.set(i.collection_id, i));
		const adminIds = new Set((roleRows ?? []).filter((r) => r.role === "admin" || r.role === "super_admin").map((r) => r.user_id));
		const adminList = (profs ?? []).filter((p) => adminIds.has(p.auth_id));
		setAdmins(adminList);
		const out = (colls ?? []).map((c) => {
			const p = profByAuth.get(c.user_id);
			const inq = inqByColl.get(c.id);
			let rawStatus = "Draft";
			if (c.status && STAGES.includes(c.status)) rawStatus = c.status;
			else if (c.whatsapp_sent || c.inquiry_status === "SENT") rawStatus = "Sent";
			else if (c.inquiry_status && STAGES.includes(c.inquiry_status)) rawStatus = c.inquiry_status;
			return {
				id: c.id,
				user_id: c.user_id,
				name: c.name || "Collection",
				reference_number: c.reference_number || null,
				project_name: c.project_name || null,
				customer_name: p?.full_name ?? null,
				customer_email: p?.email ?? null,
				customer_phone: p?.phone_number ?? null,
				customer_profile_id: p?.id ?? null,
				products_count: itemCount.get(c.id) ?? 0,
				created_at: c.created_at,
				submitted_at: c.submitted_at || null,
				whatsapp_sent: !!c.whatsapp_sent,
				is_locked: c.is_locked ?? Boolean(c.whatsapp_sent),
				version: c.version || 1,
				parent_collection_id: c.parent_collection_id || null,
				status: rawStatus,
				assigned_admin_id: inq?.assigned_admin_id ?? null,
				internal_notes: c.internal_notes ?? null,
				inquiry_id: inq?.id ?? null
			};
		});
		setRows(out);
		setBusy(false);
	};
	(0, import_react.useEffect)(() => {
		if (isAdmin) load();
	}, [isAdmin]);
	(0, import_react.useMemo)(() => filter === "all" ? rows : rows.filter((r) => r.status === filter), [rows, filter]);
	const byStage = (0, import_react.useMemo)(() => {
		const m = {
			Draft: [],
			Sent: [],
			Viewed: [],
			Quoted: [],
			Negotiating: [],
			Approved: [],
			Completed: [],
			Cancelled: []
		};
		rows.forEach((r) => {
			if (m[r.status]) m[r.status].push(r);
			else m["Draft"].push(r);
		});
		return m;
	}, [rows]);
	const setStage = async (row, stage) => {
		try {
			await supabase.from("collections").update({
				status: stage,
				inquiry_status: stage
			}).eq("id", row.id);
		} catch {
			await supabase.from("collections").update({ inquiry_status: stage }).eq("id", row.id);
		}
		if (row.inquiry_id) await supabase.from("whatsapp_inquiries").update({ inquiry_status: stage }).eq("id", row.inquiry_id);
		toast.success(`Updated stage to ${stage}`);
		load();
	};
	const assign = async (row, admin_id) => {
		if (!row.inquiry_id) return toast.error("No inquiry yet for this collection");
		const { error } = await supabase.from("whatsapp_inquiries").update({ assigned_admin_id: admin_id || null }).eq("id", row.inquiry_id);
		if (error) return toast.error(error.message);
		toast.success("Assigned admin successfully");
		load();
	};
	const saveNotes = async (row, notes) => {
		await supabase.from("collections").update({ internal_notes: notes }).eq("id", row.id);
		toast.success("Notes saved");
	};
	const openWorksheet = async (row) => {
		setSelectedRow(row);
		const { data: colItems } = await supabase.from("collection_items").select("*, products(name, code, price, brand, image_url)").eq("collection_id", row.id);
		setSelectedItems(colItems ?? []);
	};
	if (loading || !isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-8 text-sm text-muted-foreground",
		children: "Loading CRM Worksheet…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold",
					children: "Collection CRM & Quotation Requests"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Manage customer quotation requests, project specifications, and inquiry pipelines."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setFilter("all"),
						className: `rounded px-2.5 py-1 text-xs font-medium ${filter === "all" ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`,
						children: [
							"All (",
							rows.length,
							")"
						]
					}), STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setFilter(s),
						className: `rounded px-2.5 py-1 text-xs font-medium ${filter === s ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`,
						children: [
							s,
							" (",
							byStage[s].length,
							")"
						]
					}, s))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8",
				children: STAGES.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card/50 p-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between border-b border-border/60 pb-1.5 px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
							children: stage
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-surface-2 text-foreground text-[10px] font-bold px-1.5 py-0.5 border border-border",
							children: byStage[stage].length
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [byStage[stage].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border/80 bg-background p-2.5 text-xs shadow-sm hover:border-primary/40 transition",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground block truncate max-w-[130px]",
										children: r.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground block",
										children: r.customer_name || r.customer_email || "Guest User"
									})] }), r.version > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 border border-primary/20",
										children: ["v", r.version]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [r.products_count, " Items"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(r.created_at).toLocaleDateString() })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: r.status,
										onChange: (e) => setStage(r, e.target.value),
										className: "w-full rounded border border-border bg-card px-1.5 py-1 text-[10px] font-medium",
										children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: s,
											children: s
										}, s))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: r.assigned_admin_id ?? "",
										onChange: (e) => assign(r, e.target.value),
										className: "w-full rounded border border-border bg-card px-1.5 py-1 text-[10px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Unassigned"
										}), admins.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: a.id,
											children: a.full_name || a.email
										}, a.id))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center justify-between gap-1 text-[10px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => openWorksheet(r),
										className: "inline-flex items-center gap-1 text-primary hover:underline font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }), " Worksheet"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/collection/$id",
										params: { id: r.id },
										className: "inline-flex items-center gap-1 text-muted-foreground hover:text-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }), " Open"]
									})]
								})
							]
						}, r.id)), byStage[stage].length === 0 && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-muted-foreground/60 text-center py-4",
							children: "— Empty —"
						})]
					})]
				}, stage))
			}),
			selectedRow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-border pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "font-display text-lg font-semibold",
									children: [
										selectedRow.name,
										" (v",
										selectedRow.version,
										")"
									]
								}), selectedRow.reference_number && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-md bg-card text-foreground text-xs font-mono font-bold px-2 py-0.5 border border-border",
									children: selectedRow.reference_number
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground mt-0.5",
								children: [
									"Customer: ",
									selectedRow.customer_name || selectedRow.customer_email || "Guest",
									selectedRow.customer_phone && ` • Phone: ${selectedRow.customer_phone}`
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSelectedRow(null),
								className: "rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-surface-2",
								children: "Close"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2",
							children: "Project Specification Worksheet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2 max-h-60 overflow-y-auto",
							children: selectedItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border/80 p-3 bg-background text-xs space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										item.products?.name || "Product",
										" (Code: ",
										item.products?.code,
										")"
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-primary font-bold",
										children: [
											item.quantity || 1,
											" ",
											item.unit || "Pieces"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 text-muted-foreground text-[11px]",
									children: [
										item.installation_location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Location: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: item.installation_location
										})] }),
										item.delivery_preference && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Delivery: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: item.delivery_preference
										})] }),
										item.installation_required && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Installation: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: item.installation_required
										})] }),
										item.project_notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2",
											children: ["Notes: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground",
												children: item.project_notes
											})]
										})
									]
								})]
							}, item.id))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1",
							children: "Internal Admin CRM Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							defaultValue: selectedRow.internal_notes || "",
							onBlur: (e) => saveNotes(selectedRow, e.target.value),
							placeholder: "Add internal notes e.g., Sent quote ₦1.2m on 05/08...",
							className: "w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none",
							rows: 3
						})] })
					]
				})
			})
		]
	});
}
export { CollectionsCrmPage as component };
