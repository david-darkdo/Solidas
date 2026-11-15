import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as detectProductUnit, d as fetchProductsByIds, g as getUserCollectionHistory, i as AppShell, l as duplicateCollection, z as publicImageUrl } from "./router-DWif86SF.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Ct as ChevronUp, Et as ChevronDown, F as RefreshCw, J as Lock, Ot as Calendar, Rt as ArrowLeft, Z as Layers, st as FileText } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/my-collections-B55lsn4w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MyCollectionsHistoryPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [historyCollections, setHistoryCollections] = (0, import_react.useState)([]);
	const [collectionItemsMap, setCollectionItemsMap] = (0, import_react.useState)({});
	const [productsMap, setProductsMap] = (0, import_react.useState)({});
	const [expandedMap, setExpandedMap] = (0, import_react.useState)({});
	const [busy, setBusy] = (0, import_react.useState)(true);
	const [duplicatingId, setDuplicatingId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const load = async () => {
			if (!user) {
				setBusy(false);
				return;
			}
			setBusy(true);
			const cols = await getUserCollectionHistory(user.id);
			setHistoryCollections(cols);
			if (cols.length > 0) {
				const colIds = cols.map((c) => c.id);
				const { data: rawItems } = await supabase.from("collection_items").select("*").in("collection_id", colIds);
				const itemsByCol = {};
				const allProductIds = /* @__PURE__ */ new Set();
				(rawItems || []).forEach((item) => {
					if (!itemsByCol[item.collection_id]) itemsByCol[item.collection_id] = [];
					itemsByCol[item.collection_id].push(item);
					allProductIds.add(item.product_id);
				});
				setCollectionItemsMap(itemsByCol);
				const prods = await fetchProductsByIds(Array.from(allProductIds));
				const pMap = {};
				prods.forEach((p) => {
					pMap[p.id] = p;
				});
				const colProdsMap = {};
				Object.entries(itemsByCol).forEach(([cId, cItems]) => {
					colProdsMap[cId] = cItems.map((ci) => ({
						...pMap[ci.product_id] || {},
						quantity: ci.quantity || 1,
						unit: ci.unit || detectProductUnit(pMap[ci.product_id]),
						location: ci.installation_location,
						delivery: ci.delivery_preference,
						installation: ci.installation_required,
						notes: ci.project_notes
					}));
				});
				setProductsMap(colProdsMap);
			}
			setBusy(false);
		};
		if (!loading) load();
	}, [user, loading]);
	const toggleExpand = (colId) => {
		setExpandedMap((prev) => ({
			...prev,
			[colId]: !prev[colId]
		}));
	};
	const handleCreateUpdatedRequest = async (colId) => {
		if (!user) return;
		setDuplicatingId(colId);
		try {
			await duplicateCollection(user.id, colId);
			toast.success("Updated request draft created in Active Workspace!");
			navigate({ to: "/collection" });
		} catch (err) {
			toast.error("Failed to duplicate collection into active draft.");
		} finally {
			setDuplicatingId(null);
		}
	};
	if (loading || busy) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-10 text-sm text-muted-foreground",
		children: "Loading SOLIDAS collection history…"
	}) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-12 max-w-md text-center space-y-4 mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-10 w-10 text-[#1E82A6] mx-auto" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-bold text-foreground",
				children: "Sign In to View Collection History"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Your submitted project quotation requests are saved to your account history as permanent immutable records."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/auth",
				search: {
					redirectTo: "/my-collections",
					autoPush: false
				},
				className: "inline-block rounded-lg bg-[#C0262D] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#9A1B21] transition shadow-sm",
				children: "Sign In to SOLIDAS"
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/account",
						className: "text-muted-foreground hover:text-foreground text-xs font-bold flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Back to Account"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground mt-1",
					children: "SOLIDAS Collection History"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: "Permanent immutable record of your submitted project quotation requests to SOLIDAS TILES AND MARBLE NIG. LIMITED."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/collection",
				className: "inline-flex items-center gap-2 rounded-lg bg-[#1E82A6] px-4 py-2 text-xs font-bold text-white hover:bg-[#166481] transition shrink-0 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4" }), " Go to Active Workspace"]
			})]
		}), historyCollections.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-dashed border-border bg-white p-10 text-center space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-10 w-10 text-muted-foreground/40 mx-auto" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-bold text-base text-foreground",
					children: "No Submitted Quotation Requests Yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground max-w-md mx-auto",
					children: "When you submit a building material collection via Push to WhatsApp, a permanent record will be stored here."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/collection",
					className: "inline-block rounded-lg bg-[#C0262D] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#9A1B21] transition shadow-sm",
					children: "Open Active Project Workspace"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: historyCollections.map((col) => {
				const prods = productsMap[col.id] || [];
				const isDuplicating = duplicatingId === col.id;
				const isExpanded = Boolean(expandedMap[col.id]);
				let totalVal = 0;
				prods.forEach((p) => {
					totalVal += Number(p.price || 0) * Number(p.quantity || 1);
				});
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-white overflow-hidden shadow-xs hover:border-[#1E82A6]/40 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-base font-bold text-foreground",
										children: col.name || "Project Request"
									}),
									col.reference_number && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-md bg-surface-2 text-[#1E82A6] text-xs font-mono font-bold px-2.5 py-0.5 border border-border",
										children: col.reference_number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-full bg-[#1E82A6]/10 text-[#1E82A6] text-xs font-bold px-2 py-0.5 border border-[#1E82A6]/20",
										children: ["v", col.version || 1]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded-full bg-[#1E82A6]/10 text-[#1E82A6] text-xs font-bold px-2 py-0.5 border border-[#1E82A6]/20",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3" }), " Immutable Record"]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5 text-[#1E82A6]" }),
											"Submitted on ",
											new Date(col.submitted_at || col.created_at).toLocaleDateString(void 0, {
												year: "numeric",
												month: "short",
												day: "numeric"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"• ",
										prods.length,
										" Materials"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["• Est. Total: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										className: "text-foreground font-bold",
										children: ["₦", totalVal.toLocaleString()]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["• Status: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground font-bold",
										children: col.status || "Submitted"
									})] })
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => toggleExpand(col.id),
								className: "inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border bg-white hover:bg-surface-2 transition",
								children: [isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isExpanded ? "Hide Details" : `View Products (${prods.length})` })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => handleCreateUpdatedRequest(col.id),
								disabled: isDuplicating,
								className: "inline-flex items-center gap-2 rounded-lg bg-[#C0262D] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A1B21] transition shadow-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${isDuplicating ? "animate-spin" : ""}` }), "Duplicate to Active Workspace"]
							})]
						})]
					}), isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border bg-surface-2 p-4 sm:p-5 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs font-bold uppercase tracking-wider text-[#1E82A6] flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Materials Breakdown (",
								prods.length,
								")"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Est. Total: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								className: "text-foreground",
								children: ["₦", totalVal.toLocaleString()]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
							children: prods.map((p, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-white p-3 flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: publicImageUrl(p.generated_studio_image) || publicImageUrl(p.image_url) || "",
									alt: p.name,
									className: "h-12 w-12 rounded-md object-cover bg-surface-2 border border-border shrink-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 text-xs space-y-0.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-foreground truncate",
											children: p.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-muted-foreground",
											children: [
												"Code: ",
												p.code,
												" — ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#1E82A6] font-bold",
													children: [
														p.quantity,
														" ",
														p.unit
													]
												})
											]
										}),
										p.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-muted-foreground truncate",
											children: ["Loc: ", p.location]
										}),
										p.delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-muted-foreground truncate",
											children: ["Delivery: ", p.delivery]
										}),
										p.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-muted-foreground italic truncate",
											children: ["Notes: ", p.notes]
										})
									]
								})]
							}, `${col.id}-${p.id || idx}`))
						})]
					})]
				}, col.id);
			})
		})]
	}) });
}
export { MyCollectionsHistoryPage as component };
