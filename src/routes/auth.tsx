import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mergeGuestIntoUser } from "@/lib/collection";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirectTo?: string; autoPush?: boolean } => {
    return {
      redirectTo: search.redirectTo ? String(search.redirectTo) : undefined,
      autoPush: search.autoPush === "true" || search.autoPush === true ? true : undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Sign in — Enreach Concepts" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const targetPath = search.autoPush ? `${search.redirectTo || "/collection"}?autoPush=true` : (search.redirectTo || "/collection");

  if (user) {
    // Already signed in — redirect to destination with autoPush
    setTimeout(() => {
      if (search.autoPush) {
        navigate({ to: "/collection", search: { autoPush: true } });
      } else {
        navigate({ to: (search.redirectTo as any) || "/collection" });
      }
    }, 0);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${targetPath}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.user) {
          try { await mergeGuestIntoUser(data.user.id); } catch {}
          toast.success("Account created");
          if (search.autoPush) {
            navigate({ to: "/collection", search: { autoPush: true } });
          } else {
            navigate({ to: (search.redirectTo as any) || "/collection" });
          }
        } else {
          toast("Check your email to confirm your account");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          try { await mergeGuestIntoUser(data.user.id); } catch {}
        }
        toast.success("Welcome back");
        if (search.autoPush) {
          navigate({ to: "/collection", search: { autoPush: true } });
        } else {
          navigate({ to: (search.redirectTo as any) || "/collection" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const redirectUrl = `${window.location.origin}/collection?autoPush=true`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      toast.error("Google sign-in failed: " + error.message);
      setBusy(false);
    }
  };

  return (
    <div className="container-app max-w-md py-10">
      <h1 className="font-display text-2xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "signin" ? "Sync your collection across devices and submit quotation requests." : "Save & share collections, push to WhatsApp."}
      </p>

      <button
        onClick={google}
        disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-surface-2 transition"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-[#4285F4]">G</span>
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        )}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-medium text-primary hover:underline">
          {mode === "signin" ? "Create account" : "Sign in"}
        </button>
      </p>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">← Back to feed</Link>
      </p>
    </div>
  );
}
