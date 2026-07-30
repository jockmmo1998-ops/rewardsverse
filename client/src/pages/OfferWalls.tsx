import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useState, useRef, useCallback } from "react";
import { playBellSound } from "@/utils/bellSound";
import {
  LayoutDashboard,
  Gift as OfferIcon,
  Wallet,
  History as HistoryIcon,
  LogOut,
  Coins,
  X,
  ExternalLink,
  Star,
  DollarSign,
  Cpu,
  Users,
  Sparkles,
  Gift,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Zap,
  ChevronRight,
  Trophy,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OFFER_WALLS = [
  { id: "gemiwall", name: "Gemiwall", desc: "Premium survey & offer wall", reward: "$0.10 - $5.00", icon: Star, color: "from-yellow-500 to-orange-500", tag: "POPULAR", rating: 4.8 },
  { id: "revtoo", name: "Revtoo", desc: "High-paying mobile offers", reward: "$0.25 - $8.00", icon: DollarSign, color: "from-blue-500 to-cyan-500", tag: "HIGH PAY", rating: 4.9 },
  { id: "clickwall", name: "Clickwall", desc: "Quick tasks & downloads", reward: "$0.10 - $3.00", icon: Zap, color: "from-green-500 to-emerald-500", tag: "EASY", rating: 4.5 },
  { id: "moustache", name: "MoustacheLeads", desc: "CPI & CPA offers worldwide", reward: "$0.50 - $10.00", icon: Gift, color: "from-purple-500 to-pink-500", tag: "PREMIUM", rating: 4.7 },
  { id: "taskwall", name: "Taskwall", desc: "Sign-up & engagement tasks", reward: "$0.15 - $6.00", icon: Users, color: "from-indigo-500 to-blue-500", tag: "SIGN-UPS", rating: 4.6 },
  { id: "cointo", name: "CoinToMedia", desc: "Crypto-focused offers", reward: "$0.20 - $4.00", icon: Coins, color: "from-amber-500 to-yellow-500", tag: "CRYPTO", rating: 4.4 },
  { id: "klink", name: "Klink Finance", desc: "Finance & trading offers", reward: "$0.30 - $7.00", icon: Cpu, color: "from-teal-500 to-green-500", tag: "FINANCE", rating: 4.8 },
];

export default function OfferWalls() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const [wallUrl, setWallUrl] = useState("");
  const [previousBalance, setPreviousBalance] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery(
    { wall: activeWall || "" },
    { enabled: !!activeWall }
  );

  const recordMutation = trpc.user.recordOfferComplete.useMutation({
    onSuccess: async (data) => {
      await playBellSound();
      toast.success(`Reward credited! +$${data.reward}`);
    },
    onSettled: () => refreshProfile(),
  });

  useEffect(() => {
    if (!loading && !user) setLocation("/");
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (wallUrlQuery.data?.url) setWallUrl(wallUrlQuery.data.url);
  }, [wallUrlQuery.data]);

  // Track balance changes and play sound when balance increases
  useEffect(() => {
    if (user && user.balance) {
      const currentBalance = parseFloat(user.balance);
      const prevBalance = previousBalance ? parseFloat(previousBalance) : currentBalance;
      
      if (currentBalance > prevBalance) {
        // Balance increased - play bell sound
        playBellSound().catch(err => console.error("Bell sound error:", err));
        toast.success(`Balance updated! +$${(currentBalance - prevBalance).toFixed(2)}`);
      }
      
      setPreviousBalance(user.balance);
    }
  }, [user?.balance]);

  // FIX: Start polling balance every 15 seconds when offer wall is open (improved)
  useEffect(() => {
    if (activeWall) {
      // Start polling more frequently for better real-time updates
      pollingIntervalRef.current = setInterval(() => {
        refreshProfile();
      }, 15000); // Poll every 15 seconds (was 20s)

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [activeWall, refreshProfile]);

  // FIX: Add visibility change listener to refresh balance when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && activeWall) {
        // User returned to the tab - refresh profile immediately
        refreshProfile();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeWall, refreshProfile]);

  const openWall = (wallId: string) => {
    setActiveWall(wallId);
    setWallUrl("");
  };

  const closeWall = useCallback(() => {
    // FIX: Refresh profile immediately when closing offer wall
    refreshProfile();
    // NEW: Also refresh after a short delay to catch postback updates
    setTimeout(() => {
      refreshProfile();
    }, 1000);
    setActiveWall(null);
    setWallUrl("");
  }, [refreshProfile]);

  const simulateReward = () => {
    if (!activeWall) { toast.error("Open an offer wall first"); return; }
    const wallName = OFFER_WALLS.find(w => w.id === activeWall)?.name || "Wall";
    const rewards = [0.1, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    recordMutation.mutate({ wallName, reward });
    closeWall();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // will redirect via useEffect
  }

  const balance = parseFloat(user.balance || "0") || 0;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", active: false },
    { label: "Offer Walls", icon: OfferIcon, path: "/offers", active: true },
    { label: "Withdraw", icon: Wallet, path: "/withdraw", active: false },
    { label: "History", icon: HistoryIcon, path: "/history", active: false },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard", active: false },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin", active: false }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Activity Ticker - Real Data */}
      <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-background/80 backdrop-blur-md border-b border-border/50 overflow-hidden flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-[11px] font-medium text-muted-foreground">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              {activities.map((a: any) => (
                <span key={`${i}-${a.id}`} className="flex items-center gap-2">
                  <Badge variant="outline" className={`py-0 h-5 ${
                    a.type === "offer_complete" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    a.type === "withdrawal" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    a.type === "daily_claim" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                    "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  }`}>
                    {a.type === "offer_complete" ? "EARNED" : a.type === "withdrawal" ? "WITHDRAW" : a.type === "daily_claim" ? "BONUS" : "REFERRAL"}
                  </Badge>
                  <span className="text-white font-semibold">{a.username}</span>
                  <span>{a.description}</span>
                  {a.amount && <span className="text-green-400 font-semibold">${parseFloat(a.amount).toFixed(2)}</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-9 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-green-cyan flex items-center justify-center shadow-lg shadow-green-500/20">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold"><span className="text-gradient">Rewards</span>Verse</h1>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-bold">Fast Payouts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-bold text-sm">${balance.toFixed(2)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="fixed top-[6.5rem] left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all rounded-t-lg border-b-2 ${
                item.active ? "text-green-400 border-green-400 bg-green-500/5" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="pt-[10.5rem] pb-8 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Offer <span className="text-gradient">Walls</span></h2>
            <p className="text-sm text-muted-foreground mt-1">Select a provider to start earning rewards by completing simple tasks.</p>
          </div>

          {/* Offer Walls Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OFFER_WALLS.map((wall, i) => (
              <motion.div
                key={wall.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card 
                  className="group relative overflow-hidden border-border/50 bg-card/50 hover:border-green-500/30 transition-all cursor-pointer"
                  onClick={() => openWall(wall.id)}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${wall.color}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg group-hover:text-green-400 transition-colors">{wall.name}</h3>
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px] font-bold py-0 px-1.5 h-4">
                            {wall.tag}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{wall.desc}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${wall.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <wall.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-bold">{wall.rating}</span>
                        </div>
                        <span className="text-xs text-green-400 font-bold">{wall.reward}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-xs font-bold group-hover:gap-2 transition-all">
                        Earn <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <h4 className="font-bold mb-2">Instant Tracking</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Most offers track instantly. Some premium offers may take up to 24h to verify.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <h4 className="font-bold mb-2">Safe & Secure</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">We only partner with trusted offer providers to ensure your data is always protected.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="font-bold mb-2">High Rates</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">RewardsVerse offers the highest payout rates in the industry for all our walls.</p>
            </div>
          </div>

          {/* Simulate Reward */}
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={simulateReward}
              className="text-green-400 border-green-500/30 hover:border-green-500 hover:bg-green-500/5 hidden"
            >
              Claim Offer Reward (Demo)
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Offer Wall Iframe Overlay */}
      <AnimatePresence>
        {activeWall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
          >
            <div className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={closeWall} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <span className="text-sm font-semibold">{OFFER_WALLS.find(w => w.id === activeWall)?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={closeWall} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
            {wallUrl && (
              <iframe
                src={wallUrl}
                className="flex-1 w-full border-0"
                title="Offer Wall"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
