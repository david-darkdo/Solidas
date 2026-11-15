import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, g as Outlet, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { At as Briefcase, Ht as Activity, K as Mail, Nt as Bell, S as Sparkles, St as CircleAlert, V as Package, X as LayoutDashboard, Z as Layers, a as Wrench, at as FolderHeart, c as Users, i as X, j as Search, p as Trash2 } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin-C1Ky4sAv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLayout() {
	const { loading, isAdmin, user } = useAuth();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [code, setCode] = (0, import_react.useState)("");
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [showNotifications, setShowNotifications] = (0, import_react.useState)(false);
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const loadNotifications = async () => {
		if (!user?.id) return;
		const { data } = await supabase.from("communication_queue").select("*").eq("user_id", user.id).eq("channel_type", "push").order("created_at", { ascending: false }).limit(10);
		if (data) setNotifications(data);
	};
	(0, import_react.useEffect)(() => {
		if (user?.id && showNotifications) loadNotifications();
	}, [user?.id, showNotifications]);
	const clearNotification = async (id) => {
		await supabase.from("communication_queue").delete().eq("id", id);
		loadNotifications();
	};
	const onSearchCode = async (e) => {
		e.preventDefault();
		if (!code.trim()) return;
		setSearching(true);
		const { data, error } = await supabase.from("products").select("id").ilike("code", code.trim()).maybeSingle();
		setSearching(false);
		if (error) return toast.error(error.message);
		if (data?.id) {
			navigate({
				to: "/admin/products/$id",
				params: { id: data.id }
			});
			setCode("");
		} else toast.error(`No product with code "${code}"`);
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-10 text-sm text-muted-foreground",
		children: "Loading…"
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold",
			children: "Admin"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: [
				"You don't have admin access. Ask a super admin to grant you the ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "admin" }),
				" role."
			]
		})]
	});
	const tabs = [
		{
			to: "/admin",
			label: "Operations",
			icon: LayoutDashboard,
			active: pathname === "/admin"
		},
		{
			to: "/admin/products",
			label: "Products",
			icon: Package,
			active: pathname.startsWith("/admin/products")
		},
		{
			to: "/admin/pipeline",
			label: "Pipeline",
			icon: Activity,
			active: pathname.startsWith("/admin/pipeline")
		},
		{
			to: "/admin/hierarchy",
			label: "Hierarchy",
			icon: Layers,
			active: pathname.startsWith("/admin/hierarchy")
		},
		{
			to: "/admin/ai-templates",
			label: "AI Templates",
			icon: Sparkles,
			active: pathname.startsWith("/admin/ai-templates")
		},
		{
			to: "/admin/diagnostics",
			label: "Diagnostics",
			icon: Wrench,
			active: pathname.startsWith("/admin/diagnostics")
		},
		{
			to: "/admin/customers",
			label: "Customers",
			icon: Users,
			active: pathname.startsWith("/admin/customers")
		},
		{
			to: "/admin/collections",
			label: "Collections",
			icon: FolderHeart,
			active: pathname.startsWith("/admin/collections")
		},
		{
			to: "/admin/email",
			label: "Communication Center",
			icon: Mail,
			active: pathname.startsWith("/admin/email")
		},
		{
			to: "/admin/business",
			label: "Business",
			icon: Briefcase,
			active: pathname.startsWith("/admin/business")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-[60vh]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-border bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-app flex flex-wrap items-center gap-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: t.to,
						className: `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${t.active ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "h-3.5 w-3.5" }), t.label]
					}, t.to))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative ml-auto flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Storefront Feed" })
						}),
						user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setShowNotifications(!showNotifications),
								className: "relative grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-foreground transition hover:border-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5" }), notifications.filter((n) => n.status === "PENDING").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" })]
							}), showNotifications && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute right-0 mt-2 w-80 rounded-lg border border-border bg-card shadow-xl p-4 text-xs space-y-3 z-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-b border-border pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: "In-App Notifications"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setShowNotifications(false),
										className: "text-muted-foreground hover:text-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 max-h-60 overflow-y-auto pr-1",
									children: [notifications.map((notif) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 border border-border rounded bg-background flex gap-2 relative group text-left",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-semibold text-foreground truncate",
													children: notif.subject || "Alert"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-muted-foreground mt-0.5 leading-tight",
													children: notif.body
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: (e) => {
													e.stopPropagation();
													clearNotification(notif.id);
												},
												className: "absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
											})
										]
									}, notif.id)), notifications.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-muted-foreground italic text-center py-4",
										children: "No notifications yet."
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: onSearchCode,
							className: "relative flex min-w-[200px] flex-1 sm:max-w-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: code,
									onChange: (e) => setCode(e.target.value),
									placeholder: "Enter Product Code",
									className: "w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-20 text-xs outline-none focus:border-primary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: searching,
									className: "absolute right-1 top-1/2 -translate-y-1/2 rounded-sm bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
									children: searching ? "…" : "Open"
								})
							]
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
	});
}
export { AdminLayout as component };
