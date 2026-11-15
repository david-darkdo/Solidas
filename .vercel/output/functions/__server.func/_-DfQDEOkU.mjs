import { G as getProductionOrigin, M as hierarchyQuery, i as AppShell, j as Route$34 } from "./_ssr/router-DWif86SF.mjs";
import { n as ProductCard } from "./_ssr/ProductCard-BW0_yIhM.mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime, i as useSuspenseQuery } from "./_libs/react+tanstack__react-query.mjs";
import { Lt as ArrowRight, Z as Layers } from "./_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/_-DfQDEOkU.js
var import_jsx_runtime = require_jsx_runtime();
function HierarchyLandingPage() {
	const params = Route$34.useParams();
	const { data } = useSuspenseQuery(hierarchyQuery(params._splat, ""));
	const { type, category, subcategory, family, products, childCategories, childSubcategories, childFamilies } = data;
	const origin = data.origin || getProductionOrigin();
	const breadcrumbs = [{
		label: "Home",
		path: "/"
	}, {
		label: type.name,
		path: `/${type.slug}`
	}];
	if (category) breadcrumbs.push({
		label: category.name,
		path: `/${type.slug}/${category.slug}`
	});
	if (subcategory) breadcrumbs.push({
		label: subcategory.name,
		path: `/${type.slug}/${category.slug}/${subcategory.slug}`
	});
	if (family) {
		const parentPath = subcategory ? `/${type.slug}/${category.slug}/${subcategory.slug}` : `/${type.slug}/${category.slug}`;
		breadcrumbs.push({
			label: family.name,
			path: `${parentPath}/${family.slug}`
		});
	}
	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": breadcrumbs.map((b, i) => ({
			"@type": "ListItem",
			"position": i + 1,
			"name": b.label,
			"item": b.path.startsWith("/") ? `${origin}${b.path}` : b.path
		}))
	};
	const colors = Array.from(new Set(products.map((p) => p.color).filter(Boolean)));
	const finishes = Array.from(new Set(products.map((p) => p.finish).filter(Boolean)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
		type: "application/ld+json",
		dangerouslySetInnerHTML: { __html: JSON.stringify(breadcrumbSchema) }
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex items-center gap-1.5 overflow-x-auto pb-2 text-[10px] uppercase tracking-wider text-muted-foreground",
				children: breadcrumbs.map((b, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5 shrink-0",
					children: [index > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground/40",
						children: "/"
					}), index === breadcrumbs.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: b.label
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: b.path,
						className: "hover:text-primary transition",
						children: b.label
					})]
				}, index))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 border-b border-border pb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5" }),
							type.name,
							" ",
							category && `· ${category.name}`
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl",
						children: family ? family.name : subcategory ? subcategory.name : category ? category.name : type.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: family?.custom_ai_prompt_override || `Browse our catalog of premium ${type.name.toLowerCase()} materials. Solidas Tiles and Marble curates state of the art finishes for custom builder specifications.`
					})
				]
			}),
			(childCategories.length > 0 || childSubcategories.length > 0 || childFamilies.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Explore Collections & Filters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						childCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: `/${type.slug}/${c.slug}`,
							className: "rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition shrink-0",
							children: c.name
						}, c.id)),
						childSubcategories.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: `/${type.slug}/${category.slug}/${s.slug}`,
							className: "rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition shrink-0",
							children: s.name
						}, s.id)),
						childFamilies.map((f) => {
							const subSlug = subcategory?.slug || f.subcategory_slug;
							const parentPath = subSlug ? `/${type.slug}/${category.slug}/${subSlug}` : `/${type.slug}/${category.slug}`;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: `${parentPath}/${f.slug}`,
								className: "rounded-full border border-border bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-accent/25 transition shrink-0",
								children: [f.name, " Collection"]
							}, f.id);
						})
					]
				})]
			}),
			family && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					colors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
							children: "Available Colours"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-medium text-foreground",
							children: colors.join(" · ")
						})]
					}),
					finishes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
							children: "Available Finishes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-medium text-foreground",
							children: finishes.join(" · ")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
							children: "Specifications"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-medium text-foreground",
							children: "Abuja Stock · Premium Import"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between border-b border-border pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-lg font-semibold text-foreground",
						children: [
							"Products (",
							products.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Showing premium matching assets"
					})]
				}), products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 rounded-xl border border-dashed border-border p-12 text-center bg-card/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No active products in this catalog level yet."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline",
						children: ["Go to Home Catalogue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
					children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
				})]
			})
		]
	})] });
}
export { HierarchyLandingPage as component };
