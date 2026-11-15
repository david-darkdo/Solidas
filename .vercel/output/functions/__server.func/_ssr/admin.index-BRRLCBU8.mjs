import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { r as useAppSettings, t as APP_SETTINGS_QUERY_KEY } from "./settings-AvHwlRqF.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react, s as useQueryClient } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { O as Settings, V as Package, c as Users, j as Search } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.index-BRRLCBU8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_OPTIONS = [
	"customer",
	"admin",
	"super_admin"
];
function AdminPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: settings } = useAppSettings();
	const { user, loading: authLoading, isAdmin, isSuperAdmin } = useAuth();
	const [code, setCode] = (0, import_react.useState)("");
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({});
	const [savingSettings, setSavingSettings] = (0, import_react.useState)(false);
	const [products, setProducts] = (0, import_react.useState)([]);
	const [users, setUsers] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!settings) return;
		setForm({
			support_whatsapp: settings.support_whatsapp ?? "",
			sales_whatsapp: settings.sales_whatsapp ?? "",
			company_email: settings.company_email ?? "",
			company_address: settings.company_address ?? "",
			map_url: settings.map_url ?? "",
			facebook_url: settings.facebook_url ?? "",
			instagram_url: settings.instagram_url ?? "",
			tiktok_url: settings.tiktok_url ?? ""
		});
	}, [settings]);
	(0, import_react.useEffect)(() => {
		if (!isAdmin) return;
		(async () => {
			const { data } = await supabase.from("products").select("id,slug,name,code,is_published,is_ai_processing,created_at").order("created_at", { ascending: false }).limit(50);
			setProducts(data ?? []);
		})();
	}, [isAdmin]);
	const loadUsers = (0, import_react.useMemo)(() => async () => {
		const { data: profiles, error: pErr } = await supabase.from("profiles").select("auth_id, email, full_name").order("created_at", { ascending: false });
		if (pErr) {
			toast.error(pErr.message);
			return;
		}
		const { data: roles, error: rErr } = await supabase.from("user_roles").select("user_id, role");
		if (rErr) {
			toast.error(rErr.message);
			return;
		}
		const roleMap = /* @__PURE__ */ new Map();
		const rank = {
			customer: 0,
			admin: 1,
			super_admin: 2
		};
		for (const r of roles) {
			const prev = roleMap.get(r.user_id);
			if (!prev || rank[r.role] > rank[prev]) roleMap.set(r.user_id, r.role);
		}
		setUsers((profiles ?? []).map((p) => ({
			auth_id: p.auth_id,
			email: p.email,
			full_name: p.full_name,
			role: roleMap.get(p.auth_id) ?? "customer"
		})));
	}, []);
	(0, import_react.useEffect)(() => {
		if (isSuperAdmin) loadUsers();
	}, [isSuperAdmin, loadUsers]);
	if (authLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-10 text-sm text-muted-foreground",
		children: "Loading…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold",
			children: "Admin"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: "Please sign in."
		})]
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold",
			children: "Admin"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: [
				"You're signed in but don't have admin access. Ask a super admin to grant your account the ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "admin" }),
				" role."
			]
		})]
	});
	const searchByCode = async (e) => {
		e.preventDefault();
		if (!code.trim()) return;
		setSearching(true);
		const { data } = await supabase.from("products").select("slug").ilike("code", code.trim()).maybeSingle();
		setSearching(false);
		if (data?.slug) navigate({
			to: "/product/$slug",
			params: { slug: data.slug }
		});
		else toast.error(`No product with code "${code}"`);
	};
	const saveSettings = async (e) => {
		e.preventDefault();
		if (!isSuperAdmin) {
			toast.error("Only super admins can edit company settings.");
			return;
		}
		setSavingSettings(true);
		const payload = {};
		for (const k of Object.keys(form)) payload[k] = form[k]?.trim() || null;
		const { error } = settings?.id ? await supabase.from("app_settings").update(payload).eq("id", settings.id) : await supabase.from("app_settings").insert(payload);
		setSavingSettings(false);
		if (error) return toast.error(error.message);
		toast.success("Settings saved");
		await queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
	};
	const updateUserRole = async (target, nextRole) => {
		if (!isSuperAdmin) return;
		if (target.auth_id === user.id && target.role === "super_admin" && nextRole !== "super_admin") {
			if (!confirm("You are about to remove your own super admin role. Continue?")) return;
		}
		const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", target.auth_id);
		if (delErr) return toast.error(delErr.message);
		const { error: insErr } = await supabase.from("user_roles").insert({
			user_id: target.auth_id,
			role: nextRole
		});
		if (insErr) return toast.error(insErr.message);
		setUsers((rows) => rows.map((r) => r.auth_id === target.auth_id ? {
			...r,
			role: nextRole
		} : r));
		toast.success(`Role updated to ${nextRole}`);
	};
	const toggleAiProcessing = async (id, current) => {
		const next = !current;
		const { error } = await supabase.from("products").update({ is_ai_processing: next }).eq("id", id);
		if (error) return toast.error(error.message);
		setProducts((ps) => ps.map((p) => p.id === id ? {
			...p,
			is_ai_processing: next
		} : p));
		toast.success(next ? "AI generation queued (stub)" : "AI flag cleared");
	};
	const deleteProduct = async (id) => {
		if (!confirm("Delete this product?")) return;
		const { error } = await supabase.from("products").delete().eq("id", id);
		if (error) return toast.error(error.message);
		setProducts((p) => p.filter((x) => x.id !== id));
		toast.success("Deleted");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "Admin Panel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Manage products, contact info & inquiries."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerAnalyticsCards, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 font-display text-lg font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-primary" }), " Product Code Search"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Open a product instantly by its code."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: searchByCode,
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: code,
							onChange: (e) => setCode(e.target.value),
							placeholder: "e.g. TIL-CAR-001",
							className: "flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: searching,
							className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
							children: searching ? "…" : "Open"
						})]
					})
				]
			}),
			isSuperAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 font-display text-lg font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4 text-primary" }), " Company Settings"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Used across the site (Contact, Footer, Floating WhatsApp, Push to WhatsApp)."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: saveSettings,
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [[
							["support_whatsapp", "Support WhatsApp"],
							["sales_whatsapp", "Sales WhatsApp"],
							["company_email", "Company Email"],
							["company_address", "Company Address"],
							["map_url", "Map URL"],
							["facebook_url", "Facebook URL"],
							["instagram_url", "Instagram URL"],
							["tiktok_url", "TikTok URL"]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-1 block text-xs font-medium text-muted-foreground",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form[key] ?? "",
								onChange: (e) => setForm((f) => ({
									...f,
									[key]: e.target.value
								})),
								className: "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
							})]
						}, key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: savingSettings,
								className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
								children: savingSettings ? "Saving…" : "Save settings"
							})
						})]
					})
				]
			}),
			isSuperAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 font-display text-lg font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-primary" }), " User Management"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Update roles directly. Hierarchy: customer < admin < super_admin."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "min-w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-left text-xs uppercase tracking-wider text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "User"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Email"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Current Role"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Update Role"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "divide-y divide-border",
								children: [users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 pr-3 font-medium",
										children: u.full_name || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 pr-3 text-muted-foreground",
										children: u.email || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 pr-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] uppercase tracking-wider text-primary",
											children: u.role
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 pr-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: u.role,
											onChange: (e) => updateUserRole(u, e.target.value),
											className: "rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary",
											children: ROLE_OPTIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: r,
												children: r
											}, r))
										})
									})
								] }, u.auth_id)), users.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 4,
									className: "py-4 text-center text-xs text-muted-foreground",
									children: "No users found."
								}) })]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 font-display text-lg font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4 text-primary" }), " Products"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Most recent 50 products."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-border",
						children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center gap-2 py-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/product/$slug",
										params: { slug: p.slug },
										className: "block truncate font-medium hover:text-primary",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [
											"Code · ",
											p.code,
											" · ",
											p.is_published ? "Published" : "Draft",
											p.is_ai_processing ? " · AI processing…" : ""
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => toggleAiProcessing(p.id, p.is_ai_processing),
									className: "rounded-md border border-primary/40 px-2 py-1 text-xs text-primary hover:bg-primary/10",
									children: p.is_ai_processing ? "Regenerate AI Assets" : "Generate AI Assets"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => deleteProduct(p.id),
									className: "rounded-md border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/10",
									children: "Delete"
								})
							]
						}, p.id))
					})
				]
			})
		]
	});
}
function CustomerAnalyticsCards() {
	const [stats, setStats] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		(async () => {
			const [{ data: profs }, { data: roles }, { data: colls }, { data: inqs }, { data: camps }] = await Promise.all([
				supabase.from("profiles").select("email,vip_status"),
				supabase.from("user_roles").select("account_status"),
				supabase.from("collections").select("id"),
				supabase.from("whatsapp_inquiries").select("id"),
				supabase.from("email_campaigns").select("status")
			]);
			const total = profs?.length ?? 0;
			const google = (profs ?? []).filter((p) => p.email && /@gmail\./i.test(p.email)).length;
			const email = total - google;
			const active = (roles ?? []).filter((r) => (r.account_status ?? "ACTIVE") === "ACTIVE").length;
			const suspended = (roles ?? []).filter((r) => r.account_status === "SUSPENDED" || r.account_status === "BLOCKED").length;
			const vip = (profs ?? []).filter((p) => p.vip_status).length;
			const campsTotal = camps?.length ?? 0;
			const campsSent = (camps ?? []).filter((c) => c.status === "SENT").length;
			setStats({
				total,
				google,
				email,
				active,
				suspended,
				vip,
				colls: colls?.length ?? 0,
				inqs: inqs?.length ?? 0,
				campsTotal,
				campsSent
			});
		})();
	}, []);
	const cards = [
		["Total users", stats.total],
		["Google", stats.google],
		["Email", stats.email],
		["Active", stats.active],
		["Suspended", stats.suspended],
		["VIP", stats.vip],
		["Collections", stats.colls],
		["WhatsApp inquiries", stats.inqs],
		["Campaigns created", stats.campsTotal],
		["Campaigns sent", stats.campsSent]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground",
		children: "Customer Analytics"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5",
		children: cards.map(([label, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-card p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xl font-semibold",
				children: v ?? 0
			})]
		}, label))
	})] });
}
export { AdminPage as component };
