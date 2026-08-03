import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Coins, Trophy, Flame, Gift, TrendingUp, Share2, LogOut,
  LayoutDashboard, Gift as OfferIcon, Wallet, History as HistoryIcon,
  Sparkles, Zap, ArrowRight, ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";

function getLevel(xp: number) {
  if (xp >= 1000) return { level: 10, name: "Legend",  next: 1000, color: "from-yellow-400 to-orange-500" };
  if (xp >= 500)  return { level: 8,  name: "Elite",   next: 1000, color: "from-purple-400 to-pink-500" };
  if (xp >= 300)  return { level: 6,  name: "Pro",     next: 500,  color: "from-blue-400 to-cyan-500" };
  if (xp >= 150)  return { level: 4,  name: "Skilled", next: 300,  color: "from-green-400 to-emerald-500" };
  if (xp >= 50)   return { level: 2,  name: "Starter", next: 150,  color: "from-cyan-400 to-blue-500" };
  return { level: 1, name: "Newbie", next: 50, color: "from-gray-400 to-gray-500" };
}

/* Shared ticker badge colours */
const tickerBadge = (type: string) => {
  const map: Record<string, string> = {
    offer_complete: "bg-green-500/10 text-green-400 border-green-500/30",
    withdrawal:     "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    daily_claim:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    referral:       "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };
  return map[type] || map.offer_complete;
};
const tickerLabel = (type: string) =>
  ({ offer_complete: "EARNED", withdrawal: "WITHDRAW", daily_claim: "BONUS", referral: "REFERRAL" }[type] || "EARNED");

export default function Dashboard() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();

  useSSE({
    onPostback: (event) => {
      toast.success(`🎉 ${event.offerName} completed! +$${event.amount.toFixed(2)}`, { duration: 5000 });
      setTimeout(() => refreshProfile(), 500);
    },
    onBalanceUpdate: () => refreshProfile(),
    onError: (error) => console.error("[Dashboard] SSE error:", error),
    enabled: !!user?.id,
  });

  const claimMutation = trpc.user.claimDaily.useMutation({
    onSuccess: (data) => { toast.success(`Daily bonus claimed! +$${data.bonus}`); refreshProfile(); },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => { if (!loading && !user) setLocation("/"); }, [user, loading, setLocation]);
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => refreshProfile(), 30000);
    return () => clearInterval(interval);
  }, [user?.id, refreshProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4 glow-green" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const balance = parseFloat(user.balance || "0") || 0;
  const level = getLevel(user.xp || 0);
  const xpInLevel = (user.xp || 0) % level.next;
  const xpProgress = (xpInLevel / level.next) * 100;
  const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim) : null;
  const today = new Date().toISOString().split("T")[0];
  const canClaimDaily = !lastClaim || lastClaim.toISOString().split("T")[0] !== today;

  const navItems = [
    { label: "Dashboard",   icon: LayoutDashboard, path: "/dashboard", active: true },
    { label: "Offer Walls", icon: OfferIcon,        path: "/offers" },
    { label: "Withdraw",    icon: Wallet,            path: "/withdraw" },
    { label: "History",     icon: HistoryIcon,       path: "/history" },
    { label: "Leaderboard", icon: Trophy,            path: "/leaderboard" },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin" }] : []),
  ];

  const statCards = [
    { label: "Current Balance", value: `$${balance.toFixed(2)}`, icon: Coins, color: "text-green-400", bg: "bg-green-500/8", badge: "LIVE", badgeCls: "text-green-400 border-green-500/30 bg-green-500/8", hoverBorder: "hover:border-green-500/40" },
    { label: "Offers Completed", value: user.offersCompleted || 0, icon: OfferIcon, color: "text-cyan-400", bg: "bg-cyan-500/8", badge: "ACTIVE", badgeCls: "text-cyan-400 border-cyan-500/30 bg-cyan-500/8", hoverBorder: "hover:border-cyan-500/40" },
    { label: "Total XP", value: user.xp || 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/8", badge: `LVL ${level.level}`, badgeCls: "text-purple-400 border-purple-500/30 bg-purple-500/8", hoverBorder: "hover:border-purple-500/40" },
    { label: "Total Earned", value: `$${parseFloat(user.totalEarned || "0").toFixed(2)}`, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/8", badge: "ALL TIME", badgeCls: "text-yellow-400 border-yellow-500/30 bg-yellow-500/8", hoverBorder: "hover:border-yellow-500/40" },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      {/* Background glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="tech-orb tech-orb-1" />
        <div className="tech-orb tech-orb-2" />
        <div className="tech-orb tech-orb-3" />
      </div>

      {/* Ticker */}
      <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-background/90 backdrop-blur-md border-b border-green-500/10 overflow-hidden flex items-center">
        <div className="w-1 h-full bg-gradient-to-b from-green-400 to-cyan-400 shrink-0" />
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-[11px] font-medium text-muted-foreground ml-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              {activities.map((a: any) => (
                <span key={`${i}-${a.id}`} className="flex items-center gap-2">
                  <Badge variant="outline" className={`py-0 h-5 font-bold ${tickerBadge(a.type)}`}>{tickerLabel(a.type)}</Badge>
                  <span className="text-white font-semibold">{a.username}</span>
                  <span>{a.description}</span>
                  {a.amount && <span className="text-green-400 font-bold">${parseFloat(a.amount).toFixed(2)}</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-9 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-green-500/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-cyber flex items-center justify-center glow-green">
              <Coins className="w-5 h-5 text-[#060818]" />
            </div>
            <div>
              <h1 className="text-base font-bold"><span className="text-gradient">Rewards</span>Verse</h1>
              <p className="text-[9px] text-green-400/70 tracking-[0.2em] uppercase font-bold">Fast Payouts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/8 border border-green-500/25 rounded-lg px-3 py-1.5 glow-green">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-black text-sm">${balance.toFixed(2)}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 cyber-card rounded-lg px-3 py-1.5">
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

      {/* Navigation tabs */}
      <nav className="fixed top-[6.5rem] left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-green-500/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                item.active
                  ? "text-green-400 border-green-400 nav-item-active"
                  : "text-muted-foreground border-transparent hover:text-green-400/70"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 pt-[10.5rem] pb-10 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold">
              Welcome back, <span className="text-gradient">{user.username}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Here is your daily overview and reward opportunities.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className={`cyber-card ${s.hoverBorder} transition-all border`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                        <s.icon className={`w-5 h-5 ${s.color}`} />
                      </div>
                      <Badge variant="outline" className={`${s.badgeCls} text-[9px] font-bold py-0.5 px-1.5`}>{s.badge}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{s.label}</p>
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Level + Daily + Referral */}
            <div className="lg:col-span-2 space-y-6">
              {/* Level Progress */}
              <Card className="cyber-card border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                        {level.level}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{level.name} Rank</h3>
                        <p className="text-sm text-muted-foreground">Keep grinding — you're doing great!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Next Level</p>
                      <p className="text-xl font-black text-gradient">{xpInLevel}/{level.next} XP</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={xpProgress} className="h-2.5 bg-muted progress-cyber" />
                    <div
                      className="absolute top-0 left-0 h-2.5 rounded-full gradient-cyber transition-all"
                      style={{ width: `${xpProgress}%`, boxShadow: "0 0 10px rgba(0,255,135,0.5)" }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Daily + Referral */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="cyber-card border-green-500/15">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Gift className="w-5 h-5 text-green-400" /> Daily Bonus
                      </CardTitle>
                      <Badge variant="outline" className="bg-green-500/8 text-green-400 border-green-500/25 text-[9px] font-bold">
                        +{user.streak || 0} STREAK
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Claim your daily bonus and build your streak for bigger rewards!
                    </p>
                    <Button
                      onClick={() => claimMutation.mutate()}
                      disabled={!canClaimDaily || claimMutation.isPending}
                      className={`w-full h-11 font-black tracking-widest uppercase text-sm transition-all ${
                        canClaimDaily
                          ? "btn-cyber rounded-xl animate-neon-pulse"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {claimMutation.isPending
                        ? "Claiming..."
                        : canClaimDaily
                        ? `Claim +$${(0.10 + (user.streak || 0) * 0.05).toFixed(2)}`
                        : "Already Claimed Today"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cyber-card border-cyan-500/15">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-cyan-400" /> Referral Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Share your code and earn <span className="text-green-400 font-bold">$0.10</span> per referral!
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-background/60 rounded-lg px-4 py-3 text-sm font-mono border border-green-500/20 text-green-400">
                        {user.refCode || "N/A"}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-11 px-4 border-green-500/30 hover:border-green-400 hover:bg-green-500/8 font-bold transition-all"
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

            {/* Quick Actions */}
            <div>
              <Card className="cyber-card border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" /> Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { path: "/offers",     icon: OfferIcon,    color: "text-green-400", hoverBorder: "hover:border-green-500/50 hover:bg-green-500/5", title: "Offer Walls", sub: "Earn up to $5/offer" },
                    { path: "/withdraw",   icon: Wallet,       color: "text-cyan-400",  hoverBorder: "hover:border-cyan-500/50 hover:bg-cyan-500/5",  title: "Withdraw",     sub: "Min $0.50" },
                    { path: "/history",    icon: HistoryIcon,  color: "text-purple-400",hoverBorder: "hover:border-purple-500/50 hover:bg-purple-500/5",title: "History",   sub: "All transactions" },
                    { path: "/leaderboard",icon: Trophy,       color: "text-yellow-400",hoverBorder: "hover:border-yellow-500/50 hover:bg-yellow-500/5",title: "Leaderboard",sub: "Top earners" },
                  ].map((item) => (
                    <Button
                      key={item.path}
                      onClick={() => setLocation(item.path)}
                      variant="outline"
                      className={`w-full justify-between h-14 border-border/30 bg-background/40 ${item.hoverBorder} transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <div className="text-left">
                          <p className="text-sm font-bold">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  ))}
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
