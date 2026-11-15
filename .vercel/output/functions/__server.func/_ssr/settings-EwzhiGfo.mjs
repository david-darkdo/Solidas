import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { r as useAppSettings, t as APP_SETTINGS_QUERY_KEY } from "./settings-AvHwlRqF.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { i as AppShell } from "./router-DWif86SF.mjs";
import { c as require_jsx_runtime, l as require_react, s as useQueryClient } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as ShieldAlert, O as Settings } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/settings-EwzhiGfo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FIELDS = [
	[
		"support_whatsapp",
		"Support WhatsApp",
		"Used for the floating WhatsApp button"
	],
	[
		"sales_whatsapp",
		"Sales WhatsApp",
		"Used for Push to WhatsApp from collections"
	],
	["company_email", "Company Email"],
	["company_address", "Company Address"],
	["map_url", "Map URL"],
	["facebook_url", "Facebook URL"],
	["instagram_url", "Instagram URL"],
	["tiktok_url", "TikTok URL"],
	["youtube_url", "YouTube URL"],
	[
		"google_site_verification",
		"Google Site Verification",
		"Paste the Google Search Console meta tag content code"
	],
	[
		"bing_site_verification",
		"Bing Site Verification",
		"Paste the Bing Webmaster tools xml/meta verification code"
	]
];
function SettingsPage() {
	const queryClient = useQueryClient();
	const { data: settings } = useAppSettings();
	const { loading: authLoading, isSuperAdmin } = useAuth();
	const [form, setForm] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!settings) return;
		const next = {};
		for (const [k] of FIELDS) next[k] = settings[k] ?? "";
		setForm(next);
	}, [settings]);
	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		const payload = {};
		for (const [k] of FIELDS) payload[k] = form[k]?.trim() || null;
		const { error } = settings?.id ? await supabase.from("app_settings").update(payload).eq("id", settings.id) : await supabase.from("app_settings").insert(payload);
		setSaving(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("SOLIDAS Company Settings saved");
		await queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
	};
	if (authLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-10 text-sm text-muted-foreground",
		children: "Loading settings…"
	}) });
	if (!isSuperAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-[#C0262D]/30 bg-[#C0262D]/5 p-6 max-w-md mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-[#C0262D]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-lg font-bold",
						children: "Super Admin Only"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "SOLIDAS company settings can only be edited by a super admin."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account",
					className: "mt-4 inline-block rounded-lg border border-border bg-white px-4 py-2 text-xs font-bold hover:bg-surface-2",
					children: "Back to Account"
				})
			]
		})
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-8 space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-border pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-6 w-6 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold text-foreground",
				children: "SOLIDAS Company Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Configure corporate phone numbers, WhatsApp, addresses, and Search Console verification tokens."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			className: "grid gap-4 sm:grid-cols-2",
			children: [FIELDS.map(([key, label, hint]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-bold uppercase tracking-wider text-[#1E82A6]",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: form[key] ?? "",
						onChange: (e) => setForm((f) => ({
							...f,
							[key]: e.target.value
						})),
						className: "w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-foreground outline-none focus:border-[#1E82A6]"
					}),
					hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-[11px] text-muted-foreground",
						children: hint
					})
				]
			}, key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2 pt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: saving,
					className: "rounded-lg bg-[#C0262D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9A1B21] disabled:opacity-60 transition shadow-sm",
					children: saving ? "Saving…" : "Save SOLIDAS Settings"
				})
			})]
		})]
	}) });
}
export { SettingsPage as component };
