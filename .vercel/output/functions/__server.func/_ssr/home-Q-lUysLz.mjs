import { i as __toESM } from "../_runtime.mjs";
import { i as AppShell } from "./router-DWif86SF.mjs";
import { i as waLink, r as useAppSettings } from "./settings-AvHwlRqF.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Pause, G as MapPin, K as Mail, L as Play, Lt as ArrowRight, Mt as Bookmark, R as Phone, S as Sparkles, T as ShieldCheck, Tt as ChevronLeft, W as MessageCircle, ht as Compass, kt as Building2, o as VolumeX, ot as Film, s as Volume2, u as Tv, wt as ChevronRight } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/home-Q-lUysLz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HomePage() {
	const { data: s } = useAppSettings();
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [heroVideos, setHeroVideos] = (0, import_react.useState)([]);
	const [currentVideoIndex, setCurrentVideoIndex] = (0, import_react.useState)(0);
	const [showcaseVideos, setShowcaseVideos] = (0, import_react.useState)([]);
	const [currentShowcaseIndex, setCurrentShowcaseIndex] = (0, import_react.useState)(0);
	const [showcaseMuted, setShowcaseMuted] = (0, import_react.useState)(true);
	const [showcasePlaying, setShowcasePlaying] = (0, import_react.useState)(true);
	const [touchStart, setTouchStart] = (0, import_react.useState)(null);
	const [touchEnd, setTouchEnd] = (0, import_react.useState)(null);
	const minSwipeDistance = 50;
	(0, import_react.useEffect)(() => {
		const fetchVideos = async () => {
			const { data } = await supabase.from("hero_videos").select("*").eq("is_active", true).order("order_index", { ascending: true });
			if (data && data.length > 0) setHeroVideos(data);
			else setHeroVideos([
				{
					id: "1",
					url: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-39908-large.mp4"
				},
				{
					id: "2",
					url: "https://assets.mixkit.co/videos/preview/mixkit-architectural-model-design-details-39909-large.mp4"
				},
				{
					id: "3",
					url: "https://assets.mixkit.co/videos/preview/mixkit-spinning-architectural-plans-39910-large.mp4"
				}
			]);
		};
		fetchVideos();
	}, []);
	(0, import_react.useEffect)(() => {
		const fetchShowcase = async () => {
			try {
				const { data } = await supabase.from("showcase_videos").select("*").eq("is_active", true).order("order_index", { ascending: true });
				if (data && data.length > 0) setShowcaseVideos(data);
				else setShowcaseVideos([
					{
						id: "sc-1",
						url: "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-apartment-39907-large.mp4",
						title: "Luxury Marble & Porcelain Floor Installation"
					},
					{
						id: "sc-2",
						url: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-39908-large.mp4",
						title: "Imported Security & Architectural Doors Showcase"
					},
					{
						id: "sc-3",
						url: "https://assets.mixkit.co/videos/preview/mixkit-architectural-model-design-details-39909-large.mp4",
						title: "Precision Granite & Wall Cladding Solutions"
					}
				]);
			} catch (err) {
				console.warn("Notice loading showcase videos:", err);
			}
		};
		fetchShowcase();
	}, []);
	const handleShowcaseVideoEnded = () => {
		setCurrentShowcaseIndex((prev) => (prev + 1) % Math.max(1, showcaseVideos.length));
	};
	const handleVideoEnded = () => {
		setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
	};
	const onTouchStart = (e) => {
		setTouchEnd(null);
		setTouchStart(e.targetTouches[0].clientX);
	};
	const onTouchMove = (e) => {
		setTouchEnd(e.targetTouches[0].clientX);
	};
	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return;
		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > minSwipeDistance;
		const isRightSwipe = distance < -50;
		if (isLeftSwipe) setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
		else if (isRightSwipe) setCurrentVideoIndex((prev) => (prev - 1 + heroVideos.length) % heroVideos.length);
	};
	const submit = async (e) => {
		e.preventDefault();
		const targetWa = s?.sales_whatsapp || "2348035186355";
		setBusy(true);
		try {
			const msg = `Hello SOLIDAS! My name is ${name}. Please contact me regarding building materials at ${phone}.`;
			window.open(waLink(targetWa, msg), "_blank", "noopener,noreferrer");
			toast.success("Opening WhatsApp Sales Inquiry…");
			setName("");
			setPhone("");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			onTouchStart,
			onTouchMove,
			onTouchEnd,
			className: "relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-slate-950",
			children: [heroVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 w-full h-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					autoPlay: true,
					muted: true,
					playsInline: true,
					onEnded: handleVideoEnded,
					className: "w-full h-full object-cover transition-all duration-700 opacity-75",
					src: heroVideos[currentVideoIndex]?.url,
					preload: "auto"
				}, heroVideos[currentVideoIndex]?.id || currentVideoIndex), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex flex-col justify-end p-6 sm:p-14 text-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-3xl space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-[#1E82A6]" }), " Architectural Materials Showroom"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white uppercase",
							children: "SOLIDAS Architectural Video Showcase & Experience"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg sm:text-2xl text-[#1E82A6] font-bold",
							children: "SOLIDAS TILES AND MARBLE NIG. LIMITED"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed",
							children: "Dealers & Suppliers of General Building Materials: Premium Tiles, Marble, Granite, Crack Tiles, Foreign Security Doors, Wooden Doors, PVC Ceilings & General Contracts."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3 pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/",
								className: "inline-flex items-center gap-2 rounded-lg bg-[#C0262D] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9A1B21] transition shadow-lg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-4 w-4" }),
									" Explore Digital Showroom ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/collection",
								className: "inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4 text-[#1E82A6]" }), " Project Collections"]
							})]
						})
					]
				}), heroVideos.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-6 right-6 sm:right-14 flex gap-2 z-10",
					children: heroVideos.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setCurrentVideoIndex(i),
						className: `h-2 rounded-full transition-all duration-300 ${currentVideoIndex === i ? "w-8 bg-[#1E82A6]" : "w-2 bg-white/40"}`,
						"aria-label": `Slide ${i + 1}`
					}, i))
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-white border-b border-border py-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-app grid gap-6 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-8 w-8 text-[#1E82A6] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-bold text-sm text-foreground",
							children: "Direct Wholesale Supplier"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Direct importer & dealer in premium architectural tiles, marble, and foreign doors."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-8 w-8 text-[#C0262D] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-bold text-sm text-foreground",
							children: "Verified RC: 1218629"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Officially registered Nigerian company operating out of Dei Dei Building Materials Market, Abuja."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-8 w-8 text-[#1E82A6] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-bold text-sm text-foreground",
							children: "Instant WhatsApp Quotes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Curate your project lookbook and receive formatted WhatsApp quotes instantly."
						})] })]
					})
				]
			})
		}),
		showcaseVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "bg-slate-950 text-white py-12 border-y border-slate-800 shadow-2xl relative overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#1E82A6]/10 rounded-full blur-3xl pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-app space-y-6 relative z-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#1E82A6]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-3.5 w-3.5 text-[#C0262D]" }), " Architectural Showcase Reel"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mt-1",
						children: "SOLIDAS Video Showcase"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-400 max-w-md",
						children: "Watch our latest product videos, showroom installations, imported doors, and premium marble craftsmanship."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full aspect-video max-h-[550px] rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl group",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							autoPlay: showcasePlaying,
							muted: showcaseMuted,
							playsInline: true,
							onEnded: handleShowcaseVideoEnded,
							className: "w-full h-full object-cover transition-all duration-700",
							src: showcaseVideos[currentShowcaseIndex]?.url,
							preload: "auto"
						}, showcaseVideos[currentShowcaseIndex]?.id || currentShowcaseIndex),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 pointer-events-none" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2.5 z-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 rounded-full bg-[#C0262D] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "h-3 w-3" }),
									" Video #",
									currentShowcaseIndex + 1,
									" of ",
									showcaseVideos.length
								]
							}), showcaseVideos[currentShowcaseIndex]?.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline-block rounded-full bg-slate-900/80 border border-white/20 px-3.5 py-1 text-xs font-bold text-slate-200 backdrop-blur",
								children: showcaseVideos[currentShowcaseIndex].title
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowcasePlaying((p) => !p),
							className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-2xs",
							"aria-label": showcasePlaying ? "Pause Video" : "Play Video",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-full bg-slate-900/90 border border-white/30 p-4 text-white shadow-xl hover:scale-110 transition-transform",
								children: showcasePlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-6 w-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-6 w-6 text-[#1E82A6] fill-[#1E82A6] ml-0.5" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between z-10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setShowcaseMuted((m) => !m),
										className: "inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur",
										children: [showcaseMuted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "h-4 w-4 text-[#C0262D]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-4 w-4 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline text-[10px]",
											children: showcaseMuted ? "Unmute" : "Mute"
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-1.5",
									children: showcaseVideos.map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setCurrentShowcaseIndex(idx),
										className: `h-2 rounded-full transition-all duration-300 ${currentShowcaseIndex === idx ? "w-6 bg-[#1E82A6]" : "w-2 bg-white/40 hover:bg-white/70"}`,
										"aria-label": `Go to video ${idx + 1}`
									}, idx))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setCurrentShowcaseIndex((prev) => (prev - 1 + showcaseVideos.length) % showcaseVideos.length),
										className: "p-2 rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur",
										"aria-label": "Previous Video",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setCurrentShowcaseIndex((prev) => (prev + 1) % showcaseVideos.length),
										className: "p-2 rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur",
										"aria-label": "Next Video",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
									})]
								})
							]
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-app mt-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center max-w-xl mx-auto mb-8 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xs uppercase tracking-[0.2em] font-bold text-[#1E82A6]",
						children: "Get In Touch With SOLIDAS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-3xl font-extrabold text-foreground",
						children: "Visit Our Showrooms & Offices"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Contact our building material specialists for samples, project quantities, or site delivery quotes."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						s?.map_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: s.map_url,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "block rounded-xl border border-border bg-white p-5 shadow-xs space-y-3 hover:border-[#C0262D] transition group",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-6 w-6 text-[#C0262D] shrink-0 group-hover:scale-110 transition-transform" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#C0262D]",
										children: "Head Office (Click for Map)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold text-sm text-foreground group-hover:text-[#C0262D] transition",
										children: "Plot 469, Solidas Plaza"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja"
									})
								] })]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border bg-white p-5 shadow-xs space-y-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-6 w-6 text-[#C0262D] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#C0262D]",
										children: "Head Office"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold text-sm text-foreground",
										children: "Plot 469, Solidas Plaza"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja"
									})
								] })]
							})
						}),
						s?.map_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: s.map_url,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "block rounded-xl border border-border bg-white p-5 shadow-xs space-y-3 hover:border-[#1E82A6] transition group",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-6 w-6 text-[#1E82A6] shrink-0 group-hover:scale-110 transition-transform" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]",
										children: "Branch Office (Click for Map)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold text-sm text-foreground group-hover:text-[#1E82A6] transition",
										children: "Shop 819 C2 Extension"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Int'l Building Material Mkt Dei Dei, FCT Abuja"
									})
								] })]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border bg-white p-5 shadow-xs space-y-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-6 w-6 text-[#1E82A6] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]",
										children: "Branch Office"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-bold text-sm text-foreground",
										children: "Shop 819 C2 Extension"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Int'l Building Material Mkt Dei Dei, FCT Abuja"
									})
								] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border bg-white p-5 shadow-xs space-y-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-6 w-6 text-[#1E82A6] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]",
									children: "Telephone Lines"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-sm text-foreground",
									children: "0803 518 6355 | 0815 149 5663 | 0904 032 7777"
								})] })]
							})
						}),
						s?.company_email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border bg-white p-5 shadow-xs space-y-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-6 w-6 text-[#1E82A6] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]",
									children: "Email Inquiry"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-sm text-foreground",
									children: s.company_email
								})] })]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-bold text-foreground",
							children: "Request Architectural Callback"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Enter your details to initiate a WhatsApp order or material consultation with SOLIDAS sales team."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-bold text-foreground mb-1",
								children: "Your Full Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Chief Japhet / Engr. Musa",
								className: "w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-[#1E82A6] focus:bg-white"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-bold text-foreground mb-1",
								children: "Phone / WhatsApp Number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								placeholder: "e.g. 0803 123 4567",
								className: "w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-[#1E82A6] focus:bg-white"
							})] })]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: busy,
							className: "w-full rounded-lg bg-[#C0262D] px-5 py-3 text-sm font-bold text-white hover:bg-[#9A1B21] disabled:opacity-60 transition shadow-sm",
							children: busy ? "Connecting…" : "Send WhatsApp Request"
						})
					})]
				})]
			})]
		})
	] });
}
export { HomePage as component };
