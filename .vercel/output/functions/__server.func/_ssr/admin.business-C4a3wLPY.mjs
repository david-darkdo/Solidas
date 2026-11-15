import { i as __toESM } from "../_runtime.mjs";
import { t as useServerFn } from "./useServerFn-C4MBUhiH.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { B as uploadLargeMediaFileClient, R as getCloudinarySignatureServer, z as publicImageUrl } from "./router-DWif86SF.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { At as Briefcase, Ft as Award, I as Plus, It as ArrowUp, Ot as Calendar, Q as Inbox, W as MessageCircle, bt as CircleCheck, c as Users, i as X, p as Trash2, u as Tv, v as SquarePen, zt as ArrowDown } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.business-C4a3wLPY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"NEW",
	"CONTACTED",
	"NEGOTIATING",
	"QUOTED",
	"CLOSED",
	"LOST"
];
function BusinessOpsPage() {
	const { isAdmin, loading, user } = useAuth();
	const getSignatureFn = useServerFn(getCloudinarySignatureServer);
	const [activeTab, setActiveTab] = (0, import_react.useState)("pipeline");
	const [inquiries, setInquiries] = (0, import_react.useState)([]);
	const [collections, setCollections] = (0, import_react.useState)([]);
	const [profilesById, setProfilesById] = (0, import_react.useState)({});
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [videos, setVideos] = (0, import_react.useState)([]);
	const [newVideoUrl, setNewVideoUrl] = (0, import_react.useState)("");
	const [trusts, setTrusts] = (0, import_react.useState)([]);
	const [editingTrust, setEditingTrust] = (0, import_react.useState)(null);
	const [newTrust, setNewTrust] = (0, import_react.useState)({
		icon_name: "Shield",
		title: "",
		description: ""
	});
	const [showcaseVideos, setShowcaseVideos] = (0, import_react.useState)([]);
	const [newShowcaseUrl, setNewShowcaseUrl] = (0, import_react.useState)("");
	const [newShowcaseTitle, setNewShowcaseTitle] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const logAuditAction = async (action, details) => {
		try {
			const { data: me } = await supabase.auth.getUser();
			const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", me.user?.id ?? "").maybeSingle();
			if (profile?.id) await supabase.from("experience_audit_logs").insert({
				user_id: profile.id,
				action,
				details
			});
		} catch (err) {
			console.error("Audit logging error:", err);
		}
	};
	const loadAll = (0, import_react.useCallback)(async () => {
		try {
			const [{ data: inq }, { data: cols }, { data: items }, { data: profs }, { data: vids }, { data: trs }, { data: scVids }] = await Promise.all([
				supabase.from("whatsapp_inquiries").select("*").order("created_at", { ascending: false }),
				supabase.from("collections").select("*").order("created_at", { ascending: false }),
				supabase.from("collection_items").select("collection_id"),
				supabase.from("profiles").select("auth_id, email, full_name"),
				supabase.from("hero_videos").select("*").order("order_index", { ascending: true }),
				supabase.from("trust_features").select("*").order("order_index", { ascending: true }),
				supabase.from("showcase_videos").select("*").order("order_index", { ascending: true })
			]);
			const counts = /* @__PURE__ */ new Map();
			for (const r of items ?? []) counts.set(r.collection_id, (counts.get(r.collection_id) ?? 0) + 1);
			const pmap = {};
			for (const p of profs ?? []) pmap[p.auth_id] = {
				email: p.email,
				full_name: p.full_name
			};
			setProfilesById(pmap);
			setInquiries(inq ?? []);
			setCollections((cols ?? []).map((c) => ({
				...c,
				item_count: counts.get(c.id) ?? 0,
				user_email: pmap[c.user_id]?.email ?? null,
				user_name: pmap[c.user_id]?.full_name ?? null
			})));
			setVideos(vids ?? []);
			setTrusts(trs ?? []);
			setShowcaseVideos(scVids ?? []);
			setLoaded(true);
		} catch (err) {
			toast.error(err.message);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (isAdmin) loadAll();
	}, [isAdmin, loadAll]);
	const metrics = (0, import_react.useMemo)(() => {
		const monthAgo = /* @__PURE__ */ new Date();
		monthAgo.setMonth(monthAgo.getMonth() - 1);
		return {
			totalInquiries: inquiries.length,
			negotiating: inquiries.filter((i) => i.inquiry_status === "NEGOTIATING").length,
			quoted: inquiries.filter((i) => i.inquiry_status === "QUOTED").length,
			closed: inquiries.filter((i) => i.inquiry_status === "CLOSED").length,
			collections: collections.length,
			monthly: inquiries.filter((i) => new Date(i.created_at) >= monthAgo).length
		};
	}, [inquiries, collections]);
	const updateInquiryStatus = async (id, status) => {
		const { error } = await supabase.from("whatsapp_inquiries").update({ inquiry_status: status }).eq("id", id);
		if (error) return toast.error(error.message);
		setInquiries((rows) => rows.map((r) => r.id === id ? {
			...r,
			inquiry_status: status,
			last_contacted_at: (/* @__PURE__ */ new Date()).toISOString()
		} : r));
		if (selected?.id === id) setSelected((s) => s ? {
			...s,
			inquiry_status: status,
			last_contacted_at: (/* @__PURE__ */ new Date()).toISOString()
		} : s);
		await logAuditAction("update_inquiry_status", {
			id,
			status
		});
		toast.success(`Status → ${status}`);
	};
	const updateInquiryNotes = async (id, notes) => {
		const { error } = await supabase.from("whatsapp_inquiries").update({ internal_notes: notes }).eq("id", id);
		if (error) return toast.error(error.message);
		setInquiries((rows) => rows.map((r) => r.id === id ? {
			...r,
			internal_notes: notes
		} : r));
		toast.success("Notes saved");
	};
	const updateCollectionStatus = async (id, status) => {
		const patch = { inquiry_status: status };
		if (status === "CLOSED") patch.closed_at = (/* @__PURE__ */ new Date()).toISOString();
		const { error } = await supabase.from("collections").update(patch).eq("id", id);
		if (error) return toast.error(error.message);
		setCollections((rows) => rows.map((r) => r.id === id ? {
			...r,
			inquiry_status: status
		} : r));
		await logAuditAction("update_collection_status", {
			id,
			status
		});
		toast.success(`Collection → ${status}`);
	};
	const updateCollectionNotes = async (id, notes) => {
		const { error } = await supabase.from("collections").update({ internal_notes: notes }).eq("id", id);
		if (error) return toast.error(error.message);
		setCollections((rows) => rows.map((r) => r.id === id ? {
			...r,
			internal_notes: notes
		} : r));
		toast.success("Notes saved");
	};
	const addHeroVideo = async () => {
		if (!newVideoUrl.trim()) return toast.error("Please provide a video URL");
		setBusy(true);
		try {
			const nextIndex = videos.length;
			const { error } = await supabase.from("hero_videos").insert({
				url: newVideoUrl.trim(),
				order_index: nextIndex,
				is_active: true
			});
			if (error) throw error;
			setNewVideoUrl("");
			toast.success("Hero video added successfully");
			await logAuditAction("add_hero_video", {
				url: newVideoUrl.trim(),
				order_index: nextIndex
			});
			loadAll();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	};
	const deleteHeroVideo = async (id) => {
		if (!confirm("Delete this background video? This will instantly remove it from the homepage slider.")) return;
		try {
			const { error } = await supabase.from("hero_videos").delete().eq("id", id);
			if (error) throw error;
			toast.success("Background video deleted");
			await logAuditAction("delete_hero_video", { id });
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const toggleHeroVideo = async (id, current) => {
		try {
			const { error } = await supabase.from("hero_videos").update({ is_active: !current }).eq("id", id);
			if (error) throw error;
			toast.success("Video status updated");
			await logAuditAction("toggle_hero_video", {
				id,
				is_active: !current
			});
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const reorderVideo = async (video, direction) => {
		const idx = videos.findIndex((v) => v.id === video.id);
		if (direction === "up" && idx === 0) return;
		if (direction === "down" && idx === videos.length - 1) return;
		const swapIdx = direction === "up" ? idx - 1 : idx + 1;
		const target = videos[swapIdx];
		try {
			await Promise.all([supabase.from("hero_videos").update({ order_index: target.order_index }).eq("id", video.id), supabase.from("hero_videos").update({ order_index: video.order_index }).eq("id", target.id)]);
			toast.success("Reordered successfully");
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const addTrustFeature = async () => {
		if (!newTrust.title.trim() || !newTrust.description.trim()) return toast.error("Provide a title and description");
		setBusy(true);
		try {
			const nextIndex = trusts.length;
			const { error } = await supabase.from("trust_features").insert({
				icon_name: newTrust.icon_name,
				title: newTrust.title.trim(),
				description: newTrust.description.trim(),
				order_index: nextIndex
			});
			if (error) throw error;
			setNewTrust({
				icon_name: "Shield",
				title: "",
				description: ""
			});
			toast.success("Trust feature added");
			await logAuditAction("add_trust_feature", {
				title: newTrust.title.trim(),
				icon: newTrust.icon_name
			});
			loadAll();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	};
	const deleteTrustFeature = async (id) => {
		if (!confirm("Delete this trust feature? This changes the bottom trust strip storefront-wide.")) return;
		try {
			const { error } = await supabase.from("trust_features").delete().eq("id", id);
			if (error) throw error;
			toast.success("Trust feature deleted");
			await logAuditAction("delete_trust_feature", { id });
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const updateTrustFeature = async () => {
		if (!editingTrust) return;
		try {
			const { error } = await supabase.from("trust_features").update({
				icon_name: editingTrust.icon_name,
				title: editingTrust.title,
				description: editingTrust.description
			}).eq("id", editingTrust.id);
			if (error) throw error;
			toast.success("Trust feature updated");
			await logAuditAction("update_trust_feature", {
				id: editingTrust.id,
				title: editingTrust.title
			});
			setEditingTrust(null);
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const reorderTrust = async (trust, direction) => {
		const idx = trusts.findIndex((t) => t.id === trust.id);
		if (direction === "up" && idx === 0) return;
		if (direction === "down" && idx === trusts.length - 1) return;
		const swapIdx = direction === "up" ? idx - 1 : idx + 1;
		const target = trusts[swapIdx];
		try {
			await Promise.all([supabase.from("trust_features").update({ order_index: target.order_index }).eq("id", trust.id), supabase.from("trust_features").update({ order_index: trust.order_index }).eq("id", target.id)]);
			toast.success("Reordered trust strip features");
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const addShowcaseVideo = async () => {
		if (!newShowcaseUrl.trim()) return toast.error("Please upload or provide a video URL");
		setBusy(true);
		try {
			const nextIndex = showcaseVideos.length;
			const { error } = await supabase.from("showcase_videos").insert({
				url: newShowcaseUrl.trim(),
				title: newShowcaseTitle.trim() || null,
				order_index: nextIndex,
				is_active: true
			});
			if (error) throw error;
			setNewShowcaseUrl("");
			setNewShowcaseTitle("");
			toast.success("Showcase video added successfully!");
			await logAuditAction("add_showcase_video", {
				url: newShowcaseUrl.trim(),
				order_index: nextIndex
			});
			loadAll();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	};
	const deleteShowcaseVideo = async (id) => {
		if (!confirm("Delete this showcase video? This will remove it from the homepage continuous slider.")) return;
		try {
			const { error } = await supabase.from("showcase_videos").delete().eq("id", id);
			if (error) throw error;
			toast.success("Showcase video removed");
			await logAuditAction("delete_showcase_video", { id });
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const toggleShowcaseVideo = async (id, current) => {
		try {
			const { error } = await supabase.from("showcase_videos").update({ is_active: !current }).eq("id", id);
			if (error) throw error;
			toast.success("Showcase video status updated");
			await logAuditAction("toggle_showcase_video", {
				id,
				is_active: !current
			});
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const reorderShowcaseVideo = async (video, direction) => {
		const idx = showcaseVideos.findIndex((v) => v.id === video.id);
		if (direction === "up" && idx === 0) return;
		if (direction === "down" && idx === showcaseVideos.length - 1) return;
		const swapIdx = direction === "up" ? idx - 1 : idx + 1;
		const target = showcaseVideos[swapIdx];
		try {
			await Promise.all([supabase.from("showcase_videos").update({ order_index: target.order_index }).eq("id", video.id), supabase.from("showcase_videos").update({ order_index: video.order_index }).eq("id", target.id)]);
			toast.success("Reordered showcase videos");
			loadAll();
		} catch (err) {
			toast.error(err.message);
		}
	};
	if (loading || !loaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-10 text-sm text-muted-foreground",
		children: "Loading business operations…"
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-10 text-sm",
		children: "Access denied."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app space-y-6 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold tracking-tight text-foreground",
					children: "Business Operations Center"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: "Manage pipeline sales inquiries, client collections, and storefront interactive media/trust options."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex bg-muted/80 p-0.5 rounded-lg border border-border overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 self-start lg:self-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveTab("pipeline"),
							className: `rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition ${activeTab === "pipeline" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: "Sales Pipeline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveTab("collections"),
							className: `rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition ${activeTab === "collections" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: "Collections Manager"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveTab("experience"),
							className: `rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition ${activeTab === "experience" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: "Experience Manager"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveTab("home_videos"),
							className: `rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition ${activeTab === "home_videos" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: "Home Videos"
						})
					]
				})]
			}),
			activeTab === "pipeline" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							icon: Inbox,
							label: "Total Inquiries",
							value: metrics.totalInquiries
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							icon: MessageCircle,
							label: "Negotiating",
							value: metrics.negotiating
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							icon: Briefcase,
							label: "Quoted",
							value: metrics.quoted
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							icon: CircleCheck,
							label: "Closed",
							value: metrics.closed
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							icon: Users,
							label: "Collections",
							value: metrics.collections
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							icon: Calendar,
							label: "Monthly",
							value: metrics.monthly
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-bold tracking-tight text-foreground",
						children: "Inquiry Pipeline Kanban"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid auto-rows-fr gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-6 scrollbar-thin",
						children: STATUSES.map((s) => {
							const cards = inquiries.filter((i) => i.inquiry_status === s);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-[190px] rounded-lg border border-border bg-surface p-2 flex flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2.5 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-primary/10 px-1.5 text-primary text-[9px]",
										children: cards.length
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "space-y-2 flex-1 overflow-y-auto",
									children: [cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setSelected(c),
										className: "block w-full rounded-md border border-border bg-card p-2 text-left text-xs hover:border-primary transition",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate font-semibold text-foreground",
												children: c.customer_name || "Anonymous"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate text-[10px] text-muted-foreground",
												children: c.customer_email || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 flex items-center justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/40",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(c.created_at).toLocaleDateString() }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono",
													children: c.collection_id.slice(0, 5)
												})]
											})
										]
									}) }, c.id)), cards.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "rounded-md border border-dashed border-border/60 p-4 text-center text-[10px] text-muted-foreground italic",
										children: "No active cards"
									})]
								})]
							}, s);
						})
					})]
				})]
			}),
			activeTab === "collections" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-bold tracking-tight text-foreground",
					children: "Collection Manager"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "min-w-full text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 pr-3 font-semibold",
									children: "Collection"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 pr-3 font-semibold",
									children: "Customer"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 pr-3 font-semibold",
									children: "Items"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 pr-3 font-semibold",
									children: "WA Sent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 pr-3 font-semibold",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 pr-3 font-semibold",
									children: "Created"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 pr-3 font-semibold",
									children: "Notes"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 pr-3 font-semibold",
									children: "Actions"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
							className: "divide-y divide-border/65",
							children: [collections.map((c) => {
								const inq = inquiries.find((i) => i.collection_id === c.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/10 transition",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3 font-mono font-bold text-foreground",
											children: c.id.slice(0, 8)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: c.user_name || c.user_email || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3 font-semibold",
											children: c.item_count
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: c.whatsapp_sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-green-500 font-bold",
												children: "✓"
											}) : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: c.inquiry_status,
												onChange: (e) => updateCollectionStatus(c.id, e.target.value),
												className: "rounded border border-border bg-background px-1 py-0.5 text-[11px]",
												children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: s,
													children: s
												}, s))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3 text-muted-foreground",
											children: new Date(c.created_at).toLocaleDateString()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesCell, {
												value: c.internal_notes ?? "",
												onSave: (v) => updateCollectionNotes(c.id, v)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 pr-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: `/collection/${c.id}`,
													target: "_blank",
													rel: "noreferrer",
													className: "rounded border border-border px-2 py-0.5 text-[10px] font-medium hover:bg-surface-2 transition",
													children: "View"
												}), inq && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setSelected(inq),
													className: "rounded border border-primary/40 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/5 transition",
													children: "Open Inquiry"
												})]
											})
										})
									]
								}, c.id);
							}), collections.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 8,
								className: "py-8 text-center text-xs text-muted-foreground italic",
								children: "No collections registered."
							}) })]
						})]
					})
				})]
			}),
			activeTab === "experience" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-5 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 border-b border-border pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-base font-bold text-foreground",
								children: "Hero Videos Carousel Manager"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: newVideoUrl,
									onChange: (e) => setNewVideoUrl(e.target.value),
									placeholder: "Paste background video URL (.mp4)",
									className: "flex-1 rounded border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									disabled: busy || !newVideoUrl,
									onClick: addHeroVideo,
									className: "inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-60 transition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative border border-dashed border-border rounded-lg p-3 text-center bg-background/50 hover:bg-background transition",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "video/mp4,video/webm,video/quicktime,video/*",
										onChange: async (e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											const uploadToast = toast.loading("Uploading hero video (0%)...", { duration: 0 });
											try {
												const url = await uploadLargeMediaFileClient({
													file,
													folder: "hero-videos",
													resourceType: "video",
													getSignatureFn,
													onProgress: (pct) => {
														toast.loading(`Uploading hero video (${pct}%)...`, { id: uploadToast });
													}
												});
												setNewVideoUrl(url);
												toast.dismiss(uploadToast);
												toast.success("Video uploaded! Click 'Add' to activate.");
											} catch (err) {
												toast.dismiss(uploadToast);
												toast.error(err.message || "Failed to upload video");
											}
										},
										className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground font-medium",
										children: ["Drag and drop video here, or ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-primary underline cursor-pointer",
											children: "browse local files"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground/80 mt-1",
										children: "Supports MP4, WebM, MOV & high-resolution videos (large files supported)."
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 max-h-[350px] overflow-y-auto pr-1",
							children: [videos.map((vid, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-background p-3 flex gap-3 items-center text-xs justify-between group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-foreground",
											children: ["Video #", idx + 1]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase ${vid.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`,
											children: vid.is_active ? "Active" : "Disabled"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground truncate",
										children: vid.url
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => reorderVideo(vid, "up"),
											disabled: idx === 0,
											className: "p-1 rounded border border-border hover:bg-muted disabled:opacity-30",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3 w-3" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => reorderVideo(vid, "down"),
											disabled: idx === videos.length - 1,
											className: "p-1 rounded border border-border hover:bg-muted disabled:opacity-30",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-3 w-3" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => toggleHeroVideo(vid.id, vid.is_active),
											className: "rounded border border-border px-2 py-0.5 text-[9px] font-semibold hover:bg-muted transition",
											children: "Toggle"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => deleteHeroVideo(vid.id),
											className: "p-1.5 rounded text-destructive hover:bg-destructive/5 transition",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})
									]
								})]
							}, vid.id)), videos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-10 border border-dashed border-border rounded-lg text-xs text-muted-foreground italic",
								children: "No hero videos configured. Autoplay defaults will load."
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-5 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 border-b border-border pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-base font-bold text-foreground",
								children: "Trust features strip"
							})]
						}),
						editingTrust ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded border border-border/80 p-3 bg-surface text-xs space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-foreground",
									children: "Edit Trust Feature"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Title"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: editingTrust.title,
											onChange: (e) => setEditingTrust({
												...editingTrust,
												title: e.target.value
											}),
											className: "mt-1 w-full rounded border border-border bg-background px-2.5 py-1"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Icon Identifier"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: editingTrust.icon_name,
											onChange: (e) => setEditingTrust({
												...editingTrust,
												icon_name: e.target.value
											}),
											className: "mt-1 w-full rounded border border-border bg-background px-2.5 py-1",
											children: [
												"Shield",
												"Truck",
												"CreditCard",
												"Headphones",
												"FileCheck",
												"HelpCircle"
											].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: i,
												children: i
											}, i))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: editingTrust.description,
										onChange: (e) => setEditingTrust({
											...editingTrust,
											description: e.target.value
										}),
										className: "mt-1 w-full rounded border border-border bg-background px-2.5 py-1"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: updateTrustFeature,
										className: "rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground font-semibold",
										children: "Save Changes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setEditingTrust(null),
										className: "rounded border border-border px-3 py-1.5 text-xs",
										children: "Cancel"
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded border border-border/50 p-3 bg-muted/20 text-xs space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-foreground",
									children: "Add New Feature Strip Item"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-[10px] text-muted-foreground",
										children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: newTrust.title,
											onChange: (e) => setNewTrust({
												...newTrust,
												title: e.target.value
											}),
											className: "mt-1 w-full rounded border border-border bg-background px-2.5 py-1"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-[10px] text-muted-foreground",
										children: ["Icon Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: newTrust.icon_name,
											onChange: (e) => setNewTrust({
												...newTrust,
												icon_name: e.target.value
											}),
											className: "mt-1 w-full rounded border border-border bg-background px-2.5 py-1",
											children: [
												"Shield",
												"Truck",
												"CreditCard",
												"Headphones",
												"FileCheck",
												"HelpCircle"
											].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: i,
												children: i
											}, i))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-[10px] text-muted-foreground",
									children: ["Description", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: newTrust.description,
										onChange: (e) => setNewTrust({
											...newTrust,
											description: e.target.value
										}),
										className: "mt-1 w-full rounded border border-border bg-background px-2.5 py-1"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: busy,
									onClick: addTrustFeature,
									className: "rounded bg-primary px-3 py-1.5 font-semibold text-primary-foreground",
									children: "Add Feature Strip"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3 max-h-[300px] overflow-y-auto pr-1",
							children: trusts.map((t, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-background p-3 flex justify-between items-center text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-bold text-foreground flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded bg-muted px-1.5 py-0.2 font-mono text-[9px]",
										children: t.icon_name
									}), t.title]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: t.description
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 shrink-0 ml-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => reorderTrust(t, "up"),
											disabled: idx === 0,
											className: "p-1 rounded border border-border hover:bg-muted disabled:opacity-30",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3 w-3" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => reorderTrust(t, "down"),
											disabled: idx === trusts.length - 1,
											className: "p-1 rounded border border-border hover:bg-muted disabled:opacity-30",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-3 w-3" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setEditingTrust(t),
											className: "p-1.5 rounded hover:bg-muted transition text-muted-foreground hover:text-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => deleteTrustFeature(t.id),
											className: "p-1.5 rounded text-destructive hover:bg-destructive/5 transition",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})
									]
								})]
							}, t.id))
						})
					]
				})]
			}),
			activeTab === "home_videos" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-6 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "h-5 w-5 text-[#1E82A6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-bold text-foreground",
							children: "Homepage Showcase Video Manager"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Upload and arrange video clips displayed in the continuous showcase slider on the homepage."
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-[#1E82A6]/10 px-3 py-1 text-xs font-bold text-[#1E82A6] shrink-0 self-start sm:self-center",
						children: [
							showcaseVideos.filter((v) => v.is_active).length,
							" Active Video",
							showcaseVideos.filter((v) => v.is_active).length !== 1 ? "s" : ""
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 rounded-xl border border-border/80 bg-surface p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-bold uppercase tracking-wider text-foreground",
							children: "Add New Showcase Video"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-[11px] font-semibold text-muted-foreground mb-1",
									children: "Video Title / Caption (Optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: newShowcaseTitle,
									onChange: (e) => setNewShowcaseTitle(e.target.value),
									placeholder: "e.g. Italian Marble Living Room Installation",
									className: "w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-[#1E82A6]"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-[11px] font-semibold text-muted-foreground mb-1",
									children: "Video URL or Direct File Upload"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: newShowcaseUrl,
										onChange: (e) => setNewShowcaseUrl(e.target.value),
										placeholder: "Paste background video URL (.mp4 / .webm / .mov)",
										className: "flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-[#1E82A6]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										disabled: busy || !newShowcaseUrl.trim(),
										onClick: addShowcaseVideo,
										className: "inline-flex items-center gap-1.5 rounded-lg bg-[#C0262D] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A1B21] disabled:opacity-50 transition shadow-xs shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Save Video"]
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative border-2 border-dashed border-border rounded-xl p-5 text-center bg-background/80 hover:bg-background transition",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											accept: "video/mp4,video/webm,video/quicktime,video/*",
											onChange: async (e) => {
												const file = e.target.files?.[0];
												if (!file) return;
												const uploadToast = toast.loading("Uploading showcase video (0%)...", { duration: 0 });
												try {
													const url = await uploadLargeMediaFileClient({
														file,
														folder: "showcase-videos",
														resourceType: "video",
														getSignatureFn,
														onProgress: (pct) => {
															toast.loading(`Uploading showcase video (${pct}%)...`, { id: uploadToast });
														}
													});
													setNewShowcaseUrl(url);
													toast.dismiss(uploadToast);
													toast.success("Video uploaded! Click 'Save Video' to activate.");
												} catch (err) {
													toast.dismiss(uploadToast);
													toast.error(err.message || "Failed to upload video");
												}
											},
											className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "mx-auto h-8 w-8 text-muted-foreground/60 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs font-bold text-foreground",
											children: ["Drag and drop video file here, or ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[#1E82A6] underline cursor-pointer",
												children: "browse local files"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground mt-1",
											children: "Supports MP4, WebM, MOV & high-definition video files (large files supported directly)."
										})
									]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 max-h-[450px] overflow-y-auto pr-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xs font-bold uppercase tracking-wider text-foreground",
								children: [
									"Showcase Playlist (",
									showcaseVideos.length,
									")"
								]
							}),
							showcaseVideos.map((vid, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-background p-3.5 flex gap-3 items-center justify-between shadow-2xs group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-xs text-foreground",
												children: ["Showcase #", idx + 1]
											}),
											vid.title && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs font-medium text-muted-foreground truncate",
												children: ["— ", vid.title]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${vid.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`,
												children: vid.is_active ? "Active" : "Disabled"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-mono text-muted-foreground truncate",
										children: vid.url
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => reorderShowcaseVideo(vid, "up"),
											disabled: idx === 0,
											className: "p-1.5 rounded border border-border hover:bg-muted disabled:opacity-30",
											title: "Move Up",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => reorderShowcaseVideo(vid, "down"),
											disabled: idx === showcaseVideos.length - 1,
											className: "p-1.5 rounded border border-border hover:bg-muted disabled:opacity-30",
											title: "Move Down",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => toggleShowcaseVideo(vid.id, vid.is_active),
											className: "rounded border border-border px-2.5 py-1 text-[10px] font-bold hover:bg-muted transition",
											children: "Toggle"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => deleteShowcaseVideo(vid.id),
											className: "p-1.5 rounded text-destructive hover:bg-destructive/10 transition",
											title: "Delete",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
										})
									]
								})]
							}, vid.id)),
							showcaseVideos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-12 border border-dashed border-border rounded-xl text-xs text-muted-foreground italic",
								children: "No custom showcase videos added yet. Default architectural showcase videos will play on the homepage slider."
							})
						]
					})]
				})]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InquiryDrawer, {
				inquiry: selected,
				onClose: () => setSelected(null),
				onStatus: (s) => updateInquiryStatus(selected.id, s),
				onNotes: (n) => updateInquiryNotes(selected.id, n),
				profile: profilesById[selected.assigned_admin_id ?? ""] ?? null
			})
		]
	});
}
function Metric({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" }),
				" ",
				label
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-display text-2xl font-semibold",
			children: value
		})]
	});
}
function NotesCell({ value, onSave }) {
	const [v, setV] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => setV(value), [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value: v,
			onChange: (e) => setV(e.target.value),
			placeholder: "Notes…",
			className: "w-32 rounded border border-border bg-background px-1 py-0.5 text-[11px]"
		}), v !== value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => onSave(v),
			className: "rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground font-semibold",
			children: "Save"
		})]
	});
}
function InquiryDrawer({ inquiry, onClose, onStatus, onNotes, profile }) {
	const [notes, setNotes] = (0, import_react.useState)(inquiry.internal_notes ?? "");
	const [collection, setCollection] = (0, import_react.useState)(null);
	const [products, setProducts] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setNotes(inquiry.internal_notes ?? ""), [inquiry.id, inquiry.internal_notes]);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: col } = await supabase.from("collections").select("id, created_at").eq("id", inquiry.collection_id).maybeSingle();
			setCollection(col ?? null);
			const { data: items } = await supabase.from("collection_items").select("product_id").eq("collection_id", inquiry.collection_id);
			const ids = (items ?? []).map((i) => i.product_id);
			if (!ids.length) return setProducts([]);
			const { data: prods } = await supabase.from("products").select("id,name,code,image_url").in("id", ids);
			setProducts(prods ?? []);
		})();
	}, [inquiry.collection_id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 bg-black/50",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-background",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 flex items-center justify-between border-b border-border bg-background px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-semibold",
					children: "Inquiry Details"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "rounded-md p-1 hover:bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Customer Information",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Name",
								value: inquiry.customer_name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Email",
								value: inquiry.customer_email
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Phone",
								value: inquiry.customer_phone
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "WhatsApp",
								value: inquiry.whatsapp_number
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Collection Information",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Collection ID",
								value: inquiry.collection_id,
								mono: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Total Products",
								value: String(products.length)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Created",
								value: collection?.created_at ? new Date(collection.created_at).toLocaleString() : "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Collection Preview",
						children: products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "No products in this collection."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid grid-cols-3 gap-2",
							children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "overflow-hidden rounded-md border border-border bg-card",
								children: [publicImageUrl(p.image_url) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: publicImageUrl(p.image_url),
									alt: "",
									className: "aspect-square w-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "aspect-square w-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground",
									children: "No image"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-1 text-[10px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate font-semibold",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-muted-foreground font-mono",
										children: p.code
									})]
								})]
							}, p.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Assigned Admin",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Admin Email",
							value: profile?.email
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Admin Name",
							value: profile?.full_name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Inquiry Status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => onStatus(s),
								className: `rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition ${inquiry.inquiry_status === s ? "bg-primary text-primary-foreground shadow-xs" : "border border-border bg-card hover:bg-surface-2"}`,
								children: s
							}, s))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Internal Notes",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							rows: 4,
							placeholder: "Add internal notes about this client / pricing deal…",
							className: "w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => onNotes(notes),
							className: "mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 shadow-xs transition",
							children: "Save Notes"
						})]
					})
				]
			})]
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
			className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
			children: title
		}), children]
	});
}
function Row({ label, value, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between py-1 border-b border-border/40 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-medium ${mono ? "font-mono text-[11px]" : ""}`,
			children: value || "—"
		})]
	});
}
export { BusinessOpsPage as component };
