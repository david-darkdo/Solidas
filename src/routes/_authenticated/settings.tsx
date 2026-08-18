import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings, APP_SETTINGS_QUERY_KEY } from "@/lib/settings";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Settings as SettingsIcon, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Company Settings — SOLIDAS TILES AND MARBLE NIG. LIMITED" }] }),
  component: SettingsPage,
});

const FIELDS: [string, string, string?][] = [
  ["support_whatsapp", "Support WhatsApp", "Used for the floating WhatsApp button"],
  ["sales_whatsapp", "Sales WhatsApp", "Used for Push to WhatsApp from collections"],
  ["company_email", "Company Email"],
  ["company_address", "Company Address"],
  ["map_url", "Map URL"],
  ["facebook_url", "Facebook URL"],
  ["instagram_url", "Instagram URL"],
  ["tiktok_url", "TikTok URL"],
  ["youtube_url", "YouTube URL"],
  ["google_site_verification", "Google Site Verification", "Paste the Google Search Console meta tag content code"],
  ["bing_site_verification", "Bing Site Verification", "Paste the Bing Webmaster tools xml/meta verification code"],
];

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings } = useAppSettings();
  const { loading: authLoading, isSuperAdmin } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const next: Record<string, string> = {};
    for (const [k] of FIELDS) next[k] = (settings as any)[k] ?? "";
    setForm(next);
  }, [settings]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, string | null> = {};
    for (const [k] of FIELDS) payload[k] = form[k]?.trim() || null;
    const { error } = settings?.id
      ? await supabase.from("app_settings").update(payload as any).eq("id", settings.id)
      : await supabase.from("app_settings").insert(payload as any);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("SOLIDAS Company Settings saved");
    await queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
  };

  if (authLoading) {
    return <AppShell><div className="container-app py-10 text-sm text-muted-foreground">Loading settings…</div></AppShell>;
  }

  if (!isSuperAdmin) {
    return (
      <AppShell>
        <div className="container-app py-12">
          <div className="rounded-xl border border-[#C0262D]/30 bg-[#C0262D]/5 p-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-[#C0262D]">
              <ShieldAlert className="h-5 w-5" />
              <h1 className="font-display text-lg font-bold">Super Admin Only</h1>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              SOLIDAS company settings can only be edited by a super admin.
            </p>
            <Link to="/account" className="mt-4 inline-block rounded-lg border border-border bg-white px-4 py-2 text-xs font-bold hover:bg-surface-2">
              Back to Account
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container-app py-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <SettingsIcon className="h-6 w-6 text-[#1E82A6]" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">SOLIDAS Company Settings</h1>
            <p className="text-xs text-muted-foreground">
              Configure corporate phone numbers, WhatsApp, addresses, and Search Console verification tokens.
            </p>
          </div>
        </div>

        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label, hint]) => (
            <label key={key} className="text-xs space-y-1">
              <span className="block font-bold uppercase tracking-wider text-[#1E82A6]">
                {label}
              </span>
              <input
                value={form[key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-foreground outline-none focus:border-[#1E82A6]"
              />
              {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
            </label>
          ))}
          <div className="sm:col-span-2 pt-2">
            <button
              disabled={saving}
              className="rounded-lg bg-[#C0262D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9A1B21] disabled:opacity-60 transition shadow-sm"
            >
              {saving ? "Saving…" : "Save SOLIDAS Settings"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
