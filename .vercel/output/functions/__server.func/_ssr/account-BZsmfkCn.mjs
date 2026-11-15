import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { K as Mail, Mt as Bookmark, O as Settings, T as ShieldCheck, l as User, q as LogOut, w as Shield } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/account-BZsmfkCn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	const { user, loading, isAdmin, isSuperAdmin } = useAuth();
	const navigate = useNavigate();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		(async () => {
			const { data: p } = await supabase.from("profiles").select("full_name,email").eq("auth_id", user.id).maybeSingle();
			setProfile(p ?? null);
			setFullName(p?.full_name ?? "");
		})();
	}, [user]);
	const signOut = async () => {
		await supabase.auth.signOut();
		navigate({ to: "/" });
	};
	const saveProfile = async (e) => {
		e.preventDefault();
		if (!user) return;
		setSaving(true);
		const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("auth_id", user.id);
		setSaving(false);
		if (error) toast.error(error.message);
		else toast.success("Profile updated");
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-10 text-sm text-muted-foreground",
		children: "Loading…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "Account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Sign in to manage your profile and collection."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
					children: "Sign in"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/collection",
					className: "rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-primary",
					children: "My Collection"
				})]
			})
		]
	});
	const roleLabel = isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Customer";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-semibold",
					children: "Account"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Manage your profile and settings."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: signOut,
					className: "inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:border-destructive hover:text-destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Sign out"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate font-medium",
								children: profile?.full_name || user.email
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3" }),
									" ",
									user.email
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-auto inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary",
							children: [isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3 w-3" }), roleLabel]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveProfile,
					className: "mt-5 grid gap-3 sm:grid-cols-[1fr_auto]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: fullName,
						onChange: (e) => setFullName(e.target.value),
						placeholder: "Full name",
						className: "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: saving,
						className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
						children: saving ? "Saving…" : "Save"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/collection",
						search: { autoPush: false },
						className: "flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-emerald-500 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-5 w-5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-sm",
							children: "Active Project Workspace"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Current working project draft & products"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/my-collections",
						className: "flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-amber-500 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-5 w-5 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-sm",
							children: "My Collections History"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Immutable records of submitted quotation requests"
						})] })]
					}),
					isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin",
						className: "flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-sm",
							children: "Admin CRM & Quotations"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Manage products & quotation pipeline"
						})] })]
					}),
					isSuperAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/settings",
						className: "flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-sm",
							children: "Company Settings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Contact info, socials, WhatsApp"
						})] })]
					})
				]
			})
		]
	});
}
export { AccountPage as component };
