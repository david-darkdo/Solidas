import { i as AppShell } from "./router-DWif86SF.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
// node_modules/.nitro/vite/services/ssr/assets/product._slug-B9ftkAB4.js
var import_jsx_runtime = require_jsx_runtime();
var SplitErrorComponent = ({ error }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "container-app py-16 text-center text-sm text-destructive",
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-semibold text-lg",
			children: "Failed to load product page"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted-foreground",
			children: error?.message || String(error)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-4 inline-block text-primary underline",
			children: "Back to feed"
		})
	]
}) });
export { SplitErrorComponent as errorComponent };
