import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Coins, Star, DollarSign, Cpu, Users, Sparkles, Gift, Shield,
  CheckCircle2, ArrowLeft, Zap, ChevronRight, Trophy, X,
  LayoutDashboard, Wallet, History as HistoryIcon, LogOut, TrendingUp,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { playBellSound } from "@/utils/bellSound";
import { motion, AnimatePresence } from "framer-motion";

/* ── 7 original offer walls preserved exactly ── */
const OFFER_WALLS = [
  { id: "gemiwall",  name: "Gemiwall",       desc: "Premium survey & offer wall",   reward: "$0.10–$5.00",  icon: Star,       grad: "from-amber-500 to-orange-500",  bar: "linear-gradient(90deg,#f59e0b,#ef4444)", tag: "POPULAR",  tagCls: "tag-gold",   rating: 4.8, glow: "rgba(245,158,11,0.20)" },
  { id: "revtoo",    name: "Revtoo",          desc: "High-paying mobile offers",     reward: "$0.25–$8.00",  icon: DollarSign, grad: "from-blue-500 to-cyan-500",     bar: "linear-gradient(90deg,#3b82f6,#22d3ee)", tag: "HIGH PAY", tagCls: "tag-cyan",   rating: 4.9, glow: "rgba(59,130,246,0.20)" },
  { id: "clickwall", name: "Clickwall",       desc: "Quick tasks & downloads",       reward: "$0.10–$3.00",  icon: Zap,        grad: "from-green-500 to-emerald-500", bar: "linear-gradient(90deg,#4ade80,#22d3ee)", tag: "EASY",     tagCls: "tag-green",  rating: 4.5, glow: "rgba(74,222,128,0.18)" },
  { id: "moustache", name: "MoustacheLeads",  desc: "CPI & CPA offers worldwide",    reward: "$0.50–$10.00", icon: Gift,       grad: "from-purple-500 to-pink-500",   bar: "linear-gradient(90deg,#a855f7,#ec4899)", tag: "PREMIUM",  tagCls: "tag-purple", rating: 4.7, glow: "rgba(168,85,247,0.22)" },
  { id: "taskwall",  name: "Taskwall",         desc: "Sign-up & engagement tasks",    reward: "$0.15–$6.00",  icon: Users,      grad: "from-indigo-500 to-blue-500",   bar: "linear-gradient(90deg,#6366f1,#3b82f6)", tag: "SIGN-UPS", tagCls: "tag-gpt",    rating: 4.6, glow: "rgba(99,102,241,0.22)" },
  { id: "cointo",    name: "CoinToMedia",      desc: "Crypto-focused offers",         reward: "$0.20–$4.00",  icon: Coins,      grad: "from-amber-500 to-yellow-500",  bar: "linear-gradient(90deg,#f59e0b,#fbbf24)", tag: "CRYPTO",   tagCls: "tag-gold",   rating: 4.4, glow: "rgba(251,191,36,0.18)" },
  { id: "klink",     name: "Klink Finance",    desc: "Finance & trading offers",      reward: "$0.30–$7.00",  icon: Cpu,        grad: "from-teal-500 to-green-500",    bar: "linear-gradient(90deg,#14b8a6,#4ade80)", tag: "FINANCE",  tagCls: "tag-cyan",   rating: 4.8, glow: "rgba(20,184,166,0.20)" },
];

export default function OfferWalls() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const [wallUrl, setWallUrl] = useState("");
  const [previousBalance, setPreviousBalance] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery({ wall: activeWall || "" }, { enabled: !!activeWall });

  useEffect(() => { if (!loading && !user) setLocation("/"); }, [user, loading]);
  useEffect(() => { if (wallUrlQuery.data?.url) setWallUrl(wallUrlQuery.data.url); }, [wallUrlQuery.data]);
  useEffect(() => {
    if (user?.balance) {
      const curr = parseFloat(user.balance), prev = previousBalance ? parseFloat(previousBalance) : curr;
      if (curr > prev) { playBellSound().catch(() => {}); toast.success(`+$${(curr - prev).toFixed(2)} credited!`); }
      setPreviousBalance(user.balance);
    }
  }, [user?.balance]);
  useEffect(() => {
    if (activeWall) {
      pollingRef.current = setInterval(() => refreshProfile(), 15000);
      return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }
  }, [activeWall, refreshProfile]);
  useEffect(() => {
    const fn = () => { if (!document.hidden && activeWall) refreshProfile(); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [activeWall, refreshProfile]);

  const openWall = (id: string) => { setActiveWall(id); setWallUrl(""); };
  const closeWall = useCallback(() => {
    refreshProfile(); setTimeout(() => refreshProfile(), 1000);
    setActiveWall(null); setWallUrl("");
  }, [refreshProfile]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" style={{ boxShadow: "0 0 20px rgba(99,102,241,0.5)" }} />
    </div>
  );
  if (!user) return null;

  const balance = parseFloat(user.balance || "0") || 0;

  const navItems = [
    { label: "Dashboard",   icon: LayoutDashboard, path: "/dashboard" },
    { label: "Offer Walls", icon: Gift,             path: "/offers",    active: true },
    { label: "Withdraw",    icon: Wallet,           path: "/withdraw" },
    { label: "History",     icon: HistoryIcon,      path: "/history" },
    { label: "Leaderboard", icon: Trophy,           path: "/leaderboard" },
    ...(isAdmin ? [{ label: "Admin", icon: Sparkles, path: "/admin" }] : []),
  ];

  const tickerBadge = (type: string) => {
    const map: Record<string, string> = {
      offer_complete: "tag-green", withdrawal: "tag-cyan",
      daily_claim: "tag-gold", referral: "tag-purple",
    };
    return map[type] || "tag-gpt";
  };
  const tickerLabel = (type: string) =>
    ({ offer_complete: "EARNED", withdrawal: "WITHDRAW", daily_claim: "BONUS", referral: "REFERRAL" }[type] || "EARNED");

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Background layers */}
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-15%", right:"-10%", width:"35%", height:"35%", background:"radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", borderRadius:"50%", filter:"blur(60px)" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-5%",  width:"28%", height:"28%", background:"radial-gradient(circle, rgba(168,85,247,0.10), transparent 70%)", borderRadius:"50%", filter:"blur(60px)" }} />
      </div>

      {/* ── Activity Ticker ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-8 overflow-hidden flex items-center"
        style={{ background:"rgba(10,10,15,0.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(99,102,241,0.12)" }}>
        <div className="w-14 shrink-0 g-primary flex items-center justify-center h-full">
          <span className="text-white text-[9px] font-black tracking-widest uppercase">LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-14 text-[11px] ml-4">
            {Array.from({ length: 3 }).map((_, ri) =>
              activities?.map((a: any) => (
                <span key={`${ri}-${a.id}`} className="flex items-center gap-2">
                  <span className={`${tickerBadge(a.type)} text-[10px]`}>{tickerLabel(a.type)}</span>
                  <span className="font-semibold text-white/80">{a.username}</span>
                  <span className="font-bold" style={{ color:"#818cf8" }}>+${parseFloat(a.amount||"0").toFixed(2)}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="fixed top-8 left-0 right-0 z-40"
        style={{ background:"rgba(10,10,15,0.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl g-primary flex items-center justify-center" style={{ boxShadow:"0 0 16px rgba(99,102,241,0.45)" }}>
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold">
              <span className="text-g-primary">Rewards</span><span style={{ color:"#f4f4f8" }}>Verse</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background:"rgba(99,102,241,0.10)", border:"1px solid rgba(99,102,241,0.20)" }}>
              <Coins className="w-4 h-4" style={{ color:"#818cf8" }} />
              <span className="font-black text-sm" style={{ color:"#818cf8" }}>${balance.toFixed(2)}</span>
            </div>
            <button onClick={logout} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color:"rgba(255,255,255,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Nav ── */}
      <nav className="fixed top-[5.5rem] left-0 right-0 z-30"
        style={{ background:"rgba(10,10,15,0.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-5 flex items-center gap-0.5 overflow-x-auto">
          {navItems.map((item: any) => (
            <button key={item.path} onClick={() => setLocation(item.path)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${item.active ? "nav-gpt-active" : ""}`}
              style={!item.active ? { color:"rgba(255,255,255,0.40)", borderBottomColor:"transparent" } : undefined}>
              <item.icon className="w-3.5 h-3.5" />{item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="relative z-10 pt-36 pb-16 px-5 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Page header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="tag-gpt"><Zap className="w-3 h-3" /> 7 Providers</span>
              <span className="tag-green">Live Now</span>
            </div>
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily:"var(--font-display, Inter)" }}>
              Offer <span className="text-g-primary">Walls</span>
            </h1>
            <p style={{ color:"rgba(255,255,255,0.40)", fontSize:"0.875rem" }}>
              Select a provider and start earning by completing simple tasks.
            </p>
          </div>

          {/* ── Offer wall grid ── */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {OFFER_WALLS.map((wall, i) => (
              <motion.div key={wall.id}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-offer rounded-2xl"
                onClick={() => openWall(wall.id)}>

                {/* Top gradient bar */}
                <div className="offer-glow-bar" style={{ background: wall.bar }} />

                <div className="p-5">
                  {/* Icon + tag */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wall.grad} flex items-center justify-center shadow-lg`}
                      style={{ boxShadow: `0 4px 20px ${wall.glow}` }}>
                      <wall.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`${wall.tagCls} text-[10px]`}>{wall.tag}</span>
                  </div>

                  {/* Name + desc */}
                  <h3 className="font-bold text-base mb-1" style={{ color:"#f4f4f8" }}>{wall.name}</h3>
                  <p className="text-xs mb-4 leading-relaxed" style={{ color:"rgba(255,255,255,0.38)" }}>{wall.desc}</p>

                  <div className="divider-gpt mb-4" />

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1" style={{ color:"#fbbf24" }}>
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{wall.rating}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color:"#4ade80" }}>{wall.reward}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold transition-all" style={{ color:"#818cf8" }}>
                      Earn <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Info cards ── */}
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              { icon: CheckCircle2, title: "Instant Tracking", desc: "Most offers track instantly. Some premium offers may take up to 24h.", color: "#4ade80", glow: "rgba(74,222,128,0.12)" },
              { icon: Shield,       title: "Safe & Secure",    desc: "We only partner with trusted offer providers to ensure data protection.", color: "#22d3ee", glow: "rgba(34,211,238,0.12)" },
              { icon: TrendingUp,   title: "Highest Rates",    desc: "RewardsVerse offers the best payout rates across all offer networks.", color: "#a855f7", glow: "rgba(168,85,247,0.12)" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                className="glass rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: item.glow }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h4 className="font-bold mb-2" style={{ color:"#f4f4f8" }}>{item.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.38)" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* ── Offer Wall Iframe Overlay ── */}
      <AnimatePresence>
        {activeWall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col" style={{ background: "#0a0a0f" }}>
            <div className="h-14 flex items-center justify-between px-5"
              style={{ background:"rgba(10,10,15,0.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.12)" }}>
              <div className="flex items-center gap-4">
                <button onClick={closeWall} className="flex items-center gap-2 text-sm font-semibold transition-colors"
                  style={{ color:"rgba(255,255,255,0.50)" }}
                  onMouseEnter={e => (e.currentTarget.style.color="#818cf8")}
                  onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.50)")}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-sm font-bold text-g-primary">
                  {OFFER_WALLS.find(w => w.id === activeWall)?.name}
                </span>
              </div>
              <button onClick={closeWall} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color:"rgba(255,255,255,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.color="#f87171")}
                onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {wallUrl ? (
              <iframe src={wallUrl} className="flex-1 w-full border-0" title="Offer Wall"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation" />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
                  style={{ boxShadow:"0 0 20px rgba(99,102,241,0.5)" }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
