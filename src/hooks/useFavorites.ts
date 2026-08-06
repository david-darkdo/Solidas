import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const GUEST_STORAGE_KEY = "enreach_favorites_v2";
const USER_STORAGE_KEY_PREFIX = "enreach_favorites_user_v2_";
const EVENT_NAME = "enreach_favorites_changed";

function getGuestFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setGuestFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {}
}

function getUserFavoritesCache(userId: string): string[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(`${USER_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setUserFavoritesCache(userId: string, ids: string[]) {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${USER_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(Array.from(new Set(ids))));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {}
}

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (typeof window !== "undefined" && user?.id) {
      const cached = getUserFavoritesCache(user.id);
      if (cached.length > 0) return cached;
    }
    return getGuestFavorites();
  });
  const [loading, setLoading] = useState(false);

  // Sync favorites on user auth change or custom event
  const syncFavorites = useCallback(async () => {
    if (user?.id) {
      // 1. Instant local cache load (<16ms)
      const cached = getUserFavoritesCache(user.id);
      if (cached.length > 0) {
        setFavoriteIds(cached);
      }

      setLoading(true);
      try {
        // 2. Fetch user profile ID to match Supabase RLS check_user_owns_profile policy
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle();

        const profileId = prof?.id;
        const targetUserId = profileId || user.id;

        // 3. Sync guest local favorites to Supabase if any exist
        const guestIds = getGuestFavorites();
        if (guestIds.length > 0) {
          for (const prodId of guestIds) {
            try {
              await supabase.from("favorites").upsert({ user_id: targetUserId, product_id: prodId } as any, { onConflict: "user_id,product_id" } as any);
            } catch {
              await supabase.from("favorites").insert({ user_id: targetUserId, product_id: prodId } as any);
            }
          }
          localStorage.removeItem(GUEST_STORAGE_KEY);
        }

        // 4. Query user favorites from Supabase matching auth_id or profile.id
        let query = supabase.from("favorites").select("product_id");
        if (profileId) {
          query = query.or(`user_id.eq.${user.id},user_id.eq.${profileId}`);
        } else {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (!error && data) {
          const ids = Array.from(new Set(data.map((d: any) => d.product_id).filter(Boolean)));
          setFavoriteIds(ids);
          setUserFavoritesCache(user.id, ids);
        }
      } catch (err: any) {
        console.error("Failed to sync favorites from Supabase:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest Mode
      setFavoriteIds(getGuestFavorites());
    }
  }, [user?.id]);

  useEffect(() => {
    void syncFavorites();

    const handleEvent = () => {
      if (user?.id) {
        setFavoriteIds(getUserFavoritesCache(user.id));
      } else {
        setFavoriteIds(getGuestFavorites());
      }
    };

    window.addEventListener(EVENT_NAME, handleEvent);
    return () => window.removeEventListener(EVENT_NAME, handleEvent);
  }, [user?.id, syncFavorites]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (productId: string, _productData?: any) => {
      const currentlyFav = favoriteIds.includes(productId);
      const nextIds = currentlyFav
        ? favoriteIds.filter((id) => id !== productId)
        : [...favoriteIds, productId];

      if (!user?.id) {
        // Guest Mode: LocalStorage
        setFavoriteIds(nextIds);
        setGuestFavorites(nextIds);
        toast.success(currentlyFav ? "Removed from favorites" : "Saved to favorites");
        return;
      }

      // Authenticated Mode: Instant Optimistic Cache Update (<16ms)
      setFavoriteIds(nextIds);
      setUserFavoritesCache(user.id, nextIds);
      toast.success(currentlyFav ? "Removed from favorites" : "Saved to favorites");

      // Background async sync with Supabase using profile.id to pass check_user_owns_profile RLS policy
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle();

        const profileId = prof?.id;
        const targetUserId = profileId || user.id;

        if (currentlyFav) {
          let { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", targetUserId)
            .eq("product_id", productId);

          if (error && profileId) {
            await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
          }
        } else {
          try {
            await supabase.from("favorites").upsert(
              { user_id: targetUserId, product_id: productId } as any,
              { onConflict: "user_id,product_id" } as any
            );
          } catch {
            await supabase.from("favorites").insert({ user_id: targetUserId, product_id: productId } as any);
          }
        }
      } catch (err: any) {
        console.error("Background sync error updating favorite:", err);
        // Rollback optimistic state on failure
        setFavoriteIds(favoriteIds);
        setUserFavoritesCache(user.id, favoriteIds);
        toast.error("Failed to update favorites on server");
      }
    },
    [user?.id, favoriteIds]
  );

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    loading,
    refresh: syncFavorites,
  };
}
