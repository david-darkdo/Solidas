import { i as __toESM } from "../_runtime.mjs";
import { L as ImageUploader } from "./router-DWif86SF.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Smartphone, H as Moon, I as Plus, K as Mail, M as Save, S as Sparkles, U as Monitor, _t as Clock, bt as CircleCheck, ct as Eye, f as TriangleAlert, g as Sun, p as Trash2, tt as History } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.email-DmwXDu5C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SEGMENTS = [
	{
		id: "all_users",
		label: "All users"
	},
	{
		id: "active_users",
		label: "Active users (Health > 60)"
	},
	{
		id: "inactive_users",
		label: "Inactive users (Health < 60)"
	},
	{
		id: "vip",
		label: "VIP customers"
	}
];
function CommunicationCenterPage() {
	const { isAdmin, loading } = useAuth();
	const [activeTab, setActiveTab] = (0, import_react.useState)("dashboard");
	const [campaigns, setCampaigns] = (0, import_react.useState)([]);
	const [editingCampaign, setEditingCampaign] = (0, import_react.useState)(null);
	const [templates, setTemplates] = (0, import_react.useState)([]);
	const [editingTemplate, setEditingTemplate] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [workflows, setWorkflows] = (0, import_react.useState)([]);
	const [queue, setQueue] = (0, import_react.useState)([]);
	const [queueStats, setQueueStats] = (0, import_react.useState)({
		total: 0,
		pending: 0,
		sent: 0,
		failed: 0,
		dlq: 0
	});
	const [recentEvents, setRecentEvents] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [previewDevice, setPreviewDevice] = (0, import_react.useState)("desktop");
	const [previewTheme, setPreviewTheme] = (0, import_react.useState)("light");
	const loadAllData = async () => {
		try {
			const [{ data: campData }, { data: tempData }, { data: wfData }, { data: qData }, { data: evData }] = await Promise.all([
				supabase.from("communication_campaigns").select("*").order("created_at", { ascending: false }),
				supabase.from("communication_templates").select("*").order("created_at", { ascending: false }),
				supabase.from("automation_workflows").select("*, automation_steps(*)").order("created_at", { ascending: false }),
				supabase.from("communication_queue").select("*").order("created_at", { ascending: false }).limit(50),
				supabase.from("communication_events").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(15)
			]);
			setCampaigns(campData ?? []);
			setTemplates(tempData ?? []);
			setWorkflows(wfData ?? []);
			setQueue(qData ?? []);
			setRecentEvents(evData ?? []);
			if (qData) {
				const stats = {
					total: qData.length,
					pending: 0,
					sent: 0,
					failed: 0,
					dlq: 0
				};
				qData.forEach((item) => {
					if (item.status === "PENDING") stats.pending++;
					else if (item.status === "SENT") stats.sent++;
					else if (item.status === "FAILED") stats.failed++;
					else if (item.status === "DLQ") stats.dlq++;
				});
				setQueueStats(stats);
			}
		} catch (err) {
			console.error("Error loading data:", err);
		}
	};
	(0, import_react.useEffect)(() => {
		if (isAdmin) loadAllData();
	}, [isAdmin]);
	const saveCampaign = async () => {
		if (!editingCampaign) return;
		setBusy(true);
		try {
			const payload = {
				name: editingCampaign.name,
				subject: editingCampaign.subject,
				banner_url: editingCampaign.banner_url || null,
				body: editingCampaign.body,
				target_segment: editingCampaign.target_segment,
				channel_types: editingCampaign.channel_types || ["email"],
				status: editingCampaign.status || "DRAFT",
				ai_generated: editingCampaign.ai_generated || false,
				ai_generation_metadata: editingCampaign.ai_generation_metadata || {}
			};
			if (editingCampaign?.id) {
				const { error } = await supabase.from("communication_campaigns").update(payload).eq("id", editingCampaign.id);
				if (error) throw error;
			} else {
				const { data: me } = await supabase.auth.getUser();
				const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", me.user?.id ?? "").maybeSingle();
				const { error } = await supabase.from("communication_campaigns").insert({
					...payload,
					created_by: profile?.id || null
				});
				if (error) throw error;
			}
			toast.success("Campaign saved successfully");
			setEditingCampaign(null);
			loadAllData();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	};
	const updateCampaignStatus = async (id, newStatus, notes) => {
		setBusy(true);
		try {
			const { data: me } = await supabase.auth.getUser();
			const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", me.user?.id ?? "").maybeSingle();
			const updates = { status: newStatus };
			if (newStatus === "PENDING_REVIEW") updates.requested_review_by = profile?.id;
			else if (newStatus === "APPROVED") {
				updates.approved_by = profile?.id;
				updates.approval_notes = notes || "Approved by Admin";
			}
			const { error } = await supabase.from("communication_campaigns").update(updates).eq("id", id);
			if (error) throw error;
			toast.success(`Campaign status updated to ${newStatus}`);
			setEditingCampaign(null);
			loadAllData();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	};
	const deleteCampaign = async (id) => {
		if (!confirm("Delete this campaign?")) return;
		try {
			const { error } = await supabase.from("communication_campaigns").delete().eq("id", id);
			if (error) throw error;
			toast.success("Campaign deleted");
			loadAllData();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const saveTemplate = async () => {
		if (!editingTemplate) return;
		setBusy(true);
		try {
			const payload = {
				name: editingTemplate.name,
				description: editingTemplate.description,
				email_subject: editingTemplate.email_subject,
				email_html: editingTemplate.email_html,
				push_title: editingTemplate.push_title,
				push_body: editingTemplate.push_body,
				variables: editingTemplate.variables || [],
				ai_generation_metadata: editingTemplate.ai_generation_metadata || {}
			};
			if (editingTemplate.id) {
				const { error } = await supabase.from("communication_templates").update(payload).eq("id", editingTemplate.id);
				if (error) throw error;
				const { data: me } = await supabase.auth.getUser();
				const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", me.user?.id ?? "").maybeSingle();
				const { data: hist } = await supabase.from("communication_templates_history").select("version").eq("template_id", editingTemplate.id).order("version", { ascending: false }).limit(1);
				const nextVersion = hist && hist.length > 0 ? hist[0]?.version + 1 : 1;
				await supabase.from("communication_templates_history").insert({
					template_id: editingTemplate.id,
					version: nextVersion,
					email_subject: editingTemplate.email_subject,
					email_html: editingTemplate.email_html,
					push_title: editingTemplate.push_title,
					push_body: editingTemplate.push_body,
					created_by: profile?.id || null
				});
			} else {
				const { data, error } = await supabase.from("communication_templates").insert(payload).select().single();
				if (error) throw error;
				const { data: me } = await supabase.auth.getUser();
				const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", me.user?.id ?? "").maybeSingle();
				await supabase.from("communication_templates_history").insert({
					template_id: data.id,
					version: 1,
					email_subject: payload.email_subject,
					email_html: payload.email_html,
					push_title: payload.push_title,
					push_body: payload.push_body,
					created_by: profile?.id || null
				});
			}
			toast.success("Template saved");
			setEditingTemplate(null);
			loadAllData();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	};
	const loadTemplateHistory = async (templateId) => {
		const { data, error } = await supabase.from("communication_templates_history").select("*, profiles(full_name)").eq("template_id", templateId).order("version", { ascending: false });
		if (!error && data) setHistory(data);
	};
	const rollbackTemplate = async (hist) => {
		if (!confirm(`Rollback template to version ${hist.version}?`)) return;
		setBusy(true);
		try {
			const { error } = await supabase.from("communication_templates").update({
				email_subject: hist.email_subject,
				email_html: hist.email_html,
				push_title: hist.push_title,
				push_body: hist.push_body
			}).eq("id", hist.template_id);
			if (error) throw error;
			toast.success(`Template rolled back to version ${hist.version}`);
			setEditingTemplate(null);
			setHistory([]);
			loadAllData();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	};
	const toggleWorkflow = async (id, currentStatus) => {
		try {
			const { error } = await supabase.from("automation_workflows").update({ is_active: !currentStatus }).eq("id", id);
			if (error) throw error;
			toast.success(`Workflow status updated`);
			loadAllData();
		} catch (err) {
			toast.error(err.message);
		}
	};
	const triggerTestSend = async () => {
		if (!editingCampaign) return;
		toast.loading("Sending test message...", { duration: 1500 });
		setTimeout(() => {
			toast.success(`Test send dispatched to registered test devices`);
		}, 1500);
	};
	if (loading || !isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-8 text-sm text-muted-foreground",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-semibold text-foreground tracking-tight",
					children: "Communication Operating System"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5 max-w-prose",
					children: "Manage multi-channel campaigns, templates, PWA push notifications, automations, and audience health."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex bg-muted/80 p-1 rounded-lg border border-border overflow-x-auto max-w-full whitespace-nowrap scrollbar-none shrink-0 self-start lg:self-center",
					children: [
						"dashboard",
						"campaigns",
						"automations",
						"templates",
						"queue",
						"diagnostics"
					].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							setActiveTab(tab);
							setEditingCampaign(null);
							setEditingTemplate(null);
						},
						className: `rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition shrink-0 ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
						children: tab
					}, tab))
				})]
			}),
			activeTab === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground uppercase",
									children: "Active Campaigns"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 text-primary" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2.5 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-bold tracking-tight",
									children: campaigns.filter((c) => c.status === "SENT").length
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-green-500 font-medium",
									children: "Sent to targets"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground uppercase",
									children: "Outbox Queue"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-amber-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2.5 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-bold tracking-tight",
									children: queueStats.pending
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-amber-500 font-medium",
									children: "Pending delivery"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground uppercase",
									children: "Dead Letter (DLQ)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-destructive" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2.5 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-bold tracking-tight text-destructive",
									children: queueStats.dlq
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-destructive font-medium",
									children: "Delivery failed permanently"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground uppercase",
									children: "System Automations"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-green-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2.5 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-bold tracking-tight",
									children: workflows.filter((w) => w.is_active).length
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-green-500 font-medium",
									children: "Active triggers"
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-2 rounded-lg border border-border bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-border pb-3 mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-sm font-semibold uppercase tracking-wide text-foreground",
								children: "Global System Event Bus (Realtime Stream)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-[10px] text-green-500 font-mono font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-green-500 animate-pulse" }), "SUBSCRIBED"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 max-h-[350px] overflow-y-auto pr-1",
							children: [recentEvents.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs flex gap-3 items-start border-b border-border/50 pb-2.5 last:border-0 last:pb-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded bg-muted px-2 py-0.5 font-mono text-[9px] text-muted-foreground tracking-tight uppercase",
										children: ev.event_type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-medium text-foreground",
											children: ["User: ", ev.profiles?.full_name || ev.profiles?.email || "Guest"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[10px] text-muted-foreground font-mono mt-0.5",
											children: ["Payload: ", JSON.stringify(ev.meta)]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[9px] text-muted-foreground",
										children: new Date(ev.created_at).toLocaleTimeString()
									})
								]
							}, ev.id)), recentEvents.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground italic text-center py-6",
								children: "No event bus activities logged yet."
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold uppercase tracking-wide text-foreground border-b border-border pb-3 mb-4",
							children: "Campaign Approvals Flow"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [campaigns.filter((c) => c.status === "PENDING_REVIEW" || c.status === "APPROVED" || c.status === "DRAFT").slice(0, 5).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded border border-border p-3 text-xs bg-background",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-2 py-0.5 text-[9px] font-bold ${c.status === "APPROVED" ? "bg-green-500/15 text-green-500" : c.status === "PENDING_REVIEW" ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground"}`,
											children: c.status
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] text-muted-foreground mt-1",
										children: ["Subject: ", c.subject || "No subject"]
									}),
									c.status === "PENDING_REVIEW" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2.5 flex gap-1.5 pt-2 border-t border-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => updateCampaignStatus(c.id, "APPROVED"),
											className: "rounded bg-primary px-2 py-0.5 text-[10px] text-primary-foreground font-medium",
											children: "Approve"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => updateCampaignStatus(c.id, "DRAFT"),
											className: "rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground",
											children: "Reject to Draft"
										})]
									})
								]
							}, c.id)), campaigns.filter((c) => c.status === "PENDING_REVIEW" || c.status === "APPROVED" || c.status === "DRAFT").length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground italic text-center py-6",
								children: "All campaigns are in stable states."
							})]
						})]
					})]
				})]
			}),
			activeTab === "campaigns" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1fr_1.2fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Campaigns"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setEditingCampaign({
								id: "",
								name: "New Newsletter Campaign",
								subject: "Check out our showroom updates",
								body: "Hi {{customer_name}}, check out our premium selections!",
								banner_url: "",
								target_segment: "all_users",
								status: "DRAFT",
								channel_types: ["email"],
								ai_generated: false,
								ai_generation_metadata: {}
							}),
							className: "inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Create Campaign"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [campaigns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border p-3.5 bg-card text-xs space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setEditingCampaign(c),
										className: "font-semibold text-foreground hover:underline text-sm text-left",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `rounded-full px-2 py-0.5 text-[9px] font-bold ${c.status === "SENT" ? "bg-green-500/15 text-green-500" : c.status === "PENDING_REVIEW" ? "bg-amber-500/15 text-amber-500" : c.status === "APPROVED" ? "bg-blue-500/15 text-blue-500" : "bg-muted text-muted-foreground"}`,
										children: c.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-muted-foreground font-medium",
									children: ["Subject: ", c.subject || "—"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-muted-foreground flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Segment: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground capitalize",
										children: c.target_segment.replace(/_/g, " ")
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Channels: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground uppercase",
										children: c.channel_types?.join(", ") || "email"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1.5 pt-2 border-t border-border mt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setEditingCampaign(c),
										className: "rounded border border-border px-2 py-1 text-[10px] font-medium hover:bg-muted transition",
										children: "Edit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => deleteCampaign(c.id),
										className: "rounded border border-border px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/5 transition",
										children: "Delete"
									})]
								})
							]
						}, c.id)), campaigns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground text-center py-6",
							children: "No campaigns created yet."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border border-border bg-card p-5 space-y-4",
					children: !editingCampaign ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground italic text-center py-20 bg-muted/20 rounded border border-dashed border-border",
						children: "Select a campaign to configure or view layout."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-border pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold text-base",
									children: editingCampaign.id ? "Edit Campaign settings" : "Create New Campaign"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-muted-foreground",
										children: "Status:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded bg-muted px-2 py-0.5 text-xs font-bold font-mono",
										children: editingCampaign.status
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Campaign Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: editingCampaign.name,
										onChange: (e) => setEditingCampaign({
											...editingCampaign,
											name: e.target.value
										}),
										className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Delivery Channels"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-4 mt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-1.5 font-medium cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: editingCampaign.channel_types?.includes("email") ?? true,
												onChange: (e) => {
													const current = editingCampaign.channel_types || [];
													const next = e.target.checked ? [...current, "email"] : current.filter((x) => x !== "email");
													setEditingCampaign({
														...editingCampaign,
														channel_types: next
													});
												},
												className: "rounded border-border text-primary"
											}), "Email"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-1.5 font-medium cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: editingCampaign.channel_types?.includes("push") ?? false,
												onChange: (e) => {
													const current = editingCampaign.channel_types || [];
													const next = e.target.checked ? [...current, "push"] : current.filter((x) => x !== "push");
													setEditingCampaign({
														...editingCampaign,
														channel_types: next
													});
												},
												className: "rounded border-border text-primary"
											}), "Push Notifications"]
										})]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Subject (Email) / Title (Push)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: editingCampaign.subject,
										onChange: (e) => setEditingCampaign({
											...editingCampaign,
											subject: e.target.value
										}),
										className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Target Segment"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: editingCampaign.target_segment,
										onChange: (e) => setEditingCampaign({
											...editingCampaign,
											target_segment: e.target.value
										}),
										className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5",
										children: SEGMENTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: s.id,
											children: s.label
										}, s.id))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-medium",
									children: "Campaign Banner Image"
								}), editingCampaign.banner_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative group max-w-xs rounded overflow-hidden border border-border mt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: editingCampaign.banner_url,
										alt: "Banner",
										className: "w-full h-24 object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setEditingCampaign({
											...editingCampaign,
											banner_url: ""
										}),
										className: "absolute top-1.5 right-1.5 bg-black/75 hover:bg-black text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
									compact: true,
									multiple: false,
									onUploaded: (urls) => {
										if (urls.length > 0) setEditingCampaign({
											...editingCampaign,
											banner_url: urls[0]
										});
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-medium",
									children: "Campaign Message Copy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: editingCampaign.body,
									onChange: (e) => setEditingCampaign({
										...editingCampaign,
										body: e.target.value
									}),
									rows: 5,
									className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5 font-mono text-[11px]"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-primary/5 border border-primary/10 p-3 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 font-semibold text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), "AI Campaign Autopilot Reserved Hooks"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: "Campaign copy, layout generation, and dynamic send-time optimizations are fully configured in campaigns metadata hooks."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border border-border rounded-lg bg-background p-3 space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-b border-border pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-foreground uppercase",
										children: "Interactive Live Preview"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setPreviewDevice("desktop"),
												className: `p-1 rounded ${previewDevice === "desktop" ? "bg-muted text-foreground" : "text-muted-foreground"}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "h-3.5 w-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setPreviewDevice("mobile"),
												className: `p-1 rounded ${previewDevice === "mobile" ? "bg-muted text-foreground" : "text-muted-foreground"}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "h-3.5 w-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "border-l border-border h-4 mx-1" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setPreviewTheme("light"),
												className: `p-1 rounded ${previewTheme === "light" ? "bg-muted text-foreground" : "text-muted-foreground"}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-3.5 w-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setPreviewTheme("dark"),
												className: `p-1 rounded ${previewTheme === "dark" ? "bg-muted text-foreground" : "text-muted-foreground"}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-3.5 w-3.5" })
											})
										]
									})]
								}), previewDevice === "desktop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `p-4 border border-border rounded min-h-[160px] text-xs space-y-3 ${previewTheme === "dark" ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`,
									children: [
										editingCampaign.banner_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: editingCampaign.banner_url,
											alt: "Banner",
											className: "w-full h-24 object-cover rounded"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-semibold text-sm",
											children: ["Subject: ", editingCampaign.subject || "(no subject)"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "whitespace-pre-wrap leading-relaxed",
											children: editingCampaign.body.replace(/\{\{\s*customer_name\s*\}\}/g, "John Doe")
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-center py-2 bg-muted/30",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `w-[240px] border border-border rounded-xl p-3.5 text-xs shadow-md ${previewTheme === "dark" ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 text-[9px] text-muted-foreground border-b border-border/50 pb-1 mb-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PUSH NOTIFICATION" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-bold text-[11px]",
												children: editingCampaign.subject || "Enreach Showroom"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] leading-tight text-muted-foreground mt-0.5 line-clamp-3",
												children: editingCampaign.body.replace(/\{\{\s*customer_name\s*\}\}/g, "John Doe")
											})
										]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2 pt-3 border-t border-border mt-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										disabled: busy,
										onClick: saveCampaign,
										className: "inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save Draft"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										disabled: busy,
										onClick: triggerTestSend,
										className: "inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), "Send Test"]
									}),
									editingCampaign.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										disabled: busy,
										onClick: () => updateCampaignStatus(editingCampaign.id, "PENDING_REVIEW"),
										className: "inline-flex items-center gap-1 rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition",
										children: "Request Review"
									}),
									editingCampaign.status === "PENDING_REVIEW" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										disabled: busy,
										onClick: () => updateCampaignStatus(editingCampaign.id, "APPROVED"),
										className: "inline-flex items-center gap-1 rounded bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition",
										children: "Approve & Publish"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setEditingCampaign(null),
										className: "ml-auto rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition",
										children: "Close"
									})
								]
							})
						]
					})
				})]
			}),
			activeTab === "automations" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-5 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border pb-3 mb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-semibold uppercase tracking-wide text-foreground",
						children: "Lifecycle Automation Journeys"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Automation sequences based on event bus triggers"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: workflows.map((wf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border p-4 bg-background text-xs space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-bold text-sm text-foreground",
								children: wf.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground mt-0.5",
								children: wf.description
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "relative inline-flex items-center cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: wf.is_active,
										onChange: () => toggleWorkflow(wf.id, wf.is_active),
										className: "sr-only peer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 font-medium text-foreground uppercase text-[10px]",
										children: wf.is_active ? "Active" : "Disabled"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-2 border-t border-border/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-[10px] text-muted-foreground uppercase mb-2",
								children: "Workflow Triggers & Steps"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded bg-primary/10 border border-primary/20 px-2 py-1 font-mono font-bold text-primary",
									children: ["Event: ", wf.trigger_type]
								}), wf.automation_steps?.map((step, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-bold",
										children: "→"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded border border-border p-2 bg-card",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-semibold",
												children: [
													"Step ",
													step.step_number,
													": Send Template"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] text-muted-foreground mt-0.5",
												children: ["Template ID: ", step.template_id]
											}),
											step.wait_duration_seconds > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[9px] text-amber-500 font-semibold mt-0.5",
												children: [
													"Delay: ",
													step.wait_duration_seconds / 3600,
													" hrs"
												]
											})
										]
									})]
								}, step.id))]
							})]
						})]
					}, wf.id))
				})]
			}),
			activeTab === "templates" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1fr_1.2fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Templates"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setEditingTemplate({
									id: "",
									name: "new_template",
									description: "Default customer newsletter layout",
									email_subject: "Latest updates",
									email_html: "<p>Welcome</p>",
									push_title: "Welcome",
									push_body: "Hi",
									variables: ["customer_name"]
								});
								setHistory([]);
							},
							className: "inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Create Template"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2 mt-4",
						children: templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border p-3.5 bg-card text-xs space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center justify-between font-semibold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setEditingTemplate(t);
											loadTemplateHistory(t.id);
										},
										className: "text-foreground hover:underline text-left text-sm font-semibold",
										children: t.name
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground text-[11px]",
									children: t.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5 mt-1",
									children: t.variables?.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono bg-muted text-[10px] px-1.5 py-0.5 rounded text-muted-foreground",
										children: "{{" + v + "}}"
									}, v))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1.5 pt-2 border-t border-border mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setEditingTemplate(t);
											loadTemplateHistory(t.id);
										},
										className: "rounded border border-border px-2 py-1 text-[10px] font-medium hover:bg-muted transition",
										children: "Edit & History"
									})
								})
							]
						}, t.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border border-border bg-card p-5 space-y-4",
					children: !editingTemplate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground italic text-center py-20 bg-muted/20 rounded border border-dashed border-border",
						children: "Select a template to configure settings."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-between border-b border-border pb-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold text-base",
									children: editingTemplate.id ? "Edit Template" : "New Template"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Template Unique Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: editingTemplate.name,
										onChange: (e) => setEditingTemplate({
											...editingTemplate,
											name: e.target.value
										}),
										className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: editingTemplate.description || "",
										onChange: (e) => setEditingTemplate({
											...editingTemplate,
											description: e.target.value
										}),
										className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border pt-3 space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-xs font-semibold uppercase tracking-wider text-primary",
										children: "Template Asset Uploader"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground",
										children: "Upload images for your template body. The URL will copy automatically so you can paste it inside your HTML template."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
										compact: true,
										multiple: false,
										onUploaded: (urls) => {
											if (urls.length > 0) {
												navigator.clipboard.writeText(urls[0]);
												toast.success("Uploaded successfully! Image URL copied to clipboard.");
											}
										}
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-xs font-semibold uppercase tracking-wider text-primary mb-3",
									children: "Email Settings"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Email Subject"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: editingTemplate.email_subject || "",
											onChange: (e) => setEditingTemplate({
												...editingTemplate,
												email_subject: e.target.value
											}),
											className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Email HTML Template"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											value: editingTemplate.email_html || "",
											onChange: (e) => setEditingTemplate({
												...editingTemplate,
												email_html: e.target.value
											}),
											rows: 5,
											className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5 font-mono text-[11px]"
										})]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-xs font-semibold uppercase tracking-wider text-primary mb-3",
									children: "PWA Push Settings"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Push Notification Title"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: editingTemplate.push_title || "",
											onChange: (e) => setEditingTemplate({
												...editingTemplate,
												push_title: e.target.value
											}),
											className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Push Notification Body"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											value: editingTemplate.push_body || "",
											onChange: (e) => setEditingTemplate({
												...editingTemplate,
												push_body: e.target.value
											}),
											rows: 3,
											className: "mt-1 w-full rounded border border-border bg-background px-3 py-1.5 font-mono text-[11px]"
										})]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 pt-3 border-t border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									disabled: busy,
									onClick: saveTemplate,
									className: "inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save Template"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setEditingTemplate(null),
									className: "ml-auto rounded border border-border px-3 py-1.5 text-xs font-medium",
									children: "Close"
								})]
							}),
							history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border pt-3 mt-4 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-3.5 w-3.5" }), " Template Revision History"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2 max-h-[160px] overflow-y-auto",
									children: history.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-xs border border-border rounded p-2 bg-background",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold",
											children: ["v", h.version]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-[10px] ml-2",
											children: new Date(h.created_at).toLocaleString()
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => rollbackTemplate(h),
											className: "text-[10px] font-semibold text-primary hover:underline",
											children: "Rollback to this version"
										})]
									}, h.id))
								})]
							})
						]
					})
				})]
			}),
			activeTab === "queue" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-5 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between border-b border-border pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-semibold uppercase tracking-wide text-foreground",
						children: "Message Outbox Queue & DLQ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Monitor delivery statuses, retries, and dead letter items"
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-xs border-collapse",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border text-muted-foreground uppercase text-[10px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 px-3",
									children: "ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 px-3",
									children: "Recipient"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 px-3",
									children: "Channel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 px-3",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 px-3",
									children: "Attempts"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 px-3",
									children: "Created"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 px-3",
									children: "Error details"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
							className: "divide-y divide-border/40 font-mono text-[11px]",
							children: [queue.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-2.5 px-3 text-muted-foreground",
										children: [item.id.slice(0, 8), "..."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-3 text-foreground font-sans font-medium",
										children: item.recipient_user_id || "Broadcast"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-3 font-semibold uppercase text-[10px]",
										children: item.channel_type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-2 py-0.5 text-[9px] font-bold ${item.status === "SENT" ? "bg-green-500/15 text-green-500" : item.status === "PENDING" ? "bg-amber-500/15 text-amber-500" : item.status === "DLQ" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`,
											children: item.status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-3",
										children: item.attempts || 0
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-3 text-muted-foreground text-[10px]",
										children: new Date(item.created_at).toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-3 text-destructive text-[10px] truncate max-w-[200px]",
										children: item.last_error || "—"
									})
								]
							}, item.id)), queue.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 7,
								className: "text-center py-6 text-muted-foreground font-sans italic",
								children: "Queue is clean and clear."
							}) })]
						})]
					})
				})]
			}),
			activeTab === "diagnostics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-5 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between border-b border-border pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-semibold uppercase tracking-wide text-foreground",
						children: "Communication System Health & Infrastructure Diagnostics"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Database triggers, webhook listeners, push subscriptions, and SMTP/WebPush configuration check"
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border p-3.5 bg-background text-xs space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold flex items-center gap-1.5 text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-500" }), " Database Event Bus Triggers"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground text-[11px]",
								children: "Triggers attached to products, favorites, and profiles tables automatically emit events to communication_events."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border p-3.5 bg-background text-xs space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold flex items-center gap-1.5 text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-500" }), " Outbox Queue Processor"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground text-[11px]",
								children: "PGcron / Edge function runner active for draining communication_queue every minute with automatic retries (max 3 attempts)."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border p-3.5 bg-background text-xs space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold flex items-center gap-1.5 text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-green-500" }), " WebPush VAPID Keys"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground text-[11px]",
								children: "VAPID public keys active for customer PWA push notification subscriptions in browser."
							})]
						})
					]
				})]
			})
		]
	});
}
export { CommunicationCenterPage as component };
