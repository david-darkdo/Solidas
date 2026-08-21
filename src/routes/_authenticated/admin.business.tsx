import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { publicImageUrl } from "@/components/ImageUploader";
import { getCloudinarySignatureServer, uploadLargeMediaFileClient } from "@/lib/upload-server";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  X,
  MessageCircle,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Inbox,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowUp,
  ArrowDown,
  Tv,
  Award,
  Shield,
  HelpCircle,
  FileCheck
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/business")({
  head: () => ({ meta: [{ title: "Business Operations — Admin" }] }),
  component: BusinessOpsPage,
});

const STATUSES = ["NEW", "CONTACTED", "NEGOTIATING", "QUOTED", "CLOSED", "LOST"] as const;
type Status = (typeof STATUSES)[number];

type Inquiry = {
  id: string;
  collection_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  whatsapp_number: string | null;
  inquiry_status: Status;
  internal_notes: string | null;
  assigned_admin_id: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string | null;
};

type CollectionRow = {
  id: string;
  user_id: string;
  name: string;
  inquiry_status: Status;
  internal_notes: string | null;
  whatsapp_sent: boolean;
  created_at: string;
  updated_at: string | null;
  closed_at: string | null;
  item_count: number;
  user_email: string | null;
  user_name: string | null;
};

type HeroVideo = {
  id: string;
  url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
};

type TrustFeature = {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
};

type BusinessTab = "pipeline" | "collections" | "experience" | "home_videos";

function BusinessOpsPage() {
  const { isAdmin, loading, user } = useAuth();
  const getSignatureFn = useServerFn(getCloudinarySignatureServer);
  const [activeTab, setActiveTab] = useState<BusinessTab>("pipeline");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, { email: string | null; full_name: string | null }>>({});
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Experience Manager states
  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [trusts, setTrusts] = useState<TrustFeature[]>([]);
  const [editingTrust, setEditingTrust] = useState<TrustFeature | null>(null);
  const [newTrust, setNewTrust] = useState<{ icon_name: string; title: string; description: string }>({
    icon_name: "Shield",
    title: "",
    description: "",
  });

  // Showcase / Home Videos states
  const [showcaseVideos, setShowcaseVideos] = useState<any[]>([]);
  const [newShowcaseUrl, setNewShowcaseUrl] = useState("");
  const [newShowcaseTitle, setNewShowcaseTitle] = useState("");
  const [busy, setBusy] = useState(false);

  // Audit logger helper
  const logAuditAction = async (action: string, details: any) => {
    try {
      const { data: me } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", me.user?.id ?? "").maybeSingle();
      if (profile?.id) {
        await supabase.from("experience_audit_logs").insert({
          user_id: profile.id,
          action,
          details
        });
      }
    } catch (err: any) {
      console.error("Audit logging error:", err);
    }
  };

  const loadAll = useCallback(async () => {
    try {
      const [
        { data: inq },
        { data: cols },
        { data: items },
        { data: profs },
        { data: vids },
        { data: trs },
        { data: scVids }
      ] = await Promise.all([
        supabase.from("whatsapp_inquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("collections").select("*").order("created_at", { ascending: false }),
        supabase.from("collection_items").select("collection_id"),
        supabase.from("profiles").select("auth_id, email, full_name"),
        supabase.from("hero_videos" as any).select("*").order("order_index", { ascending: true }),
        supabase.from("trust_features" as any).select("*").order("order_index", { ascending: true }),
        supabase.from("showcase_videos" as any).select("*").order("order_index", { ascending: true })
      ]);

      const counts = new Map<string, number>();
      for (const r of (items ?? []) as Array<{ collection_id: string }>) {
        counts.set(r.collection_id, (counts.get(r.collection_id) ?? 0) + 1);
      }
      const pmap: Record<string, { email: string | null; full_name: string | null }> = {};
      for (const p of (profs ?? []) as Array<{ auth_id: string; email: string | null; full_name: string | null }>) {
        pmap[p.auth_id] = { email: p.email, full_name: p.full_name };
      }
      setProfilesById(pmap);

      setInquiries((inq ?? []) as Inquiry[]);
      setCollections(
        ((cols ?? []) as Array<Omit<CollectionRow, "item_count" | "user_email" | "user_name">>).map((c) => ({
          ...c,
          item_count: counts.get(c.id) ?? 0,
          user_email: pmap[c.user_id]?.email ?? null,
          user_name: pmap[c.user_id]?.full_name ?? null,
        }))
      );
      setVideos((vids ?? []) as any);
      setTrusts((trs ?? []) as any);
      setShowcaseVideos((scVids ?? []) as any);
      setLoaded(true);
    } catch (err: any) {
      toast.error((err as any).message);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);

  const metrics = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return {
      totalInquiries: inquiries.length,
      negotiating: inquiries.filter((i) => i.inquiry_status === "NEGOTIATING").length,
      quoted: inquiries.filter((i) => i.inquiry_status === "QUOTED").length,
      closed: inquiries.filter((i) => i.inquiry_status === "CLOSED").length,
      collections: collections.length,
      monthly: inquiries.filter((i) => new Date(i.created_at) >= monthAgo).length,
    };
  }, [inquiries, collections]);

  const updateInquiryStatus = async (id: string, status: Status) => {
    const { error } = await supabase
      .from("whatsapp_inquiries")
      .update({ inquiry_status: status } as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    setInquiries((rows) =>
      rows.map((r) => (r.id === id ? { ...r, inquiry_status: status, last_contacted_at: new Date().toISOString() } : r))
    );
    if (selected?.id === id) {
      setSelected((s) => (s ? { ...s, inquiry_status: status, last_contacted_at: new Date().toISOString() } : s));
    }
    await logAuditAction("update_inquiry_status", { id, status });
    toast.success(`Status → ${status}`);
  };

  const updateInquiryNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from("whatsapp_inquiries")
      .update({ internal_notes: notes } as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    setInquiries((rows) => rows.map((r) => (r.id === id ? { ...r, internal_notes: notes } : r)));
    toast.success("Notes saved");
  };

  const updateCollectionStatus = async (id: string, status: Status) => {
    const patch: Record<string, unknown> = { inquiry_status: status };
    if (status === "CLOSED") patch.closed_at = new Date().toISOString();
    const { error } = await supabase.from("collections").update(patch as never).eq("id", id);
    if (error) return toast.error(error.message);
    setCollections((rows) => rows.map((r) => (r.id === id ? { ...r, inquiry_status: status } : r)));
    await logAuditAction("update_collection_status", { id, status });
    toast.success(`Collection → ${status}`);
  };

  const updateCollectionNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from("collections")
      .update({ internal_notes: notes } as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    setCollections((rows) => rows.map((r) => (r.id === id ? { ...r, internal_notes: notes } : r)));
    toast.success("Notes saved");
  };

  // EXPERIENCE MANAGER — HERO VIDEOS
  const addHeroVideo = async () => {
    if (!newVideoUrl.trim()) return toast.error("Please provide a video URL");
    setBusy(true);
    try {
      const nextIndex = videos.length;
      const { error } = await supabase.from("hero_videos" as any).insert({
        url: newVideoUrl.trim(),
        order_index: nextIndex,
        is_active: true
      });
      if (error) throw error;
      setNewVideoUrl("");
      toast.success("Hero video added successfully");
      await logAuditAction("add_hero_video", { url: newVideoUrl.trim(), order_index: nextIndex });
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteHeroVideo = async (id: string) => {
    if (!confirm("Delete this background video? This will instantly remove it from the homepage slider.")) return;
    try {
      const { error } = await supabase.from("hero_videos" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Background video deleted");
      await logAuditAction("delete_hero_video", { id });
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleHeroVideo = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("hero_videos" as any).update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      toast.success("Video status updated");
      await logAuditAction("toggle_hero_video", { id, is_active: !current });
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const reorderVideo = async (video: HeroVideo, direction: "up" | "down") => {
    const idx = videos.findIndex(v => v.id === video.id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === videos.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const target = videos[swapIdx];

    try {
      await Promise.all([
        supabase.from("hero_videos" as any).update({ order_index: target.order_index }).eq("id", video.id),
        supabase.from("hero_videos" as any).update({ order_index: video.order_index }).eq("id", target.id)
      ]);
      toast.success("Reordered successfully");
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // EXPERIENCE MANAGER — TRUST STRIP
  const addTrustFeature = async () => {
    if (!newTrust.title.trim() || !newTrust.description.trim()) return toast.error("Provide a title and description");
    setBusy(true);
    try {
      const nextIndex = trusts.length;
      const { error } = await supabase.from("trust_features" as any).insert({
        icon_name: newTrust.icon_name,
        title: newTrust.title.trim(),
        description: newTrust.description.trim(),
        order_index: nextIndex
      });
      if (error) throw error;
      setNewTrust({ icon_name: "Shield", title: "", description: "" });
      toast.success("Trust feature added");
      await logAuditAction("add_trust_feature", { title: newTrust.title.trim(), icon: newTrust.icon_name });
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteTrustFeature = async (id: string) => {
    if (!confirm("Delete this trust feature? This changes the bottom trust strip storefront-wide.")) return;
    try {
      const { error } = await supabase.from("trust_features" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Trust feature deleted");
      await logAuditAction("delete_trust_feature", { id });
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateTrustFeature = async () => {
    if (!editingTrust) return;
    try {
      const { error } = await supabase.from("trust_features" as any).update({
        icon_name: editingTrust.icon_name,
        title: editingTrust.title,
        description: editingTrust.description
      }).eq("id", editingTrust.id);
      if (error) throw error;
      toast.success("Trust feature updated");
      await logAuditAction("update_trust_feature", { id: editingTrust.id, title: editingTrust.title });
      setEditingTrust(null);
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const reorderTrust = async (trust: TrustFeature, direction: "up" | "down") => {
    const idx = trusts.findIndex(t => t.id === trust.id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === trusts.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const target = trusts[swapIdx];

    try {
      await Promise.all([
        supabase.from("trust_features" as any).update({ order_index: target.order_index }).eq("id", trust.id),
        supabase.from("trust_features" as any).update({ order_index: trust.order_index }).eq("id", target.id)
      ]);
      toast.success("Reordered trust strip features");
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // SHOWCASE / HOME VIDEOS MANAGER
  const addShowcaseVideo = async () => {
    if (!newShowcaseUrl.trim()) return toast.error("Please upload or provide a video URL");
    setBusy(true);
    try {
      const nextIndex = showcaseVideos.length;
      const { error } = await supabase.from("showcase_videos" as any).insert({
        url: newShowcaseUrl.trim(),
        title: newShowcaseTitle.trim() || null,
        order_index: nextIndex,
        is_active: true
      });
      if (error) throw error;
      setNewShowcaseUrl("");
      setNewShowcaseTitle("");
      toast.success("Showcase video added successfully!");
      await logAuditAction("add_showcase_video", { url: newShowcaseUrl.trim(), order_index: nextIndex });
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteShowcaseVideo = async (id: string) => {
    if (!confirm("Delete this showcase video? This will remove it from the homepage continuous slider.")) return;
    try {
      const { error } = await supabase.from("showcase_videos" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Showcase video removed");
      await logAuditAction("delete_showcase_video", { id });
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleShowcaseVideo = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("showcase_videos" as any).update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      toast.success("Showcase video status updated");
      await logAuditAction("toggle_showcase_video", { id, is_active: !current });
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const reorderShowcaseVideo = async (video: any, direction: "up" | "down") => {
    const idx = showcaseVideos.findIndex(v => v.id === video.id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === showcaseVideos.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const target = showcaseVideos[swapIdx];

    try {
      await Promise.all([
        supabase.from("showcase_videos" as any).update({ order_index: target.order_index }).eq("id", video.id),
        supabase.from("showcase_videos" as any).update({ order_index: video.order_index }).eq("id", target.id)
      ]);
      toast.success("Reordered showcase videos");
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading || !loaded) {
    return <div className="container-app py-10 text-sm text-muted-foreground">Loading business operations…</div>;
  }
  if (!isAdmin) {
    return <div className="container-app py-10 text-sm">Access denied.</div>;
  }

  return (
    <div className="container-app space-y-6 py-6">
      {/* Title / Tab Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Business Operations Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage pipeline sales inquiries, client collections, and storefront interactive media/trust options.</p>
        </div>
        
        <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 self-start lg:self-center">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              activeTab === "pipeline" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sales Pipeline
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              activeTab === "collections" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Collections Manager
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              activeTab === "experience" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Experience Manager
          </button>
          <button
            onClick={() => setActiveTab("home_videos")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              activeTab === "home_videos" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Home Videos
          </button>
        </div>
      </div>

      {/* TABS VIEWPORT */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          {/* Metrics */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Metric icon={Inbox} label="Total Inquiries" value={metrics.totalInquiries} />
            <Metric icon={MessageCircle} label="Negotiating" value={metrics.negotiating} />
            <Metric icon={Briefcase} label="Quoted" value={metrics.quoted} />
            <Metric icon={CheckCircle2} label="Closed" value={metrics.closed} />
            <Metric icon={Users} label="Collections" value={metrics.collections} />
            <Metric icon={Calendar} label="Monthly" value={metrics.monthly} />
          </section>

          {/* Kanban */}
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-display text-base font-bold tracking-tight text-foreground">Inquiry Pipeline Kanban</h2>
            <div className="mt-3 grid auto-rows-fr gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-6 scrollbar-thin">
              {STATUSES.map((s) => {
                const cards = inquiries.filter((i) => i.inquiry_status === s);
                return (
                  <div key={s} className="min-w-[190px] rounded-lg border border-border bg-surface p-2 flex flex-col">
                    <div className="mb-2.5 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1">
                      <span>{s}</span>
                      <span className="rounded-full bg-primary/10 px-1.5 text-primary text-[9px]">{cards.length}</span>
                    </div>
                    <ul className="space-y-2 flex-1 overflow-y-auto">
                      {cards.map((c) => (
                        <li key={c.id}>
                          <button
                            onClick={() => setSelected(c)}
                            className="block w-full rounded-md border border-border bg-card p-2 text-left text-xs hover:border-primary transition"
                          >
                            <div className="truncate font-semibold text-foreground">{c.customer_name || "Anonymous"}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{c.customer_email || "—"}</div>
                            <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/40">
                              <span>{new Date(c.created_at).toLocaleDateString()}</span>
                              <span className="font-mono">{c.collection_id.slice(0, 5)}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                      {cards.length === 0 && (
                        <li className="rounded-md border border-dashed border-border/60 p-4 text-center text-[10px] text-muted-foreground italic">
                          No active cards
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {activeTab === "collections" && (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-base font-bold tracking-tight text-foreground">Collection Manager</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 pr-3 font-semibold">Collection</th>
                  <th className="py-2.5 pr-3 font-semibold">Customer</th>
                  <th className="py-2.5 pr-3 font-semibold">Items</th>
                  <th className="py-2.5 pr-3 font-semibold">WA Sent</th>
                  <th className="py-2.5 pr-3 font-semibold">Status</th>
                  <th className="py-2.5 pr-3 font-semibold">Created</th>
                  <th className="py-2.5 pr-3 font-semibold">Notes</th>
                  <th className="py-2.5 pr-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/65">
                {collections.map((c) => {
                  const inq = inquiries.find((i) => i.collection_id === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-muted/10 transition">
                      <td className="py-2 pr-3 font-mono font-bold text-foreground">{c.id.slice(0, 8)}</td>
                      <td className="py-2 pr-3">{c.user_name || c.user_email || "—"}</td>
                      <td className="py-2 pr-3 font-semibold">{c.item_count}</td>
                      <td className="py-2 pr-3">{c.whatsapp_sent ? <span className="text-green-500 font-bold">✓</span> : "—"}</td>
                      <td className="py-2 pr-3">
                        <select
                          value={c.inquiry_status}
                          onChange={(e) => updateCollectionStatus(c.id, e.target.value as Status)}
                          className="rounded border border-border bg-background px-1 py-0.5 text-[11px]"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="py-2 pr-3">
                        <NotesCell value={c.internal_notes ?? ""} onSave={(v) => updateCollectionNotes(c.id, v)} />
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1">
                          <a
                            href={`/collection/${c.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-border px-2 py-0.5 text-[10px] font-medium hover:bg-surface-2 transition"
                          >
                            View
                          </a>
                          {inq && (
                            <button
                              onClick={() => setSelected(inq)}
                              className="rounded border border-primary/40 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/5 transition"
                            >
                              Open Inquiry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {collections.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground italic">No collections registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "experience" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* HERO VIDEOS MANAGER */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border pb-3">
              <Tv className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">Hero Videos Carousel Manager</h2>
            </div>
            
            {/* Add video form with upload & URL support */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Paste background video URL (.mp4)"
                  className="flex-1 rounded border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                />
                <button
                  disabled={busy || !newVideoUrl}
                  onClick={addHeroVideo}
                  className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-60 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <div className="relative border border-dashed border-border rounded-lg p-3 text-center bg-background/50 hover:bg-background transition">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={async (e) => {
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
                        },
                      });
                      setNewVideoUrl(url);
                      toast.dismiss(uploadToast);
                      toast.success("Video uploaded! Click 'Add' to activate.");
                    } catch (err: any) {
                      toast.dismiss(uploadToast);
                      toast.error(err.message || "Failed to upload video");
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground font-medium">Drag and drop video here, or <span className="text-primary underline cursor-pointer">browse local files</span></p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">Supports MP4, WebM, MOV & high-resolution videos (large files supported).</p>
              </div>
            </div>

            {/* Videos List */}
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {videos.map((vid, idx) => (
                <div key={vid.id} className="rounded-lg border border-border bg-background p-3 flex gap-3 items-center text-xs justify-between group">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Video #{idx + 1}</span>
                      <span className={`rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase ${vid.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                        {vid.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{vid.url}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => reorderVideo(vid, "up")} disabled={idx === 0} className="p-1 rounded border border-border hover:bg-muted disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                    <button onClick={() => reorderVideo(vid, "down")} disabled={idx === videos.length - 1} className="p-1 rounded border border-border hover:bg-muted disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                    <button onClick={() => toggleHeroVideo(vid.id, vid.is_active)} className="rounded border border-border px-2 py-0.5 text-[9px] font-semibold hover:bg-muted transition">Toggle</button>
                    <button onClick={() => deleteHeroVideo(vid.id)} className="p-1.5 rounded text-destructive hover:bg-destructive/5 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <div className="text-center py-10 border border-dashed border-border rounded-lg text-xs text-muted-foreground italic">No hero videos configured. Autoplay defaults will load.</div>
              )}
            </div>
          </div>

          {/* TRUST FEATURE STRIP MANAGER */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border pb-3">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">Trust features strip</h2>
            </div>

            {/* Add feature Form */}
            {editingTrust ? (
              <div className="rounded border border-border/80 p-3 bg-surface text-xs space-y-3">
                <div className="font-bold text-foreground">Edit Trust Feature</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Title</span>
                    <input value={editingTrust.title} onChange={(e) => setEditingTrust({ ...editingTrust, title: e.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2.5 py-1" />
                  </label>
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Icon Identifier</span>
                    <select value={editingTrust.icon_name} onChange={(e) => setEditingTrust({ ...editingTrust, icon_name: e.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2.5 py-1">
                      {["Shield", "Truck", "CreditCard", "Headphones", "FileCheck", "HelpCircle"].map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block text-xs">
                  <span className="text-muted-foreground">Description</span>
                  <input value={editingTrust.description} onChange={(e) => setEditingTrust({ ...editingTrust, description: e.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2.5 py-1" />
                </label>
                <div className="flex gap-2">
                  <button onClick={updateTrustFeature} className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground font-semibold">Save Changes</button>
                  <button onClick={() => setEditingTrust(null)} className="rounded border border-border px-3 py-1.5 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="rounded border border-border/50 p-3 bg-muted/20 text-xs space-y-3">
                <div className="font-semibold text-foreground">Add New Feature Strip Item</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block text-[10px] text-muted-foreground">
                    Title
                    <input value={newTrust.title} onChange={(e) => setNewTrust({ ...newTrust, title: e.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2.5 py-1" />
                  </label>
                  <label className="block text-[10px] text-muted-foreground">
                    Icon Name
                    <select value={newTrust.icon_name} onChange={(e) => setNewTrust({ ...newTrust, icon_name: e.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2.5 py-1">
                      {["Shield", "Truck", "CreditCard", "Headphones", "FileCheck", "HelpCircle"].map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block text-[10px] text-muted-foreground">
                  Description
                  <input value={newTrust.description} onChange={(e) => setNewTrust({ ...newTrust, description: e.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2.5 py-1" />
                </label>
                <button disabled={busy} onClick={addTrustFeature} className="rounded bg-primary px-3 py-1.5 font-semibold text-primary-foreground">Add Feature Strip</button>
              </div>
            )}

            {/* Trusts List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {trusts.map((t, idx) => (
                <div key={t.id} className="rounded-lg border border-border bg-background p-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[9px]">{t.icon_name}</span>
                      {t.title}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button onClick={() => reorderTrust(t, "up")} disabled={idx === 0} className="p-1 rounded border border-border hover:bg-muted disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                    <button onClick={() => reorderTrust(t, "down")} disabled={idx === trusts.length - 1} className="p-1 rounded border border-border hover:bg-muted disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                    <button onClick={() => setEditingTrust(t)} className="p-1.5 rounded hover:bg-muted transition text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteTrustFeature(t.id)} className="p-1.5 rounded text-destructive hover:bg-destructive/5 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "home_videos" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-[#1E82A6]" />
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Homepage Showcase Video Manager</h2>
                <p className="text-xs text-muted-foreground">Upload and arrange video clips displayed in the continuous showcase slider on the homepage.</p>
              </div>
            </div>
            <span className="rounded-full bg-[#1E82A6]/10 px-3 py-1 text-xs font-bold text-[#1E82A6] shrink-0 self-start sm:self-center">
              {showcaseVideos.filter(v => v.is_active).length} Active Video{showcaseVideos.filter(v => v.is_active).length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload Form Box */}
            <div className="space-y-4 rounded-xl border border-border/80 bg-surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Add New Showcase Video</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Video Title / Caption (Optional)</label>
                  <input
                    value={newShowcaseTitle}
                    onChange={(e) => setNewShowcaseTitle(e.target.value)}
                    placeholder="e.g. Italian Marble Living Room Installation"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-[#1E82A6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Video URL or Direct File Upload</label>
                  <div className="flex gap-2">
                    <input
                      value={newShowcaseUrl}
                      onChange={(e) => setNewShowcaseUrl(e.target.value)}
                      placeholder="Paste background video URL (.mp4 / .webm / .mov)"
                      className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-[#1E82A6]"
                    />
                    <button
                      disabled={busy || !newShowcaseUrl.trim()}
                      onClick={addShowcaseVideo}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#C0262D] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A1B21] disabled:opacity-50 transition shadow-xs shrink-0"
                    >
                      <Plus className="h-4 w-4" /> Save Video
                    </button>
                  </div>
                </div>

                <div className="relative border-2 border-dashed border-border rounded-xl p-5 text-center bg-background/80 hover:bg-background transition">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={async (e) => {
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
                          },
                        });
                        setNewShowcaseUrl(url);
                        toast.dismiss(uploadToast);
                        toast.success("Video uploaded! Click 'Save Video' to activate.");
                      } catch (err: any) {
                        toast.dismiss(uploadToast);
                        toast.error(err.message || "Failed to upload video");
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Tv className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-xs font-bold text-foreground">Drag and drop video file here, or <span className="text-[#1E82A6] underline cursor-pointer">browse local files</span></p>
                  <p className="text-[10px] text-muted-foreground mt-1">Supports MP4, WebM, MOV & high-definition video files (large files supported directly).</p>
                </div>
              </div>
            </div>

            {/* Videos Playlist List */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Showcase Playlist ({showcaseVideos.length})</h3>
              
              {showcaseVideos.map((vid, idx) => (
                <div key={vid.id} className="rounded-xl border border-border bg-background p-3.5 flex gap-3 items-center justify-between shadow-2xs group">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">Showcase #{idx + 1}</span>
                      {vid.title && <span className="text-xs font-medium text-muted-foreground truncate">— {vid.title}</span>}
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${vid.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                        {vid.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{vid.url}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => reorderShowcaseVideo(vid, "up")} disabled={idx === 0} className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-30" title="Move Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => reorderShowcaseVideo(vid, "down")} disabled={idx === showcaseVideos.length - 1} className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-30" title="Move Down"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button onClick={() => toggleShowcaseVideo(vid.id, vid.is_active)} className="rounded border border-border px-2.5 py-1 text-[10px] font-bold hover:bg-muted transition">Toggle</button>
                    <button onClick={() => deleteShowcaseVideo(vid.id)} className="p-1.5 rounded text-destructive hover:bg-destructive/10 transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}

              {showcaseVideos.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border rounded-xl text-xs text-muted-foreground italic">
                  No custom showcase videos added yet. Default architectural showcase videos will play on the homepage slider.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <InquiryDrawer
          inquiry={selected}
          onClose={() => setSelected(null)}
          onStatus={(s) => updateInquiryStatus(selected.id, s)}
          onNotes={(n) => updateInquiryNotes(selected.id, n)}
          profile={profilesById[selected.assigned_admin_id ?? ""] ?? null}
        />
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Inbox; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function NotesCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <div className="flex items-center gap-1">
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Notes…"
        className="w-32 rounded border border-border bg-background px-1 py-0.5 text-[11px]"
      />
      {v !== value && (
        <button onClick={() => onSave(v)} className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground font-semibold">
          Save
        </button>
      )}
    </div>
  );
}

function InquiryDrawer({
  inquiry,
  onClose,
  onStatus,
  onNotes,
  profile,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onStatus: (s: Status) => void;
  onNotes: (n: string) => void;
  profile: { email: string | null; full_name: string | null } | null;
}) {
  const [notes, setNotes] = useState(inquiry.internal_notes ?? "");
  const [collection, setCollection] = useState<{ id: string; created_at: string } | null>(null);
  const [products, setProducts] = useState<Array<{ id: string; name: string; code: string; image_url: string | null }>>([]);

  useEffect(() => setNotes(inquiry.internal_notes ?? ""), [inquiry.id, inquiry.internal_notes]);

  useEffect(() => {
    (async () => {
      const { data: col } = await supabase
        .from("collections")
        .select("id, created_at")
        .eq("id", inquiry.collection_id)
        .maybeSingle();
      setCollection(col ?? null);
      const { data: items } = await supabase
        .from("collection_items")
        .select("product_id")
        .eq("collection_id", inquiry.collection_id);
      const ids = (items ?? []).map((i: { product_id: string }) => i.product_id);
      if (!ids.length) return setProducts([]);
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,code,image_url")
        .in("id", ids);
      setProducts((prods ?? []) as Array<{ id: string; name: string; code: string; image_url: string | null }>);
    })();
  }, [inquiry.collection_id]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-background">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <h3 className="font-display text-lg font-semibold">Inquiry Details</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-surface-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-5 p-4 text-sm">
          <Section title="Customer Information">
            <Row label="Name" value={inquiry.customer_name} />
            <Row label="Email" value={inquiry.customer_email} />
            <Row label="Phone" value={inquiry.customer_phone} />
            <Row label="WhatsApp" value={inquiry.whatsapp_number} />
          </Section>

          <Section title="Collection Information">
            <Row label="Collection ID" value={inquiry.collection_id} mono />
            <Row label="Total Products" value={String(products.length)} />
            <Row
              label="Created"
              value={collection?.created_at ? new Date(collection.created_at).toLocaleString() : "—"}
            />
          </Section>

          <Section title="Collection Preview">
            {products.length === 0 ? (
              <p className="text-xs text-muted-foreground">No products in this collection.</p>
            ) : (
              <ul className="grid grid-cols-3 gap-2">
                {products.map((p) => (
                  <li key={p.id} className="overflow-hidden rounded-md border border-border bg-card">
                    {publicImageUrl(p.image_url) ? (
                      <img src={publicImageUrl(p.image_url)!} alt="" className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="aspect-square w-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">No image</div>
                    )}
                    <div className="p-1 text-[10px]">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="truncate text-muted-foreground font-mono">{p.code}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Assigned Admin">
            <Row label="Admin Email" value={profile?.email} />
            <Row label="Admin Name" value={profile?.full_name} />
          </Section>

          <Section title="Inquiry Status">
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatus(s)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition ${
                    inquiry.inquiry_status === s
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card hover:bg-surface-2"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Internal Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this client / pricing deal…"
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
            />
            <button
              onClick={() => onNotes(notes)}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 shadow-xs transition"
            >
              Save Notes
            </button>
          </Section>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex justify-between py-1 border-b border-border/40 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${mono ? "font-mono text-[11px]" : ""}`}>{value || "—"}</span>
    </div>
  );
}
