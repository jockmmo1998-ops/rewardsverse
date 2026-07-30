import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Coins, Trophy, Flame, Gift, TrendingUp, Share2, LogOut,
  LayoutDashboard, Wallet, History as HistoryIcon, Sparkles,
  ArrowRight, ShieldCheck, Copy, CheckCircle2, Users, Zap, Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";

function getLevel(xp: number) {
  if (xp >= 1000) return { level:10, name:"Legend",  next:1000, pct:100,                       color:"#fbbf24" };
  if (xp >= 500)  return { level:8,  name:"Elite",   next:1000, pct:(xp-500)/500*100,           color:"#c084fc" };
  if (xp >= 300)  return { level:6,  name:"Pro",     next:500,  pct:(xp-300)/200*100,           color:"#818cf8" };
  if (xp >= 150)  return { level:4,  name:"Skilled", next:300,  pct:(xp-150)/150*100,           color:"#22d3ee" };
  if (xp >= 50)   return { level:2,  name:"Starter", next:150,  pct:(xp-50)/100*100,            color:"#4ade80" };
  return           { level:1,  name:"Newbie",  next:50,   pct:(xp/50)*100,                color:"#6366f1" };
}

export default function Dashboard() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  useSSE({
    onPostback: (event) => { toast.success(`🎉 ${event.offerName} +$${event.amount.toFixed(2)}`); setTimeout(() => refreshProfile(), 500); },
    onError: (e) => console.error("[Dashboard SSE]", e),
    enabled: !!user?.id,
  });

  const claimMutation = trpc.user.claimDaily.useMutation({
    onSuccess: (data) => { toast.success(`Daily bonus! +$${data.bonus}`); refreshProfile(); },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => { if (!loading && !user) setLocation("/"); }, [user, loading]);
  useEffect(() => { if (!user?.id) return; const iv = setInterval(() => refreshProfile(), 30000); return () => clearInterval(iv); }, [user?.id]);

  const copyRef = () => {
    navigator.clipboard.writeText(`https://rewardsverse.online?ref=${user?.referralCode || ""}`);
    setCopied(true); toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"#0a0a0f" }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ boxShadow:"0 0 20px rgba(99,102,241,0.5)" }} />
        <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.875rem" }}>Loading…</p>
      </div>
    </div>
  );
  if (!user) return null;

  const balance = parseFloat(user.balance || "0") || 0;
  const level   = getLevel(user.xp || 0);
  const canClaim = !user.lastDailyBonus || (Date.now() - new Date(user.lastDailyBonus).getTime()) > 86400000;

  const statCards = [
    { label:"Balance",      value:`$${balance.toFixed(2)}`,    icon:Coins,      color:"#818cf8", glow:"rgba(99,102,241,0.15)",   badge:"Available" },
    { label:"Total Earned", value:`$${(parseFloat(user.totalEarned||"0")||0).toFixed(2)}`, icon:TrendingUp, color:"#4ade80", glow:"rgba(74,222,128,0.12)",  badge:"All Time" },
    { label:"Daily Streak", value:`${user.dailyStreak||0} days`,  icon:Flame,      color:"#fbbf24", glow:"rgba(251,191,36,0.12)",   badge:"Streak" },
    { label:"Referrals",    value:`${user.referralCount||0}`,     icon:Users,      color:"#22d3ee", glow:"rgba(34,211,238,0.12)",   badge:"Members" },
  ];

  const navItems = [
    { label:"Dashboard",   icon:LayoutDashboard, path:"/dashboard",  active:true },
    { label:"Earn",        icon:Gift,            path:"/offers",     active:false },
    { label:"Withdraw",    icon:Wallet,          path:"/withdraw",   active:false },
    { label:"History",     icon:HistoryIcon,     path:"/history",    active:false },
    { label:"Leaderboard", icon:Trophy,          path:"/leaderboard",active:false },
    ...(isAdmin ? [{ label:"Admin", icon:Sparkles, path:"/admin", active:false }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background:"#0a0a0f", color:"#f4f4f8" }}>
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-15%", right:"-10%", width:"30%", height:"30%", background:"radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)", filter:"blur(60px)" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-5%",  width:"25%", height:"25%", background:"radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)", filter:"blur(60px)" }} />
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40" style={{ background:"rgba(10,10,15,0.92)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl g-primary flex items-center justify-center" style={{ boxShadow:"0 0 14px rgba(99,102,241,0.40)" }}>
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-base"><span className="text-g-primary">Rewards</span><span style={{ color:"#f4f4f8" }}>Verse</span></span>
          </div>

          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <button key={item.path} onClick={() => setLocation(item.path)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={item.active
                  ? { background:"rgba(99,102,241,0.12)", color:"#818cf8" }
                  : { color:"rgba(255,255,255,0.38)" }}>
                <item.icon className="w-3.5 h-3.5" />{item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button onClick={() => setLocation("/admin")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background:"rgba(251,191,36,0.10)", color:"#fbbf24", border:"1px solid rgba(251,191,36,0.20)" }}>
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background:"rgba(99,102,241,0.10)", border:"1px solid rgba(99,102,241,0.18)" }}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-6 h-6 rounded-full" alt={user.username} />
              <span className="text-sm font-bold" style={{ color:"#818cf8" }}>{user.username}</span>
            </div>
            <button onClick={logout} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color:"rgba(255,255,255,0.30)" }}
              onMouseEnter={e => (e.currentTarget.style.color="#f87171")}
              onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.30)")}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-5 py-8 space-y-8">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Welcome back, <span className="text-g-primary">{user.username}</span> 👋</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.875rem", marginTop:"0.25rem" }}>Your earning summary for today.</p>
          </div>
          <button onClick={() => setLocation("/offers")} className="btn-gpt text-sm hidden md:flex items-center gap-2">
            Start Earning <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="glass-stat rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:s.glow }}>
                  <s.icon className="w-5 h-5" style={{ color:s.color }} />
                </div>
                <span className="tag-gpt text-[10px]">{s.badge}</span>
              </div>
              <div className="text-2xl font-black mb-0.5">{s.value}</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.75rem", fontWeight:600 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Level */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-black text-lg">Level Progress</h2>
                  <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem" }}>Keep earning to reach the next tier</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color:level.color }}>Lv.{level.level}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.75rem" }}>{level.name}</div>
                </div>
              </div>
              <div className="progress-gpt mb-3">
                <motion.div className="progress-gpt-fill" initial={{ width:0 }} animate={{ width:`${level.pct}%` }} transition={{ duration:0.9, delay:0.3 }} />
              </div>
              <div className="flex justify-between" style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.75rem" }}>
                <span>{user.xp||0} XP</span>
                <span>{level.next} XP to next level</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-black text-lg mb-5">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Offer Walls", icon:Gift,        href:"/offers",      color:"#818cf8", glow:"rgba(99,102,241,0.12)" },
                  { label:"Withdraw",   icon:Wallet,       href:"/withdraw",    color:"#4ade80", glow:"rgba(74,222,128,0.10)" },
                  { label:"History",    icon:HistoryIcon,  href:"/history",     color:"#22d3ee", glow:"rgba(34,211,238,0.10)" },
                  { label:"Leaderboard",icon:Trophy,       href:"/leaderboard", color:"#fbbf24", glow:"rgba(251,191,36,0.10)" },
                ].map(a => (
                  <button key={a.label} onClick={() => setLocation(a.href)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all"
                    style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor=`${a.color}40`; (e.currentTarget as HTMLButtonElement).style.background=a.glow; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.03)"; }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:a.glow }}>
                      <a.icon className="w-5 h-5" style={{ color:a.color }} />
                    </div>
                    <span style={{ fontSize:"0.75rem", fontWeight:700, color:"rgba(255,255,255,0.70)" }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            {activities && activities.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-black text-lg mb-5">Recent Activity</h2>
                <div className="space-y-2">
                  {activities.slice(0, 5).map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl tr-gpt transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background:"rgba(99,102,241,0.12)" }}>
                        <Sparkles className="w-4 h-4" style={{ color:"#818cf8" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{a.description}</p>
                        <p style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.75rem" }}>{new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-black" style={{ color:"#4ade80" }}>+${parseFloat(a.amount||"0").toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">

            {/* Daily bonus */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(251,191,36,0.12)" }}>
                  <Gift className="w-5 h-5" style={{ color:"#fbbf24" }} />
                </div>
                <div>
                  <h3 className="font-black text-base">Daily Bonus</h3>
                  <p style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.75rem" }}>Once every 24 hours</p>
                </div>
              </div>
              {canClaim ? (
                <button onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending}
                  className="btn-gpt w-full flex items-center justify-center gap-2 py-3">
                  {claimMutation.isPending
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Gift className="w-4 h-4" /> Claim Bonus</>}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.35)" }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color:"#4ade80" }} /> Already claimed today
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <Flame className="w-4 h-4" style={{ color:"#f97316" }} />
                <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)" }}>Streak: <strong style={{ color:"#f4f4f8" }}>{user.dailyStreak||0} days</strong></span>
              </div>
            </div>

            {/* Referral */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(34,211,238,0.10)" }}>
                  <Share2 className="w-5 h-5" style={{ color:"#22d3ee" }} />
                </div>
                <div>
                  <h3 className="font-black text-base">Refer & Earn</h3>
                  <p style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.75rem" }}>10% lifetime commission</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-3"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-sm font-mono font-bold" style={{ color:"#818cf8" }}>{user.referralCode||"—"}</span>
                <button onClick={copyRef} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color:"rgba(255,255,255,0.35)" }}>
                  {copied ? <CheckCircle2 className="w-4 h-4" style={{ color:"#4ade80" }} /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.75rem", textAlign:"center" }}>
                {user.referralCount||0} referrals · Earned ${((user.referralCount||0)*0.1).toFixed(2)}
              </p>
            </div>

            {/* Leaderboard promo */}
            <div className="rounded-2xl overflow-hidden" style={{ background:"linear-gradient(135deg,#0c0c1e,#120820)" }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" style={{ color:"#fbbf24" }} />
                    <h3 className="font-black text-base">Leaderboard</h3>
                  </div>
                  <button onClick={() => setLocation("/leaderboard")} className="flex items-center gap-1 text-xs font-bold transition-colors"
                    style={{ color:"#818cf8" }}>
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.75rem" }}>Compete with top earners for exclusive rewards.</p>
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => setLocation("/leaderboard")} className="btn-ghost-gpt w-full text-sm py-2.5">
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
