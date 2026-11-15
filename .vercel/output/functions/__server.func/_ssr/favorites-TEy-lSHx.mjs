import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { i as useFavorites, n as ProductCard, r as ProductCardSkeleton } from "./ProductCard-BW0_yIhM.mjs";
import { i as AppShell } from "./router-DWif86SF.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Lt as ArrowRight, nt as Heart } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/favorites-TEy-lSHx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FavoritesPage() {
	const { user } = useAuth();
	const { favoriteIds, loading: favLoading } = useFavorites();
	const [products, setProducts] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const loadFavoriteProducts = (0, import_react.useCallback)(async () => {
		if (favoriteIds.length === 0) {
			setProducts([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const { data, error } = await supabase.from("products").select("id,slug,name,code,price,brand,image_url,generated_studio_image,generated_installed_image,short_description,family_id,type_id,category_id,subcategory_id,color,material,finish,app_keywords,featured_feed,featured_homepage").in("id", favoriteIds).eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null);
			if (!error && data) setProducts(data);
		} catch (err) {
			console.error("Failed to load favorite products:", err);
		} finally {
			setLoading(false);
		}
	}, [favoriteIds]);
	(0, import_react.useEffect)(() => {
		loadFavoriteProducts();
	}, [loadFavoriteProducts]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-8 space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-6 w-6 text-red-500 fill-red-500" }), "My Favorites"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-0.5",
				children: "Your saved shortlist of luxury finishes, tiles, doors, and architectural materials."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs font-semibold text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-full self-start sm:self-auto",
				children: [
					favoriteIds.length,
					" Saved ",
					favoriteIds.length === 1 ? "Item" : "Items"
				]
			})]
		}), loading || favLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
			children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCardSkeleton, {}, i))
		}) : products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center py-20 border border-dashed border-border rounded-xl space-y-4 bg-card/30",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-10 w-10 text-muted-foreground mx-auto" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold text-foreground text-sm",
					children: "No favorited items yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1 max-w-xs mx-auto",
					children: "Explore our catalog and click the heart icon on any product to save it to your shortlist."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition shadow-sm",
					children: ["Browse Catalogue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
			children: products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product }, product.id))
		})]
	}) });
}
export { FavoritesPage as component };
