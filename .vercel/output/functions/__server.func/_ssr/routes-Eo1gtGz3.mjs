import { i as __toESM } from "../_runtime.mjs";
import { F as taxonomyQuery, N as Route$35, P as feedInfiniteQuery, i as AppShell } from "./router-DWif86SF.mjs";
import { n as ProductCard, r as ProductCardSkeleton } from "./ProductCard-BW0_yIhM.mjs";
import { c as require_jsx_runtime, i as useSuspenseQuery, l as require_react, t as useInfiniteQuery } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Et as ChevronDown, Y as LoaderCircle } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/routes-Eo1gtGz3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FeedPage() {
	const search = Route$35.useSearch();
	const navigate = useNavigate();
	const { data: tax } = useSuspenseQuery(taxonomyQuery);
	const feedQuery = useInfiniteQuery(feedInfiniteQuery(search));
	const loadMoreRef = (0, import_react.useRef)(null);
	const activeType = tax.types.find((t) => t.slug === search.type);
	const categoriesForType = activeType ? tax.categories.filter((c) => c.type_id === activeType.id && (c.product_count ?? 1) > 0) : [];
	const activeCategory = categoriesForType.find((c) => c.slug === search.category);
	const subcategoriesForCat = activeCategory ? tax.subcategories.filter((s) => s.category_id === activeCategory.id && (s.product_count ?? 1) > 0) : [];
	const activeSub = subcategoriesForCat.find((s) => s.slug === search.subcategory);
	const setType = (slug) => navigate({
		to: "/",
		search: {
			type: slug,
			category: void 0,
			subcategory: void 0
		}
	});
	const setCategory = (slug) => navigate({
		to: "/",
		search: {
			...search,
			category: slug,
			subcategory: void 0
		}
	});
	const setSub = (slug) => navigate({
		to: "/",
		search: {
			...search,
			subcategory: slug
		}
	});
	const allProducts = feedQuery.data?.pages.flatMap((page) => page.items) ?? [];
	const totalCount = feedQuery.data?.pages[0]?.totalCount ?? 0;
	const hasNextPage = feedQuery.hasNextPage;
	const isFetchingNextPage = feedQuery.isFetchingNextPage;
	(0, import_react.useEffect)(() => {
		if (!hasNextPage || isFetchingNextPage) return;
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) feedQuery.fetchNextPage();
		}, { threshold: .1 });
		const el = loadMoreRef.current;
		if (el) observer.observe(el);
		return () => {
			if (el) observer.unobserve(el);
		};
	}, [
		hasNextPage,
		isFetchingNextPage,
		feedQuery
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app pt-4 pb-12 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				active: !search.type,
				onClick: () => setType(void 0),
				children: "All Materials"
			}), tax.types.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				active: search.type === t.slug,
				onClick: () => setType(t.slug),
				children: t.name
			}, t.id))] }),
			activeType && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterRow, {
				tone: "muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					active: !search.category,
					onClick: () => setCategory(void 0),
					children: "All Categories"
				}), categoriesForType.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					active: search.category === c.slug,
					onClick: () => setCategory(c.slug),
					children: c.name
				}, c.id))]
			}),
			activeCategory && subcategoriesForCat.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterRow, {
				tone: "muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					active: !search.subcategory,
					onClick: () => setSub(void 0),
					children: "All Specs"
				}), subcategoriesForCat.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					active: search.subcategory === s.slug,
					onClick: () => setSub(s.slug),
					children: s.name
				}, s.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-end justify-between border-b border-border pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xs uppercase tracking-[0.2em] font-bold text-[#1E82A6]",
					children: activeSub ? `${activeCategory?.name} · ${activeSub.name}` : activeCategory ? activeCategory.name : activeType ? activeType.name : "SOLIDAS Digital Showroom Feed"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl",
					children: "Architectural Materials Catalog"
				})] }), totalCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-mono text-muted-foreground hidden sm:inline",
					children: [
						"Showing ",
						allProducts.length,
						" of ",
						totalCount,
						" products"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
				children: feedQuery.isLoading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCardSkeleton, {}, i)) : allProducts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
			}),
			!feedQuery.isLoading && allProducts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 rounded-xl border border-dashed border-border p-10 text-center bg-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No products match these material filters yet."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					search: {},
					className: "mt-3 inline-block text-xs font-bold text-[#1E82A6] hover:underline",
					children: "Reset filters"
				})]
			}),
			hasNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: loadMoreRef,
				className: "pt-8 text-center space-y-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => void feedQuery.fetchNextPage(),
					disabled: isFetchingNextPage,
					className: "inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:border-[#1E82A6] hover:text-[#1E82A6] transition shadow-xs disabled:opacity-50",
					children: isFetchingNextPage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-[#1E82A6]" }), "Loading more materials…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"Load More Products (",
						totalCount - allProducts.length,
						" remaining)",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
					] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Browse Showroom Categories and Specifications",
				className: "mt-10 rounded-xl border border-border bg-white p-5 shadow-2xs space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-bold uppercase tracking-wider text-[#1E82A6]",
					children: "Browse Showroom by Material Category & Size"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: "Direct links to our full Abuja showroom collections for tiles, marble, granite, and security doors."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: tax.types.filter((t) => (t.product_count ?? 1) > 0).map((t) => {
						const cats = tax.categories.filter((c) => c.type_id === t.id && (c.product_count ?? 1) > 0);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border/70 bg-surface-2 p-3.5 space-y-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `/${t.slug}`,
								className: "font-display text-sm font-bold text-foreground hover:text-[#1E82A6] transition inline-block",
								children: [t.name, " Catalog →"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: cats.map((c) => {
									const subs = tax.subcategories.filter((s) => s.category_id === c.id && (s.product_count ?? 1) > 0);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: `/${t.slug}/${c.slug}`,
											className: "font-semibold text-[#1E82A6] hover:underline",
											children: c.name
										}), subs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 flex flex-wrap gap-1.5",
											children: subs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: `/${t.slug}/${c.slug}/${s.slug}`,
												className: "rounded border border-border bg-white px-2 py-0.5 text-[11px] text-muted-foreground hover:border-[#1E82A6] hover:text-[#1E82A6] transition",
												children: s.name
											}, s.id))
										})]
									}, c.id);
								})
							})]
						}, t.id);
					})
				})]
			})
		]
	}) });
}
function FilterRow({ children, tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none ${tone === "muted" ? "opacity-95" : ""}`,
		children
	});
}
function Pill({ children, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${active ? "border-[#1E82A6] bg-[#1E82A6] text-white shadow-2xs" : "border-border bg-white text-muted-foreground hover:border-[#1E82A6] hover:text-[#1E82A6]"}`,
		children
	});
}
export { FeedPage as component };
