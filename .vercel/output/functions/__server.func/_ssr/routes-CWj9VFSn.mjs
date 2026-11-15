import { c as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
// node_modules/.nitro/vite/services/ssr/assets/routes-CWj9VFSn.js
var import_jsx_runtime = require_jsx_runtime();
var SplitErrorComponent = ({ error }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6 text-sm text-[#C0262D] font-mono",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Error: ", error?.message || String(error)] })
	});
};
export { SplitErrorComponent as errorComponent };
