import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Dt as Check, K as Mail, Pt as Ban, ct as Eye, dt as Crown, w as Shield } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.customers-39fpktV6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	"customer",
	"admin",
	"super_admin"
];
var STATUSES = [
	"ACTIVE",
	"SUSPENDED",
	"BLOCKED"
];
function CustomersPage() {
	const { isAdmin, loading } = useAuth();
	const [rows, setRows] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [fRole, setFRole] = (0, import_react.useState)("all");
	const [fProv, setFProv] = (0, import_react.useState)("all");
	const [fVip, setFVip] = (0, import_react.useState)("all");
	const [fStatus, setFStatus] = (0, import_react.useState)("all");
	const [fHasColl, setFHasColl] = (0, import_react.useState)("all");
	const [fHasInq, setFHasInq] = (0, import_react.useState)("all");
	const load = async () => {
		setBusy(true);
		const [{ data: profs }, { data: roles }, { data: colls }, { data: inqs }] = await Promise.all([
			supabase.from("profiles").select("id,auth_id,email,full_name,vip_status,created_at"),
			supabase.from("user_roles").select("user_id,role,account_status"),
			supabase.from("collections").select("id,user_id,updated_at,created_at"),
			supabase.from("whatsapp_inquiries").select("id,collection_id,created_at")
		]);
		const roleByAuth = /* @__PURE__ */ new Map();
		(roles ?? []).forEach((r) => roleByAuth.set(r.user_id, {
			role: r.role,
			account_status: r.account_status ?? "ACTIVE"
		}));
		const collByUser = /* @__PURE__ */ new Map();
		(colls ?? []).forEach((c) => {
			const e = collByUser.get(c.user_id) ?? {
				count: 0,
				last: null,
				ids: /* @__PURE__ */ new Set()
			};
			e.count++;
			e.ids.add(c.id);
			const t = c.updated_at ?? c.created_at;
			if (!e.last || t && t > e.last) e.last = t;
			collByUser.set(c.user_id, e);
		});
		const inqByColl = /* @__PURE__ */ new Map();
		(inqs ?? []).forEach((i) => inqByColl.set(i.collection_id, (inqByColl.get(i.collection_id) ?? 0) + 1));
		const out = (profs ?? []).map((p) => {
			const r = roleByAuth.get(p.auth_id) ?? {
				role: "customer",
				account_status: "ACTIVE"
			};
			const ce = collByUser.get(p.auth_id);
			let inqCount = 0;
			ce?.ids.forEach((cid) => inqCount += inqByColl.get(cid) ?? 0);
			return {
				profile_id: p.id,
				auth_id: p.auth_id,
				email: p.email,
				full_name: p.full_name,
				vip_status: !!p.vip_status,
				created_at: p.created_at,
				role: r.role,
				account_status: r.account_status,
				provider: p.email && /@gmail\./i.test(p.email) ? "google" : "email",
				collections_count: ce?.count ?? 0,
				inquiries_count: inqCount,
				last_activity: ce?.last ?? null
			};
		});
		setRows(out);
		setBusy(false);
	};
	(0, import_react.useEffect)(() => {
		if (isAdmin) load();
	}, [isAdmin]);
	const filtered = (0, import_react.useMemo)(() => rows.filter((r) => {
		if (q && !`${r.email ?? ""} ${r.full_name ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
		if (fRole !== "all" && r.role !== fRole) return false;
		if (fProv !== "all" && r.provider !== fProv) return false;
		if (fVip !== "all" && r.vip_status !== (fVip === "vip")) return false;
		if (fStatus !== "all" && r.account_status !== fStatus) return false;
		if (fHasColl === "yes" && r.collections_count === 0) return false;
		if (fHasColl === "no" && r.collections_count > 0) return false;
		if (fHasInq === "yes" && r.inquiries_count === 0) return false;
		if (fHasInq === "no" && r.inquiries_count > 0) return false;
		return true;
	}), [
		rows,
		q,
		fRole,
		fProv,
		fVip,
		fStatus,
		fHasColl,
		fHasInq
	]);
	const updateRole = async (auth_id, role) => {
		const { error } = await supabase.from("user_roles").upsert({
			user_id: auth_id,
			role
		}, { onConflict: "user_id,role" });
		if (error) return toast.error(error.message);
		toast.success("Role updated");
		load();
	};
	const updateStatus = async (auth_id, account_status) => {
		const { error } = await supabase.from("user_roles").update({ account_status }).eq("user_id", auth_id);
		if (error) return toast.error(error.message);
		toast.success(`Account ${account_status}`);
		load();
	};
	const toggleVip = async (profile_id, next) => {
		const { error } = await supabase.from("profiles").update({ vip_status: next }).eq("id", profile_id);
		if (error) return toast.error(error.message);
		load();
	};
	if (loading || !isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-8 text-sm text-muted-foreground",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold",
					children: "Customer Management"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [
						filtered.length,
						" of ",
						rows.length
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 md:grid-cols-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search name/email",
						className: "col-span-2 rounded-md border border-border bg-card px-2 py-1.5 text-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: fRole,
						onChange: (e) => setFRole(e.target.value),
						className: "rounded-md border border-border bg-card px-2 py-1.5 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All roles"
						}), ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: r,
							children: r
						}, r))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: fProv,
						onChange: (e) => setFProv(e.target.value),
						className: "rounded-md border border-border bg-card px-2 py-1.5 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Any provider"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "google",
								children: "Google"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "email",
								children: "Email"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: fVip,
						onChange: (e) => setFVip(e.target.value),
						className: "rounded-md border border-border bg-card px-2 py-1.5 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "VIP any"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "vip",
								children: "VIP only"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "reg",
								children: "Non‑VIP"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: fStatus,
						onChange: (e) => setFStatus(e.target.value),
						className: "rounded-md border border-border bg-card px-2 py-1.5 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "Any status"
						}), STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s
						}, s))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: fHasColl,
						onChange: (e) => setFHasColl(e.target.value),
						className: "rounded-md border border-border bg-card px-2 py-1.5 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Collections any"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "yes",
								children: "Has collections"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "no",
								children: "None"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: fHasInq,
						onChange: (e) => setFHasInq(e.target.value),
						className: "rounded-md border border-border bg-card px-2 py-1.5 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Inquiries any"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "yes",
								children: "Has inquiries"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "no",
								children: "None"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted/50 text-left text-[11px] uppercase text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Customer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Provider"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Role"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "VIP"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Collections"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Inquiries"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Last activity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Joined"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-2",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 10,
						className: "p-4 text-center text-muted-foreground",
						children: "Loading…"
					}) }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 10,
						className: "p-4 text-center text-muted-foreground",
						children: "No customers"
					}) }) : filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border align-top",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "p-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: r.full_name || "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground",
									children: r.email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: r.provider
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: r.role,
									onChange: (e) => updateRole(r.auth_id, e.target.value),
									className: "rounded border border-border bg-card px-1.5 py-0.5 text-[11px]",
									children: ROLES.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: x,
										children: x
									}, x))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `rounded px-1.5 py-0.5 text-[10px] font-medium ${r.account_status === "ACTIVE" ? "bg-primary/15 text-primary" : r.account_status === "SUSPENDED" ? "bg-yellow-500/15 text-yellow-600" : "bg-destructive/15 text-destructive"}`,
									children: r.account_status
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => toggleVip(r.profile_id, !r.vip_status),
									className: `inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] ${r.vip_status ? "bg-primary/15 text-primary" : "border border-border text-muted-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3 w-3" }), r.vip_status ? "VIP" : "—"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: r.collections_count
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: r.inquiries_count
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: r.last_activity ? new Date(r.last_activity).toLocaleDateString() : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: new Date(r.created_at).toLocaleDateString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/admin/customers/$id",
											params: { id: r.profile_id },
											className: "inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 hover:bg-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), "Profile"]
										}),
										r.account_status !== "ACTIVE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => updateStatus(r.auth_id, "ACTIVE"),
											className: "inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 hover:bg-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }), "Activate"]
										}),
										r.account_status !== "SUSPENDED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => updateStatus(r.auth_id, "SUSPENDED"),
											className: "inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 hover:bg-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3 w-3" }), "Suspend"]
										}),
										r.account_status !== "BLOCKED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => updateStatus(r.auth_id, "BLOCKED"),
											className: "inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-destructive hover:bg-destructive/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-3 w-3" }), "Block"]
										}),
										r.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `mailto:${r.email}`,
											className: "inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 hover:bg-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3" }), "Email"]
										})
									]
								})
							})
						]
					}, r.profile_id)) })]
				})
			})
		]
	});
}
export { CustomersPage as component };
