import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { y as mergeGuestIntoUser } from "./router-DWif86SF.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { S as useSearch, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
// node_modules/.nitro/vite/services/ssr/assets/auth-CqYVtf9u.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/auth" });
	const { user } = useAuth();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const targetPath = search.autoPush ? `${search.redirectTo || "/collection"}?autoPush=true` : search.redirectTo || "/collection";
	if (user) setTimeout(() => {
		if (search.autoPush) navigate({
			to: "/collection",
			search: { autoPush: true }
		});
		else navigate({ to: search.redirectTo || "/collection" });
	}, 0);
	const submit = async (e) => {
		e.preventDefault();
		setBusy(true);
		try {
			if (mode === "signup") {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: `${window.location.origin}${targetPath}`,
						data: { full_name: fullName }
					}
				});
				if (error) throw error;
				if (data.user) {
					try {
						await mergeGuestIntoUser(data.user.id);
					} catch {}
					toast.success("Account created");
					if (search.autoPush) navigate({
						to: "/collection",
						search: { autoPush: true }
					});
					else navigate({ to: search.redirectTo || "/collection" });
				} else toast("Check your email to confirm your account");
			} else {
				const { data, error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				if (data.user) try {
					await mergeGuestIntoUser(data.user.id);
				} catch {}
				toast.success("Welcome back");
				if (search.autoPush) navigate({
					to: "/collection",
					search: { autoPush: true }
				});
				else navigate({ to: search.redirectTo || "/collection" });
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setBusy(false);
		}
	};
	const google = async () => {
		setBusy(true);
		const redirectUrl = `${window.location.origin}/collection?autoPush=true`;
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: redirectUrl }
		});
		if (error) {
			toast.error("Google sign-in failed: " + error.message);
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app max-w-md py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: mode === "signin" ? "Sign in" : "Create account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: mode === "signin" ? "Sync your collection across devices and submit quotation requests." : "Save & share collections, push to WhatsApp."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: google,
				disabled: busy,
				className: "mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-surface-2 transition",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-[#4285F4]",
					children: "G"
				}), "Continue with Google"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" }),
					" or ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-3",
				children: [
					mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						placeholder: "Full name",
						value: fullName,
						onChange: (e) => setFullName(e.target.value),
						className: "w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "email",
						required: true,
						placeholder: "Email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						className: "w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						required: true,
						minLength: 6,
						placeholder: "Password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						className: "w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy,
						className: "w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
						children: busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-center text-sm text-muted-foreground",
				children: [
					mode === "signin" ? "New here?" : "Already have an account?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
						className: "font-medium text-primary hover:underline",
						children: mode === "signin" ? "Create account" : "Sign in"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-xs text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "hover:text-foreground",
					children: "← Back to feed"
				})
			})
		]
	});
}
export { AuthPage as component };
