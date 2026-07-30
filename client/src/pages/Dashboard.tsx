import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Coins,
  Trophy,
  Flame,
  Gift,
  TrendingUp,
  Share2,
  LogOut,
  LayoutDashboard,
  Gift as OfferIcon,
  Wallet,
  History as HistoryIcon,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";

function getLevel(xp: number) {
  if (xp >= 1000) return { level: 10, name: "Legend", next: 1000, color: "from-yellow-400 to-orange-500" };
  if (xp >= 500) return { level: 8, name: "Elite", next: 1000, color: "from-purple-400 to-pink-500" };
  if (xp >= 300) return { level: 6, name: "Pro", next: 500, color: "from-blue-400 to-cyan-500" };
  if (xp >= 150) return { level: 4, name: "Skilled", next: 300, color: "from-green-400 to-emerald-500" };
  if (xp >= 50) return { level: 2, name: "Starter", next: 150, color: "from-cyan-400 to-blue-500" };
  return { level: 1, name: "Newbie", next: 50, color: "from-gray-400 to-gray-500" };
}

export default function Dashboard() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();

  // Subscribe to real-time postback notifications (always call hooks, gated by enabled)
  useSSE({
    onPostback: (event) => {
      console.log("[Dashboard] Postback received:", event);
      toast.success(`🎉 ${event.offerName} completed! +$${event.amount.toFixed(2)}`, {
        duration: 5000,
      });
      setTimeout(() => {
        refreshProfile();
      }, 500);
    },
    onError: (error) => {
      console.error("[Dashboard] SSE error:", error);
    },
    enabled: !!user?.id,
  });

  const claimMutation = trpc.user.claimDaily.useMutation({
    onSuccess: (data) => {
      toast.success(`Daily bonus claimed! +$${data.bonus}`);
      refreshProfile();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Redirect to home when not authenticated
  useEffect(() => {
    if (!loading && !user) setLocation("/");
  }, [user, loading, setLocation]);

  // Refresh profile periodically as fallback
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      refreshProfile();
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id, refreshProfile]);

  // ALL hooks called above - no hooks after early returns

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Computed values after hooks
  const balance = parseFloat(user.balance || "0") || 0;
  const level = getLevel(user.xp || 0);
  const xpInLevel = (user.xp || 0) % level.next;
  const xpProgress = (xpInLevel / level.next) * 100;
  const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim) : null;
  const today = new Date().toISOString().split("T")[0];
  const canClaimDaily = !lastClaim || lastClaim.toISOString().split("T")[0] !== today;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", active: true },
    { label: "Offer Walls", icon: OfferIcon, path: "/offers" },
    { label: "Withdraw", icon: Wallet, path: "/withdraw" },
    { label: "History", icon: HistoryIcon, path: "/history" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-green-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-500/5 blur-[100px] rounded-full" />
      </div>

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
              <h1 className="text-base font-bold">
                <span className="text-gradient">Rewards</span>Verse
              </h1>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-bold">Fast Payouts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-bold text-sm">${balance.toFixed(2)}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-card border border-border/50 rounded-lg px-3 py-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold">{user.streak || 0} day streak</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium">{user.username}</span>
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-red-400">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="fixed top-[6.5rem] left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all rounded-t-lg border-b-2 ${
                item.active
                  ? "text-green-400 border-green-400 bg-green-500/5"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-[10.5rem] pb-8 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Welcome back, <span className="text-gradient">{user.username}</span></h2>
            <p className="text-sm text-muted-foreground mt-1">Here is your daily overview and reward opportunities.</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card/50 border-border/50 hover:border-green-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-green-400" />
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px] font-bold py-0.5 px-1.5">LIVE</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Current Balance</p>
                <p className="text-3xl font-black text-white">${balance.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-blue-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <OfferIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-bold py-0.5 px-1.5">ACTIVE</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Offers Completed</p>
                <p className="text-3xl font-black text-white">{user.offersCompleted || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-purple-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold py-0.5 px-1.5">LEVEL {level.level}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total XP</p>
                <p className="text-3xl font-black text-white">{user.xp || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-yellow-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[9px] font-bold py-0.5 px-1.5">ALL TIME</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Earned</p>
                <p className="text-3xl font-black text-white">${parseFloat(user.totalEarned || "0").toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column: Level Progress & Daily Claim */}
            <div className="lg:col-span-2 space-y-6">
              {/* Level Progress */}
              <Card className="border-green-500/20 bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                        {level.level}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{level.name} Rank</h3>
                        <p className="text-sm text-muted-foreground">You are making great progress!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Next Level</p>
                      <p className="text-xl font-black">{xpInLevel}/{level.next} XP</p>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <Progress value={xpProgress} className="h-3 bg-muted" />
                  </div>
                </CardContent>
              </Card>

              {/* Daily Bonus & Referral */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Gift className="w-5 h-5 text-green-400" />
                        Daily Bonus
                      </CardTitle>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px] font-bold py-0.5 px-1.5">+{user.streak || 0} STREAK</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Claim your daily bonus and build your streak for bigger rewards!
                    </p>
                    <Button
                      onClick={() => claimMutation.mutate()}
                      disabled={!canClaimDaily || claimMutation.isPending}
                      className="w-full h-12 gradient-green-cyan text-white font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {claimMutation.isPending
                        ? "Claiming..."
                        : canClaimDaily
                        ? `Claim +$${(0.10 + (user.streak || 0) * 0.05).toFixed(2)}`
                        : "Already Claimed Today"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-cyan-400" />
                      Referral Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your code and earn <span className="text-green-400 font-bold">$0.10</span> per referral!
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-background rounded-lg px-4 py-3 text-sm font-mono border border-border/50">
                        {user.refCode || "N/A"}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 px-4"
                        onClick={() => {
                          navigator.clipboard.writeText(user.refCode || "");
                          toast.success("Referral code copied!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column: Quick Actions */}
            <div className="space-y-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setLocation("/offers")}
                    variant="outline"
                    className="w-full justify-between h-14 border-border/50 hover:border-green-500/50 bg-background/50 hover:bg-green-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <OfferIcon className="w-5 h-5 text-green-400" />
                      <div className="text-left">
                        <p className="text-sm font-bold">Offer Walls</p>
                        <p className="text-[10px] text-muted-foreground">Earn up to $5/offer</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Button>

                  <Button
                    onClick={() => setLocation("/withdraw")}
                    variant="outline"
                    className="w-full justify-between h-14 border-border/50 hover:border-cyan-500/50 bg-background/50 hover:bg-cyan-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <p className="text-sm font-bold">Withdraw</p>
                        <p className="text-[10px] text-muted-foreground">Min $0.50</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Button>

                  <Button
                    onClick={() => setLocation("/history")}
                    variant="outline"
                    className="w-full justify-between h-14 border-border/50 hover:border-purple-500/50 bg-background/50 hover:bg-purple-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <HistoryIcon className="w-5 h-5 text-purple-400" />
                      <div className="text-left">
                        <p className="text-sm font-bold">History</p>
                        <p className="text-[10px] text-muted-foreground">All transactions</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Button>

                  {isAdmin && (
                    <Button
                      onClick={() => setLocation("/admin")}
                      variant="outline"
                      className="w-full justify-between h-14 border-red-500/30 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-red-400" />
                        <div className="text-left">
                          <p className="text-sm font-bold">Admin Panel</p>
                          <p className="text-[10px] text-red-400/70">Manage users</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
