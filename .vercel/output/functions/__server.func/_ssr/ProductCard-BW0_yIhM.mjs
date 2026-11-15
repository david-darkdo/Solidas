import { i as __toESM } from "../_runtime.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { S as removeItemFromUserCollectionSync, U as getCanonicalProductSlug, a as addGuestItem, b as removeGuestItem, h as getGuestCollection, m as getCachedUserCollectionItems, o as addItemToUserCollection, s as addItemToUserCollectionSync, x as removeItemFromUserCollection, z as publicImageUrl } from "./router-DWif86SF.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Dt as Check, I as Plus, nt as Heart } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/ProductCard-BW0_yIhM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AddToCollectionButton({ productId, className, compact = false }) {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [added, setAdded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const refresh = () => {
			if (user) {
				const cached = getCachedUserCollectionItems(user.id);
				setAdded(cached.items.some((i) => i.product_id === productId));
			} else setAdded(getGuestCollection().some((i) => i.product_id === productId));
		};
		refresh();
		window.addEventListener("collection:change", refresh);
		return () => {
			window.removeEventListener("collection:change", refresh);
		};
	}, [productId, user]);
	const onClick = (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		const nextState = !added;
		setAdded(nextState);
		try {
			if (!user) {
				if (nextState) {
					addGuestItem(productId);
					const currentCount = getGuestCollection().length;
					toast.success(`+${currentCount}`, {
						description: "Sign in to sync across devices.",
						action: {
							label: "Sign in",
							onClick: () => navigate({ to: "/auth" })
						}
					});
				} else removeGuestItem(productId);
			} else if (nextState) {
				const cached = addItemToUserCollectionSync(user.id, productId);
				toast.success(`+${cached.items.length}`);
				addItemToUserCollection(user.id, productId);
			} else {
				removeItemFromUserCollectionSync(user.id, productId);
				removeItemFromUserCollection(user.id, productId);
			}
		} catch (e) {
			console.error(e);
			setAdded(!nextState);
			toast.error("Couldn't update collection");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: className ?? `flex flex-1 items-center justify-center gap-1 rounded-md border ${added ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs" : "border-border bg-surface-2 text-foreground hover:border-primary hover:text-primary font-medium"} px-2.5 py-1.5 text-[11px] transition-all duration-150 active:scale-95`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(added ? Check : Plus, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: added ? "Added" : compact ? "+ Add" : "Add to Collection" })]
	});
}
var GUEST_STORAGE_KEY = "enreach_favorites_v2";
var USER_STORAGE_KEY_PREFIX = "enreach_favorites_user_v2_";
var EVENT_NAME = "enreach_favorites_changed";
function getGuestFavorites() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(GUEST_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function setGuestFavorites(ids) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
		window.dispatchEvent(new CustomEvent(EVENT_NAME));
	} catch {}
}
function getUserFavoritesCache(userId) {
	if (typeof window === "undefined" || !userId) return [];
	try {
		const raw = localStorage.getItem(`${USER_STORAGE_KEY_PREFIX}${userId}`);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function setUserFavoritesCache(userId, ids) {
	if (typeof window === "undefined" || !userId) return;
	try {
		localStorage.setItem(`${USER_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(Array.from(new Set(ids))));
		window.dispatchEvent(new CustomEvent(EVENT_NAME));
	} catch {}
}
function useFavorites() {
	const { user } = useAuth();
	const [favoriteIds, setFavoriteIds] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined" && user?.id) {
			const cached = getUserFavoritesCache(user.id);
			if (cached.length > 0) return cached;
		}
		return getGuestFavorites();
	});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const syncFavorites = (0, import_react.useCallback)(async () => {
		if (user?.id) {
			const cached = getUserFavoritesCache(user.id);
			if (cached.length > 0) setFavoriteIds(cached);
			setLoading(true);
			try {
				const { data: prof } = await supabase.from("profiles").select("id").eq("auth_id", user.id).maybeSingle();
				const profileId = prof?.id;
				const targetUserId = profileId || user.id;
				const guestIds = getGuestFavorites();
				if (guestIds.length > 0) {
					for (const prodId of guestIds) try {
						await supabase.from("favorites").upsert({
							user_id: targetUserId,
							product_id: prodId
						}, { onConflict: "user_id,product_id" });
					} catch {
						await supabase.from("favorites").insert({
							user_id: targetUserId,
							product_id: prodId
						});
					}
					localStorage.removeItem(GUEST_STORAGE_KEY);
				}
				let query = supabase.from("favorites").select("product_id");
				if (profileId) query = query.or(`user_id.eq.${user.id},user_id.eq.${profileId}`);
				else query = query.eq("user_id", user.id);
				const { data, error } = await query;
				if (!error && data) {
					const ids = Array.from(new Set(data.map((d) => d.product_id).filter(Boolean)));
					setFavoriteIds(ids);
					setUserFavoritesCache(user.id, ids);
				}
			} catch (err) {
				console.error("Failed to sync favorites from Supabase:", err);
			} finally {
				setLoading(false);
			}
		} else setFavoriteIds(getGuestFavorites());
	}, [user?.id]);
	(0, import_react.useEffect)(() => {
		syncFavorites();
		const handleEvent = () => {
			if (user?.id) setFavoriteIds(getUserFavoritesCache(user.id));
			else setFavoriteIds(getGuestFavorites());
		};
		window.addEventListener(EVENT_NAME, handleEvent);
		return () => window.removeEventListener(EVENT_NAME, handleEvent);
	}, [user?.id, syncFavorites]);
	return {
		favoriteIds,
		isFavorite: (0, import_react.useCallback)((productId) => favoriteIds.includes(productId), [favoriteIds]),
		toggleFavorite: (0, import_react.useCallback)(async (productId, _productData) => {
			const currentlyFav = favoriteIds.includes(productId);
			const nextIds = currentlyFav ? favoriteIds.filter((id) => id !== productId) : [...favoriteIds, productId];
			if (!user?.id) {
				setFavoriteIds(nextIds);
				setGuestFavorites(nextIds);
				toast.success(currentlyFav ? "Removed from favorites" : "Saved to favorites");
				return;
			}
			setFavoriteIds(nextIds);
			setUserFavoritesCache(user.id, nextIds);
			toast.success(currentlyFav ? "Removed from favorites" : "Saved to favorites");
			try {
				const { data: prof } = await supabase.from("profiles").select("id").eq("auth_id", user.id).maybeSingle();
				const profileId = prof?.id;
				const targetUserId = profileId || user.id;
				if (currentlyFav) {
					let { error } = await supabase.from("favorites").delete().eq("user_id", targetUserId).eq("product_id", productId);
					if (error && profileId) await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
				} else try {
					await supabase.from("favorites").upsert({
						user_id: targetUserId,
						product_id: productId
					}, { onConflict: "user_id,product_id" });
				} catch {
					await supabase.from("favorites").insert({
						user_id: targetUserId,
						product_id: productId
					});
				}
			} catch (err) {
				console.error("Background sync error updating favorite:", err);
				setFavoriteIds(favoriteIds);
				setUserFavoritesCache(user.id, favoriteIds);
				toast.error("Failed to update favorites on server");
			}
		}, [user?.id, favoriteIds]),
		loading,
		refresh: syncFavorites
	};
}
function ProductCardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/60 shadow-xs select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes cardBreathing {
          0%, 100% { transform: scale(0.94); opacity: 0.25; }
          50% { transform: scale(1.06); opacity: 0.55; }
        }
        .animate-card-breathing {
          animation: cardBreathing 2s ease-in-out infinite;
        }
      ` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "aspect-square bg-muted/15 relative flex items-center justify-center overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "animate-card-breathing",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.png",
						alt: "Loading",
						className: "h-9 w-auto object-contain opacity-40 dark:opacity-60"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-2 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3.5 bg-muted/20 rounded-md w-3/4 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2.5 bg-muted/15 rounded-md w-1/2 animate-pulse" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 bg-muted/10 rounded-md w-1/3 mt-2 animate-pulse" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex gap-2 pt-2 border-t border-border/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-7 bg-muted/10 rounded animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-7 bg-muted/10 rounded animate-pulse" })]
					})
				]
			})
		]
	});
}
function ProductCard({ product }) {
	const { isFavorite, toggleFavorite } = useFavorites();
	const isFav = isFavorite(product.id);
	const img = publicImageUrl(product.generated_studio_image) || publicImageUrl(product.image_url) || "https://placehold.co/600x600/eee/aaa?text=No+Image";
	const isNew = (0, import_react.useMemo)(() => {
		const createdAt = product.created_at;
		if (!createdAt) return false;
		const createdDate = new Date(createdAt);
		const diffTime = Math.abs((/* @__PURE__ */ new Date()).getTime() - createdDate.getTime());
		return Math.ceil(diffTime / 864e5) <= 7;
	}, [product.created_at]);
	const handleToggleFavorite = (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggleFavorite(product.id, product);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/20",
		children: [
			isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-2.5 left-2.5 z-10 bg-primary/90 backdrop-blur px-2 py-0.5 rounded text-[9px] font-bold text-primary-foreground tracking-wide uppercase shadow",
				children: "New"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: handleToggleFavorite,
				className: "absolute top-2.5 right-2.5 z-10 rounded-full p-2 bg-background/85 hover:bg-background text-foreground transition shadow border border-border/80 focus:outline-none",
				"aria-label": isFav ? "Remove from favorites" : "Save to favorites",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `h-3.5 w-3.5 transition-colors duration-300 text-red-500 hover:text-red-600 ${isFav ? "fill-red-500 text-red-500" : ""}` })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/product/$slug",
				params: { slug: getCanonicalProductSlug(product) },
				className: "block aspect-square overflow-hidden bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: img,
					alt: product.name,
					loading: "lazy",
					className: "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-2 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-sm font-semibold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors",
						children: product.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
						children: ["Code · ", product.code]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-base font-bold text-primary mt-1",
						children: [
							"₦",
							Number(product.price).toLocaleString(),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-[10px] font-normal text-muted-foreground",
								children: "/sqm"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex gap-2 pt-2 border-t border-border/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToCollectionButton, {
							productId: product.id,
							compact: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/product/$slug",
							params: { slug: getCanonicalProductSlug(product) },
							className: "flex-1 flex items-center justify-center rounded bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/95 transition shadow-sm",
							children: "View"
						})]
					})
				]
			})
		]
	});
}
export { useFavorites as i, ProductCard as n, ProductCardSkeleton as r, AddToCollectionButton as t };
