import { i as __toESM } from "../_runtime.mjs";
import { D as relatedQuery, H as getCanonicalProductPath, W as getCanonicalProductUrl, i as AppShell, r as Route$14, z as publicImageUrl } from "./router-DWif86SF.mjs";
import { i as useFavorites, n as ProductCard, t as AddToCollectionButton } from "./ProductCard-BW0_yIhM.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { c as require_jsx_runtime, i as useSuspenseQuery, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Tt as ChevronLeft, i as X, n as ZoomIn, nt as Heart, t as ZoomOut, wt as ChevronRight } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/product._slug-D-d8qvzH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductPage() {
	const { product, origin, taxonomy } = Route$14.useLoaderData();
	const { data: related = [] } = useSuspenseQuery(relatedQuery(product.family_id, product.id, product.category_id));
	const { user } = useAuth();
	const { isFavorite, toggleFavorite } = useFavorites();
	const isFav = isFavorite(product.id);
	const [recommendations, setRecommendations] = (0, import_react.useState)([]);
	const [activeImgIndex, setActiveImgIndex] = (0, import_react.useState)(0);
	const [lightboxImg, setLightboxImg] = (0, import_react.useState)(null);
	const [lightboxScale, setLightboxScale] = (0, import_react.useState)(1);
	const studio = publicImageUrl(product.generated_studio_image) || publicImageUrl(product.image_url);
	const installed = publicImageUrl(product.generated_installed_image) || publicImageUrl(product.image_url);
	const galleryImages = (0, import_react.useMemo)(() => {
		return [studio, installed].filter(Boolean);
	}, [studio, installed]);
	(0, import_react.useEffect)(() => {
		if (!product?.id) return;
		if (user?.id) {
			const trackEvent = async () => {
				const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).maybeSingle();
				if (!profile?.id) return;
				await supabase.from("customer_activity").insert({
					user_id: profile.id,
					activity_type: "product_viewed",
					metadata: {
						productId: product.id,
						name: product.name,
						category: product.category || "Uncategorized"
					}
				});
			};
			trackEvent();
		}
		const loadRecs = async () => {
			const { data } = await supabase.from("products").select("*").eq("processing_state", "completed").eq("status", "published").eq("hidden", false).is("deleted_at", null).neq("id", product.id).limit(4);
			setRecommendations(data || []);
		};
		loadRecs();
	}, [product?.id, user?.id]);
	const handleToggleFavorite = () => {
		toggleFavorite(product.id, product);
	};
	const breadcrumbs = (0, import_react.useMemo)(() => {
		const list = [{
			label: "Home",
			path: "/"
		}];
		if (taxonomy.type) {
			list.push({
				label: taxonomy.type.name,
				path: `/${taxonomy.type.slug}`
			});
			if (taxonomy.category) {
				list.push({
					label: taxonomy.category.name,
					path: `/${taxonomy.type.slug}/${taxonomy.category.slug}`
				});
				if (taxonomy.subcategory) {
					list.push({
						label: taxonomy.subcategory.name,
						path: `/${taxonomy.type.slug}/${taxonomy.category.slug}/${taxonomy.subcategory.slug}`
					});
					if (taxonomy.family) list.push({
						label: taxonomy.family.name,
						path: `/${taxonomy.type.slug}/${taxonomy.category.slug}/${taxonomy.subcategory.slug}/${taxonomy.family.slug}`
					});
				}
			}
		}
		list.push({
			label: product.name,
			path: getCanonicalProductPath(product)
		});
		return list;
	}, [taxonomy, product]);
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
	const canonicalProductUrl = getCanonicalProductUrl(product, origin);
	const dimension = (product?.size || taxonomy?.subcategory?.name || "")?.trim();
	const specSummary = [
		dimension ? `size ${dimension}` : "",
		product?.material ? `${product.material} material` : "",
		product?.color ? `${product.color} colour` : "",
		product?.finish ? `${product.finish} finish` : ""
	].filter(Boolean);
	const differentiatedDescription = product.seo_description || product.generated_description || `Buy ${product.name}${product.code ? ` (Code: ${product.code})` : ""}${specSummary.length ? ` featuring ${specSummary.join(", ")}` : ""} from SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei-Dei, Abuja. ${product.short_description || ""}`.trim();
	const productSchema = {
		"@context": "https://schema.org",
		"@type": "Product",
		"name": product.code ? `${product.name} (${product.code})` : product.name,
		"image": galleryImages.map((img) => ({
			"@type": "ImageObject",
			"url": img,
			"name": product.alt_text || `${product.name}${product.code ? ` (${product.code})` : ""}`,
			"caption": differentiatedDescription
		})),
		"description": differentiatedDescription,
		"sku": product.code || product.id,
		"mpn": product.code || product.id,
		"brand": {
			"@type": "Brand",
			"name": product.brand || "SOLIDAS"
		},
		"material": product.material || void 0,
		"color": product.color || void 0,
		"category": taxonomy.subcategory?.name ? `${taxonomy.category?.name || "Material"} > ${taxonomy.subcategory.name}` : taxonomy.category?.name || "Material",
		"offers": {
			"@type": "Offer",
			"url": canonicalProductUrl,
			"priceCurrency": "NGN",
			"price": product.price || 0,
			"priceValidUntil": "2027-12-31",
			"availability": "https://schema.org/InStock",
			"itemCondition": "https://schema.org/NewCondition",
			"seller": {
				"@type": "Organization",
				"name": "SOLIDAS TILES AND MARBLE NIG. LIMITED",
				"url": origin
			}
		}
	};
	const faqSchema = product.faq && Array.isArray(product.faq) ? {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": product.faq.map((f) => ({
			"@type": "Question",
			"name": f.question || f.q || "",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": f.answer || f.a || ""
			}
		}))
	} : null;
	const handleLightboxNav = (dir) => {
		const idx = galleryImages.indexOf(lightboxImg || "");
		if (idx === -1) return;
		if (dir === "prev") {
			const nextIdx = (idx - 1 + galleryImages.length) % galleryImages.length;
			setLightboxImg(galleryImages[nextIdx]);
		} else {
			const nextIdx = (idx + 1) % galleryImages.length;
			setLightboxImg(galleryImages[nextIdx]);
		}
		setLightboxScale(1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: JSON.stringify(breadcrumbSchema) }
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: JSON.stringify(productSchema) }
		}),
		faqSchema && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: JSON.stringify(faqSchema) }
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-app pt-2 pb-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex items-center gap-1.5 overflow-x-auto pb-3 text-[10px] uppercase tracking-wider text-muted-foreground scrollbar-none",
					children: breadcrumbs.map((b, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5 shrink-0",
						children: [index > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground/30",
							children: "/"
						}), index === breadcrumbs.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-foreground truncate max-w-[120px]",
							children: b.label
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: b.path,
							className: "hover:text-primary transition",
							children: b.label
						})]
					}, index))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm aspect-square flex items-center justify-center",
						children: galleryImages[activeImgIndex] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: galleryImages[activeImgIndex],
							alt: product.name,
							onClick: () => setLightboxImg(galleryImages[activeImgIndex]),
							className: "w-full h-full object-cover cursor-zoom-in hover:scale-[1.01] transition-transform duration-300"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground italic",
							children: "No image assets"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between aspect-square",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 overflow-hidden",
							children: installed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: installed,
								alt: `${product.name} installed scene`,
								loading: "lazy",
								onClick: () => setLightboxImg(installed),
								className: "w-full h-full object-cover cursor-zoom-in hover:scale-[1.01] transition-transform duration-300"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground italic flex h-full items-center justify-center bg-muted/20",
								children: "No installed preview uploaded"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-border px-3.5 py-2 text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold bg-background shrink-0",
							children: "Installed reference / lifestyle layout"
						})]
					})]
				}),
				galleryImages.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2.5 mt-3 overflow-x-auto pb-1 scrollbar-none",
					children: galleryImages.map((imgUrl, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveImgIndex(i),
						className: `h-14 w-14 rounded-lg border overflow-hidden shrink-0 transition bg-card ${activeImgIndex === i ? "border-primary shadow-sm" : "border-border hover:border-primary/45"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: imgUrl,
							alt: "thumbnail",
							className: "h-full w-full object-cover"
						})
					}, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-mono uppercase tracking-[0.18em] text-primary font-bold",
								children: [
									product.brand || "SOLIDAS",
									" · Code ",
									product.code
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight uppercase",
								children: product.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1.5 font-display text-2xl font-bold text-primary",
								children: [
									"₦",
									Number(product.price).toLocaleString(),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1 text-sm font-normal text-muted-foreground",
										children: "/sqm"
									})
								]
							})
						] }),
						product.short_description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border/80 bg-card p-4 text-xs leading-relaxed text-muted-foreground max-w-prose shadow-sm",
							children: product.short_description
						}),
						product.faq && Array.isArray(product.faq) && product.faq.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border/80 bg-card p-4 text-xs space-y-3 max-w-prose shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-sm font-semibold uppercase tracking-wider text-foreground border-b border-border/40 pb-2",
								children: "Frequently Asked Questions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-4",
								children: product.faq.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "font-semibold text-xs text-foreground flex gap-1.5 items-start",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-primary font-bold",
											children: "Q:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f.question || f.q })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "pl-4 text-xs text-muted-foreground leading-relaxed",
										children: f.answer || f.a
									})]
								}, i))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs max-w-xl",
							children: [taxonomy.subcategory?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-primary/20 bg-primary/5 p-3 shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[9px] font-bold uppercase tracking-wider text-primary",
									children: "Subcategory"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 font-semibold text-foreground text-xs",
									children: taxonomy.subcategory.name
								})]
							}), [
								["Color", product.color],
								["Material", product.material],
								["Finish", product.finish]
							].map(([k, v]) => v ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-card p-3 shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[9px] font-bold uppercase tracking-wider text-muted-foreground",
									children: k
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 font-semibold text-foreground text-xs",
									children: v
								})]
							}, k) : null)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2.5 max-w-md pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToCollectionButton, {
								productId: product.id,
								className: "flex flex-1 items-center justify-center gap-2 rounded bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handleToggleFavorite,
								className: `rounded px-5 py-3 border text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${isFav ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `h-4 w-4 text-red-500 hover:text-red-600 ${isFav ? "fill-red-500" : ""}` }), isFav ? "Saved" : "Favorite"]
							})]
						})
					]
				}),
				related.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-12 border-t border-border/50 pt-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-[10px] font-bold uppercase tracking-[0.18em] text-primary",
							children: "From the same design family"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg font-extrabold text-foreground uppercase tracking-tight",
							children: "Related materials"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
							children: related.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
						})
					]
				}),
				recommendations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-12 border-t border-border pt-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-[10px] font-bold uppercase tracking-[0.18em] text-primary",
							children: "Tailored for your design style"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg font-extrabold text-foreground uppercase tracking-tight",
							children: "Recommended for you"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
							children: recommendations.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
						})
					]
				})
			]
		}),
		lightboxImg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 transition-all",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					onClick: () => setLightboxImg(null)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 flex flex-col items-center max-w-4xl max-h-[85vh] px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden flex items-center justify-center bg-zinc-900 rounded-lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: lightboxImg,
								alt: "Fullscreen view",
								style: { transform: `scale(${lightboxScale})` },
								className: "max-w-full max-h-[75vh] object-contain transition-transform duration-250 ease-out"
							})
						}),
						lightboxScale !== 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute bottom-20 bg-black/55 text-white text-[9px] px-2 py-0.5 rounded font-mono",
							children: [
								"Zoom: ",
								Math.round(lightboxScale * 100),
								"%"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-center gap-6 text-white bg-black/45 p-2 rounded-full border border-white/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => handleLightboxNav("prev"),
									className: "p-2 rounded-full hover:bg-white/15 transition",
									"aria-label": "Previous image",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setLightboxScale((s) => Math.min(s + .25, 3)),
											className: "p-1.5 rounded hover:bg-white/15 transition flex items-center gap-1 text-[10px] font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "h-4 w-4" }), " Zoom In"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setLightboxScale((s) => Math.max(s - .25, .75)),
											className: "p-1.5 rounded hover:bg-white/15 transition flex items-center gap-1 text-[10px] font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { className: "h-4 w-4" }), " Zoom Out"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setLightboxScale(1),
											className: "p-1.5 rounded hover:bg-white/15 transition text-[10px] font-semibold",
											children: "Reset"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => handleLightboxNav("next"),
									className: "p-2 rounded-full hover:bg-white/15 transition",
									"aria-label": "Next image",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5" })
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setLightboxImg(null),
					className: "absolute top-4 right-4 z-20 rounded-full p-2 bg-white/15 text-white hover:bg-white/25 transition",
					"aria-label": "Close fullscreen gallery",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})
			]
		})
	] });
}
export { ProductPage as component };
