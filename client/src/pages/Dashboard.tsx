import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Coins, Trophy, Flame, Gift, TrendingUp, Share2, LogOut,
  LayoutDashboard, Wallet, History as HistoryIcon,
  Sparkles, Zap, ArrowRight, ShieldCheck, Copy, CheckCircle2,
  Users, Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";

function getLevel(xp: number) {
  if (xp >= 1000) return { level: 10, name: "Legend",  next: 1000, pct: 100, color: "#f59e0b" };
  if (xp >= 500)  return { level: 8,  name: "Elite",   next: 1000, pct: (xp - 500) / 500 * 100, color: "#8b5cf6" };
  if (xp >= 300)  return { level: 6,  name: "Pro",     next: 500,  pct: (xp - 300) / 200 * 100, color: "#3b82f6" };
  if (xp >= 150)  return { level: 4,  name: "Skilled", next: 300,  pct: (xp - 150) / 150 * 100, color: "#10b981" };
  if (xp >= 50)   return { level: 2,  name: "Starter", next: 150,  pct: (xp - 50) / 100 * 100,  color: "#06b6d4" };
  return { level: 1, name: "Newbie", next: 50, pct: (xp / 50) * 100, color: "#7c3aed" };
}

export default function Dashboard() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  useSSE({
    onPostback: (event) => {
      toast.success(`🎉 ${event.offerName} completed! +$${event.amount.toFixed(2)}`, { duration: 5000 });
      setTimeout(() => refreshProfile(), 500);
    },
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
    const iv = setInterval(() => refreshProfile(), 30000);
    return () => clearInterval(iv);
  }, [user?.id, refreshProfile]);

  const copyRef = () => {
    const code = user?.referralCode || "";
    navigator.clipboard.writeText(`https://rewardsverse.online?ref=${code}`);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground text-sm font-medium">Loading dashboard…</p>
      </div>
    </div>
  );
  if (!user) return null;

  const balance = parseFloat(user.balance || "0") || 0;
  const level = getLevel(user.xp || 0);
  const canClaim = !user.lastDailyBonus || (Date.now() - new Date(user.lastDailyBonus).getTime()) > 86400000;

  const statCards = [
    { label: "Balance",       value: `$${balance.toFixed(2)}`,    icon: Coins,      color: "#7c3aed", bg: "rgba(124,58,237,0.08)",  badge: "Available" },
    { label: "Total Earned",  value: `$${(parseFloat(user.totalEarned || "0") || 0).toFixed(2)}`, icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.08)", badge: "All Time" },
    { label: "Daily Streak",  value: `${user.dailyStreak || 0} days`,  icon: Flame,      color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  badge: "Keep it up!" },
    { label: "Referrals",     value: `${user.referralCount || 0}`,     icon: Users,      color: "#06b6d4", bg: "rgba(6,182,212,0.08)",   badge: "Members" },
  ];

  const quickActions = [
    { label: "Offer Walls",  icon: Gift,          href: "/offers",    color: "#7c3aed" },
    { label: "Withdraw",     icon: Wallet,        href: "/withdraw",  color: "#10b981" },
    { label: "History",      icon: HistoryIcon,   href: "/history",   color: "#06b6d4" },
    { label: "Leaderboard",  icon: Trophy,        href: "/leaderboard", color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top nav ── */}
      <nav className="bg-white border-b border-border/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-gradient">Rewards</span>
              <span className="text-foreground">Verse</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {[["Dashboard", "/dashboard", LayoutDashboard], ["Earn", "/offers", Gift], ["Withdraw", "/withdraw", Wallet], ["History", "/history", HistoryIcon], ["Leaderboard", "/leaderboard", Trophy]].map(([label, href, Icon]: any) => (
              <button key={label} onClick={() => setLocation(href)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  href === "/dashboard" ? "bg-violet-50 text-violet-700" : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button onClick={() => setLocation("/admin")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-7 h-7 rounded-full" alt={user.username} />
              <span className="text-sm font-semibold text-violet-700">{user.username}</span>
            </div>
            <button onClick={logout} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Welcome ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Welcome back, <span className="text-gradient">{user.username}</span> 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Here's your earning summary for today.</p>
          </div>
          <button onClick={() => setLocation("/offers")} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hidden md:flex">
            Start Earning <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="pc-stat-card rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <span className="tag-primary text-[10px]">{s.badge}</span>
              </div>
              <div className="text-2xl font-extrabold text-foreground mb-0.5">{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Level Card */}
            <div className="pc-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-foreground text-lg">Level Progress</h2>
                  <p className="text-muted-foreground text-sm">Keep earning to reach the next level</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold" style={{ color: level.color }}>Lv.{level.level}</div>
                  <div className="text-xs font-semibold text-muted-foreground">{level.name}</div>
                </div>
              </div>
              <div className="progress-pc mb-3">
                <motion.div className="progress-pc-fill" initial={{ width: 0 }} animate={{ width: `${level.pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>{user.xp || 0} XP</span>
                <span>{level.next} XP to next level</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pc-card rounded-2xl p-6">
              <h2 className="font-bold text-foreground text-lg mb-5">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((a) => (
                  <button key={a.label} onClick={() => setLocation(a.href)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-violet-200 hover:bg-violet-50/50 transition-all group">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors" style={{ background: `${a.color}15` }}>
                      <a.icon className="w-5 h-5 transition-colors" style={{ color: a.color }} />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            {activities && activities.length > 0 && (
              <div className="pc-card rounded-2xl p-6">
                <h2 className="font-bold text-foreground text-lg mb-5">Recent Activity</h2>
                <div className="space-y-3">
                  {activities.slice(0, 5).map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors table-row-pc">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{a.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">+${parseFloat(a.amount || "0").toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6">

            {/* Daily Bonus */}
            <div className="pc-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Daily Bonus</h3>
                  <p className="text-xs text-muted-foreground">Claim once every 24 hours</p>
                </div>
              </div>
              {canClaim ? (
                <button onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending}
                  className="w-full btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  {claimMutation.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Gift className="w-4 h-4" /> Claim Bonus</>}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-gray-50 border border-border text-center text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Already claimed today
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-muted-foreground font-medium">Current streak: <strong className="text-foreground">{user.dailyStreak || 0} days</strong></span>
              </div>
            </div>

            {/* Referral */}
            <div className="pc-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Refer & Earn</h3>
                  <p className="text-xs text-muted-foreground">10% lifetime commission</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-border rounded-xl px-3 py-2.5 mb-3 flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-violet-700">{user.referralCode || "—"}</span>
                <button onClick={copyRef} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {user.referralCount || 0} referrals · Earned ${((user.referralCount || 0) * 0.1).toFixed(2)} from refs
              </p>
            </div>

            {/* Leaderboard preview */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1e0533, #0c0a2e)" }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-base">Leaderboard</h3>
                  </div>
                  <button onClick={() => setLocation("/leaderboard")} className="text-violet-300 text-xs font-semibold hover:text-white transition-colors flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-white/50 text-xs">Compete with top earners and win exclusive rewards.</p>
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => setLocation("/leaderboard")} className="w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/15 transition-colors">
                  See Rankings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
