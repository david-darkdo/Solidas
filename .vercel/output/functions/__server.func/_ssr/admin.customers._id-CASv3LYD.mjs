import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { n as useAuth } from "./use-auth-BMs4mq4g.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { C as useParams, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Rt as ArrowLeft, dt as Crown, p as Trash2 } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/admin.customers._id-CASv3LYD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	"customer",
	"admin",
	"super_admin"
];
var NOTE_TYPES = [
	"GENERAL",
	"SALES",
	"SUPPORT",
	"VIP",
	"FOLLOW_UP"
];
function CustomerDetail() {
	const { id } = useParams({ from: "/_authenticated/admin/customers/$id" });
	const { isAdmin, loading } = useAuth();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [roleRow, setRoleRow] = (0, import_react.useState)(null);
	const [collections, setCollections] = (0, import_react.useState)([]);
	const [inquiries, setInquiries] = (0, import_react.useState)([]);
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [newNote, setNewNote] = (0, import_react.useState)("");
	const [noteType, setNoteType] = (0, import_react.useState)("GENERAL");
	const [tagInput, setTagInput] = (0, import_react.useState)("");
	const [scores, setScores] = (0, import_react.useState)(null);
	const [interests, setInterests] = (0, import_react.useState)([]);
	const [devices, setDevices] = (0, import_react.useState)([]);
	const [preferences, setPreferences] = (0, import_react.useState)(null);
	const [activities, setActivities] = (0, import_react.useState)([]);
	const load = async () => {
		const { data: p } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
		setProfile(p);
		if (!p) return;
		const [{ data: r }, { data: c }, { data: n }, { data: sc }, { data: ints }, { data: devs }, { data: prefs }, { data: acts }] = await Promise.all([
			supabase.from("user_roles").select("*").eq("user_id", p.auth_id).maybeSingle(),
			supabase.from("collections").select("id,name,inquiry_status,whatsapp_sent,created_at").eq("user_id", p.auth_id).order("created_at", { ascending: false }),
			supabase.from("customer_notes").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
			supabase.from("customer_scores").select("*").eq("user_id", id).maybeSingle(),
			supabase.from("customer_interests").select("*").eq("user_id", id).order("score", { ascending: false }),
			supabase.from("communication_devices").select("*").eq("user_id", id),
			supabase.from("communication_preferences").select("*").eq("user_id", id).maybeSingle(),
			supabase.from("customer_activity").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(20)
		]);
		setRoleRow(r);
		setCollections(c ?? []);
		setNotes(n ?? []);
		setScores(sc);
		setInterests(ints ?? []);
		setDevices(devs ?? []);
		setPreferences(prefs);
		setActivities(acts ?? []);
		const ids = (c ?? []).map((x) => x.id);
		if (ids.length) {
			const { data: iq } = await supabase.from("whatsapp_inquiries").select("*").in("collection_id", ids).order("created_at", { ascending: false });
			setInquiries(iq ?? []);
		} else setInquiries([]);
	};
	(0, import_react.useEffect)(() => {
		if (isAdmin) load();
	}, [isAdmin, id]);
	const setRole = async (role) => {
		await supabase.from("user_roles").delete().eq("user_id", profile.auth_id);
		const { error } = await supabase.from("user_roles").insert({
			user_id: profile.auth_id,
			role,
			account_status: roleRow?.account_status ?? "ACTIVE"
		});
		if (error) return toast.error(error.message);
		toast.success("Role updated");
		load();
	};
	const setStatus = async (account_status) => {
		const { error } = await supabase.from("user_roles").update({ account_status }).eq("user_id", profile.auth_id);
		if (error) return toast.error(error.message);
		toast.success(`Account ${account_status}`);
		load();
	};
	const toggleVip = async () => {
		const { error } = await supabase.from("profiles").update({ vip_status: !profile.vip_status }).eq("id", id);
		if (error) return toast.error(error.message);
		load();
	};
	const addTag = async () => {
		const t = tagInput.trim();
		if (!t) return;
		const next = Array.from(/* @__PURE__ */ new Set([...profile.tags ?? [], t]));
		await supabase.from("profiles").update({ tags: next }).eq("id", id);
		setTagInput("");
		load();
	};
	const removeTag = async (t) => {
		const next = (profile.tags ?? []).filter((x) => x !== t);
		await supabase.from("profiles").update({ tags: next }).eq("id", id);
		load();
	};
	const addNote = async () => {
		if (!newNote.trim()) return;
		const { data: me } = await supabase.auth.getUser();
		const { data: adminProf } = await supabase.from("profiles").select("id").eq("auth_id", me.user?.id ?? "").maybeSingle();
		const { error } = await supabase.from("customer_notes").insert({
			customer_id: id,
			admin_id: adminProf?.id ?? null,
			note: newNote.trim(),
			note_type: noteType
		});
		if (error) return toast.error(error.message);
		setNewNote("");
		load();
	};
	const delNote = async (nid) => {
		await supabase.from("customer_notes").delete().eq("id", nid);
		load();
	};
	const updatePreferences = async (updates) => {
		const { error } = await supabase.from("communication_preferences").upsert({
			user_id: id,
			...preferences,
			...updates
		});
		if (error) return toast.error(error.message);
		toast.success("Consent preferences updated");
		load();
	};
	const togglePerEventChannel = async (eventKey, channelKey) => {
		const current = preferences?.per_event_channels || {};
		const eventConfig = current[eventKey] || {};
		const nextConfig = {
			...current,
			[eventKey]: {
				...eventConfig,
				[channelKey]: !eventConfig[channelKey]
			}
		};
		await updatePreferences({ per_event_channels: nextConfig });
	};
	if (loading || !isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-8 text-sm text-muted-foreground",
		children: "Loading…"
	});
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-app py-8 text-sm text-muted-foreground",
		children: "Not found"
	});
	const health = scores?.health_score ?? 100;
	const healthColor = health >= 75 ? "text-green-500" : health >= 40 ? "text-amber-500" : "text-red-500";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-app py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/admin/customers",
				className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3 w-3" }), "Back to customers"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border p-5 md:col-span-2 bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Account Information"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-2 gap-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-foreground",
									children: profile.full_name || "—"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-foreground",
									children: profile.email
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground",
									children: "Provider"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium capitalize text-foreground",
									children: profile.email && /@gmail\./i.test(profile.email) ? "google" : "email"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground",
									children: "Joined"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-foreground",
									children: new Date(profile.created_at).toLocaleString()
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground mb-1",
									children: "Role"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: roleRow?.role ?? "customer",
									onChange: (e) => setRole(e.target.value),
									className: "rounded border border-border bg-background px-2.5 py-1 text-xs outline-none focus:border-primary",
									children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: r,
										children: r
									}, r))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground mb-1",
									children: "Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1",
									children: [
										"ACTIVE",
										"SUSPENDED",
										"BLOCKED"
									].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setStatus(s),
										className: `rounded px-2.5 py-1 text-[11px] font-medium transition ${roleRow?.account_status === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`,
										children: s
									}, s))
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: toggleVip,
								className: `inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${profile.vip_status ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "border border-border hover:bg-muted"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3.5 w-3.5" }), profile.vip_status ? "VIP CUSTOMER" : "MARK AS VIP"]
							}), profile.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `mailto:${profile.email}`,
								className: "rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition",
								children: "Send Email"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border p-5 bg-card flex flex-col justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3",
							children: "Retention Intelligence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Engagement Health"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `text-lg font-semibold ${healthColor}`,
								children: [health, "%"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Lifecycle Segment"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary",
								children: scores?.segment || "NEW"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-muted-foreground block mb-1",
								children: "System Auto Tags"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1",
								children: [(scores?.auto_tags || []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded bg-muted-foreground/10 px-2 py-0.5 text-[10px] font-mono text-muted-foreground",
									children: t
								}, t)), (!scores?.auto_tags || scores.auto_tags.length === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground italic",
									children: "None computed"
								})]
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-4 border-t border-border mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-muted-foreground block mb-1",
								children: "Manual Tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1 mb-2",
								children: [(profile.tags ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px]",
									children: [t, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => removeTag(t),
										className: "text-muted-foreground hover:text-destructive",
										children: "×"
									})]
								}, t)), (profile.tags ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "No tags"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tagInput,
									onChange: (e) => setTagInput(e.target.value),
									placeholder: "Add custom tag",
									className: "flex-1 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: addTag,
									className: "rounded bg-primary px-2.5 py-1 text-xs text-primary-foreground font-medium",
									children: "Add"
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2 space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg border border-border p-5 bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4",
							children: "Category Interests Score"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [interests.map((int) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs mb-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: int.category
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: ["Score: ", int.score]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full bg-muted rounded-full h-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "bg-primary h-1.5 rounded-full",
									style: { width: `${Math.min(100, Number(int.score) * 10)}%` }
								})
							})] }, int.category)), interests.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground italic text-center py-4",
								children: "No categories viewed or favorited yet"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg border border-border p-5 bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4",
							children: "Timeline (Recent Events)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 max-h-[400px] overflow-y-auto pr-2",
							children: [activities.map((act) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3 text-xs items-start border-l-2 border-primary/20 pl-3.5 py-1 relative ml-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium capitalize text-foreground",
											children: act.activity_type.replace(/_/g, " ")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground",
											children: new Date(act.created_at).toLocaleString()
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
										className: "mt-1 text-[10px] font-mono bg-muted p-1.5 rounded overflow-x-auto text-muted-foreground",
										children: JSON.stringify(act.metadata, null, 2)
									})]
								})]
							}, act.id)), activities.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground italic text-center py-4",
								children: "No events logged yet"
							})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg border border-border p-5 bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4",
							children: "Communication Consents"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2.5 text-xs font-medium cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: preferences?.receive_marketing ?? true,
										onChange: (e) => updatePreferences({ receive_marketing: e.target.checked }),
										className: "rounded border-border text-primary focus:ring-primary h-4 w-4"
									}), "Receive Marketing Campaigns"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2.5 text-xs font-medium cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: preferences?.receive_transactional ?? true,
										onChange: (e) => updatePreferences({ receive_transactional: e.target.checked }),
										className: "rounded border-border text-primary focus:ring-primary h-4 w-4"
									}), "Receive Transactional System Notifications"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-4 border-t border-border mt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5",
										children: "Granular Event Notifications"
									}), [
										"product_updates",
										"recommendations",
										"price_drops",
										"collection_reminders"
									].map((eventKey) => {
										const eventVal = (preferences?.per_event_channels || {})[eventKey] || {
											email: true,
											push: true
										};
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 border-b border-border/50 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium text-foreground capitalize mb-1",
												children: eventKey.replace(/_/g, " ")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: eventVal.email ?? false,
														onChange: () => togglePerEventChannel(eventKey, "email"),
														className: "rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
													}), "Email"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: eventVal.push ?? false,
														onChange: () => togglePerEventChannel(eventKey, "push"),
														className: "rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
													}), "Push Notif"]
												})]
											})]
										}, eventKey);
									})]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg border border-border p-5 bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3",
							children: [
								"Push Devices PWA (",
								devices.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [devices.map((dev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded border border-border p-2.5 text-xs bg-background",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mb-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-medium text-foreground capitalize",
											children: [
												dev.browser || "Browser",
												" · ",
												dev.device_type
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${dev.is_active ? "bg-green-500/15 text-green-500" : "bg-muted text-muted-foreground"}`,
											children: dev.is_active ? "ACTIVE" : "INACTIVE"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground font-mono truncate",
										children: dev.token
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[9px] text-muted-foreground mt-1",
										children: [
											"OS: ",
											dev.os_version || "Unknown",
											" · Registered: ",
											new Date(dev.created_at).toLocaleDateString()
										]
									})
								]
							}, dev.id)), devices.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground italic text-center py-2",
								children: "No active PWA devices registered"
							})]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border p-5 bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4",
					children: "Core Showroom Engagement"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 text-xs font-semibold text-foreground",
						children: [
							"Saved Collections (",
							collections.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 text-xs",
						children: [collections.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/collection/$id",
							params: { id: c.id },
							className: "flex items-center justify-between rounded border border-border p-2.5 hover:bg-muted transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] text-muted-foreground",
								children: [c.inquiry_status ?? "Draft", c.whatsapp_sent ? " · WhatsApp sent" : ""]
							})]
						}, c.id)), collections.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted-foreground italic",
							children: "No collections created yet"
						})]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 text-xs font-semibold text-foreground",
						children: [
							"WhatsApp Inquiries (",
							inquiries.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 text-xs",
						children: [inquiries.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded border border-border p-2.5 bg-background",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: i.customer_name || i.customer_phone || "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground capitalize font-semibold",
									children: i.inquiry_status
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] text-muted-foreground mt-1",
								children: new Date(i.created_at).toLocaleString()
							})]
						}, i.id)), inquiries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted-foreground italic",
							children: "No WhatsApp inquiries received"
						})]
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border p-5 bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4",
						children: "CRM — Internal Staff Notes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 md:flex-row mb-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: noteType,
								onChange: (e) => setNoteType(e.target.value),
								className: "rounded border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary",
								children: NOTE_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t,
									children: t
								}, t))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: newNote,
								onChange: (e) => setNewNote(e.target.value),
								placeholder: "Add internal staff notes for this user...",
								className: "flex-1 rounded border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: addNote,
								className: "rounded bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition",
								children: "Add Note"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded border border-border p-3 text-xs bg-background",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[10px] text-muted-foreground border-b border-border pb-1.5 mb-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono bg-muted px-1.5 py-0.5 rounded",
									children: n.note_type
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(n.created_at).toLocaleString() }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => delNote(n.id),
										className: "text-muted-foreground hover:text-destructive transition",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "whitespace-pre-wrap text-foreground font-medium",
								children: n.note
							})]
						}, n.id)), notes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground italic py-2",
							children: "No notes posted yet"
						})]
					})
				]
			})
		]
	});
}
export { CustomerDetail as component };
