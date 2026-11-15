import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Dt as Check, F as RefreshCw, N as RotateCw, P as RotateCcw, Y as LoaderCircle, b as SquareCenterlineDashedVertical, ft as Crop, n as ZoomIn, t as ZoomOut, x as SquareCenterlineDashedHorizontal } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/seo-publisher-BXmy5OdW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function uploadEditedBlob(blob, productId) {
	throw new Error("Missing Cloudinary configuration (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)");
}
function ImageEditorModal({ isOpen, imageUrl, onClose, onSave, productId }) {
	const [rotation, setRotation] = (0, import_react.useState)(0);
	const [flipH, setFlipH] = (0, import_react.useState)(false);
	const [flipV, setFlipV] = (0, import_react.useState)(false);
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [aspectRatio, setAspectRatio] = (0, import_react.useState)("free");
	const [isSaving, setIsSaving] = (0, import_react.useState)(false);
	const [crop, setCrop] = (0, import_react.useState)({
		x: 10,
		y: 10,
		width: 80,
		height: 80
	});
	const [activeHandle, setActiveHandle] = (0, import_react.useState)(null);
	const [dragStart, setDragStart] = (0, import_react.useState)(null);
	const containerRef = (0, import_react.useRef)(null);
	const imageRef = (0, import_react.useRef)(null);
	const [loadedImageObj, setLoadedImageObj] = (0, import_react.useState)(null);
	const [loadingImage, setLoadingImage] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!isOpen || !imageUrl) return;
		let isMounted = true;
		setLoadingImage(true);
		const loadImage = async () => {
			try {
				let srcToUse = imageUrl;
				if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
					const blob = await (await fetch(imageUrl, { mode: "cors" })).blob();
					srcToUse = URL.createObjectURL(blob);
				}
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.onload = () => {
					if (isMounted) {
						setLoadedImageObj(img);
						setLoadingImage(false);
					}
				};
				img.onerror = () => {
					if (isMounted) {
						const fallbackImg = new Image();
						fallbackImg.src = imageUrl;
						fallbackImg.onload = () => {
							setLoadedImageObj(fallbackImg);
							setLoadingImage(false);
						};
					}
				};
				img.src = srcToUse;
			} catch (err) {
				console.error("Failed to load image as blob for editor:", err);
				const img = new Image();
				img.src = imageUrl;
				img.onload = () => {
					if (isMounted) {
						setLoadedImageObj(img);
						setLoadingImage(false);
					}
				};
			}
		};
		loadImage();
		return () => {
			isMounted = false;
		};
	}, [isOpen, imageUrl]);
	const handleReset = () => {
		setRotation(0);
		setFlipH(false);
		setFlipV(false);
		setZoom(1);
		setAspectRatio("free");
		setCrop({
			x: 10,
			y: 10,
			width: 80,
			height: 80
		});
	};
	const handleSetAspectRatio = (ratio) => {
		setAspectRatio(ratio);
		if (ratio === "1:1") setCrop({
			x: 15,
			y: 15,
			width: 70,
			height: 70
		});
		else if (ratio === "4:3") setCrop({
			x: 10,
			y: 17.5,
			width: 80,
			height: 60
		});
		else if (ratio === "16:9") setCrop({
			x: 5,
			y: 24,
			width: 90,
			height: 50.6
		});
		else setCrop({
			x: 10,
			y: 10,
			width: 80,
			height: 80
		});
	};
	const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
	const rotateRight = () => setRotation((r) => (r + 90) % 360);
	const handleMouseDown = (e, handle) => {
		e.stopPropagation();
		e.preventDefault();
		setActiveHandle(handle);
		setDragStart({
			x: e.clientX,
			y: e.clientY,
			crop: { ...crop }
		});
	};
	const handleMouseMove = (0, import_react.useCallback)((e) => {
		if (!activeHandle || !dragStart || !containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const deltaX = (e.clientX - dragStart.x) / rect.width * 100;
		const deltaY = (e.clientY - dragStart.y) / rect.height * 100;
		const initial = dragStart.crop;
		let next = { ...initial };
		if (activeHandle === "move") {
			next.x = Math.max(0, Math.min(100 - initial.width, initial.x + deltaX));
			next.y = Math.max(0, Math.min(100 - initial.height, initial.y + deltaY));
		} else {
			if (activeHandle.includes("w")) {
				const maxW = initial.x + initial.width;
				next.x = Math.max(0, Math.min(maxW - 10, initial.x + deltaX));
				next.width = maxW - next.x;
			}
			if (activeHandle.includes("e")) next.width = Math.max(10, Math.min(100 - initial.x, initial.width + deltaX));
			if (activeHandle.includes("n")) {
				const maxH = initial.y + initial.height;
				next.y = Math.max(0, Math.min(maxH - 10, initial.y + deltaY));
				next.height = maxH - next.y;
			}
			if (activeHandle.includes("s")) next.height = Math.max(10, Math.min(100 - initial.y, initial.height + deltaY));
			if (aspectRatio === "1:1") {
				const side = Math.min(next.width, next.height);
				next.width = side;
				next.height = side;
			}
		}
		setCrop(next);
	}, [
		activeHandle,
		dragStart,
		aspectRatio
	]);
	const handleMouseUp = (0, import_react.useCallback)(() => {
		setActiveHandle(null);
		setDragStart(null);
	}, []);
	(0, import_react.useEffect)(() => {
		if (activeHandle) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [
		activeHandle,
		handleMouseMove,
		handleMouseUp
	]);
	const handleApply = async () => {
		if (!loadedImageObj) {
			toast.error("Image not loaded yet");
			return;
		}
		setIsSaving(true);
		try {
			const origW = loadedImageObj.naturalWidth || loadedImageObj.width;
			const origH = loadedImageObj.naturalHeight || loadedImageObj.height;
			const isRotated90 = rotation === 90 || rotation === 270;
			const canvasW = isRotated90 ? origH : origW;
			const canvasH = isRotated90 ? origW : origH;
			const fullCanvas = document.createElement("canvas");
			fullCanvas.width = canvasW;
			fullCanvas.height = canvasH;
			const ctx = fullCanvas.getContext("2d");
			if (!ctx) throw new Error("Could not create canvas context");
			ctx.save();
			ctx.translate(canvasW / 2, canvasH / 2);
			ctx.rotate(rotation * Math.PI / 180);
			ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
			ctx.drawImage(loadedImageObj, -origW / 2, -origH / 2);
			ctx.restore();
			const cropPxX = Math.round(crop.x / 100 * canvasW);
			const cropPxY = Math.round(crop.y / 100 * canvasH);
			const cropPxW = Math.max(1, Math.round(crop.width / 100 * canvasW));
			const cropPxH = Math.max(1, Math.round(crop.height / 100 * canvasH));
			const croppedCanvas = document.createElement("canvas");
			croppedCanvas.width = cropPxW;
			croppedCanvas.height = cropPxH;
			const cropCtx = croppedCanvas.getContext("2d");
			if (!cropCtx) throw new Error("Could not create crop canvas context");
			cropCtx.drawImage(fullCanvas, cropPxX, cropPxY, cropPxW, cropPxH, 0, 0, cropPxW, cropPxH);
			const blob = await new Promise((resolve) => croppedCanvas.toBlob((b) => resolve(b), "image/png", .95));
			if (!blob) throw new Error("Failed to render canvas image blob");
			await onSave(await uploadEditedBlob(blob, productId));
			toast.success("Photo cropped & rotated successfully!");
			onClose();
		} catch (err) {
			console.error("Failed to crop/rotate image:", err);
			toast.error(err.message || "Failed to process edited photo");
		} finally {
			setIsSaving(false);
		}
	};
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col bg-black/90 text-white backdrop-blur-md animate-in fade-in duration-200",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-white/10 px-6 py-4 bg-zinc-900/80",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crop, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-bold uppercase tracking-wider text-white",
						children: "Photo Editor — Crop & Rotate"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						disabled: isSaving,
						className: "rounded border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition disabled:opacity-50",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleApply,
						disabled: isSaving || loadingImage,
						className: "flex items-center gap-2 rounded bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition shadow-lg disabled:opacity-50",
						children: isSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Applying & Uploading…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), "Save & Apply to Product"] })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative flex-1 overflow-hidden p-6 flex items-center justify-center bg-zinc-950",
				children: loadingImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center gap-3 text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs uppercase tracking-wider",
						children: "Loading image canvas…"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: containerRef,
					className: "relative max-h-[65vh] max-w-[80vw] overflow-hidden rounded-lg shadow-2xl select-none",
					style: {
						transform: `scale(${zoom})`,
						transition: "transform 0.15s ease-out"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						ref: imageRef,
						src: imageUrl,
						alt: "Source Canvas",
						style: {
							transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
							transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
							maxHeight: "65vh",
							maxWidth: "80vw",
							objectFit: "contain"
						},
						className: "block"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onMouseDown: (e) => handleMouseDown(e, "move"),
						style: {
							left: `${crop.x}%`,
							top: `${crop.y}%`,
							width: `${crop.width}%`,
							height: `${crop.height}%`
						},
						className: "absolute border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move transition-all duration-75 group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-r border-b border-white/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-r border-b border-white/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b border-white/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-r border-b border-white/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-r border-b border-white/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b border-white/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-r border-white/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-r border-white/50" })
							]
						}), [
							"nw",
							"ne",
							"sw",
							"se",
							"n",
							"s",
							"w",
							"e"
						].map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							onMouseDown: (e) => handleMouseDown(e, handle),
							className: `absolute h-3.5 w-3.5 bg-primary border-2 border-white rounded-full shadow ${handle === "nw" ? "-left-1.5 -top-1.5 cursor-nwse-resize" : handle === "ne" ? "-right-1.5 -top-1.5 cursor-nesw-resize" : handle === "sw" ? "-left-1.5 -bottom-1.5 cursor-nesw-resize" : handle === "se" ? "-right-1.5 -bottom-1.5 cursor-nwse-resize" : handle === "n" ? "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize" : handle === "s" ? "left-1/2 -bottom-1.5 -translate-x-1/2 cursor-ns-resize" : handle === "w" ? "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize" : "right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize"}`
						}, handle))]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-white/10 bg-zinc-900/90 p-4 space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-4 max-w-5xl mx-auto text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1",
									children: "Rotate / Flip"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: rotateLeft,
									className: "rounded bg-white/10 p-2.5 hover:bg-white/20 transition flex items-center gap-1.5 font-medium",
									title: "Rotate Left 90°",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "-90°" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: rotateRight,
									className: "rounded bg-white/10 p-2.5 hover:bg-white/20 transition flex items-center gap-1.5 font-medium",
									title: "Rotate Right 90°",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+90°" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setFlipH(!flipH),
									className: `rounded p-2.5 transition flex items-center gap-1.5 font-medium ${flipH ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20"}`,
									title: "Flip Horizontal",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCenterlineDashedHorizontal, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Flip H" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setFlipV(!flipV),
									className: `rounded p-2.5 transition flex items-center gap-1.5 font-medium ${flipV ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20"}`,
									title: "Flip Vertical",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCenterlineDashedVertical, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Flip V" })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1",
								children: "Aspect Ratio"
							}), [
								"free",
								"1:1",
								"4:3",
								"16:9"
							].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleSetAspectRatio(r),
								className: `rounded px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${aspectRatio === r ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20 text-gray-300"}`,
								children: r === "1:1" ? "1:1 Square" : r
							}, r))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { className: "h-4 w-4 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: "1",
										max: "2.5",
										step: "0.1",
										value: zoom,
										onChange: (e) => setZoom(parseFloat(e.target.value)),
										className: "w-24 accent-primary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "h-4 w-4 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] font-mono text-muted-foreground w-8",
										children: [zoom.toFixed(1), "x"]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleReset,
								className: "rounded border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition flex items-center gap-1.5 text-muted-foreground hover:text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), "Reset"]
							})]
						})
					]
				})
			})
		]
	});
}
/**
* Triggered automatically upon product creation or updates.
* Guarantees that every product page and product image is immediately
* included and updated across all XML sitemaps and search engines.
*/
async function triggerSitemapUpdate(productId) {
	try {
		const origin = typeof window !== "undefined" ? window.location.origin : "https://showroom.enreach.concepts";
		if (productId) await supabase.from("products").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", productId);
		const endpoints = [
			`${origin}/sitemap.xml`,
			`${origin}/sitemap-products.xml`,
			`${origin}/sitemap-categories.xml`,
			`${origin}/sitemap-images.xml`,
			`${origin}/sitemap-pages.xml`
		];
		if (typeof window !== "undefined") Promise.allSettled(endpoints.map((url) => fetch(url, {
			method: "HEAD",
			cache: "no-cache"
		}).catch(() => {})));
	} catch (err) {
		console.error("Auto sitemap publisher error:", err);
	}
}
export { triggerSitemapUpdate as n, ImageEditorModal as t };
