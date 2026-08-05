import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  LogOut,
  Mail,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Bookmark,
  Settings as SettingsIcon,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — Stoneworks" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null } | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("auth_id", user.id)
        .maybeSingle();
      setProfile(p ?? null);
      setFullName(p?.full_name ?? "");
    })();
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("auth_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  if (loading) return <div className="container-app py-10 text-sm text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="container-app py-10">
        <h1 className="font-display text-2xl font-semibold">Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your profile and collection.</p>
        <div className="mt-6 flex gap-3">
          <Link to="/auth" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Sign in
          </Link>
          <Link to="/collection" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-primary">
            My Collection
          </Link>
        </div>
      </div>
    );
  }

  const roleLabel = isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Customer";

  return (
    <div className="container-app py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Account</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and settings.</p>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:border-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium">{profile?.full_name || user.email}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" /> {user.email}
            </div>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
            {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
            {roleLabel}
          </span>
        </div>

        <form onSubmit={saveProfile} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link to="/collection" search={{ autoPush: false }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-emerald-500 transition">
          <Bookmark className="h-5 w-5 text-emerald-600" />
          <div>
            <div className="font-medium text-sm">Active Project Workspace</div>
            <div className="text-xs text-muted-foreground">Current working project draft & products</div>
          </div>
        </Link>

        <Link to="/my-collections" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-amber-500 transition">
          <Bookmark className="h-5 w-5 text-amber-600" />
          <div>
            <div className="font-medium text-sm">My Collections History</div>
            <div className="text-xs text-muted-foreground">Immutable records of submitted quotation requests</div>
          </div>
        </Link>

        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary transition">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium text-sm">Admin CRM & Quotations</div>
              <div className="text-xs text-muted-foreground">Manage products & quotation pipeline</div>
            </div>
          </Link>
        )}

        {isSuperAdmin && (
          <Link to="/settings" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary transition">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium text-sm">Company Settings</div>
              <div className="text-xs text-muted-foreground">Contact info, socials, WhatsApp</div>
            </div>
          </Link>
        )}
      </section>
    </div>
  );
}
