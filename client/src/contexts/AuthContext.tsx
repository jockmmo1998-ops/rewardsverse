import { useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth as useCoreAuth } from "@/_core/hooks/useAuth";

type AuthResult = {
  error: Error | null;
  data?: unknown;
};

type AuthContextType = {
  user: any | null;
  profile: any | null;
  activities: any[];
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<unknown>;
  logout: () => Promise<void>;
  register: (username: string, password: string, email: string, refCode?: string, avatarId?: number) => Promise<AuthResult>;
  login: (username: string, password: string) => Promise<AuthResult>;
  signUpWithUsername: (username: string, password: string, email: string, refCode?: string, avatarId?: number) => Promise<AuthResult>;
  signInWithUsername: (username: string, password: string) => Promise<AuthResult>;
};

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error || "Request failed"));

/**
 * Compatibility layer for older pages while the application uses the current
 * tRPC/MySQL authentication flow. This keeps every route on one session source
 * and removes the legacy Supabase dependency from the active app.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth(): AuthContextType {
  const coreAuth = useCoreAuth();
  const profileQuery = trpc.user.getProfile.useQuery(undefined, {
    enabled: Boolean(coreAuth.user),
    retry: false,
    refetchOnWindowFocus: false,
    // Keep the balance responsive even when the user is on a page that is
    // not currently holding an SSE subscription (provider callbacks are
    // still processed immediately on the server).
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
  const activitiesQuery = trpc.user.getActivities.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });
  const registerMutation = trpc.virtual.register.useMutation();
  const loginMutation = trpc.virtual.login.useMutation();

  const profile = useMemo(() => {
    const value = profileQuery.data ?? coreAuth.user ?? null;
    if (!value) return null;
    return {
      ...value,
      // Legacy pages use snake_case profile fields.
      is_admin: value.is_admin ?? value.role === "admin",
      ref_code: value.ref_code ?? value.refCode,
      referred_by: value.referred_by ?? value.referredBy,
      lifetime_earnings: value.lifetime_earnings ?? value.totalEarned,
      completed_offers: value.completed_offers ?? value.offersCompleted,
    };
  }, [profileQuery.data, coreAuth.user]);

  const refreshProfile = useCallback(async () => {
    await Promise.all([coreAuth.refresh(), profileQuery.refetch()]);
  }, [coreAuth.refresh, profileQuery.refetch]);

  const register = useCallback(
    async (username: string, password: string, email: string, refCode?: string, avatarId = 1): Promise<AuthResult> => {
      try {
        const data = await registerMutation.mutateAsync({
          username,
          password,
          email,
          refCode: refCode ?? "",
          avatarId,
        });
        try {
          sessionStorage.setItem("rewardsverse-username", String((data as any)?.username || username));
        } catch {}
        await refreshProfile();
        return { error: null, data };
      } catch (error) {
        return { error: toError(error) };
      }
    },
    [registerMutation, refreshProfile],
  );

  const login = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      try {
        const data = await loginMutation.mutateAsync({ username, password });
        try {
          sessionStorage.setItem("rewardsverse-username", String((data as any)?.username || username));
        } catch {}
        await refreshProfile();
        return { error: null, data };
      } catch (error) {
        return { error: toError(error) };
      }
    },
    [loginMutation, refreshProfile],
  );

  return {
    user: profile ?? coreAuth.user ?? null,
    profile,
    activities: activitiesQuery.data ?? [],
    loading: coreAuth.loading || profileQuery.isLoading,
    isAdmin: profile?.role === "admin" || profile?.is_admin === true,
    refreshProfile,
    logout: coreAuth.logout,
    register,
    login,
    signUpWithUsername: register,
    signInWithUsername: login,
  };
}
