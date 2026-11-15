import { V as fetchFeedProducts, i as AppShell, k as Route$24 } from "./router-DWif86SF.mjs";
import { n as ProductCard, r as ProductCardSkeleton } from "./ProductCard-BW0_yIhM.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as useQuery, c as require_jsx_runtime, r as queryOptions } from "../_libs/react+tanstack__react-query.mjs";
import { j as Search } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/search-C34BlDg4.js
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const search = Route$24.useSearch();
	const navigate = useNavigate();
	const results = useQuery(queryOptions({
		queryKey: ["search", search],
		queryFn: () => fetchFeedProducts(search),
		enabled: search.q.trim().length > 0
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-xs uppercase tracking-[0.18em] text-accent",
				children: "Search"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl font-semibold tracking-tight",
				children: "Find materials by name, code, color or finish"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					const data = new FormData(e.currentTarget);
					navigate({
						to: "/search",
						search: {
							...search,
							q: String(data.get("q") || "")
						}
					});
				},
				className: "relative mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "q",
					defaultValue: search.q,
					autoFocus: true,
					placeholder: "Try \"carrara\", \"oak\", \"matte\"…",
					className: "w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
				})]
			}),
			(search.type || search.category || search.subcategory) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: ["Limited to filters: ", [
					search.type,
					search.category,
					search.subcategory
				].filter(Boolean).join(" · ")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
				children: search.q.trim() === "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-full text-sm text-muted-foreground",
					children: "Type something to start searching."
				}) : results.isLoading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCardSkeleton, {}, i)) : (results.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-full text-sm text-muted-foreground",
					children: "No matches. Try a different word."
				}) : (results.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
			})
		]
	}) });
}
export { SearchPage as component };
