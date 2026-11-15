import { i as __toESM } from "../_runtime.mjs";
import { n as useAuth, t as AuthProvider } from "./use-auth-BMs4mq4g.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { i as waLink, n as fetchAppSettings, r as useAppSettings } from "./settings-AvHwlRqF.mjs";
import { t as useServerFn } from "./useServerFn-C4MBUhiH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-DztbFD3V.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { c as require_jsx_runtime, l as require_react, n as infiniteQueryOptions, o as QueryClientProvider, r as queryOptions } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { F as RefreshCw, G as MapPin, K as Mail, Mt as Bookmark, Nt as Bell, R as Phone, St as CircleAlert, Y as LoaderCircle, _ as Star, d as Truck, et as House, ft as Crop, gt as CloudUpload, ht as Compass, i as X, j as Search, l as User, p as Trash2, pt as CreditCard, q as LogOut, rt as Headphones, ut as Download, w as Shield, yt as CircleQuestionMark } from "../_libs/lucide-react.mjs";
import { Wt as redirect, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, qt as notFound, v as createFileRoute, w as useRouter, x as useNavigate, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
// node_modules/.nitro/vite/services/ssr/assets/origin-B-32raFA.js
function getProductionOrigin(request) {
	if (typeof window !== "undefined") {
		const origin = window.location.origin;
		if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) return origin;
	}
	if (request) {
		const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
		const proto = request.headers.get("x-forwarded-proto") || "https";
		if (host && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("vercel.app")) return `${proto}://${host}`;
	}
	if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
	return "https://solidas.com.ng";
}
// node_modules/.nitro/vite/services/ssr/assets/product-url-GKWwAVYR.js
/**
* Authoritative Slug Normalization Function
* 
* Guarantees:
* - Lowercase
* - Trimmed whitespace
* - Spaces converted to single hyphens
* - Multiple hyphens collapsed
* - Leading and trailing hyphens removed
* - Unsafe URL characters removed
*/
function slugify(text) {
	if (!text) return "";
	return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}
var LEGACY_CATEGORY_SLUG_MAP = {
	"ceramics-tiles": "ceramics",
	"ceramic-tiles": "ceramics",
	"foreign-doors": "foreign",
	"exterior-doors": "foreign",
	"granite-tiles": "granite",
	"local-doors": "local",
	"marble-tiles": "marble"
};
/**
* Normalizes category slugs, mapping legacy malformed category slugs
* (e.g. "ceramics tiles ", "ceramics-tiles", "foreign Doors ", "foreign-doors")
* to their clean canonical slug ("ceramics", "foreign", "granite", "local", "marble").
*/
function normalizeCategorySlug(text) {
	const s = slugify(text);
	return LEGACY_CATEGORY_SLUG_MAP[s] || s;
}
function stripDraftSlugPrefix(slug) {
	return slug.replace(/^draft-(?:img-)?/i, "");
}
/**
* Returns the single authoritative normalized slug for a product.
* Prefers product.slug if present, otherwise slugifies product.name, fallback to product.id.
* Always strips any legacy `draft-` or `draft-img-` prefix so published URLs are clean.
*/
function getCanonicalProductSlug(product) {
	if (!product) return "";
	if (product.slug) {
		const clean = stripDraftSlugPrefix(slugify(product.slug));
		if (clean) return clean;
	}
	if (product.name) {
		const clean = stripDraftSlugPrefix(slugify(product.name));
		if (clean) return clean;
	}
	return product.id || "";
}
/**
* Returns the relative canonical path for a product: /product/{slug}
*/
function getCanonicalProductPath(product) {
	const slug = getCanonicalProductSlug(product);
	return slug ? `/product/${slug}` : "/";
}
/**
* Returns the absolute canonical URL for a product: https://{domain}/product/{slug}
*/
function getCanonicalProductUrl(product, origin = getProductionOrigin()) {
	return `${origin.replace(/\/+$/, "")}${getCanonicalProductPath(product)}`;
}
// node_modules/.nitro/vite/services/ssr/assets/catalog-iDuKVH-_.js
var PRODUCT_FIELDS = "id,slug,name,code,price,brand,image_url,generated_studio_image,generated_installed_image,short_description,family_id,type_id,category_id,subcategory_id,color,material,finish,app_keywords,featured_feed,featured_homepage,created_at";
/** Customer-facing visibility: completed processing, published, not hidden, not soft-deleted. */
function applyPublicFilters(q) {
	return q.eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null);
}
async function fetchTaxonomy() {
	const [types, categories, subcategories, pubProducts] = await Promise.all([
		supabase.from("product_types").select("id,name,slug").order("name"),
		supabase.from("categories").select("id,name,slug,type_id").order("name"),
		supabase.from("subcategories").select("id,name,slug,category_id").order("name"),
		applyPublicFilters(supabase.from("products").select("type_id,category_id,subcategory_id"))
	]);
	if (types.error) throw types.error;
	if (categories.error) throw categories.error;
	if (subcategories.error) throw subcategories.error;
	const typeCounts = /* @__PURE__ */ new Map();
	const catCounts = /* @__PURE__ */ new Map();
	const subCounts = /* @__PURE__ */ new Map();
	for (const p of pubProducts.data ?? []) {
		if (p.type_id) typeCounts.set(p.type_id, (typeCounts.get(p.type_id) || 0) + 1);
		if (p.category_id) catCounts.set(p.category_id, (catCounts.get(p.category_id) || 0) + 1);
		if (p.subcategory_id) subCounts.set(p.subcategory_id, (subCounts.get(p.subcategory_id) || 0) + 1);
	}
	return {
		types: (types.data ?? []).map((t) => ({
			...t,
			name: t.name.trim(),
			slug: slugify(t.slug),
			product_count: typeCounts.get(t.id) || 0
		})),
		categories: (categories.data ?? []).map((c) => ({
			...c,
			name: c.name.trim(),
			slug: normalizeCategorySlug(c.slug),
			product_count: catCounts.get(c.id) || 0
		})),
		subcategories: (subcategories.data ?? []).map((s) => ({
			...s,
			name: s.name.trim(),
			slug: slugify(s.slug),
			product_count: subCounts.get(s.id) || 0
		}))
	};
}
/**
* PRODUCTION CURSOR PAGINATION & INTELLIGENT PRODUCT DISTRIBUTION
* Interleaves Product Types, Categories, Subcategories, and Brands deterministically.
* Eliminates all hardcoded 60-item caps. Supports enterprise scale catalogs.
*/
async function fetchFeedProductsPaginated(filters, cursor = null, limit = 24) {
	if (filters.q && filters.q.trim()) {
		const term = filters.q.trim();
		const matchedIdSet = /* @__PURE__ */ new Set();
		const { data: ranked } = await supabase.rpc("search_products", {
			_q: term,
			_limit: 500
		});
		if (ranked && Array.isArray(ranked)) ranked.forEach((r) => {
			if (r?.product_id) matchedIdSet.add(r.product_id);
		});
		const { data: ilikeProducts } = await applyPublicFilters(supabase.from("products").select("id")).or(`name.ilike.%${term}%,code.ilike.%${term}%,brand.ilike.%${term}%,short_description.ilike.%${term}%,material.ilike.%${term}%,finish.ilike.%${term}%,color.ilike.%${term}%,size.ilike.%${term}%`);
		if (ilikeProducts) ilikeProducts.forEach((p) => matchedIdSet.add(p.id));
		const [typeMatches, catMatches, subMatches, famMatches] = await Promise.all([
			supabase.from("product_types").select("id").ilike("name", `%${term}%`),
			supabase.from("categories").select("id").ilike("name", `%${term}%`),
			supabase.from("subcategories").select("id").ilike("name", `%${term}%`),
			supabase.from("family_groups").select("id").ilike("name", `%${term}%`)
		]);
		const typeIds = (typeMatches.data || []).map((t) => t.id);
		const catIds = (catMatches.data || []).map((c) => c.id);
		const subIds = (subMatches.data || []).map((s) => s.id);
		const famIds = (famMatches.data || []).map((f) => f.id);
		const hierOrConditions = [];
		if (typeIds.length) hierOrConditions.push(`type_id.in.(${typeIds.join(",")})`);
		if (catIds.length) hierOrConditions.push(`category_id.in.(${catIds.join(",")})`);
		if (subIds.length) hierOrConditions.push(`subcategory_id.in.(${subIds.join(",")})`);
		if (famIds.length) hierOrConditions.push(`family_id.in.(${famIds.join(",")})`);
		if (hierOrConditions.length > 0) {
			const { data: hierProducts } = await applyPublicFilters(supabase.from("products").select("id")).or(hierOrConditions.join(","));
			if (hierProducts) hierProducts.forEach((p) => matchedIdSet.add(p.id));
		}
		const finalIds = Array.from(matchedIdSet);
		if (finalIds.length === 0) return {
			items: [],
			nextCursor: null,
			hasMore: false,
			totalCount: 0
		};
		let byIdQuery = applyPublicFilters(supabase.from("products").select(PRODUCT_FIELDS)).in("id", finalIds);
		if (filters.type) {
			const { data } = await supabase.from("product_types").select("id").eq("slug", filters.type).maybeSingle();
			if (data?.id) byIdQuery = byIdQuery.eq("type_id", data.id);
		}
		if (filters.category) {
			const targetCat = normalizeCategorySlug(filters.category);
			const { data: allCats } = await supabase.from("categories").select("id,slug,name");
			const matchedCat = (allCats ?? []).find((c) => normalizeCategorySlug(c.slug) === targetCat || normalizeCategorySlug(c.name) === targetCat);
			if (matchedCat?.id) byIdQuery = byIdQuery.eq("category_id", matchedCat.id);
		}
		if (filters.subcategory) {
			const { data } = await supabase.from("subcategories").select("id").eq("slug", filters.subcategory).maybeSingle();
			if (data?.id) byIdQuery = byIdQuery.eq("subcategory_id", data.id);
		}
		const { data, error } = await byIdQuery;
		if (error) throw error;
		const rankOrder = new Map(finalIds.map((id, i) => [id, i]));
		const sorted = (data ?? []).sort((a, b) => (rankOrder.get(a.id) ?? 0) - (rankOrder.get(b.id) ?? 0));
		const startIndex = cursor?.rank ?? 0;
		const items = sorted.slice(startIndex, startIndex + limit);
		const hasMore = sorted.length > startIndex + limit;
		return {
			items,
			nextCursor: hasMore ? { rank: startIndex + limit } : null,
			hasMore,
			totalCount: sorted.length
		};
	}
	let query = applyPublicFilters(supabase.from("products").select(PRODUCT_FIELDS)).order("created_at", { ascending: false });
	if (filters.type) {
		const { data } = await supabase.from("product_types").select("id").eq("slug", filters.type).maybeSingle();
		if (data?.id) query = query.eq("type_id", data.id);
	}
	if (filters.category) {
		const targetCat = normalizeCategorySlug(filters.category);
		const { data: allCats } = await supabase.from("categories").select("id,slug,name");
		const matchedCat = (allCats ?? []).find((c) => normalizeCategorySlug(c.slug) === targetCat || normalizeCategorySlug(c.name) === targetCat);
		if (matchedCat?.id) query = query.eq("category_id", matchedCat.id);
	}
	if (filters.subcategory) {
		const { data } = await supabase.from("subcategories").select("id").eq("slug", filters.subcategory).maybeSingle();
		if (data?.id) query = query.eq("subcategory_id", data.id);
	}
	const { data: rawProducts, error } = await query;
	if (error) throw error;
	if (!rawProducts || rawProducts.length === 0) return {
		items: [],
		nextCursor: null,
		hasMore: false,
		totalCount: 0
	};
	const partitionCounts = /* @__PURE__ */ new Map();
	const ranked = rawProducts.map((p) => {
		const partitionKey = filters.category ? p.subcategory_id || p.category_id || "default" : p.category_id || p.type_id || "default";
		const currentRank = (partitionCounts.get(partitionKey) || 0) + 1;
		partitionCounts.set(partitionKey, currentRank);
		return {
			...p,
			distribution_rank: currentRank
		};
	});
	ranked.sort((a, b) => {
		const rA = a.distribution_rank ?? 0;
		const rB = b.distribution_rank ?? 0;
		if (rA !== rB) return rA - rB;
		if (a.featured_feed !== b.featured_feed) return a.featured_feed ? -1 : 1;
		const cA = a.created_at || "";
		const cB = b.created_at || "";
		if (cA !== cB) return cB > cA ? 1 : -1;
		return a.id.localeCompare(b.id);
	});
	let cursorFiltered = ranked;
	if (cursor?.rank) {
		const targetRank = cursor.rank;
		const targetId = cursor.id;
		cursorFiltered = ranked.filter((item) => {
			const itemRank = item.distribution_rank ?? 0;
			if (itemRank > targetRank) return true;
			if (itemRank === targetRank && targetId && item.id > targetId) return true;
			return false;
		});
	}
	const items = cursorFiltered.slice(0, limit);
	const hasMore = cursorFiltered.length > limit;
	const lastItem = items[items.length - 1];
	return {
		items,
		nextCursor: hasMore && lastItem ? {
			rank: lastItem.distribution_rank,
			id: lastItem.id,
			created_at: lastItem.created_at || void 0
		} : null,
		hasMore,
		totalCount: ranked.length
	};
}
async function fetchFeedProducts(filters) {
	return (await fetchFeedProductsPaginated(filters, null, 1e3)).items;
}
async function fetchProductBySlug(slug) {
	const normalized = slugify(slug);
	const clean = normalized.replace(/^draft-(?:img-)?/i, "");
	const candidates = Array.from(new Set([
		slug,
		normalized,
		clean,
		`draft-${clean}`,
		`draft-img-${clean}`
	].filter(Boolean)));
	const { data, error } = await applyPublicFilters(supabase.from("products").select("*")).in("slug", candidates).limit(1).maybeSingle();
	if (error) throw error;
	return data;
}
async function fetchRelatedProducts(familyId, excludeId, similarIds, categoryId) {
	if (similarIds && similarIds.length) {
		const { data, error } = await applyPublicFilters(supabase.from("products").select(PRODUCT_FIELDS)).in("id", similarIds).neq("id", excludeId).limit(8);
		if (error) throw error;
		if ((data ?? []).length) return data;
	}
	if (familyId) {
		const { data, error } = await applyPublicFilters(supabase.from("products").select(PRODUCT_FIELDS)).eq("family_id", familyId).neq("id", excludeId).limit(8);
		if (error) throw error;
		if ((data ?? []).length) return data;
	}
	if (categoryId) {
		const { data, error } = await applyPublicFilters(supabase.from("products").select(PRODUCT_FIELDS)).eq("category_id", categoryId).neq("id", excludeId).order("created_at", { ascending: false }).limit(4);
		if (error) throw error;
		return data ?? [];
	}
	return [];
}
// node_modules/.nitro/vite/services/ssr/assets/ImageUploader-VoYbz6Ry.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatCloudinaryUrl(url) {
	if (!url || typeof url !== "string") return url;
	if (url.includes("res.cloudinary.com") && url.includes("/image/upload/") && !url.includes("/f_auto")) return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
	return url;
}
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("fbfff271fcd17db305f3c28d4d1deba0a94d6381dce6e3ca1be3470745c99f20"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("ac53eb6f8605ea9b134753379f7ee5ba69d700199f336962711581bad9eee2f7"));
var getCloudinarySignatureServer = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("f96f798d744f7b89e9cf14feb6bc74cda25fafaa994f1dbda9a700c2781e0913"));
async function uploadLargeMediaFileClient({ file, folder = "hero-videos", resourceType = "auto", getSignatureFn, onProgress }) {
	try {
		const sig = await getSignatureFn({ data: { folder } });
		if (sig.cloudName && sig.apiKey && sig.signature) {
			const fd = new FormData();
			fd.append("file", file);
			fd.append("api_key", sig.apiKey);
			fd.append("timestamp", sig.timestamp);
			fd.append("folder", sig.folder);
			fd.append("signature", sig.signature);
			const typePath = resourceType === "video" || file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name) ? "video" : "image";
			const targetUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${typePath}/upload`;
			const xhr = new XMLHttpRequest();
			return await new Promise((resolve, reject) => {
				xhr.open("POST", targetUrl);
				if (xhr.upload && onProgress) xhr.upload.onprogress = (e) => {
					if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
				};
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) try {
						const res = JSON.parse(xhr.responseText);
						if (res.secure_url) {
							resolve(formatCloudinaryUrl(res.secure_url));
							return;
						}
					} catch (e) {}
					reject(new Error(xhr.responseText || `Cloudinary HTTP ${xhr.status}`));
				};
				xhr.onerror = () => reject(/* @__PURE__ */ new Error("Network error during direct Cloudinary upload"));
				xhr.send(fd);
			});
		}
	} catch (err) {
		console.warn("Direct Cloudinary upload failed, falling back to direct Supabase Storage...", err);
	}
	const ext = (file.name.split(".").pop() || "bin").toLowerCase();
	const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
	const { error: upErr } = await supabase.storage.from("product-images").upload(filename, file, {
		contentType: file.type || "application/octet-stream",
		upsert: true
	});
	if (upErr) throw new Error(`Direct storage upload failed: ${upErr.message}`);
	const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename);
	return urlData.publicUrl;
}
function publicImageUrl(path) {
	if (!path) return null;
	if (path.startsWith("http://") || path.startsWith("https://")) return formatCloudinaryUrl(path);
	const { data } = supabase.storage.from("product-images").getPublicUrl(path);
	return data.publicUrl;
}
/**
* Normalizes device photos (e.g. Samsung HEIC / high resolution camera photos)
* into standard JPEG blobs prior to upload.
*/
async function normalizeFileForUpload(file) {
	if (!(/heic|heif/i.test(file.name) || /heic|heif/i.test(file.type)) && file.type.startsWith("image/") && file.size < 6291456) return file;
	try {
		if (typeof window !== "undefined" && "createImageBitmap" in window) {
			const bitmap = await createImageBitmap(file);
			const canvas = document.createElement("canvas");
			let width = bitmap.width;
			let height = bitmap.height;
			const maxDim = 2560;
			if (width > maxDim || height > maxDim) {
				if (width > height) {
					height = Math.round(height * maxDim / width);
					width = maxDim;
				} else {
					width = Math.round(width * maxDim / height);
					height = maxDim;
				}
			}
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(bitmap, 0, 0, width, height);
				const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", .92));
				if (blob) {
					const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
					return new File([blob], cleanName, { type: "image/jpeg" });
				}
			}
		}
	} catch (e) {
		console.warn("Client-side image normalization notice:", e);
	}
	return file;
}
/**
* Reusable uploader — supports drag/drop, click, multi-file, and mobile
* camera/gallery. Calls onUploaded(paths[]) after successful upload.
*/
function ImageUploader({ productId, multiple = true, onUploaded, label = "Upload images", compact = false }) {
	const inputRef = (0, import_react.useRef)(null);
	const cameraRef = (0, import_react.useRef)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [statusText, setStatusText] = (0, import_react.useState)("");
	const getSignatureFn = useServerFn(getCloudinarySignatureServer);
	const handleFiles = (0, import_react.useCallback)(async (files) => {
		const list = Array.from(files).filter((f) => !f.type || f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(f.name));
		if (list.length === 0) return;
		setBusy(true);
		const uploaded = [];
		for (let i = 0; i < list.length; i++) {
			const rawFile = list[i];
			try {
				setStatusText(`Normalizing image format (${i + 1}/${list.length})…`);
				const fileToUpload = await normalizeFileForUpload(rawFile);
				setStatusText(`Uploading image (${i + 1}/${list.length})…`);
				const url = await uploadLargeMediaFileClient({
					file: fileToUpload,
					folder: productId ? `products/${productId}` : "products",
					resourceType: "image",
					getSignatureFn,
					onProgress: (pct) => {
						setStatusText(`Uploading image (${i + 1}/${list.length}) ${pct}%…`);
					}
				});
				if (url) uploaded.push(formatCloudinaryUrl(url));
			} catch (e) {
				toast.error(`Upload failed: ${e.message || e}`);
			}
		}
		setBusy(false);
		setStatusText("");
		if (uploaded.length) {
			await onUploaded(uploaded);
			toast.success(`Uploaded ${uploaded.length} image${uploaded.length > 1 ? "s" : ""}`);
		}
	}, [
		productId,
		onUploaded,
		getSignatureFn
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		onDragOver: (e) => {
			e.preventDefault();
			setDragging(true);
		},
		onDragLeave: () => setDragging(false),
		onDrop: (e) => {
			e.preventDefault();
			setDragging(false);
			if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
		},
		className: `rounded-lg border-2 border-dashed transition ${dragging ? "border-primary bg-primary/5" : "border-border bg-background"} ${compact ? "p-3" : "p-5"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center gap-2 text-center",
			children: [
				busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-6 w-6 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium",
					children: busy ? statusText || "Uploading…" : label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: "Drag & drop, or use the buttons below"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => inputRef.current?.click(),
						disabled: busy,
						className: "rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary disabled:opacity-50",
						children: "Choose files"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => cameraRef.current?.click(),
						disabled: busy,
						className: "rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary disabled:opacity-50 md:hidden",
						children: "Take photo"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					accept: "image/*,.heic,.heif",
					multiple,
					className: "hidden",
					onChange: (e) => e.target.files && handleFiles(e.target.files)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: cameraRef,
					type: "file",
					accept: "image/*,.heic,.heif",
					capture: "environment",
					className: "hidden",
					onChange: (e) => e.target.files && handleFiles(e.target.files)
				})
			]
		})
	});
}
/** Small badge/actions bar for an image tile with load error handling. */
function ImageTile({ url, onDelete, onEdit, onSetPrimary, onReplace, onRegenerate, isPrimary, badge }) {
	const [loadFailed, setLoadFailed] = (0, import_react.useState)(false);
	const formattedUrl = formatCloudinaryUrl(url);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-lg border border-border bg-card shadow-xs group",
		children: [
			loadFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "aspect-square w-full flex flex-col items-center justify-center p-4 bg-muted/30 text-center space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-6 w-6 text-amber-500" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-foreground",
						children: "Image Decode Failure"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "The image format or network request was interrupted."
					}),
					onReplace && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onReplace,
						className: "mt-1 rounded bg-primary px-2.5 py-1 text-[10px] font-bold text-white hover:bg-primary/90",
						children: "Re-select Image"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: formattedUrl,
				alt: "",
				onError: () => setLoadFailed(true),
				className: "aspect-square w-full object-cover"
			}),
			badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white backdrop-blur",
				children: badge
			}),
			isPrimary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3" }), " Primary"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1 border-t border-border bg-card/90 p-1.5 backdrop-blur",
				children: [
					onEdit && !loadFailed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onEdit,
						className: "inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition",
						title: "Crop & Rotate Photo",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crop, { className: "h-3 w-3" }), " Edit Photo"]
					}),
					onSetPrimary && !isPrimary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onSetPrimary,
						className: "rounded border border-border px-1.5 py-1 text-[10px] hover:border-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3" })
					}),
					onReplace && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onReplace,
						className: "rounded border border-border px-1.5 py-1 text-[10px] hover:border-primary",
						title: "Replace",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: formattedUrl,
						download: true,
						target: "_blank",
						rel: "noreferrer",
						className: "rounded border border-border px-1.5 py-1 text-[10px] hover:border-primary",
						title: "Download",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" })
					}),
					onRegenerate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onRegenerate,
						className: "rounded border border-primary/40 px-1.5 py-1 text-[10px] text-primary hover:bg-primary/10",
						title: "Regenerate",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3" })
					}),
					onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onDelete,
						className: "ml-auto rounded border border-destructive/40 px-1.5 py-1 text-[10px] text-destructive hover:bg-destructive/10",
						title: "Delete",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
					})
				]
			})
		]
	});
}
// node_modules/.nitro/vite/services/ssr/assets/router-DWif86SF.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-D5MWrJ_W.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-extrabold text-[#1E82A6] font-display",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-bold text-foreground",
					children: "Material Page Not Found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "The building material, collection, or catalog view you requested is unavailable or has been relocated."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex items-center justify-center rounded-md bg-[#1E82A6] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#166481]",
					children: "Return to SOLIDAS Showroom"
				}) })
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold tracking-tight text-foreground",
					children: "Showroom Connection Error"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "We encountered an issue loading this section. Please refresh or return to the main showroom view."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-[#1E82A6] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#166481]",
						children: "Refresh View"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-surface-2",
						children: "Go to Showroom Home"
					})]
				})
			]
		})
	});
}
var Route$36 = createRootRouteWithContext()({
	loader: async () => {
		try {
			return { settings: await fetchAppSettings() };
		} catch {
			return { settings: null };
		}
	},
	head: ({ loaderData }) => {
		const settings = loaderData?.settings;
		const googleVerify = settings?.google_site_verification;
		const bingVerify = settings?.bing_site_verification;
		const origin = getProductionOrigin();
		const meta = [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{
				name: "theme-color",
				content: "#1E82A6"
			},
			{ title: "SOLIDAS — Premium Tiles, Marble, Security Doors & Building Materials" },
			{
				name: "description",
				content: "SOLIDAS TILES AND MARBLE NIG. LIMITED: Premium tiles, marble, granite, foreign security doors, wooden doors, PVC ceiling, & general building materials in Abuja."
			},
			{
				property: "og:title",
				content: "SOLIDAS TILES AND MARBLE NIG. LIMITED — Architectural Digital Showroom"
			},
			{
				property: "og:description",
				content: "Explore premium tiles, luxury marble, security doors and architectural finishes curated by SOLIDAS TILES AND MARBLE NIG. LIMITED."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:url",
				content: origin
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "SOLIDAS TILES AND MARBLE NIG. LIMITED"
			},
			{
				name: "twitter:description",
				content: "Dealers & Suppliers of General Building Materials: Tiles, Marble, Granite, Security Doors & Finishes."
			},
			{
				property: "og:image",
				content: `${origin}/logo.png`
			},
			{
				name: "twitter:image",
				content: `${origin}/logo.png`
			}
		];
		if (googleVerify) meta.push({
			name: "google-site-verification",
			content: googleVerify
		});
		if (bingVerify) meta.push({
			name: "msvalidate.01",
			content: bingVerify
		});
		return {
			meta,
			links: [
				{
					rel: "stylesheet",
					href: styles_default
				},
				{
					rel: "manifest",
					href: "/manifest.webmanifest?v=3"
				},
				{
					rel: "apple-touch-icon",
					href: "/apple-touch-icon.png?v=3"
				},
				{
					rel: "icon",
					href: "/favicon.ico?v=3",
					sizes: "any"
				},
				{
					rel: "icon",
					href: "/favicon.png?v=3",
					type: "image/png"
				}
			]
		};
	},
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	const origin = getProductionOrigin();
	const settings = Route$36.useLoaderData()?.settings;
	const sameAsLinks = [
		settings?.facebook_url,
		settings?.instagram_url,
		settings?.tiktok_url,
		settings?.youtube_url
	].filter(Boolean);
	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": "SOLIDAS TILES AND MARBLE NIG. LIMITED",
		"alternateName": "SOLIDAS",
		"url": origin,
		"logo": `${origin}/logo.png`,
		"description": "Dealers & Suppliers of General Building Materials Such As Tiles & Marble, Granite, Crack Tiles, Foreign Security Doors, Wooden Doors, PVC Ceiling & General Contracts.",
		"telephone": "+2348035186355",
		"email": settings?.company_email || "solidastilesnmarble@gmail.com",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt",
			"addressLocality": "Abuja",
			"addressRegion": "FCT",
			"addressCountry": "NG"
		}
	};
	if (sameAsLinks.length > 0) organizationSchema["sameAs"] = sameAsLinks;
	const localBusinessSchema = {
		"@context": "https://schema.org",
		"@type": "HomeGoodsStore",
		"name": "SOLIDAS TILES AND MARBLE NIG. LIMITED",
		"image": `${origin}/logo.png`,
		"url": origin,
		"telephone": "+2348035186355",
		"priceRange": "$$",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt",
			"addressLocality": "Abuja",
			"addressRegion": "FCT",
			"addressCountry": "NG"
		},
		"hasMap": settings?.map_url || "https://maps.app.goo.gl/noM38nVdN74A2Gpt8?g_st=ac"
	};
	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": "SOLIDAS Digital Showroom",
		"url": origin,
		"potentialAction": {
			"@type": "SearchAction",
			"target": `${origin}/search?q={search_term_string}`,
			"query-input": "required name=search_term_string"
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify(organizationSchema) }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify(localBusinessSchema) }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify(websiteSchema) }
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$36.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootAppWrapper, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			richColors: true,
			position: "top-center"
		})] })
	});
}
function RootAppWrapper() {
	const { user } = useAuth();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isPending = useRouterState({ select: (s) => s.status === "pending" });
	const [showLoader, setShowLoader] = (0, import_react.useState)(false);
	const [initialLoading, setInitialLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		setInitialLoading(false);
	}, []);
	(0, import_react.useEffect)(() => {
		let timer;
		if (isPending) timer = setTimeout(() => setShowLoader(true), 150);
		else setShowLoader(false);
		return () => clearTimeout(timer);
	}, [isPending]);
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		const trackView = async () => {
			const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).maybeSingle();
			if (!profile?.id) return;
			await supabase.from("customer_activity").insert({
				user_id: profile.id,
				activity_type: pathname === "/" ? "homepage_viewed" : "page_viewed",
				metadata: {
					path: pathname,
					timestamp: (/* @__PURE__ */ new Date()).toISOString()
				}
			});
		};
		trackView();
		const registerDevice = async () => {
			const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).maybeSingle();
			if (!profile?.id) return;
			const mockToken = `web_pwa_token_${user.id.substring(0, 8)}_${navigator.userAgent.replace(/[^a-zA-Z0-9]/g, "").substring(0, 16)}`;
			await supabase.from("communication_devices").upsert({
				user_id: profile.id,
				token: mockToken,
				device_type: "web_pwa",
				os_version: navigator.platform,
				browser: navigator.userAgent.includes("Chrome") ? "Chrome" : "Safari",
				is_active: true,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}, { onConflict: "token" });
		};
		registerDevice();
	}, [user?.id, pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen bg-background",
		children: [(() => {
			const isApiRoute = pathname === "/robots.txt" || pathname === "/sitemap.xml" || pathname.startsWith("/api/");
			if (!((showLoader || initialLoading) && !isApiRoute)) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/40 backdrop-blur-xs transition-all duration-300 animate-fade-in",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
              @keyframes breathing {
                0%, 100% { transform: scale(0.95); opacity: 0.4; }
                50% { transform: scale(1.05); opacity: 0.85; }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-breathing {
                animation: breathing 2s ease-in-out infinite;
              }
              .animate-fade-in {
                animation: fadeIn 0.2s ease-out forwards;
              }
            ` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 animate-breathing",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.png",
						alt: "SOLIDAS Logo",
						className: "h-16 w-auto object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[10px] font-bold tracking-widest text-[#1E82A6] uppercase",
						children: "SOLIDAS SHOWROOM"
					})]
				})]
			});
		})(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
	});
}
var taxonomyQuery = queryOptions({
	queryKey: ["taxonomy"],
	queryFn: fetchTaxonomy,
	staleTime: 3e5
});
var feedInfiniteQuery = (f) => infiniteQueryOptions({
	queryKey: ["feed_infinite", f],
	queryFn: ({ pageParam }) => fetchFeedProductsPaginated(f, pageParam, 24),
	initialPageParam: null,
	getNextPageParam: (lastPage) => lastPage.nextCursor
});
var $$splitErrorComponentImporter$1 = () => import("./routes-CWj9VFSn.mjs");
var $$splitComponentImporter$29 = () => import("./routes-Eo1gtGz3.mjs");
function validateFeedSearch(s) {
	const pick = (k) => {
		const v = s[k];
		return typeof v === "string" && v.length > 0 ? v : void 0;
	};
	return {
		type: pick("type"),
		category: pick("category"),
		subcategory: pick("subcategory")
	};
}
var Route$35 = createFileRoute("/")({
	validateSearch: validateFeedSearch,
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps }) => {
		context.queryClient.ensureQueryData(taxonomyQuery);
		context.queryClient.ensureInfiniteQueryData(feedInfiniteQuery(deps));
	},
	head: () => {
		const origin = getProductionOrigin();
		return {
			meta: [
				{ title: "SOLIDAS Tiles & Marble Nigeria Ltd | Luxury Tiles, Marble, Granite & Security Doors in Abuja" },
				{
					name: "description",
					content: "Official digital showroom of SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei-Dei, Abuja. Browse luxury ceramic & porcelain tiles, granite, marble, and foreign security doors with instant WhatsApp quotes."
				},
				{
					property: "og:title",
					content: "SOLIDAS Tiles & Marble Nigeria Ltd | Luxury Tiles, Marble, Granite & Security Doors in Abuja"
				},
				{
					property: "og:description",
					content: "Official digital showroom of SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei-Dei, Abuja. Browse luxury ceramic & porcelain tiles, granite, marble, and foreign security doors with instant WhatsApp quotes."
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:url",
					content: `${origin}/`
				},
				{
					name: "twitter:card",
					content: "summary_large_image"
				},
				{
					name: "twitter:title",
					content: "SOLIDAS Tiles & Marble Nigeria Ltd | Luxury Tiles, Marble, Granite & Security Doors in Abuja"
				},
				{
					name: "twitter:description",
					content: "Dealers & Suppliers of General Building Materials: Tiles, Marble, Granite, Security Doors & Finishes in Abuja."
				}
			],
			links: [{
				rel: "canonical",
				href: `${origin}/`
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$29, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent")
});
var hierarchyQuery = (splat, origin) => queryOptions({
	queryKey: ["hierarchy", splat],
	queryFn: async () => {
		const rawParts = splat.split("/").filter(Boolean);
		const parts = rawParts.map((p) => {
			try {
				return decodeURIComponent(p);
			} catch {
				return p;
			}
		});
		if (parts.length === 0 || parts.length > 5) throw notFound();
		if (parts.length >= 3) {
			const lastPartSlug = slugify(parts[parts.length - 1]);
			if (lastPartSlug) {
				const { data: matchedProduct } = await supabase.from("products").select("id, slug, name").or(`slug.eq.${lastPartSlug},slug.eq.${parts[parts.length - 1]}`).eq("status", "published").eq("hidden", false).is("deleted_at", null).maybeSingle();
				if (matchedProduct) throw redirect({
					href: getCanonicalProductUrl(matchedProduct, origin),
					statusCode: 301
				});
			}
		}
		const typeSlug = slugify(parts[0]);
		const categorySlug = parts[1] ? normalizeCategorySlug(parts[1]) : null;
		const slug3 = parts[2] ? slugify(parts[2]) : null;
		const slug4 = parts[3] ? slugify(parts[3]) : null;
		const { data: allTypes } = await supabase.from("product_types").select("id, name, slug, code_prefix");
		const rawType = (allTypes ?? []).find((t) => slugify(t.slug) === typeSlug || slugify(t.name) === typeSlug);
		if (!rawType) throw notFound();
		const type = {
			...rawType,
			name: rawType.name.trim(),
			slug: slugify(rawType.slug || rawType.name)
		};
		let category = null;
		if (categorySlug) {
			const { data: catsForType } = await supabase.from("categories").select("id, name, slug, type_id").eq("type_id", type.id);
			const rawCat = (catsForType ?? []).find((c) => normalizeCategorySlug(c.slug) === categorySlug || normalizeCategorySlug(c.name) === categorySlug || slugify(c.slug) === slugify(parts[1]) || slugify(c.name) === slugify(parts[1]));
			if (!rawCat) throw notFound();
			category = {
				...rawCat,
				name: rawCat.name.trim(),
				slug: normalizeCategorySlug(rawCat.slug || rawCat.name)
			};
		}
		let subcategory = null;
		let family = null;
		if (category && parts.length === 3 && slug3) {
			const { data: subsForCatAll } = await supabase.from("subcategories").select("id, name, slug, category_id").eq("category_id", category.id);
			const rawSub = (subsForCatAll ?? []).find((s) => slugify(s.slug) === slug3 || slugify(s.name) === slug3);
			if (rawSub) subcategory = {
				...rawSub,
				name: rawSub.name.trim(),
				slug: slugify(rawSub.slug || rawSub.name)
			};
			else {
				const subIds = (subsForCatAll || []).map((s) => s.id);
				if (subIds.length === 0) throw notFound();
				const { data: famsForCat } = await supabase.from("family_groups").select("id, name, slug, subcategory_id, custom_ai_prompt_override").in("subcategory_id", subIds);
				const rawFam = (famsForCat ?? []).find((f) => slugify(f.slug) === slug3 || slugify(f.name) === slug3);
				if (!rawFam) throw notFound();
				family = {
					...rawFam,
					name: rawFam.name.trim(),
					slug: slugify(rawFam.slug || rawFam.name)
				};
				if (rawFam.subcategory_id) {
					const parentSub = (subsForCatAll ?? []).find((s) => s.id === rawFam.subcategory_id);
					if (parentSub) subcategory = {
						...parentSub,
						name: parentSub.name.trim(),
						slug: slugify(parentSub.slug || parentSub.name)
					};
				}
			}
		} else if (category && parts.length === 4 && slug3 && slug4) {
			const { data: subsForCatAll } = await supabase.from("subcategories").select("id, name, slug, category_id").eq("category_id", category.id);
			const rawSub = (subsForCatAll ?? []).find((s) => slugify(s.slug) === slug3 || slugify(s.name) === slug3);
			if (!rawSub) throw notFound();
			subcategory = {
				...rawSub,
				name: rawSub.name.trim(),
				slug: slugify(rawSub.slug || rawSub.name)
			};
			const { data: famsForSub } = await supabase.from("family_groups").select("id, name, slug, subcategory_id, custom_ai_prompt_override").eq("subcategory_id", subcategory.id);
			const rawFam = (famsForSub ?? []).find((f) => slugify(f.slug) === slug4 || slugify(f.name) === slug4);
			if (!rawFam) throw notFound();
			family = {
				...rawFam,
				name: rawFam.name.trim(),
				slug: slugify(rawFam.slug || rawFam.name)
			};
		}
		const canonicalSegments = [type.slug];
		if (category) canonicalSegments.push(category.slug);
		if (subcategory) canonicalSegments.push(subcategory.slug);
		if (family) canonicalSegments.push(family.slug);
		const canonicalSplat = canonicalSegments.join("/");
		if (rawParts.join("/") !== canonicalSplat) {
			const base = (origin || getProductionOrigin()).replace(/\/+$/, "");
			throw redirect({
				href: `${base}/${canonicalSplat}`,
				statusCode: 301
			});
		}
		let productsQuery = supabase.from("products").select("id, slug, name, code, price, brand, image_url, generated_studio_image, generated_installed_image, short_description, color, material, finish, alt_text, type_id, category_id, subcategory_id, family_id").eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null);
		if (family) productsQuery = productsQuery.eq("family_id", family.id);
		else if (subcategory) productsQuery = productsQuery.eq("subcategory_id", subcategory.id);
		else if (category) productsQuery = productsQuery.eq("category_id", category.id);
		else productsQuery = productsQuery.eq("type_id", type.id);
		const { data: products } = await productsQuery.order("created_at", { ascending: false });
		const activeProducts = products ?? [];
		const activeCatIds = new Set(activeProducts.map((p) => p.category_id).filter(Boolean));
		const activeSubIds = new Set(activeProducts.map((p) => p.subcategory_id).filter(Boolean));
		const activeFamIds = new Set(activeProducts.map((p) => p.family_id).filter(Boolean));
		let childCategories = [];
		let childSubcategories = [];
		let childFamilies = [];
		if (!category) {
			const { data } = await supabase.from("categories").select("id, name, slug").eq("type_id", type.id).order("name");
			childCategories = (data ?? []).filter((c) => activeCatIds.has(c.id)).map((c) => ({
				...c,
				name: c.name.trim(),
				slug: normalizeCategorySlug(c.slug || c.name)
			}));
		} else if (!subcategory) {
			const { data: subs } = await supabase.from("subcategories").select("id, name, slug").eq("category_id", category.id).order("name");
			const allMappedSubs = (subs ?? []).map((s) => ({
				...s,
				name: s.name.trim(),
				slug: slugify(s.slug || s.name)
			}));
			const subSlugById = new Map(allMappedSubs.map((s) => [s.id, s.slug]));
			childSubcategories = allMappedSubs.filter((s) => activeSubIds.has(s.id));
			const subIds = childSubcategories.map((s) => s.id);
			if (subIds.length > 0) {
				const { data: fams } = await supabase.from("family_groups").select("id, name, slug, subcategory_id").in("subcategory_id", subIds).order("name");
				childFamilies = (fams ?? []).filter((f) => activeFamIds.has(f.id) && subSlugById.has(f.subcategory_id)).map((f) => ({
					...f,
					name: f.name.trim(),
					slug: slugify(f.slug || f.name),
					subcategory_slug: subSlugById.get(f.subcategory_id)
				}));
			}
		} else if (!family) {
			const { data: fams } = await supabase.from("family_groups").select("id, name, slug, subcategory_id").eq("subcategory_id", subcategory.id).order("name");
			childFamilies = (fams ?? []).filter((f) => activeFamIds.has(f.id)).map((f) => ({
				...f,
				name: f.name.trim(),
				slug: slugify(f.slug || f.name),
				subcategory_slug: subcategory.slug
			}));
		}
		return {
			type,
			category,
			subcategory,
			family,
			products: activeProducts,
			childCategories,
			childSubcategories,
			childFamilies,
			origin
		};
	}
});
var $$splitComponentImporter$28 = () => import("../_-DfQDEOkU.mjs");
var Route$34 = createFileRoute("/$")({
	loader: async ({ context, params }) => {
		const origin = typeof window !== "undefined" ? window.location.origin : getProductionOrigin();
		return await context.queryClient.ensureQueryData(hierarchyQuery(params._splat ?? "", origin));
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const { type, category, subcategory, family } = loaderData;
		const origin = loaderData.origin || getProductionOrigin();
		let title = "";
		let description = "";
		if (family) {
			title = `${family.name} Collection — Premium ${category.name} | SOLIDAS`;
			description = `Explore the beautiful ${family.name} collection of premium ${category.name} ${type.name} at Solidas Tiles and Marble. View available colors, finishes, and specs.`;
		} else if (subcategory) {
			title = `Luxury ${subcategory.name} ${category.name} ${type.name} | SOLIDAS`;
			description = `Browse our catalog of premium ${subcategory.name} sized ${category.name} ${type.name} building materials curated by Solidas Tiles and Marble.`;
		} else if (category) {
			title = `Premium ${category.name} ${type.name} | SOLIDAS`;
			description = `Discover high-quality, luxury ${category.name} ${type.name} building products at Solidas Tiles and Marble. Explore our curated collections.`;
		} else {
			title = `${type.name} Catalog | SOLIDAS`;
			description = `Curated luxury ${type.name} collections and building materials. Discover premium tiles, doors, plumbing, and surfaces at Solidas Tiles and Marble.`;
		}
		const firstImage = loaderData.products[0]?.generated_studio_image || loaderData.products[0]?.image_url || "";
		const metaImageUrl = firstImage ? publicImageUrl(firstImage) : "";
		const canonical = `${origin}/${type.slug}` + (category ? `/${category.slug}` : "") + (subcategory ? `/${subcategory.slug}` : "") + (family ? `/${family.slug}` : "");
		const isEmptyTaxonomy = !loaderData.products || loaderData.products.length === 0;
		return {
			meta: [
				{ title },
				{
					name: "description",
					content: description
				},
				...isEmptyTaxonomy ? [{
					name: "robots",
					content: "noindex, follow"
				}] : [],
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:title",
					content: title
				},
				{
					property: "og:description",
					content: description
				},
				{
					property: "og:image",
					content: metaImageUrl
				},
				{
					property: "og:url",
					content: canonical
				},
				{
					name: "twitter:card",
					content: "summary_large_image"
				},
				{
					name: "twitter:title",
					content: title
				},
				{
					name: "twitter:description",
					content: description
				},
				{
					name: "twitter:image",
					content: metaImageUrl
				}
			],
			links: isEmptyTaxonomy ? [] : [{
				rel: "canonical",
				href: canonical
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
var $$splitComponentImporter$27 = () => import("./route-DZf-ZM5Z.mjs");
var Route$33 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async ({ location }) => {
		try {
			const { data, error } = await supabase.auth.getUser();
			if ((error || !data.user) && location.pathname !== "/favorites") throw redirect({ to: "/auth" });
			return { user: data.user || null };
		} catch (err) {
			if (err && typeof err === "object" && "to" in err) throw err;
			if (location.pathname === "/favorites") return { user: null };
			throw redirect({ to: "/auth" });
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./account-BZsmfkCn.mjs");
var Route$32 = createFileRoute("/account")({
	head: () => ({ meta: [{ title: "My Account | SOLIDAS" }, {
		name: "robots",
		content: "noindex, nofollow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./auth-CqYVtf9u.mjs");
var Route$31 = createFileRoute("/auth")({
	validateSearch: (search) => {
		return {
			redirectTo: search.redirectTo ? String(search.redirectTo) : void 0,
			autoPush: search.autoPush === "true" || search.autoPush === true ? true : void 0
		};
	},
	head: () => ({ meta: [{ title: "Sign In / Register | SOLIDAS" }, {
		name: "robots",
		content: "noindex, follow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./collection-BbmID2k-.mjs");
var Route$30 = createFileRoute("/collection")({
	validateSearch: (search) => {
		return { autoPush: search.autoPush === "true" || search.autoPush === true ? true : void 0 };
	},
	head: () => ({ meta: [{ title: "Project Quotation Workspace | SOLIDAS" }, {
		name: "robots",
		content: "noindex, follow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./contact-De_caGDT.mjs");
var Route$29 = createFileRoute("/contact")({
	head: () => {
		const origin = getProductionOrigin();
		return {
			meta: [
				{ title: "Contact Us — SOLIDAS TILES AND MARBLE NIG. LIMITED" },
				{
					name: "description",
					content: "Contact SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei Dei, Abuja. Premium tiles, marble, granite & security doors. Phone: 08035186355, 08151495663, 09040327777."
				},
				{
					property: "og:title",
					content: "Contact Us — SOLIDAS TILES AND MARBLE NIG. LIMITED"
				},
				{
					property: "og:description",
					content: "Visit our Head Office or Branch Office in Dei Dei, Abuja. Suppliers of premium tiles, marble, granite, and security doors."
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:url",
					content: `${origin}/contact`
				}
			],
			links: [{
				rel: "canonical",
				href: `${origin}/contact`
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./debug-env-DK_hehiP.mjs");
var getDatabaseConfig = createServerFn({ method: "GET" }).handler(createSsrRpc("509ed2d44f18935fb75ec709c1d01f15dfda1246f3904615303814ab4f4d48d5"));
var Route$28 = createFileRoute("/debug-env")({
	loader: async () => {
		return await getDatabaseConfig();
	},
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./home-Q-lUysLz.mjs");
var Route$27 = createFileRoute("/home")({
	head: () => {
		const origin = getProductionOrigin();
		return {
			meta: [
				{ title: "Project Video Showcase & Architectural Profile | SOLIDAS Abuja" },
				{
					name: "description",
					content: "Watch real-world installation videos, showroom walkthroughs, and architectural project highlights from SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei-Dei, Abuja."
				},
				{
					property: "og:title",
					content: "Project Video Showcase & Architectural Profile | SOLIDAS Abuja"
				},
				{
					property: "og:description",
					content: "Watch installation videos, showroom walkthroughs, and architectural building material highlights by SOLIDAS in Abuja."
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:url",
					content: `${origin}/home`
				},
				{
					name: "twitter:card",
					content: "summary_large_image"
				},
				{
					name: "twitter:title",
					content: "Project Video Showcase & Architectural Profile | SOLIDAS Abuja"
				},
				{
					name: "twitter:description",
					content: "Watch installation videos, showroom walkthroughs, and architectural building material highlights by SOLIDAS in Abuja."
				}
			],
			links: [{
				rel: "canonical",
				href: `${origin}/home`
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./my-collections-B55lsn4w.mjs");
var Route$26 = createFileRoute("/my-collections")({
	head: () => ({ meta: [{ title: "Collection History — SOLIDAS TILES AND MARBLE NIG. LIMITED" }, {
		name: "robots",
		content: "noindex, follow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var Route$25 = createFileRoute("/robots.txt")({ server: { handlers: { GET: async ({ request }) => {
	const origin = getProductionOrigin(request);
	const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /account
Disallow: /account/*
Disallow: /favorites
Disallow: /favorites/*

Sitemap: ${origin}/sitemap.xml
Host: ${origin}
`;
	return new Response(robotsTxt, { headers: {
		"Content-Type": "text/plain",
		"Cache-Control": "public, max-age=3600, s-maxage=18000"
	} });
} } } });
var $$splitComponentImporter$19 = () => import("./search-C34BlDg4.mjs");
function validateSearch(s) {
	const pick = (k) => {
		const v = s[k];
		return typeof v === "string" && v.length > 0 ? v : void 0;
	};
	return {
		q: typeof s.q === "string" ? s.q : "",
		type: pick("type"),
		category: pick("category"),
		subcategory: pick("subcategory")
	};
}
var Route$24 = createFileRoute("/search")({
	validateSearch,
	head: () => ({ meta: [
		{ title: "Search Materials & Tiles | SOLIDAS" },
		{
			name: "description",
			content: "Search across the Solidas Tiles and Marble catalogue for premium tiles, granite, marble, security doors, and sanitary ware."
		},
		{
			name: "robots",
			content: "noindex, follow"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
function escapeXml$3(unsafe) {
	return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function formatDate$3(dateStr, fallback = "2026-11-05") {
	if (!dateStr) return fallback;
	try {
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) return fallback;
		return d.toISOString().split("T")[0];
	} catch {
		return fallback;
	}
}
var Route$23 = createFileRoute("/sitemap-categories.xml")({ server: { handlers: { GET: async () => {
	const origin = getProductionOrigin();
	const [typesRes, catsRes, subsRes, famsRes, prodsRes] = await Promise.all([
		supabase.from("product_types").select("id, name, slug, created_at, is_archived"),
		supabase.from("categories").select("id, name, slug, type_id, created_at, is_archived"),
		supabase.from("subcategories").select("id, name, slug, category_id, created_at, is_archived"),
		supabase.from("family_groups").select("id, name, slug, subcategory_id, created_at, is_archived"),
		supabase.from("products").select("id, type_id, category_id, subcategory_id, family_id, updated_at, created_at").eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null)
	]);
	if (typesRes.error || catsRes.error || subsRes.error || famsRes.error || prodsRes.error) {
		console.error("[sitemap-categories.xml] Database query failed:", typesRes.error || catsRes.error || subsRes.error || famsRes.error || prodsRes.error);
		return new Response("Error generating category sitemap", { status: 500 });
	}
	const types = (typesRes.data || []).filter((t) => !t.is_archived);
	const categories = (catsRes.data || []).filter((c) => !c.is_archived);
	const subcategories = (subsRes.data || []).filter((s) => !s.is_archived);
	const families = (famsRes.data || []).filter((f) => !f.is_archived);
	const products = prodsRes.data || [];
	const typeStats = /* @__PURE__ */ new Map();
	const catStats = /* @__PURE__ */ new Map();
	const subStats = /* @__PURE__ */ new Map();
	const famStats = /* @__PURE__ */ new Map();
	const recordStat = (map, id, ts) => {
		if (!id) return;
		const prev = map.get(id);
		if (!prev) map.set(id, {
			count: 1,
			lastmod: ts
		});
		else map.set(id, {
			count: prev.count + 1,
			lastmod: ts > prev.lastmod ? ts : prev.lastmod
		});
	};
	for (const p of products) {
		const ts = formatDate$3(p.updated_at || p.created_at);
		recordStat(typeStats, p.type_id, ts);
		recordStat(catStats, p.category_id, ts);
		recordStat(subStats, p.subcategory_id, ts);
		recordStat(famStats, p.family_id, ts);
	}
	const typeMap = new Map(types.map((t) => [t.id, t]));
	const catMap = new Map(categories.map((c) => [c.id, c]));
	const subMap = new Map(subcategories.map((s) => [s.id, s]));
	const seenLocs = /* @__PURE__ */ new Set();
	const urls = [];
	const addUrl = (loc, lastmod, changefreq, priority) => {
		if (!loc || seenLocs.has(loc)) return;
		seenLocs.add(loc);
		urls.push(`  <url>
    <loc>${escapeXml$3(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
	};
	for (const t of types) {
		const stat = typeStats.get(t.id);
		if (!stat || stat.count === 0) continue;
		const tSlug = slugify(t.slug || t.name);
		if (!tSlug) continue;
		addUrl(`${origin}/${tSlug}`, stat.lastmod || formatDate$3(t.created_at), "weekly", "0.9");
	}
	for (const c of categories) {
		const stat = catStats.get(c.id);
		if (!stat || stat.count === 0) continue;
		const parentType = typeMap.get(c.type_id);
		const tSlug = slugify(parentType?.slug || parentType?.name);
		const cSlug = normalizeCategorySlug(c.slug || c.name);
		if (!tSlug || !cSlug) continue;
		addUrl(`${origin}/${tSlug}/${cSlug}`, stat.lastmod || formatDate$3(c.created_at), "weekly", "0.8");
	}
	for (const s of subcategories) {
		const stat = subStats.get(s.id);
		if (!stat || stat.count === 0) continue;
		const parentCat = catMap.get(s.category_id);
		const parentType = parentCat ? typeMap.get(parentCat.type_id) : null;
		const tSlug = slugify(parentType?.slug || parentType?.name);
		const cSlug = normalizeCategorySlug(parentCat?.slug || parentCat?.name);
		const sSlug = slugify(s.slug || s.name);
		if (!tSlug || !cSlug || !sSlug) continue;
		addUrl(`${origin}/${tSlug}/${cSlug}/${sSlug}`, stat.lastmod || formatDate$3(s.created_at), "weekly", "0.8");
	}
	for (const f of families) {
		const stat = famStats.get(f.id);
		if (!stat || stat.count === 0) continue;
		const fSlug = slugify(f.slug || f.name);
		if (!fSlug || !f.subcategory_id) continue;
		const parentSub = subMap.get(f.subcategory_id);
		const parentCat = parentSub ? catMap.get(parentSub.category_id) : null;
		const parentType = parentCat ? typeMap.get(parentCat.type_id) : null;
		const tSlug = slugify(parentType?.slug || parentType?.name);
		const cSlug = normalizeCategorySlug(parentCat?.slug || parentCat?.name);
		const sSlug = slugify(parentSub?.slug || parentSub?.name);
		if (tSlug && cSlug && sSlug) addUrl(`${origin}/${tSlug}/${cSlug}/${sSlug}/${fSlug}`, stat.lastmod || formatDate$3(f.created_at), "weekly", "0.7");
	}
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600"
		}
	});
} } } });
function escapeXml$2(unsafe) {
	return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function isValidProductionImageUrl(url) {
	if (!url || typeof url !== "string") return false;
	const trimmed = url.trim();
	if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
	if (trimmed.includes("parverhzjdhrzdcqajyw.supabase.co")) return false;
	return true;
}
var Route$22 = createFileRoute("/sitemap-images.xml")({ server: { handlers: { GET: async () => {
	const origin = getProductionOrigin();
	const [productsRes, assetsRes] = await Promise.all([supabase.from("products").select("id, slug, name, code, short_description, image_url, generated_studio_image, generated_installed_image, image_title, image_caption, alt_text").eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null).order("updated_at", { ascending: false }), supabase.from("product_assets").select("product_id, asset_url")]);
	if (productsRes.error) {
		console.error("[sitemap-images.xml] Database query failed:", productsRes.error);
		return new Response("Error generating image sitemap", { status: 500 });
	}
	const assetsByProduct = /* @__PURE__ */ new Map();
	for (const a of assetsRes.data || []) if (a.product_id && isValidProductionImageUrl(a.asset_url)) {
		const list = assetsByProduct.get(a.product_id) || [];
		list.push(a.asset_url.trim());
		assetsByProduct.set(a.product_id, list);
	}
	const seenLocs = /* @__PURE__ */ new Set();
	const urls = [];
	for (const p of productsRes.data || []) {
		const slug = getCanonicalProductSlug(p);
		if (!slug || slug.startsWith("draft-")) continue;
		const loc = getCanonicalProductUrl(p, origin);
		if (seenLocs.has(loc)) continue;
		const imgSet = /* @__PURE__ */ new Set();
		if (isValidProductionImageUrl(p.generated_studio_image)) imgSet.add(p.generated_studio_image.trim());
		if (isValidProductionImageUrl(p.image_url)) imgSet.add(p.image_url.trim());
		if (isValidProductionImageUrl(p.generated_installed_image)) imgSet.add(p.generated_installed_image.trim());
		for (const extraUrl of assetsByProduct.get(p.id) || []) imgSet.add(extraUrl);
		if (imgSet.size === 0) continue;
		seenLocs.add(loc);
		const rawTitle = (p.image_title || p.name || "").trim();
		const rawCaption = (p.image_caption || p.alt_text || p.short_description || "").trim();
		const imageNodes = Array.from(imgSet).map((imgUrl) => {
			const metaLines = [`      <image:loc>${escapeXml$2(imgUrl)}</image:loc>`];
			if (rawTitle) metaLines.push(`      <image:title>${escapeXml$2(rawTitle)}</image:title>`);
			if (rawCaption) metaLines.push(`      <image:caption>${escapeXml$2(rawCaption)}</image:caption>`);
			return `    <image:image>\n${metaLines.join("\n")}\n    </image:image>`;
		}).join("\n");
		urls.push(`  <url>
    <loc>${escapeXml$2(loc)}</loc>
${imageNodes}
  </url>`);
	}
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`;
	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600"
		}
	});
} } } });
function escapeXml$1(unsafe) {
	return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function formatDate$2(dateStr, fallback = "2026-11-05") {
	if (!dateStr) return fallback;
	try {
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) return fallback;
		return d.toISOString().split("T")[0];
	} catch {
		return fallback;
	}
}
var Route$21 = createFileRoute("/sitemap-pages.xml")({ server: { handlers: { GET: async () => {
	const origin = getProductionOrigin();
	const latestProdRes = await supabase.from("products").select("updated_at, created_at").eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null).order("updated_at", { ascending: false }).limit(1).maybeSingle();
	const catalogLastmod = formatDate$2(latestProdRes.data?.updated_at || latestProdRes.data?.created_at, "2026-11-05");
	const staticReleaseDate = "2026-11-05";
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
		{
			path: "/",
			lastmod: catalogLastmod,
			priority: "1.0",
			changefreq: "daily"
		},
		{
			path: "/home",
			lastmod: staticReleaseDate,
			priority: "0.8",
			changefreq: "weekly"
		},
		{
			path: "/contact",
			lastmod: staticReleaseDate,
			priority: "0.8",
			changefreq: "monthly"
		}
	].map((page) => `  <url>
    <loc>${escapeXml$1(`${origin}${page.path}`)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600"
		}
	});
} } } });
function escapeXml(unsafe) {
	return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function formatDate$1(dateStr, fallback = "2026-11-05") {
	if (!dateStr) return fallback;
	try {
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) return fallback;
		return d.toISOString().split("T")[0];
	} catch {
		return fallback;
	}
}
var Route$20 = createFileRoute("/sitemap-products.xml")({ server: { handlers: { GET: async () => {
	const origin = getProductionOrigin();
	const { data: products, error } = await supabase.from("products").select("id, slug, name, updated_at, created_at").eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null).order("updated_at", { ascending: false });
	if (error) {
		console.error("[sitemap-products.xml] Database query failed:", error);
		return new Response("Error generating product sitemap", { status: 500 });
	}
	const seenLocs = /* @__PURE__ */ new Set();
	const urls = [];
	for (const p of products || []) {
		const slug = getCanonicalProductSlug(p);
		if (!slug || slug.startsWith("draft-")) continue;
		const loc = getCanonicalProductUrl(p, origin);
		if (seenLocs.has(loc)) continue;
		seenLocs.add(loc);
		const lastmod = formatDate$1(p.updated_at || p.created_at);
		urls.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
	}
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600"
		}
	});
} } } });
function formatDate(dateStr, fallback = "2026-11-05") {
	if (!dateStr) return fallback;
	try {
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) return fallback;
		return d.toISOString().split("T")[0];
	} catch {
		return fallback;
	}
}
var Route$19 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async ({ request }) => {
	const origin = getProductionOrigin(request);
	const latestProdRes = await supabase.from("products").select("updated_at, created_at").eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null).order("updated_at", { ascending: false }).limit(1).maybeSingle();
	const latestProductDate = formatDate(latestProdRes.data?.updated_at || latestProdRes.data?.created_at, "2026-11-05");
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${origin}/sitemap-pages.xml</loc>
    <lastmod>${latestProductDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/sitemap-categories.xml</loc>
    <lastmod>${latestProductDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/sitemap-products.xml</loc>
    <lastmod>${latestProductDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/sitemap-images.xml</loc>
    <lastmod>${latestProductDate}</lastmod>
  </sitemap>
</sitemapindex>`;
	return new Response(xml, { headers: {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600, s-maxage=18000"
	} });
} } } });
var $$splitComponentImporter$18 = () => import("./admin-C1Ky4sAv.mjs");
var Route$18 = createFileRoute("/_authenticated/admin")({
	head: () => ({ meta: [{ title: "Admin — Stoneworks" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./favorites-TEy-lSHx.mjs");
var Route$17 = createFileRoute("/_authenticated/favorites")({
	head: () => ({ meta: [{ title: "My Favorites — Enreach Concepts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./settings-EwzhiGfo.mjs");
var Route$16 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [{ title: "Company Settings — SOLIDAS TILES AND MARBLE NIG. LIMITED" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./collection._id-aYxMNl4a.mjs");
var Route$15 = createFileRoute("/collection/$id")({
	loader: async ({ params }) => {
		let imageUrl = "";
		try {
			const { data: items } = await supabase.from("collection_items").select("product_id").eq("collection_id", params.id).limit(1);
			if (items && items.length > 0) {
				const { data: prod } = await supabase.from("products").select("generated_studio_image, image_url").eq("id", items[0].product_id).maybeSingle();
				if (prod) imageUrl = prod.generated_studio_image || prod.image_url || "";
			}
		} catch (e) {}
		return { imageUrl };
	},
	head: ({ loaderData }) => {
		const origin = getProductionOrigin();
		const title = "Shared Project Collection — SOLIDAS TILES AND MARBLE NIG. LIMITED";
		const desc = "Check out this curated building materials project quotation request on SOLIDAS TILES AND MARBLE NIG. LIMITED.";
		const img = loaderData?.imageUrl || `${origin}/logo.png`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: desc
			},
			{
				name: "robots",
				content: "noindex, follow"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: desc
			},
			{
				property: "og:image",
				content: img
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: title
			},
			{
				name: "twitter:description",
				content: desc
			},
			{
				name: "twitter:image",
				content: img
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var relatedQuery = (familyId, excludeId, categoryId) => queryOptions({
	queryKey: [
		"related",
		familyId,
		excludeId,
		categoryId
	],
	queryFn: () => fetchRelatedProducts(familyId, excludeId, null, categoryId),
	enabled: Boolean(familyId || categoryId)
});
function WhatsAppIcon({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className,
		viewBox: "0 0 24 24",
		fill: "currentColor",
		xmlns: "http://www.w3.org/2000/svg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.37 5.378.002 12.038.002c3.223.001 6.253 1.257 8.532 3.538 2.279 2.279 3.532 5.309 3.53 8.533-.004 6.669-5.379 12.037-12.04 12.037-2.006-.001-3.978-.5-5.733-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.536 0 10.04-4.502 10.04-10.042.002-2.684-1.047-5.207-2.952-7.114C16.528 1.543 14.015.498 11.33.498c-5.539 0-10.043 4.503-10.046 10.043-.002 1.737.457 3.432 1.348 4.93L1.508 22.09l6.722-1.758c-1.52.83-2.013.91-1.583.822zM17.16 14.28c-.282-.142-1.67-.824-1.928-.918-.258-.094-.446-.142-.634.142-.188.282-.728.918-.892 1.107-.164.188-.328.212-.61.07-2.8-.14-3.79-1.12-4.52-1.75-.434-.378-.857-.866-1.112-1.3-.164-.282-.018-.435.122-.575.126-.126.282-.328.423-.493.142-.164.188-.282.282-.47.094-.188.047-.353-.024-.494-.07-.142-.634-1.527-.868-2.09-.23-.553-.48-.48-.657-.487-.168-.008-.363-.01-.557-.01-.195 0-.51.073-.777.363-.267.29-1.02.996-1.02 2.43 0 1.432 1.043 2.815 1.185 3.003.142.188 2.012 3.172 4.957 4.316.7.273 1.246.435 1.672.57.702.222 1.34.19 1.844.116.563-.083 1.67-.682 1.905-1.34.234-.658.234-1.22.164-1.34-.07-.116-.258-.188-.54-.33z" })
	});
}
function FloatingWhatsApp() {
	const { data: settings } = useAppSettings();
	const phone = settings?.support_whatsapp;
	const [position, setPosition] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [isDragging, setIsDragging] = (0, import_react.useState)(false);
	const dragStart = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const elementRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const saved = localStorage.getItem("whatsapp_position");
		if (saved) try {
			setPosition(JSON.parse(saved));
		} catch {}
	}, []);
	const handleMouseDown = (e) => {
		if (e.button !== 0) return;
		setIsDragging(true);
		dragStart.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y
		};
		e.preventDefault();
	};
	const handleTouchStart = (e) => {
		setIsDragging(true);
		const touch = e.touches[0];
		dragStart.current = {
			x: touch.clientX - position.x,
			y: touch.clientY - position.y
		};
	};
	(0, import_react.useEffect)(() => {
		const handleMouseMove = (e) => {
			if (!isDragging) return;
			let newX = e.clientX - dragStart.current.x;
			let newY = e.clientY - dragStart.current.y;
			setPosition({
				x: newX,
				y: newY
			});
		};
		const handleTouchMove = (e) => {
			if (!isDragging) return;
			const touch = e.touches[0];
			let newX = touch.clientX - dragStart.current.x;
			let newY = touch.clientY - dragStart.current.y;
			setPosition({
				x: newX,
				y: newY
			});
		};
		const handleMouseUp = () => {
			if (isDragging) {
				setIsDragging(false);
				localStorage.setItem("whatsapp_position", JSON.stringify(position));
			}
		};
		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
			window.addEventListener("touchmove", handleTouchMove, { passive: true });
			window.addEventListener("touchend", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleMouseUp);
		};
	}, [isDragging, position]);
	if (!phone) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		ref: elementRef,
		href: isDragging ? void 0 : waLink(phone, "Hi! I need help finding a product."),
		target: "_blank",
		rel: "noopener noreferrer",
		"aria-label": "Ask Question on WhatsApp",
		style: {
			transform: `translate(${position.x}px, ${position.y}px)`,
			cursor: isDragging ? "grabbing" : "grab",
			touchAction: "none"
		},
		onMouseDown: handleMouseDown,
		onTouchStart: handleTouchStart,
		className: "fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg ring-4 ring-[#25D366]/15 select-none hover:bg-[#20ba5a] transition-all",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppIcon, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-bold tracking-wide uppercase",
			children: "Ask Question"
		})]
	});
}
var GUEST_KEY = "stoneworks.guest_collection_v2";
var GUEST_REQ_KEY = "stoneworks.guest_requirements_v2";
var USER_REQ_KEY_PREFIX = "stoneworks.user_requirements_v2_";
var CACHED_ITEMS_KEY_PREFIX = "stoneworks.cached_user_items_";
function generateCollectionReference(colId) {
	return `ENC-${(/* @__PURE__ */ new Date()).getFullYear()}-${(colId || Math.random().toString(36)).substring(0, 6).toUpperCase()}`;
}
function detectProductUnit(product) {
	if (!product) return "Pieces";
	const text = `${String(product.name || "").toLowerCase()} ${String(product.brand || "").toLowerCase()} ${String(product.short_description || "").toLowerCase()}`;
	if ([
		"tile",
		"flooring",
		"marble",
		"granite",
		"decking",
		"slab",
		"paving",
		"stone",
		"cladding",
		"terrazzo",
		"porcelain",
		"quartz",
		"paver",
		"wall tile",
		"floor tile"
	].some((kw) => text.includes(kw))) return "m²";
	return "Pieces";
}
function getGuestCollection() {
	if (typeof window === "undefined") return [];
	try {
		const rawItems = JSON.parse(window.localStorage.getItem(GUEST_KEY) || "[]");
		const rawReqs = JSON.parse(window.localStorage.getItem(GUEST_REQ_KEY) || "{}");
		return rawItems.map((item) => ({
			...item,
			...rawReqs[item.product_id] || {}
		}));
	} catch {
		return [];
	}
}
function setGuestCollection(items) {
	if (typeof window === "undefined") return;
	const baseItems = items.map((i) => ({
		product_id: i.product_id,
		added_at: i.added_at
	}));
	const reqMap = {};
	items.forEach((i) => {
		if (i.quantity || i.installation_location || i.delivery_preference || i.installation_required || i.project_notes) reqMap[i.product_id] = {
			quantity: i.quantity,
			unit: i.unit,
			installation_location: i.installation_location,
			delivery_preference: i.delivery_preference,
			installation_required: i.installation_required,
			project_notes: i.project_notes
		};
	});
	window.localStorage.setItem(GUEST_KEY, JSON.stringify(baseItems));
	window.localStorage.setItem(GUEST_REQ_KEY, JSON.stringify(reqMap));
	window.dispatchEvent(new Event("collection:change"));
}
function updateGuestItemRequirements(product_id, reqs) {
	if (typeof window === "undefined") return;
	try {
		const rawReqs = JSON.parse(window.localStorage.getItem(GUEST_REQ_KEY) || "{}");
		rawReqs[product_id] = {
			...rawReqs[product_id] || {},
			...reqs
		};
		window.localStorage.setItem(GUEST_REQ_KEY, JSON.stringify(rawReqs));
		window.dispatchEvent(new Event("collection:change"));
	} catch (e) {
		console.error("Failed updating guest item requirements:", e);
	}
}
function addGuestItem(product_id) {
	const items = getGuestCollection();
	if (items.some((i) => i.product_id === product_id)) return items;
	const next = [...items, {
		product_id,
		added_at: (/* @__PURE__ */ new Date()).toISOString()
	}];
	setGuestCollection(next);
	return next;
}
function removeGuestItem(product_id) {
	const next = getGuestCollection().filter((i) => i.product_id !== product_id);
	setGuestCollection(next);
	return next;
}
function getUserItemRequirements(userId) {
	if (typeof window === "undefined") return {};
	try {
		const reqKey = `${USER_REQ_KEY_PREFIX}${userId}`;
		return JSON.parse(window.localStorage.getItem(reqKey) || "{}");
	} catch {
		return {};
	}
}
function updateUserItemRequirements(userId, productId, reqs) {
	if (typeof window === "undefined") return;
	try {
		const reqKey = `${USER_REQ_KEY_PREFIX}${userId}`;
		const rawMap = getUserItemRequirements(userId);
		rawMap[productId] = {
			...rawMap[productId] || {},
			...reqs
		};
		window.localStorage.setItem(reqKey, JSON.stringify(rawMap));
		window.dispatchEvent(new Event("collection:change"));
	} catch (e) {
		console.error("Failed updating user item requirements:", e);
	}
}
/** Synchronous local cache reader for instant UI (<16ms) */
function getCachedUserCollectionItems(userId) {
	if (typeof window === "undefined") return {
		collection_id: "",
		items: []
	};
	try {
		const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
		return JSON.parse(window.localStorage.getItem(cacheKey) || "{\"items\":[]}");
	} catch {
		return {
			collection_id: "",
			items: []
		};
	}
}
/** Instant synchronous cache writer for adding items (<16ms) */
function addItemToUserCollectionSync(userId, product_id) {
	const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
	let cached = {
		collection_id: "",
		items: []
	};
	if (typeof window !== "undefined") {
		try {
			cached = JSON.parse(window.localStorage.getItem(cacheKey) || "{\"items\":[]}");
			if (!cached.items.some((i) => i.product_id === product_id)) {
				cached.items.unshift({
					product_id,
					added_at: (/* @__PURE__ */ new Date()).toISOString()
				});
				window.localStorage.setItem(cacheKey, JSON.stringify(cached));
			}
		} catch {}
		window.dispatchEvent(new Event("collection:change"));
	}
	return cached;
}
/** Instant synchronous cache writer for removing items (<16ms) */
function removeItemFromUserCollectionSync(userId, product_id) {
	const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
	let cached = {
		collection_id: "",
		items: []
	};
	if (typeof window !== "undefined") {
		try {
			cached = JSON.parse(window.localStorage.getItem(cacheKey) || "{\"items\":[]}");
			cached.items = cached.items.filter((i) => i.product_id !== product_id);
			window.localStorage.setItem(cacheKey, JSON.stringify(cached));
		} catch {}
		window.dispatchEvent(new Event("collection:change"));
	}
	return cached;
}
/** Guaranteed active collection generator (Schema-Safe strictly standard columns) */
async function ensureUserCollection(userId) {
	if (!userId) return "";
	try {
		const { data: existing, error } = await supabase.from("collections").select("id, name, user_id, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
		if (!error && existing?.id) return existing.id;
	} catch (err) {
		console.warn("Failed selecting existing collection:", err);
	}
	try {
		const { data: newCol, error } = await supabase.from("collections").insert({
			user_id: userId,
			name: "Project Workspace"
		}).select("id").single();
		if (error) {
			console.error("Failed to insert new collection:", error);
			return "";
		}
		return newCol?.id || "";
	} catch (err) {
		console.error("Exception creating user collection:", err);
		return "";
	}
}
/** Parallelized workspace loader executing profile, items, collections, and product queries concurrently */
async function getBatchCollectionWorkspaceData(userId) {
	const cached = getCachedUserCollectionItems(userId);
	let colId = cached.collection_id;
	if (!colId) colId = await ensureUserCollection(userId);
	const [profRes, itemsRes, colInfoRes] = await Promise.all([
		supabase.from("profiles").select("*").eq("auth_id", userId).maybeSingle(),
		colId ? supabase.from("collection_items").select("product_id, added_at, collection_id").eq("collection_id", colId).order("added_at", { ascending: false }) : Promise.resolve({ data: [] }),
		colId ? supabase.from("collections").select("*").eq("id", colId).maybeSingle() : Promise.resolve({ data: null })
	]);
	const dbItems = itemsRes.data ?? [];
	const mergedMap = /* @__PURE__ */ new Map();
	dbItems.forEach((i) => mergedMap.set(i.product_id, i));
	(cached.items || []).forEach((i) => {
		if (!mergedMap.has(i.product_id)) mergedMap.set(i.product_id, i);
	});
	const items = Array.from(mergedMap.values());
	const productIds = items.map((i) => i.product_id);
	const products = productIds.length > 0 ? await fetchProductsByIds(productIds) : [];
	if (typeof window !== "undefined" && colId) {
		const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
		window.localStorage.setItem(cacheKey, JSON.stringify({
			collection_id: colId,
			items
		}));
	}
	return {
		profile: profRes.data ?? null,
		collectionId: colId,
		collectionData: colInfoRes.data ?? null,
		items,
		products
	};
}
async function addItemToUserCollection(userId, product_id) {
	`${userId}`;
	let collection_id = "";
	addItemToUserCollectionSync(userId, product_id);
	try {
		collection_id = getCachedUserCollectionItems(userId).collection_id || "";
		if (!collection_id) collection_id = await ensureUserCollection(userId);
		if (collection_id) {
			const { error } = await supabase.from("collection_items").upsert({
				collection_id,
				product_id
			}, {
				onConflict: "collection_id,product_id",
				ignoreDuplicates: true
			});
			if (error) await supabase.from("collection_items").insert({
				collection_id,
				product_id
			});
		}
	} catch (err) {
		console.error("Background sync error adding item:", err);
	}
	return collection_id;
}
async function removeItemFromUserCollection(userId, product_id) {
	removeItemFromUserCollectionSync(userId, product_id);
	try {
		let collection_id = getCachedUserCollectionItems(userId).collection_id || "";
		if (!collection_id) collection_id = await ensureUserCollection(userId);
		if (collection_id) await supabase.from("collection_items").delete().eq("collection_id", collection_id).eq("product_id", product_id);
	} catch (err) {
		console.error("Background sync error removing item:", err);
	}
}
/** Atomic, safe guest collection merging in 1 single array payload */
async function mergeGuestIntoUser(userId) {
	const guest = getGuestCollection();
	if (!guest.length) return;
	const collection_id = await ensureUserCollection(userId);
	if (!collection_id) return;
	const payload = guest.map((g) => ({
		collection_id,
		product_id: g.product_id
	}));
	try {
		const { error } = await supabase.from("collection_items").upsert(payload, {
			onConflict: "collection_id,product_id",
			ignoreDuplicates: true
		});
		if (error) await supabase.from("collection_items").insert(payload);
	} catch (err) {
		console.error("Atomic guest merge error:", err);
	}
	const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
	const reqKey = `${USER_REQ_KEY_PREFIX}${userId}`;
	if (typeof window !== "undefined") try {
		const cached = JSON.parse(window.localStorage.getItem(cacheKey) || "{\"items\":[]}");
		const existingIds = new Set(cached.items.map((i) => i.product_id));
		guest.forEach((g) => {
			if (!existingIds.has(g.product_id)) cached.items.unshift({
				product_id: g.product_id,
				added_at: g.added_at || (/* @__PURE__ */ new Date()).toISOString()
			});
		});
		cached.collection_id = collection_id;
		window.localStorage.setItem(cacheKey, JSON.stringify(cached));
		const rawGuestReqs = JSON.parse(window.localStorage.getItem(GUEST_REQ_KEY) || "{}");
		const mergedReqs = {
			...JSON.parse(window.localStorage.getItem(reqKey) || "{}"),
			...rawGuestReqs
		};
		window.localStorage.setItem(reqKey, JSON.stringify(mergedReqs));
	} catch {}
	setGuestCollection([]);
	window.dispatchEvent(new Event("collection:change"));
}
async function fetchProductsByIds(ids) {
	if (!ids.length) return [];
	const { data, error } = await supabase.from("products").select("id,slug,name,code,price,brand,image_url,generated_studio_image,short_description").in("id", ids);
	if (error) throw error;
	return data ?? [];
}
async function lockAndSubmitCollection(collectionId, userId) {
	const refNum = generateCollectionReference(collectionId);
	if (collectionId) try {
		await supabase.from("collections").update({
			status: "Submitted",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", collectionId);
	} catch {}
	if (userId) try {
		await supabase.from("collections").insert({
			user_id: userId,
			name: "Project Workspace"
		});
	} catch {}
	if (typeof window !== "undefined") {
		if (userId) {
			const cacheKey = `${CACHED_ITEMS_KEY_PREFIX}${userId}`;
			const reqKey = `${USER_REQ_KEY_PREFIX}${userId}`;
			window.localStorage.removeItem(cacheKey);
			window.localStorage.removeItem(reqKey);
		}
		setGuestCollection([]);
		window.dispatchEvent(new Event("collection:change"));
	}
	return refNum;
}
async function updateCustomerPhoneNumber(userId, phone) {
	try {
		const { data: prof } = await supabase.from("profiles").select("id").eq("auth_id", userId).maybeSingle();
		if (prof?.id) await supabase.from("profiles").update({ phone_number: phone }).eq("id", prof.id);
	} catch (e) {
		console.error("Failed to update profile phone number:", e);
	}
}
async function getUserCollectionHistory(userId) {
	try {
		const { data: cols } = await supabase.from("collections").select("*").eq("user_id", userId).order("created_at", { ascending: false });
		return cols || [];
	} catch {
		return [];
	}
}
async function duplicateCollection(userId, parentCollectionId) {
	const collection_id = await ensureUserCollection(userId);
	try {
		const { data: items } = await supabase.from("collection_items").select("*").eq("collection_id", parentCollectionId);
		if (items && items.length > 0) for (const item of items) await supabase.from("collection_items").upsert({
			collection_id,
			product_id: item.product_id
		}, {
			onConflict: "collection_id,product_id",
			ignoreDuplicates: true
		});
	} catch (err) {
		console.error("Failed to duplicate collection:", err);
	}
	window.dispatchEvent(new Event("collection:change"));
	return collection_id;
}
function FacebookBrandIcon({ className = "h-5 w-5" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className,
		fill: "currentColor",
		viewBox: "0 0 24 24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" })
	});
}
function InstagramBrandIcon({ className = "h-5 w-5" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className,
		fill: "currentColor",
		viewBox: "0 0 24 24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" })
	});
}
function TikTokBrandIcon({ className = "h-5 w-5" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className,
		viewBox: "0 0 24 24",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201-1.743 2.895 2.895 0 0 1 2.312-2.834V7.633a6.347 6.347 0 0 0-5.115 6.223A6.34 6.34 0 0 0 10.709 20V9.378a8.16 8.16 0 0 0 4.772 1.524v-3.4a4.847 4.847 0 0 1-1.554-.816z",
				fill: "#25F4EE",
				transform: "translate(-0.8, -0.6)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201-1.743 2.895 2.895 0 0 1 2.312-2.834V7.633a6.347 6.347 0 0 0-5.115 6.223A6.34 6.34 0 0 0 10.709 20V9.378a8.16 8.16 0 0 0 4.772 1.524v-3.4a4.847 4.847 0 0 1-1.554-.816z",
				fill: "#FE2C55",
				transform: "translate(0.8, 0.6)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201-1.743 2.895 2.895 0 0 1 2.312-2.834V7.633a6.347 6.347 0 0 0-5.115 6.223A6.34 6.34 0 0 0 10.709 20V9.378a8.16 8.16 0 0 0 4.772 1.524v-3.4a4.847 4.847 0 0 1-1.554-.816z",
				fill: "#FFFFFF"
			})
		]
	});
}
function YouTubeBrandIcon({ className = "h-5 w-5" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className,
		fill: "currentColor",
		viewBox: "0 0 24 24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" })
	});
}
function SiteFooter() {
	const { data: s } = useAppSettings();
	const mapUrl = s?.map_url || null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-6 border-t border-border bg-white text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-app grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/logo.png",
								alt: "SOLIDAS Logo",
								className: "h-8 w-auto object-contain"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-lg font-bold tracking-tight text-[#1E82A6]",
								children: "SOLIDAS"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-[#C0262D]",
							children: "SOLIDAS TILES AND MARBLE NIG. LIMITED"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground leading-relaxed",
							children: "Dealers & Suppliers of General Building Materials Such As Tiles & Marble, Granite, Crack Tiles, Foreign Security Doors, Wooden Doors, PVC Ceiling & General Contracts."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-mono text-muted-foreground/70",
							children: "RC Registration: 1218629"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-bold uppercase tracking-wider text-[#1E82A6]",
					children: "Showroom Discovery"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "Showroom Catalog"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/home",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "Video Showcase & Profile"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/tiles",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "All Tiles & Slabs"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/tiles/ceramics",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "Ceramics Tiles"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/tiles/ceramics/60-60",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "60×60 Ceramic & Porcelain Tiles"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/tiles/ceramics/60-120",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "60×120 Luxury Tile Slabs"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/doors",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "Security & Interior Doors"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/doors/foreign",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "Foreign Doors"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/doors/local",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "Local Doors"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contact",
							className: "text-muted-foreground hover:text-[#1E82A6] transition",
							children: "Contact & Head Office"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-bold uppercase tracking-wider text-[#1E82A6]",
					children: "Offices & Contacts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-3 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 h-4 w-4 text-[#C0262D] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "block text-foreground font-semibold",
								children: "Head Office:"
							}), mapUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: mapUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "hover:text-[#1E82A6] hover:underline transition",
								children: "Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja" })] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 h-4 w-4 text-[#1E82A6] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "block text-foreground font-semibold",
								children: "Branch Office:"
							}), mapUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: mapUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "hover:text-[#1E82A6] hover:underline transition",
								children: "Shop 819 C2 Extension Int'l Building Material Mkt Dei Dei, FCT Abuja"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shop 819 C2 Extension Int'l Building Material Mkt Dei Dei, FCT Abuja" })] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 text-[#1E82A6] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tel: 0803 518 6355 | 0815 149 5663 | 0904 032 7777" })]
						}),
						s?.company_email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 text-[#1E82A6] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `mailto:${s.company_email}`,
								className: "hover:text-[#1E82A6]",
								children: s.company_email
							})]
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-bold uppercase tracking-wider text-[#1E82A6]",
						children: "Connect & Inquiries"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs text-muted-foreground leading-relaxed",
						children: "Need custom quotes, bulk orders, or architectural samples? Speak directly with our sales team via WhatsApp."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `https://wa.me/${(s?.sales_whatsapp || "2348035186355").replace(/[^\d]/g, "")}?text=${encodeURIComponent("Hello SOLIDAS, I would like to inquire about building materials.")}`,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "inline-flex items-center gap-2 rounded-lg bg-[#C0262D] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#9A1B21]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "WhatsApp Sales Consultation" })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-6 flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: s?.facebook_url || "https://facebook.com",
								target: "_blank",
								rel: "noopener noreferrer",
								"aria-label": "Facebook",
								className: "grid h-10 w-10 place-items-center rounded-full bg-[#1877F2] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FacebookBrandIcon, { className: "h-5 w-5 fill-white" })
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: s?.instagram_url || "https://instagram.com",
								target: "_blank",
								rel: "noopener noreferrer",
								"aria-label": "Instagram",
								className: "grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstagramBrandIcon, { className: "h-5 w-5 fill-white" })
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: s?.tiktok_url || "https://tiktok.com",
								target: "_blank",
								rel: "noopener noreferrer",
								"aria-label": "TikTok",
								className: "grid h-10 w-10 place-items-center rounded-full bg-black text-white shadow-md ring-1 ring-white/20 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TikTokBrandIcon, { className: "h-5 w-5 fill-white" })
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: s?.youtube_url || "https://youtube.com",
								target: "_blank",
								rel: "noopener noreferrer",
								"aria-label": "YouTube",
								className: "grid h-10 w-10 place-items-center rounded-full bg-[#FF0000] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YouTubeBrandIcon, { className: "h-5 w-5 fill-white" })
							}) })
						]
					})
				] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border py-4 text-center text-xs text-muted-foreground",
			children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" SOLIDAS TILES AND MARBLE NIG. LIMITED. All rights reserved."
			]
		})]
	});
}
function AppShell({ children }) {
	const [trustFeatures, setTrustFeatures] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const fetchTrust = async () => {
			const { data } = await supabase.from("trust_features").select("*").order("order_index", { ascending: true });
			if (data) setTrustFeatures(data);
		};
		fetchTrust();
	}, []);
	(0, import_react.useEffect)(() => {
		const handleOnline = () => {
			toast.success("Connection restored! Syncing offline actions...");
		};
		const handleOffline = () => {
			toast.warning("Connection lost. Running in offline resilience mode.");
		};
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		if (navigator.onLine);
		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 pb-16 md:pb-6",
				children
			}),
			trustFeatures.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "fixed bottom-12 md:bottom-0 left-0 right-0 z-20 border-t border-border bg-white/95 py-2.5 shadow-md overflow-hidden backdrop-blur select-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 30s linear infinite;
            }
          ` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "animate-marquee flex items-center gap-16 px-4",
					children: [trustFeatures.map((t) => {
						const IconComponent = t.icon_name === "Shield" ? Shield : t.icon_name === "Truck" ? Truck : t.icon_name === "CreditCard" ? CreditCard : t.icon_name === "Headphones" ? Headphones : CircleQuestionMark;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2.5 items-center shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-full bg-[#1E82A6]/10 p-1.5 text-[#1E82A6] shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, { className: "h-3.5 w-3.5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex items-baseline gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-bold text-[11px] text-foreground tracking-tight whitespace-nowrap",
										children: t.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground/40 font-bold font-mono",
										children: "|"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground whitespace-nowrap",
										children: t.description
									})
								]
							})]
						}, `${t.id}-1`);
					}), trustFeatures.map((t) => {
						const IconComponent = t.icon_name === "Shield" ? Shield : t.icon_name === "Truck" ? Truck : t.icon_name === "CreditCard" ? CreditCard : t.icon_name === "Headphones" ? Headphones : CircleQuestionMark;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2.5 items-center shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-full bg-[#1E82A6]/10 p-1.5 text-[#1E82A6] shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, { className: "h-3.5 w-3.5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex items-baseline gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-bold text-[11px] text-foreground tracking-tight whitespace-nowrap",
										children: t.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground/40 font-bold font-mono",
										children: "|"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground whitespace-nowrap",
										children: t.description
									})
								]
							})]
						}, `${t.id}-2`);
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingWhatsApp, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})
		]
	});
}
function TopBar() {
	const navigate = useNavigate();
	const search = useRouterState({ select: (s) => s.location.search });
	const { user, isAdmin } = useAuth();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [showNotifications, setShowNotifications] = (0, import_react.useState)(false);
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [unreadCount, setUnreadCount] = (0, import_react.useState)(0);
	const loadNotifications = async () => {
		if (!user?.id) return;
		const { data } = await supabase.from("communication_queue").select("*").eq("user_id", user.id).eq("channel_type", "push").order("created_at", { ascending: false }).limit(10);
		if (data) {
			setNotifications(data);
			const pending = data.filter((n) => n.status === "PENDING").length;
			setUnreadCount(pending);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		loadNotifications();
		const channel = supabase.channel(`user-notifications-${user.id}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "communication_queue",
			filter: `user_id=eq.${user.id}`
		}, () => {
			loadNotifications();
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [user?.id]);
	const openNotifications = async () => {
		setShowNotifications(!showNotifications);
		setMenuOpen(false);
		if (!showNotifications && user?.id) {
			await supabase.from("communication_queue").update({ status: "DELIVERED" }).eq("user_id", user.id).eq("channel_type", "push").eq("status", "PENDING");
			setUnreadCount(0);
		}
	};
	const clearNotification = async (id) => {
		await supabase.from("communication_queue").delete().eq("id", id);
		loadNotifications();
	};
	const handleSignOut = async () => {
		await supabase.auth.signOut();
		setMenuOpen(false);
		navigate({ to: "/" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur shadow-xs",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-app flex items-center gap-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3 group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.png",
						alt: "SOLIDAS Logo",
						className: "h-9 w-auto object-contain transition group-hover:scale-105"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg font-bold tracking-tight text-[#1E82A6] leading-none",
							children: "SOLIDAS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-[9px] font-semibold tracking-wider text-muted-foreground uppercase sm:block mt-0.5",
							children: "Tiles & Marble Nig. Ltd."
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						const data = new FormData(e.currentTarget);
						const q = String(data.get("q") || "").trim();
						navigate({
							to: "/search",
							search: { q }
						});
					},
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "q",
						defaultValue: search?.q ?? "",
						placeholder: "Search Tiles, Marble, Security Doors & Finishes…",
						className: "w-full rounded-full border border-border bg-surface-2 py-2 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-[#1E82A6] focus:bg-white focus:ring-1 focus:ring-[#1E82A6]"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "hidden md:flex items-center gap-1.5 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/home",
							className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-foreground hover:bg-[#1E82A6]/10 hover:text-[#1E82A6] hover:border-[#1E82A6] transition shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-3.5 w-3.5 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Home" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-foreground hover:bg-[#1E82A6]/10 hover:text-[#1E82A6] hover:border-[#1E82A6] transition shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-3.5 w-3.5 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Showroom" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/collection",
							search: { autoPush: false },
							className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-foreground hover:bg-[#1E82A6]/10 hover:text-[#1E82A6] hover:border-[#1E82A6] transition shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-3.5 w-3.5 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Workspace" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/contact",
							className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-foreground hover:bg-[#1E82A6]/10 hover:text-[#1E82A6] hover:border-[#1E82A6] transition shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact" })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: openNotifications,
							className: "relative grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-foreground transition hover:border-[#1E82A6]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4 text-[#1E82A6]" }), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C0262D] text-[8px] font-bold text-white shadow-sm animate-pulse",
								children: unreadCount
							})]
						}), showNotifications && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							onClick: () => setShowNotifications(false),
							className: "fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[340px] rounded-xl border border-border bg-white shadow-2xl p-4 text-xs space-y-3 z-50 md:absolute md:top-auto md:left-auto md:right-0 md:translate-x-0 md:translate-y-0 md:mt-2 md:w-80 md:rounded-lg md:shadow-xl md:p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-border pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground text-sm md:text-xs",
									children: "Notifications"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setShowNotifications(false),
									className: "text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 max-h-60 overflow-y-auto pr-1",
								children: [notifications.map((notif) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-2.5 border border-border rounded bg-surface-2 flex gap-2 relative group text-left",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-[#1E82A6] shrink-0 mt-0.5" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-foreground truncate",
												children: notif.subject || "Alert"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground mt-0.5 leading-tight",
												children: notif.body
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: (e) => {
												e.stopPropagation();
												clearNotification(notif.id);
											},
											className: "absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[#C0262D] transition",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})
									]
								}, notif.id)), notifications.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground italic text-center py-4",
									children: "No notifications yet."
								})]
							})]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setMenuOpen((o) => !o);
								setShowNotifications(false);
							},
							"aria-label": "Account menu",
							className: "grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-[#1E82A6] hover:border-[#1E82A6]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" })
						}), menuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute right-0 mt-2 w-52 rounded-lg border border-border bg-white py-1.5 shadow-xl z-50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/collection",
									search: { autoPush: false },
									onClick: () => setMenuOpen(false),
									className: "flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#1E82A6]/10 hover:text-[#1E82A6]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Workspace" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/my-collections",
									onClick: () => setMenuOpen(false),
									className: "flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#1E82A6]/10 hover:text-[#1E82A6] border-b border-border/50 pb-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4 text-[#C0262D]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Collection History" })]
								}),
								isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/admin",
									onClick: () => setMenuOpen(false),
									className: "flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#1E82A6]/10 hover:text-[#1E82A6]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Admin Command Center" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleSignOut,
									className: "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#C0262D] hover:bg-[#C0262D]/10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign out" })]
								})
							]
						})]
					})]
				})
			]
		})
	});
}
function BottomNav() {
	const { user } = useAuth();
	const searchState = useRouterState({ select: (s) => s.location.pathname });
	const [collectionCount, setCollectionCount] = (0, import_react.useState)(0);
	const loadCollectionCount = (0, import_react.useCallback)(() => {
		if (user?.id) {
			const cached = getCachedUserCollectionItems(user.id);
			setCollectionCount(cached.items.length);
		} else setCollectionCount(getGuestCollection().length);
	}, [user?.id]);
	(0, import_react.useEffect)(() => {
		loadCollectionCount();
		window.addEventListener("collection:change", loadCollectionCount);
		return () => {
			window.removeEventListener("collection:change", loadCollectionCount);
		};
	}, [loadCollectionCount]);
	const nav = [
		{
			to: "/home",
			label: "Home",
			icon: House,
			active: searchState === "/home"
		},
		{
			to: "/search",
			label: "Search",
			icon: Search,
			active: searchState.startsWith("/search")
		},
		{
			to: "/",
			label: "Feed",
			icon: Compass,
			active: searchState === "/"
		},
		{
			to: "/collection",
			label: "Collection",
			icon: Bookmark,
			active: searchState.startsWith("/collection")
		},
		{
			to: user ? "/account" : "/auth",
			label: "Account",
			icon: User,
			active: searchState.startsWith("/account") || searchState.startsWith("/auth")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 py-2 backdrop-blur md:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-around",
			children: nav.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: t.to,
				className: `flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${t.active ? "text-[#1E82A6] font-bold" : "text-muted-foreground hover:text-foreground"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "h-5 w-5" }), t.label === "Collection" && collectionCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C0262D] text-[8px] font-bold text-white shadow-sm",
						children: ["+", collectionCount]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.label })]
			}, t.label))
		})
	});
}
var $$splitErrorComponentImporter = () => import("./product._slug-B9ftkAB4.mjs");
var $$splitNotFoundComponentImporter = () => import("./product._slug-DX-tRQQ1.mjs");
var $$splitComponentImporter$14 = () => import("./product._slug-D-d8qvzH.mjs");
var productQuery = (slug) => queryOptions({
	queryKey: ["product", slug],
	queryFn: async () => {
		const p = await fetchProductBySlug(slug);
		if (!p) throw notFound();
		return p;
	}
});
var Route$14 = createFileRoute("/product/$slug")({
	loader: async ({ context, params }) => {
		const origin = getProductionOrigin();
		const product = await context.queryClient.ensureQueryData(productQuery(params.slug));
		const canonicalSlug = getCanonicalProductSlug(product);
		if (params.slug !== canonicalSlug) throw redirect({
			href: getCanonicalProductUrl(product, origin),
			statusCode: 301
		});
		await context.queryClient.ensureQueryData(relatedQuery(product.family_id, product.id, product.category_id));
		const [typeRes, categoryRes, subcategoryRes, familyRes] = await Promise.all([
			product.type_id ? supabase.from("product_types").select("name, slug").eq("id", product.type_id).maybeSingle() : Promise.resolve({ data: null }),
			product.category_id ? supabase.from("categories").select("name, slug").eq("id", product.category_id).maybeSingle() : Promise.resolve({ data: null }),
			product.subcategory_id ? supabase.from("subcategories").select("name, slug").eq("id", product.subcategory_id).maybeSingle() : Promise.resolve({ data: null }),
			product.family_id ? supabase.from("family_groups").select("name, slug").eq("id", product.family_id).maybeSingle() : Promise.resolve({ data: null })
		]);
		return {
			product,
			origin,
			taxonomy: {
				type: typeRes.data ? {
					...typeRes.data,
					name: typeRes.data.name.trim(),
					slug: slugify(typeRes.data.slug || typeRes.data.name)
				} : null,
				category: categoryRes.data ? {
					...categoryRes.data,
					name: categoryRes.data.name.trim(),
					slug: normalizeCategorySlug(categoryRes.data.slug || categoryRes.data.name)
				} : null,
				subcategory: subcategoryRes.data ? {
					...subcategoryRes.data,
					name: subcategoryRes.data.name.trim(),
					slug: slugify(subcategoryRes.data.slug || subcategoryRes.data.name)
				} : null,
				family: familyRes.data ? {
					...familyRes.data,
					name: familyRes.data.name.trim(),
					slug: slugify(familyRes.data.slug || familyRes.data.name)
				} : null
			}
		};
	},
	head: ({ loaderData }) => {
		const product = loaderData?.product;
		const taxonomy = loaderData?.taxonomy;
		const origin = loaderData?.origin || getProductionOrigin();
		const baseName = product?.name?.trim() || "Building Material";
		const code = product?.code?.trim() || "";
		const dimension = (product?.size || taxonomy?.subcategory?.name || "")?.trim();
		const color = product?.color?.trim() || "";
		const finish = (product?.finish || product?.finish_name || "")?.trim();
		const material = product?.material?.trim() || "";
		const categoryName = taxonomy?.category?.name?.trim() || "";
		const titleSpecs = [
			color,
			finish,
			dimension,
			material
		].filter(Boolean).slice(0, 3);
		const generatedTitle = `${baseName}${titleSpecs.length ? ` — ${titleSpecs.join(", ")}` : ""}${code ? ` (${code})` : ""} | SOLIDAS Abuja`;
		const title = product?.seo_title_manual && product?.seo_title ? product.seo_title : generatedTitle;
		const descSpecs = [
			dimension ? `size ${dimension}` : "",
			material ? `${material} material` : "",
			color ? `${color} colour` : "",
			finish ? `${finish} finish` : ""
		].filter(Boolean);
		const generatedDesc = `Buy ${baseName}${code ? ` (Code: ${code})` : ""}${categoryName ? ` in ${categoryName}` : ""}${descSpecs.length ? ` featuring ${descSpecs.join(", ")}` : ""} from SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei-Dei, Abuja. ${product?.short_description || "Nationwide delivery and instant WhatsApp project quotes."}`.slice(0, 300);
		const desc = product?.seo_description_manual && product?.seo_description ? product.seo_description : generatedDesc;
		const imageUrl = product?.generated_studio_image || product?.image_url || "";
		const canonical = getCanonicalProductUrl(product, origin);
		return {
			meta: [
				{ title },
				{
					name: "description",
					content: desc
				},
				{
					property: "og:type",
					content: "product"
				},
				{
					property: "og:title",
					content: title
				},
				{
					property: "og:description",
					content: desc
				},
				{
					property: "og:image",
					content: imageUrl ? publicImageUrl(imageUrl) : ""
				},
				{
					property: "og:url",
					content: canonical
				},
				{
					name: "twitter:card",
					content: "summary_large_image"
				},
				{
					name: "twitter:title",
					content: title
				},
				{
					name: "twitter:description",
					content: desc
				},
				{
					name: "twitter:image",
					content: imageUrl ? publicImageUrl(imageUrl) : ""
				}
			],
			links: [{
				rel: "canonical",
				href: canonical
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$14, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent")
});
var $$splitComponentImporter$13 = () => import("./admin.index-BRRLCBU8.mjs");
var Route$13 = createFileRoute("/_authenticated/admin/")({
	head: () => ({ meta: [{ title: "Admin — Stoneworks" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./admin.ai-templates-DqvwAlbK.mjs");
var Route$12 = createFileRoute("/_authenticated/admin/ai-templates")({
	head: () => ({ meta: [{ title: "AI Control Center — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./admin.business-C4a3wLPY.mjs");
var Route$11 = createFileRoute("/_authenticated/admin/business")({
	head: () => ({ meta: [{ title: "Business Operations — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./admin.collections-89OXsDs7.mjs");
var Route$10 = createFileRoute("/_authenticated/admin/collections")({
	head: () => ({ meta: [{ title: "Collection CRM & Quotation Requests — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./admin.customers-39fpktV6.mjs");
var Route$9 = createFileRoute("/_authenticated/admin/customers")({
	head: () => ({ meta: [{ title: "Customers — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./admin.diagnostics-BpgK3sgQ.mjs");
var Route$8 = createFileRoute("/_authenticated/admin/diagnostics")({
	head: () => ({ meta: [{ title: "AI & Discovery Diagnostics — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./admin.email-DmwXDu5C.mjs");
var Route$7 = createFileRoute("/_authenticated/admin/email")({
	head: () => ({ meta: [{ title: "Communication Center — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./admin.hierarchy-0v3QcIp-.mjs");
var Route$6 = createFileRoute("/_authenticated/admin/hierarchy")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./admin.pipeline-_rp400nO.mjs");
var Route$5 = createFileRoute("/_authenticated/admin/pipeline")({
	head: () => ({ meta: [{ title: "AI Operations Dashboard — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin.products-C_ySBefl.mjs");
var Route$4 = createFileRoute("/_authenticated/admin/products")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin.prompts-D5YmqQiW.mjs");
var Route$3 = createFileRoute("/_authenticated/admin/prompts")({
	beforeLoad: () => {
		throw redirect({ to: "/admin/ai-templates" });
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./admin.customers._id-CASv3LYD.mjs");
var Route$2 = createFileRoute("/_authenticated/admin/customers/$id")({
	head: () => ({ meta: [{ title: "Customer — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin.products._id-DnnN9THm.mjs");
var Route$1 = createFileRoute("/_authenticated/admin/products/$id")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./admin.products.new-DoYcNK9H.mjs");
var Route = createFileRoute("/_authenticated/admin/products/new")({
	head: () => ({ meta: [{ title: "Create New Product — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$35.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$36
});
var SplatRoute = Route$34.update({
	id: "/$",
	path: "/$",
	getParentRoute: () => Route$36
});
var AuthenticatedRouteRoute = Route$33.update({
	id: "/_authenticated",
	getParentRoute: () => Route$36
});
var AccountRoute = Route$32.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => Route$36
});
var AuthRoute = Route$31.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$36
});
var CollectionRoute = Route$30.update({
	id: "/collection",
	path: "/collection",
	getParentRoute: () => Route$36
});
var ContactRoute = Route$29.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$36
});
var DebugEnvRoute = Route$28.update({
	id: "/debug-env",
	path: "/debug-env",
	getParentRoute: () => Route$36
});
var HomeRoute = Route$27.update({
	id: "/home",
	path: "/home",
	getParentRoute: () => Route$36
});
var MyCollectionsRoute = Route$26.update({
	id: "/my-collections",
	path: "/my-collections",
	getParentRoute: () => Route$36
});
var RobotsDottxtRoute = Route$25.update({
	id: "/robots.txt",
	path: "/robots.txt",
	getParentRoute: () => Route$36
});
var SearchRoute = Route$24.update({
	id: "/search",
	path: "/search",
	getParentRoute: () => Route$36
});
var SitemapCategoriesDotxmlRoute = Route$23.update({
	id: "/sitemap-categories.xml",
	path: "/sitemap-categories.xml",
	getParentRoute: () => Route$36
});
var SitemapImagesDotxmlRoute = Route$22.update({
	id: "/sitemap-images.xml",
	path: "/sitemap-images.xml",
	getParentRoute: () => Route$36
});
var SitemapPagesDotxmlRoute = Route$21.update({
	id: "/sitemap-pages.xml",
	path: "/sitemap-pages.xml",
	getParentRoute: () => Route$36
});
var SitemapProductsDotxmlRoute = Route$20.update({
	id: "/sitemap-products.xml",
	path: "/sitemap-products.xml",
	getParentRoute: () => Route$36
});
var SitemapDotxmlRoute = Route$19.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$36
});
var AuthenticatedAdminRoute = Route$18.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFavoritesRoute = Route$17.update({
	id: "/favorites",
	path: "/favorites",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$16.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var CollectionIdRoute = Route$15.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => CollectionRoute
});
var ProductSlugRoute = Route$14.update({
	id: "/product/$slug",
	path: "/product/$slug",
	getParentRoute: () => Route$36
});
var AuthenticatedAdminIndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminAiTemplatesRoute = Route$12.update({
	id: "/ai-templates",
	path: "/ai-templates",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminBusinessRoute = Route$11.update({
	id: "/business",
	path: "/business",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminCollectionsRoute = Route$10.update({
	id: "/collections",
	path: "/collections",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminCustomersRoute = Route$9.update({
	id: "/customers",
	path: "/customers",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminDiagnosticsRoute = Route$8.update({
	id: "/diagnostics",
	path: "/diagnostics",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminEmailRoute = Route$7.update({
	id: "/email",
	path: "/email",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminHierarchyRoute = Route$6.update({
	id: "/hierarchy",
	path: "/hierarchy",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminPipelineRoute = Route$5.update({
	id: "/pipeline",
	path: "/pipeline",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminProductsRoute = Route$4.update({
	id: "/products",
	path: "/products",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminPromptsRoute = Route$3.update({
	id: "/prompts",
	path: "/prompts",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminCustomersIdRoute = Route$2.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AuthenticatedAdminCustomersRoute
});
var AuthenticatedAdminProductsIdRoute = Route$1.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AuthenticatedAdminProductsRoute
});
var AuthenticatedAdminProductsNewRoute = Route.update({
	id: "/new",
	path: "/new",
	getParentRoute: () => AuthenticatedAdminProductsRoute
});
var AuthenticatedAdminCustomersRouteChildren = { AuthenticatedAdminCustomersIdRoute };
var AuthenticatedAdminCustomersRouteWithChildren = AuthenticatedAdminCustomersRoute._addFileChildren(AuthenticatedAdminCustomersRouteChildren);
var AuthenticatedAdminProductsRouteChildren = {
	AuthenticatedAdminProductsIdRoute,
	AuthenticatedAdminProductsNewRoute
};
var AuthenticatedAdminRouteChildren = {
	AuthenticatedAdminAiTemplatesRoute,
	AuthenticatedAdminBusinessRoute,
	AuthenticatedAdminCollectionsRoute,
	AuthenticatedAdminCustomersRoute: AuthenticatedAdminCustomersRouteWithChildren,
	AuthenticatedAdminDiagnosticsRoute,
	AuthenticatedAdminEmailRoute,
	AuthenticatedAdminHierarchyRoute,
	AuthenticatedAdminPipelineRoute,
	AuthenticatedAdminProductsRoute: AuthenticatedAdminProductsRoute._addFileChildren(AuthenticatedAdminProductsRouteChildren),
	AuthenticatedAdminPromptsRoute,
	AuthenticatedAdminIndexRoute
};
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRoute: AuthenticatedAdminRoute._addFileChildren(AuthenticatedAdminRouteChildren),
	AuthenticatedFavoritesRoute,
	AuthenticatedSettingsRoute
};
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var CollectionRouteChildren = { CollectionIdRoute };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	SplatRoute,
	AccountRoute,
	AuthRoute,
	CollectionRoute: CollectionRoute._addFileChildren(CollectionRouteChildren),
	ContactRoute,
	DebugEnvRoute,
	HomeRoute,
	MyCollectionsRoute,
	RobotsDottxtRoute,
	SearchRoute,
	SitemapCategoriesDotxmlRoute,
	SitemapImagesDotxmlRoute,
	SitemapPagesDotxmlRoute,
	SitemapProductsDotxmlRoute,
	SitemapDotxmlRoute,
	ProductSlugRoute
};
var routeTree = Route$36._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
export { Route$28 as A, uploadLargeMediaFileClient as B, setGuestCollection as C, relatedQuery as D, updateUserItemRequirements as E, taxonomyQuery as F, getProductionOrigin as G, getCanonicalProductPath as H, ImageTile as I, ImageUploader as L, hierarchyQuery as M, Route$35 as N, Route$15 as O, feedInfiniteQuery as P, getCloudinarySignatureServer as R, removeItemFromUserCollectionSync as S, updateGuestItemRequirements as T, getCanonicalProductSlug as U, fetchFeedProducts as V, getCanonicalProductUrl as W, getUserItemRequirements as _, addGuestItem as a, removeGuestItem as b, detectProductUnit as c, fetchProductsByIds as d, generateCollectionReference as f, getUserCollectionHistory as g, getGuestCollection as h, AppShell as i, Route$34 as j, Route$24 as k, duplicateCollection as l, getCachedUserCollectionItems as m, Route$1 as n, addItemToUserCollection as o, getBatchCollectionWorkspaceData as p, Route$14 as r, addItemToUserCollectionSync as s, router_exports as t, ensureUserCollection as u, lockAndSubmitCollection as v, updateCustomerPhoneNumber as w, removeItemFromUserCollection as x, mergeGuestIntoUser as y, publicImageUrl as z };
