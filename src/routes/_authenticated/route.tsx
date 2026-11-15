import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ location }) => {
    try {
      const { data, error } = await supabase.auth.getUser();
      // Allow guest users to access the /favorites route
      if ((error || !data.user) && location.pathname !== "/favorites") {
        throw redirect({ to: "/auth" });
      }
      return { user: data.user || null };
    } catch (err) {
      if (err && typeof err === "object" && "to" in (err as Record<string, unknown>)) {
        throw err;
      }
      if (location.pathname === "/favorites") {
        return { user: null };
      }
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
