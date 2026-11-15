import { A as Route$28 } from "./router-DWif86SF.mjs";
import { c as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
// node_modules/.nitro/vite/services/ssr/assets/debug-env-DK_hehiP.js
var import_jsx_runtime = require_jsx_runtime();
function DebugEnvPage() {
	const data = Route$28.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			padding: "2rem",
			fontFamily: "monospace",
			backgroundColor: "#0f172a",
			color: "#e2e8f0",
			minHeight: "100vh"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				style: {
					color: "#38bdf8",
					borderBottom: "1px solid #334155",
					paddingBottom: "0.5rem"
				},
				children: "Environment Debug Audit"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginTop: "1.5rem" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Environment Variables (Vercel Server):" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "SUPABASE_URL:" }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { color: "#a7f3d0" },
							children: data.SUPABASE_URL
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "SUPABASE_PROJECT_ID:" }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { color: "#a7f3d0" },
							children: data.SUPABASE_PROJECT_ID
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "SUPABASE_PUBLISHABLE_KEY:" }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { color: "#a7f3d0" },
							children: data.SUPABASE_PUBLISHABLE_KEY_PREVIEW
						})
					] })
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					marginTop: "2rem",
					borderTop: "1px solid #334155",
					paddingTop: "1rem"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Database Connection Audit:" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Status:" }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { color: data.dbStatus.includes("Success") ? "#4ade80" : "#f87171" },
							children: data.dbStatus
						})
					] }),
					data.dbError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						style: {
							backgroundColor: "#1e293b",
							padding: "1rem",
							borderRadius: "0.375rem",
							overflowX: "auto",
							color: "#f87171"
						},
						children: JSON.stringify(data.dbError, null, 2)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					marginTop: "2rem",
					borderTop: "1px solid #334155",
					paddingTop: "1rem"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tables Inspected:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: data.tablesList.map((t, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t }, idx)) })]
			})
		]
	});
}
export { DebugEnvPage as component };
