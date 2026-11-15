import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { C as setGuestCollection, E as updateUserItemRequirements, T as updateGuestItemRequirements, _ as getUserItemRequirements, b as removeGuestItem, c as detectProductUnit, d as fetchProductsByIds, f as generateCollectionReference, h as getGuestCollection, m as getCachedUserCollectionItems, p as getBatchCollectionWorkspaceData, u as ensureUserCollection, v as lockAndSubmitCollection, w as updateCustomerPhoneNumber, x as removeItemFromUserCollection, y as mergeGuestIntoUser, z as publicImageUrl } from "./router-DWif86SF.mjs";
import { i as waLink, r as useAppSettings } from "./settings-AvHwlRqF.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { S as useSearch, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Ct as ChevronUp, D as Share2, Et as ChevronDown, R as Phone, St as CircleAlert, W as MessageCircle, Z as Layers, bt as CircleCheck, p as Trash2, tt as History } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/collection-BbmID2k-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CollectionPage() {
	const { user, loading } = useAuth();
	const search = useSearch({ from: "/collection" });
	useNavigate();
	const { data: settings } = useAppSettings();
	const [items, setItems] = (0, import_react.useState)([]);
	const [products, setProducts] = (0, import_react.useState)([]);
	const [collectionId, setCollectionId] = (0, import_react.useState)(null);
	const [collectionData, setCollectionData] = (0, import_react.useState)(null);
	const [userProfile, setUserProfile] = (0, import_react.useState)(null);
	const [refreshKey, setRefreshKey] = (0, import_react.useState)(0);
	const [justSubmitted, setJustSubmitted] = (0, import_react.useState)(false);
	const [lastSubmittedRef, setLastSubmittedRef] = (0, import_react.useState)(null);
	const [activeView, setActiveView] = (0, import_react.useState)("collection");
	const [favoriteProducts, setFavoriteProducts] = (0, import_react.useState)([]);
	const [requirementsMap, setRequirementsMap] = (0, import_react.useState)({});
	const [expandedMap, setExpandedMap] = (0, import_react.useState)({});
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	const [showPhoneModal, setShowPhoneModal] = (0, import_react.useState)(false);
	const [phoneInput, setPhoneInput] = (0, import_react.useState)("");
	const [whatsappFallbackUrl, setWhatsappFallbackUrl] = (0, import_react.useState)(null);
	const [productToRemove, setProductToRemove] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const load = async () => {
			if (user) {
				const cached = getCachedUserCollectionItems(user.id);
				if (cached.items && cached.items.length > 0) {
					setCollectionId(cached.collection_id || null);
					setItems(cached.items);
					fetchProductsByIds(cached.items.map((i) => i.product_id)).then((cachedProds) => {
						if (cachedProds.length > 0) setProducts(cachedProds);
					});
				}
				if (getGuestCollection().length > 0) await mergeGuestIntoUser(user.id);
				const batch = await getBatchCollectionWorkspaceData(user.id);
				setUserProfile(batch.profile);
				setCollectionId(batch.collectionId);
				setItems(batch.items);
				if (batch.collectionData) setCollectionData({
					id: batch.collectionData.id,
					user_id: batch.collectionData.user_id,
					name: batch.collectionData.name || "Project Workspace",
					reference_number: batch.collectionData.reference_number || generateCollectionReference(batch.collectionData.id),
					project_name: batch.collectionData.project_name || null,
					status: batch.collectionData.status || "Draft",
					is_locked: batch.collectionData.is_locked ?? false,
					parent_collection_id: batch.collectionData.parent_collection_id || null,
					version: batch.collectionData.version || 1,
					submitted_at: batch.collectionData.submitted_at || null,
					created_at: batch.collectionData.created_at,
					updated_at: batch.collectionData.updated_at
				});
				setProducts(batch.products);
				const savedUserReqs = getUserItemRequirements(user.id);
				const reqMap = {};
				batch.items.forEach((ci) => {
					const matchingProd = batch.products.find((p) => p.id === ci.product_id);
					const autoUnit = detectProductUnit(matchingProd);
					const savedReq = savedUserReqs[ci.product_id] || {};
					reqMap[ci.product_id] = {
						quantity: ci.quantity ?? savedReq.quantity ?? 1,
						unit: ci.unit || savedReq.unit || autoUnit,
						installation_location: ci.installation_location || savedReq.installation_location || "",
						delivery_preference: ci.delivery_preference || savedReq.delivery_preference || "Deliver to Site",
						installation_required: ci.installation_required || savedReq.installation_required || "Not Sure",
						project_notes: ci.project_notes || savedReq.project_notes || ""
					};
				});
				setRequirementsMap(reqMap);
			} else {
				const guest = getGuestCollection();
				setItems(guest);
				setCollectionId(null);
				setCollectionData(null);
				setUserProfile(null);
				const prods = await fetchProductsByIds(guest.map((g) => g.product_id));
				setProducts(prods);
				const reqMap = {};
				guest.forEach((gi) => {
					const matchingProd = prods.find((p) => p.id === gi.product_id);
					const autoUnit = detectProductUnit(matchingProd);
					reqMap[gi.product_id] = {
						quantity: gi.quantity ?? 1,
						unit: gi.unit || autoUnit,
						installation_location: gi.installation_location || "",
						delivery_preference: gi.delivery_preference || "Deliver to Site",
						installation_required: gi.installation_required || "Not Sure",
						project_notes: gi.project_notes || ""
					};
				});
				setRequirementsMap(reqMap);
			}
		};
		if (!loading) load();
	}, [
		user,
		loading,
		refreshKey
	]);
	(0, import_react.useEffect)(() => {
		if (search.autoPush && !loading && items.length > 0 && settings?.sales_whatsapp) {
			const timer = setTimeout(() => {
				handlePushToWhatsAppClick();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [
		search.autoPush,
		loading,
		items.length,
		settings
	]);
	const handleRequirementChange = (productId, patch) => {
		setRequirementsMap((prev) => {
			const updated = {
				...prev[productId] || {},
				...patch
			};
			if (user) updateUserItemRequirements(user.id, productId, updated);
			else updateGuestItemRequirements(productId, updated);
			return {
				...prev,
				[productId]: updated
			};
		});
	};
	const toggleExpand = (productId) => {
		setExpandedMap((prev) => ({
			...prev,
			[productId]: !prev[productId]
		}));
	};
	const promptRemoveProduct = (product) => {
		setProductToRemove(product);
	};
	const confirmRemoveProduct = async () => {
		if (!productToRemove) return;
		const productId = productToRemove.id;
		setProducts((prev) => prev.filter((p) => p.id !== productId));
		setItems((prev) => prev.filter((i) => i.product_id !== productId));
		if (user) await removeItemFromUserCollection(user.id, productId);
		else removeGuestItem(productId);
		setProductToRemove(null);
		toast.success("Item removed from collection");
	};
	const summaryMetrics = (0, import_react.useMemo)(() => {
		const activeProducts = activeView === "collection" ? products : favoriteProducts;
		let totalPieces = 0;
		let totalSqM = 0;
		let totalPrice = 0;
		let installerRequestedCount = 0;
		let deliveryItemsCount = 0;
		activeProducts.forEach((p) => {
			const req = requirementsMap[p.id] || {};
			const qty = req.quantity || 1;
			const unit = req.unit || detectProductUnit(p);
			const price = Number(p.price || 0);
			if (unit === "m²") totalSqM += qty;
			else totalPieces += qty;
			totalPrice += price * qty;
			if (req.installation_required && req.installation_required !== "Not Sure" && req.installation_required !== "No, Supply Only") installerRequestedCount++;
			if (req.delivery_preference && req.delivery_preference !== "Self Pickup") deliveryItemsCount++;
		});
		const qtyParts = [];
		if (totalSqM > 0) qtyParts.push(`${totalSqM.toLocaleString()} m²`);
		if (totalPieces > 0) qtyParts.push(`${totalPieces.toLocaleString()} Pcs`);
		const totalQtyString = qtyParts.join(" + ") || "0 Items";
		return {
			totalPieces,
			totalSqM,
			totalPriceFormatted: `₦${totalPrice.toLocaleString()}`,
			totalQtyString,
			installerRequestedCount,
			deliveryItemsCount,
			itemCount: activeProducts.length
		};
	}, [
		products,
		favoriteProducts,
		activeView,
		requirementsMap
	]);
	const handlePushToWhatsAppClick = async () => {
		if (!(userProfile?.phone_number || user?.phone || user?.user_metadata?.phone) && user) {
			setShowPhoneModal(true);
			return;
		}
		await executePushToWhatsApp();
	};
	const handlePhoneSubmit = async (e) => {
		e.preventDefault();
		if (!phoneInput.trim()) {
			toast.error("Please enter a valid phone number");
			return;
		}
		if (user) {
			await updateCustomerPhoneNumber(user.id, phoneInput.trim());
			setUserProfile((prev) => ({
				...prev || {},
				phone_number: phoneInput.trim()
			}));
		}
		setShowPhoneModal(false);
		toast.success("Phone number saved to profile");
		await executePushToWhatsApp();
	};
	const executePushToWhatsApp = async () => {
		if (!settings?.sales_whatsapp) {
			toast.error("Sales WhatsApp not configured");
			return;
		}
		const activeItems = activeView === "collection" ? products : favoriteProducts;
		let id = collectionId || (user ? getCachedUserCollectionItems(user.id).collection_id : "");
		const refNum = collectionData?.reference_number || generateCollectionReference(id || void 0);
		const versionStr = collectionData?.version && collectionData.version > 1 ? ` (v${collectionData.version})` : "";
		const shareUrl = id ? `${window.location.origin}/collection/${id}` : `${window.location.origin}/collection`;
		const messageParts = [
			"Hello SOLIDAS,",
			"",
			"I would like a quotation for my project.",
			"",
			`Collection Reference:`,
			`*${refNum}${versionStr}*`,
			"",
			`Collection Link:`,
			`${shareUrl}`,
			"",
			`*SELECTED PRODUCTS (${activeItems.length}):*`
		];
		activeItems.forEach((p, idx) => {
			const req = requirementsMap[p.id] || {};
			const qty = req.quantity || 1;
			const unit = req.unit || detectProductUnit(p);
			const loc = req.installation_location ? ` | Loc: ${req.installation_location}` : "";
			const del = req.delivery_preference ? ` | Delivery: ${req.delivery_preference}` : "";
			const inst = req.installation_required && req.installation_required !== "Not Sure" ? ` | Install: ${req.installation_required}` : "";
			const notes = req.project_notes ? ` | Notes: ${req.project_notes}` : "";
			messageParts.push(`${idx + 1}. *${p.name}* (Code: ${p.code}) — ${qty} ${unit}${loc}${del}${inst}${notes}`);
		});
		messageParts.push("", `*PROJECT SUMMARY:*`, `Total Est. Quantity: ${summaryMetrics.totalQtyString}`, `Total Est. Value: ${summaryMetrics.totalPriceFormatted}`, `Delivery Items: ${summaryMetrics.deliveryItemsCount}`, `Installer Service Requested: ${summaryMetrics.installerRequestedCount > 0 ? "Yes" : "No"}`);
		const msg = messageParts.join("\n");
		const url = waLink(settings.sales_whatsapp, msg);
		const win = window.open(url, "_blank", "noopener,noreferrer");
		if (!win || win.closed || typeof win.closed === "undefined") {
			setWhatsappFallbackUrl(url);
			toast("Quotation ready! Click the green button below to launch WhatsApp.");
		} else toast.success("Quotation request submitted & saved to History!");
		setGuestCollection([]);
		setItems([]);
		setProducts([]);
		setJustSubmitted(true);
		setLastSubmittedRef(refNum);
		setCollectionId(null);
		setCollectionData(null);
		(async () => {
			let targetId = id;
			if (!targetId && user) targetId = await ensureUserCollection(user.id);
			if (targetId) {
				await lockAndSubmitCollection(targetId, user?.id);
				if (user) try {
					await supabase.from("whatsapp_inquiries").insert({
						collection_id: targetId,
						customer_name: user.user_metadata?.full_name || user.email || "Customer",
						customer_phone: userProfile?.phone_number || user.phone || user.user_metadata?.phone || "",
						customer_email: user.email ?? null,
						whatsapp_number: userProfile?.phone_number || user.user_metadata?.whatsapp || user.phone || null,
						inquiry_status: "NEW",
						status: "pending"
					});
				} catch {}
			}
		})();
	};
	const shareLink = async () => {
		let id = collectionId;
		if (!id && user) id = await ensureUserCollection(user.id);
		if (!id) {
			toast("Sign in to share your collection by link");
			return;
		}
		const url = `${window.location.origin}/collection/${id}`;
		await navigator.clipboard.writeText(url);
		toast.success("Link copied to clipboard");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl font-semibold",
							children: "Active Project Workspace"
						}),
						collectionData?.reference_number && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-md bg-card text-foreground text-xs font-mono font-bold px-2.5 py-1 border border-border",
							children: collectionData.reference_number
						}),
						collectionData?.version && collectionData.version > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 border border-primary/20",
							children: ["v", collectionData.version]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1",
					children: "Build your custom project bill of quantities, set specifications, and push directly to WhatsApp for rapid pricing."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/my-collections",
						className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Collection History" })]
					}), collectionId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: shareLink,
						className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Share Link" })]
					})]
				})]
			}),
			justSubmitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4 max-w-lg mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-bold text-foreground",
								children: "Quotation Request Submitted!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: ["Reference: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "font-mono text-foreground",
									children: lastSubmittedRef
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground pt-1",
								children: "Your quotation request was saved to your permanent Collection History. Your active project workspace is now reset and ready for your next project quotation."
							})
						]
					}),
					whatsappFallbackUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: whatsappFallbackUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), "Launch WhatsApp Now"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-4 flex flex-wrap items-center justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setJustSubmitted(false);
								setLastSubmittedRef(null);
								setWhatsappFallbackUrl(null);
							},
							className: "rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition",
							children: "Start New Project Workspace"
						}), user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/my-collections",
							className: "rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-2 transition",
							children: "View Collection History"
						})]
					})
				]
			}) : products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-dashed border-border p-12 text-center space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-12 w-12 text-muted-foreground/30 mx-auto" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg font-semibold text-foreground",
							children: "No Active Project Workspace"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground max-w-sm mx-auto",
							children: "Explore our luxury surface catalogue and save products to build your project quotation."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-center gap-3 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition shadow-sm",
							children: "Browse Catalogue"
						}), user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/my-collections",
							className: "inline-block rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-2 transition",
							children: "View Collection History"
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b border-border pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
							children: [
								"Selected Products (",
								products.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: ["Est. Value: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground font-medium",
								children: summaryMetrics.totalPriceFormatted
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: products.map((product) => {
							const req = requirementsMap[product.id] || {};
							const isExpanded = Boolean(expandedMap[product.id]);
							const qty = req.quantity || 1;
							const unit = req.unit || detectProductUnit(product);
							const itemTotal = Number(product.price || 0) * qty;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/30 transition",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 flex items-start gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: publicImageUrl(product.generated_studio_image) || publicImageUrl(product.image_url) || "",
											alt: product.name,
											className: "h-20 w-20 rounded-lg object-cover bg-muted border border-border/50 shrink-0"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1 space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/product/$slug",
													params: { slug: product.slug },
													className: "font-semibold text-sm text-foreground hover:text-primary transition line-clamp-1",
													children: product.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground font-mono",
													children: ["Code: ", product.code]
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => promptRemoveProduct(product),
													className: "p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-500/10 transition",
													title: "Remove product",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center gap-3 pt-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center border border-border rounded-lg bg-surface-2 overflow-hidden",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => handleRequirementChange(product.id, { quantity: Math.max(1, qty - 1) }),
																className: "px-2.5 py-1 text-xs font-bold text-foreground hover:bg-card transition",
																children: "-"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "px-3 py-1 text-xs font-semibold font-mono border-x border-border/60 min-w-[2.5rem] text-center",
																children: qty
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => handleRequirementChange(product.id, { quantity: qty + 1 }),
																className: "px-2.5 py-1 text-xs font-bold text-foreground hover:bg-card transition",
																children: "+"
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
														value: unit,
														onChange: (e) => handleRequirementChange(product.id, { unit: e.target.value }),
														className: "rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium focus:outline-none",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Pieces",
															children: "Pieces"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "m²",
															children: "m²"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-xs font-semibold text-primary ml-auto",
														children: ["₦", itemTotal.toLocaleString()]
													})
												]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "border-t border-border/50 bg-surface-2/40 px-4 py-2 flex items-center justify-between text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => toggleExpand(product.id),
											className: "text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium",
											children: [isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isExpanded ? "Hide Specifications" : "Set Installation & Delivery Specs" })]
										}), (req.installation_location || req.delivery_preference || req.project_notes) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-emerald-600 dark:text-emerald-400 font-medium",
											children: "✓ Specs Configured"
										})]
									}),
									isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border-t border-border/60 bg-surface-2/60 p-4 space-y-3 text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "block text-muted-foreground font-medium mb-1",
													children: "Installation Location (e.g. Living Room Floor)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													placeholder: "e.g. Master Bathroom Wall",
													value: req.installation_location || "",
													onChange: (e) => handleRequirementChange(product.id, { installation_location: e.target.value }),
													className: "w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "block text-muted-foreground font-medium mb-1",
													children: "Delivery Preference"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: req.delivery_preference || "Deliver to Site",
													onChange: (e) => handleRequirementChange(product.id, { delivery_preference: e.target.value }),
													className: "w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Deliver to Site",
														children: "Deliver to Site (Lagos/Nationwide)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Self Pickup",
														children: "Self Pickup from Showroom"
													})]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "block text-muted-foreground font-medium mb-1",
													children: "Installation Service Required?"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: req.installation_required || "Not Sure",
													onChange: (e) => handleRequirementChange(product.id, { installation_required: e.target.value }),
													className: "w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Not Sure",
															children: "Not Sure (Need Advice)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Yes, Full Installation",
															children: "Yes, Full Installation Required"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "No, Supply Only",
															children: "No, Supply Material Only"
														})
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "block text-muted-foreground font-medium mb-1",
													children: "Special Project Notes / Cuts"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													placeholder: "e.g. 60x120cm size, bullnose edge",
													value: req.project_notes || "",
													onChange: (e) => handleRequirementChange(product.id, { project_notes: e.target.value }),
													className: "w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
												})] })
											]
										})
									})
								]
							}, product.id);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-5 space-y-4 sticky top-20 shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-border pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-base font-semibold",
									children: "Quotation Summary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: "Est. summary bill of quantities for WhatsApp submission."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2.5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Selected Products:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: summaryMetrics.itemCount
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Est. Total Quantity:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: summaryMetrics.totalQtyString
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delivery Services:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-foreground",
											children: [summaryMetrics.deliveryItemsCount, " Items Configured"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Installer Services:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: summaryMetrics.installerRequestedCount > 0 ? "Requested" : "None"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "border-t border-border pt-3 flex justify-between items-baseline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-sm text-foreground",
											children: "Est. Total Material Cost:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-lg text-primary",
											children: summaryMetrics.totalPriceFormatted
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handlePushToWhatsAppClick,
								disabled: isSubmitting,
								className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.99] transition shadow-md disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Push Collection to WhatsApp" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground text-center leading-relaxed",
								children: "Submitting saves your project collection to your permanent History record and opens WhatsApp for direct pricing."
							})
						]
					})
				})]
			}),
			showPhoneModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-8 w-8 text-primary mx-auto" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold text-foreground",
								children: "Enter Phone Number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Please provide a phone number so our sales team can attach your quotation to your project account."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handlePhoneSubmit,
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "tel",
							placeholder: "e.g. +234 801 234 5678",
							value: phoneInput,
							onChange: (e) => setPhoneInput(e.target.value),
							autoFocus: true,
							className: "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setShowPhoneModal(false),
								className: "flex-1 rounded-xl border border-border bg-surface-2 py-2 text-xs font-semibold text-foreground hover:bg-card transition",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "flex-1 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition shadow-sm",
								children: "Save & Push to WhatsApp"
							})]
						})]
					})]
				})
			}),
			productToRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-8 w-8 text-red-500 mx-auto" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-bold text-foreground",
								children: "Remove Product?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Are you sure you want to remove ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: productToRemove.name
									}),
									" from your active project workspace?"
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setProductToRemove(null),
							className: "flex-1 rounded-xl border border-border bg-surface-2 py-2.5 text-xs font-semibold text-foreground hover:bg-card transition",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: confirmRemoveProduct,
							className: "flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition shadow-sm",
							children: "Remove"
						})]
					})]
				})
			})
		]
	});
}
export { CollectionPage as component };
