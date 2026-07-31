import { trpc } from "@/lib/trpc";
import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type VirtualUser = {
  id: number;
  openId: string;
  username: string;
  name: string | null;
  email: string | null;
  refCode: string | null;
  referredBy: string | null;
  balance: string;
  xp: number;
  streak: number;
  offersCompleted: number;
  totalEarned: string;
  refEarnings: string;
  role: string;
  createdAt: Date | null;
  lastSignedIn: Date | null;
  lastDailyClaim: Date | null;
};

type Activity = {
  id: number;
  userId: number;
  username: string;
  type: string;
  description: string;
  amount: string | null;
  createdAt: Date | null;
};

type AuthContextType = {
  user: VirtualUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  activities: Activity[];
  register: (username: string, password: string, refCode?: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => void;
  profileQuery: ReturnType<typeof trpc.user.getProfile.useQuery>;
  activitiesQuery: ReturnType<typeof trpc.user.getActivities.useQuery>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<VirtualUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Fetch profile directly - this is a publicProcedure that returns null if not authenticated
  // staleTime=0 để refreshProfile() sau SSE luôn fetch mới, không bị cache chặn
  const profileQuery = trpc.user.getProfile.useQuery(undefined, {
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const activitiesQuery = trpc.user.getActivities.useQuery(undefined, {
    enabled: !!profileQuery.data,
    retry: false,
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  // Handle initial load - profileQuery settles quickly (success with data or null, or error)
  // FIX: Set loading to false when profileQuery is no longer loading, regardless of whether data is null
  useEffect(() => {
    if (!profileQuery.isLoading) {
      // profileQuery has settled (data, null, or error)
      setLoading(false);
    }
  }, [profileQuery.isLoading]);

  // When profile query returns data, sync it
  useEffect(() => {
    if (profileQuery.data) {
      const u = profileQuery.data as any;
      setCurrentUser({
        id: u.id,
        openId: u.openId,
        username: u.username,
        name: u.name,
        email: u.email,
        refCode: u.refCode,
        referredBy: u.referredBy,
        balance: u.balance,
        xp: u.xp,
        streak: u.streak,
        offersCompleted: u.offersCompleted,
        totalEarned: u.totalEarned,
        refEarnings: u.refEarnings,
        role: u.role,
        createdAt: u.createdAt,
        lastSignedIn: u.lastSignedIn,
        lastDailyClaim: u.lastDailyClaim,
      });
    } else {
      setCurrentUser(null);
    }
  }, [profileQuery.data]);

  const registerMutation = trpc.virtual.register.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome to RewardsVerse, ${data.username}! Starting with $0.50`);
      // Reload the page to establish the session properly
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  const loginMutation = trpc.virtual.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.username}!`);
      // Reload the page to establish the session properly
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message || "Login failed. Please check your credentials.");
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setCurrentUser(null);
      window.location.href = "/";
    },
  });

  const register = useCallback(async (username: string, password: string, refCode?: string) => {
    await registerMutation.mutateAsync({ username, password, refCode: (refCode || "") as string });
  }, [registerMutation]);

  const login = useCallback(async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  }, [loginMutation]);

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const refreshProfile = useCallback(() => {
    profileQuery.refetch();
    activitiesQuery.refetch();
  }, [profileQuery, activitiesQuery]);

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        loading,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === "admin",
        activities: (activitiesQuery.data || []) as Activity[],
        register,
        login,
        logout,
        refreshProfile,
        profileQuery,
        activitiesQuery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
