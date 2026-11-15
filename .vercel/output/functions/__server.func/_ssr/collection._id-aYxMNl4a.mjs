import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { O as Route$15, c as detectProductUnit, d as fetchProductsByIds, z as publicImageUrl } from "./router-DWif86SF.mjs";
import { i as waLink, r as useAppSettings } from "./settings-AvHwlRqF.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { J as Lock, Rt as ArrowLeft, W as MessageCircle } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/collection._id-aYxMNl4a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SharedCollection() {
	const { id } = Route$15.useParams();
	const { data: settings } = useAppSettings();
	const [collection, setCollection] = (0, import_react.useState)(null);
	const [items, setItems] = (0, import_react.useState)([]);
	const [products, setProducts] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const load = async () => {
			const { data: c } = await supabase.from("collections").select("*").eq("id", id).maybeSingle();
			if (c) setCollection(c);
			const { data: rawItems } = await supabase.from("collection_items").select("*").eq("collection_id", id);
			const fetchedItems = rawItems ?? [];
			setItems(fetchedItems);
			const fetchedProds = await fetchProductsByIds(fetchedItems.map((i) => i.product_id));
			setProducts(fetchedProds);
		};
		load();
	}, [id]);
	const itemsWithDetails = products.map((p) => {
		const itemData = items.find((i) => i.product_id === p.id) || {};
		const unit = itemData.unit || detectProductUnit(p);
		const qty = itemData.quantity || 1;
		return {
			...p,
			itemQty: qty,
			itemUnit: unit,
			location: itemData.installation_location,
			delivery: itemData.delivery_preference,
			installation: itemData.installation_required,
			notes: itemData.project_notes
		};
	});
	const targetWa = settings?.sales_whatsapp || "2348035186355";
	const message = [
		`Hello SOLIDAS TILES AND MARBLE NIG. LIMITED,`,
		`I'd like to inquire about this Project Collection: ${collection?.name || "Collection"} ${collection?.version > 1 ? `(v${collection.version})` : ""}`,
		`Shared Link: ${typeof window !== "undefined" ? window.location.href : ""}`,
		"",
		"Selected Products:",
		...itemsWithDetails.map((p, idx) => `${idx + 1}. ${p.name} (Code: ${p.code}) — ${p.itemQty} ${p.itemUnit}`)
	].join("\n");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between border-b border-border pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-2 text-xs font-bold text-[#1E82A6] hover:text-[#166480] bg-white border border-border px-3.5 py-1.5 rounded-lg shadow-2xs hover:border-[#1E82A6] transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back to Showroom Home" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl font-bold text-foreground",
							children: collection?.name || "Shared Project Collection"
						}),
						collection?.reference_number && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-md bg-white text-[#1E82A6] text-xs font-mono font-bold px-2.5 py-1 border border-border",
							children: collection.reference_number
						}),
						collection?.version && collection.version > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-[#1E82A6]/10 text-[#1E82A6] text-xs font-bold px-2.5 py-0.5 border border-[#1E82A6]/20",
							children: ["v", collection.version]
						}),
						collection?.is_locked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full bg-[#1E82A6]/10 text-[#1E82A6] text-xs font-bold px-2.5 py-0.5 border border-[#1E82A6]/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3" }), " Submitted Request"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						products.length,
						" building material",
						products.length === 1 ? "" : "s",
						" included in this quotation request"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: waLink(targetWa, message),
					target: "_blank",
					rel: "noopener noreferrer",
					className: "inline-flex items-center gap-2 rounded-lg bg-[#C0262D] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9A1B21] transition shrink-0 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), " Inquire on WhatsApp"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: itemsWithDetails.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-white overflow-hidden p-4 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start sm:items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/product/$slug",
								params: { slug: p.slug },
								className: "block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2 border border-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: publicImageUrl(p.generated_studio_image) || publicImageUrl(p.image_url) || "",
									alt: p.name,
									className: "h-full w-full object-cover",
									loading: "lazy"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/product/$slug",
										params: { slug: p.slug },
										className: "block truncate font-bold text-base hover:text-[#1E82A6]",
										children: p.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground font-mono",
										children: ["Code · ", p.code]
									}),
									p.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-[#1E82A6] font-bold mt-0.5",
										children: ["Location: ", p.location]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm font-bold text-foreground",
									children: ["₦", Number(p.price).toLocaleString()]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-block mt-1 rounded-full bg-[#1E82A6]/10 text-[#1E82A6] text-xs font-bold px-2.5 py-0.5",
									children: [
										p.itemQty,
										" ",
										p.itemUnit
									]
								})]
							})
						]
					}), (p.delivery || p.installation || p.notes) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 pt-3 border-t border-border text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted-foreground",
						children: [
							p.delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-foreground",
									children: "Delivery:"
								}),
								" ",
								p.delivery
							] }),
							p.installation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-foreground",
									children: "Installation:"
								}),
								" ",
								p.installation
							] }),
							p.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: "Notes:"
									}),
									" ",
									p.notes
								]
							})
						]
					})]
				}, p.id))
			})
		]
	});
}
export { SharedCollection as component };
