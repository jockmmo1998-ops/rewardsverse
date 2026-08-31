import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useState, useRef, useCallback } from "react";
import { playBellSound } from "@/utils/bellSound";
import { useSSE } from "@/hooks/useSSE";
import {
  LayoutDashboard, Gift as OfferIcon, Wallet, History as HistoryIcon,
  LogOut, Coins, X, ExternalLink, Star, Maximize2, Minimize2,
  Sparkles, Shield, CheckCircle2, ArrowLeft, Zap, ChevronRight, Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OFFER_WALLS = [
  { id: "gemiwall",    name: "Gemiwall",       desc: "Premium survey & offer wall",    reward: "$0.10–$5.00",  logo: "https://gemiwall.com/favicon.ico",                                              color: "from-yellow-500 to-orange-500", glow: "rgba(245,158,11,0.15)", tag: "POPULAR",  rating: 4.8 },
  { id: "revtoo",      name: "Revtoo",         desc: "High-paying mobile offers",      reward: "$0.25–$8.00",  logo: "https://revtoo.com/assets/offerwall/images/revtoo-dark.svg",                    color: "from-blue-500 to-cyan-500",     glow: "rgba(59,130,246,0.15)",  tag: "HIGH PAY", rating: 4.9 },
  { id: "clickwall",   name: "Clickwall",      desc: "Quick tasks & downloads",        reward: "$0.10–$3.00",  logo: "https://www.google.com/s2/favicons?domain=clickwall.com&sz=128",                color: "from-green-500 to-emerald-500", glow: "rgba(0,255,135,0.15)",   tag: "EASY",     rating: 4.5 },
  { id: "moustache",   name: "MoustacheLeads", desc: "CPI & CPA offers worldwide",     reward: "$0.50–$10.00", logo: "https://moustacheleads.com/logo.png",                                           color: "from-purple-500 to-pink-500",   glow: "rgba(168,85,247,0.15)",  tag: "PREMIUM",  rating: 4.7 },
  { id: "taskwall",    name: "Taskwall",       desc: "Sign-up & engagement tasks",     reward: "$0.15–$6.00",  logo: "https://taskwall.io/taskwall_theme/assets/images/logo/logo.svg",                color: "from-indigo-500 to-blue-500",   glow: "rgba(99,102,241,0.15)",  tag: "SIGN-UPS", rating: 4.6 },
  { id: "cointo",      name: "CoinToMedia",    desc: "Crypto-focused offers",          reward: "$0.20–$4.00",  logo: "https://cointomedia.com/asset/images/iframe-logo.webp",                         color: "from-amber-500 to-yellow-500",  glow: "rgba(245,158,11,0.12)",  tag: "CRYPTO",   rating: 4.4 },
  { id: "klink",       name: "Klink Finance",  desc: "Finance & trading offers",       reward: "$0.30–$7.00",  logo: "https://assets.klink.finance/CDN/opengraph.jpg",                                color: "from-teal-500 to-green-500",    glow: "rgba(20,184,166,0.15)",  tag: "FINANCE",  rating: 4.8 },
  { id: "adswedmedia", name: "AdsWedMedia",    desc: "CPA & incent offers worldwide",  reward: "$0.10–$6.00",  logo: "https://adswedmedia.com/asset/storage/photos/logo-img.png",                     color: "from-rose-500 to-pink-500",     glow: "rgba(244,63,94,0.15)",   tag: "NEW",      rating: 4.7 },
  { id: "admaxflow",   name: "AdMaxFlow",      desc: "Surveys, apps & tasks worldwide", reward: "$0.10–$5.00", logo: "https://www.google.com/s2/favicons?domain=www.admaxflow.com&sz=128",                color: "from-cyan-500 to-blue-500",     glow: "rgba(6,182,212,0.15)",   tag: "NEW",      rating: 4.6 },
  { id: "gaintwall",   name: "Gaintwall",      desc: "Earn with surveys & tasks worldwide", reward: "$0.10–$6.00", logo: "https://www.google.com/s2/favicons?domain=gaintwall.com&sz=128",             color: "from-pink-500 to-rose-500",     glow: "rgba(236,72,153,0.15)",  tag: "NEW",      rating: 4.7 },
  { id: "buckswall",   name: "BucksWall",       desc: "Mobile apps, surveys & gaming offers", reward: "$0.10–$6.00", logo: "https://www.google.com/s2/favicons?domain=buckswall.com&sz=128",                                       color: "from-sky-500 to-blue-500",      glow: "rgba(14,165,233,0.15)",   tag: "SETUP",    rating: 4.6 },
];

const tickerBadge = (type: string) => {
  const map: Record<string, string> = {
    offer_complete: "bg-green-500/10 text-green-400 border-green-500/30",
    withdrawal: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    daily_claim: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    referral: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };
  return map[type] || map.offer_complete;
};
const tickerLabel = (type: string) =>
  ({ offer_complete: "EARNED", withdrawal: "WITHDRAW", daily_claim: "BONUS", referral: "REFERRAL" }[type] || "EARNED");

export default function OfferWalls() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const [wallUrl, setWallUrl] = useState("");
  const [isWallFullscreen, setIsWallFullscreen] = useState(false);
  const [previousBalance, setPreviousBalance] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery(
    { wall: activeWall || "" },
    { enabled: !!activeWall, retry: false },
  );
  const recordMutation = trpc.user.recordOfferComplete.useMutation({
    onSuccess: async (data) => { await playBellSound(); toast.success(`Reward credited! +$${data.reward}`); },
    onSettled: () => refreshProfile(),
  });

  useEffect(() => { if (!loading && !user) setLocation("/"); }, [user, loading, setLocation]);
  useEffect(() => {
    if (wallUrlQuery.data?.url) setWallUrl(wallUrlQuery.data.url);
  }, [wallUrlQuery.data]);

  useEffect(() => {
    if (!wallUrlQuery.error) return;
    setWallUrl("");
    toast.error(wallUrlQuery.error.message || "This offer wall is not available yet.");
    setActiveWall(null);
  }, [wallUrlQuery.error]);

  useEffect(() => {
    if (user?.balance) {
      const curr = parseFloat(user.balance);
      const prev = previousBalance ? parseFloat(previousBalance) : curr;
      if (curr > prev) { playBellSound().catch(() => {}); toast.success(`Balance updated! +$${(curr - prev).toFixed(2)}`); }
      setPreviousBalance(user.balance);
    }
  }, [user?.balance]);

  useEffect(() => {
    if (activeWall) {
      pollingIntervalRef.current = setInterval(() => refreshProfile(), 15000);
      return () => { if (pollingIntervalRef.current) { clearInterval(pollingIntervalRef.current); pollingIntervalRef.current = null; } };
    }
  }, [activeWall, refreshProfile]);

  useEffect(() => {
    const fn = () => { if (!document.hidden && activeWall) refreshProfile(); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [activeWall, refreshProfile]);

  const openWall = (wallId: string) => {
    setActiveWall(wallId);
    setWallUrl("");
    setIsWallFullscreen(false);
  };
  const closeWall = useCallback(() => {
    refreshProfile();
    setTimeout(() => refreshProfile(), 1000);
    setActiveWall(null); setWallUrl("");
    setIsWallFullscreen(false);
  }, [refreshProfile]);

  useSSE({
    onPostback: async (event) => {
      await playBellSound().catch(() => {});
      toast.success(`🎉 +$${event.amount.toFixed(2)} từ ${event.provider}${event.offerName ? ` — ${event.offerName}` : ""}`, { duration: 6000 });
      refreshProfile();
      setTimeout(() => refreshProfile(), 1500);
    },
    onBalanceUpdate: () => refreshProfile(),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin glow-green" /></div>;
  if (!user) return null;

  const balance = parseFloat(user.balance || "0") || 0;
  const navItems = [
    { label: "Dashboard",   icon: LayoutDashboard, path: "/dashboard", active: false },
    { label: "Offer Walls", icon: OfferIcon,        path: "/offers",    active: true },
    { label: "Withdraw",    icon: Wallet,            path: "/withdraw",  active: false },
    { label: "History",     icon: HistoryIcon,       path: "/history",   active: false },
    { label: "Leaderboard", icon: Trophy,            path: "/leaderboard", active: false },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin", active: false }] : []),
  ];

  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
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
            <div className="flex items-center gap-2 bg-green-500/8 border border-green-500/25 rounded-lg px-3 py-1.5">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-black text-sm">${balance.toFixed(2)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-red-400"><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="fixed top-[6.5rem] left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-green-500/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => setLocation(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${item.active ? "text-green-400 border-green-400 nav-item-active" : "text-muted-foreground border-transparent hover:text-green-400/70"}`}>
              <item.icon className="w-3.5 h-3.5" />{item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 pt-[10.5rem] pb-10 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 tag-cyber mb-3">
              <Zap className="w-3 h-3" /> {OFFER_WALLS.length} Providers
            </div>
            <h2 className="text-3xl font-extrabold">Offer <span className="text-gradient">Walls</span></h2>
            <p className="text-sm text-muted-foreground mt-1">Select a provider to start earning rewards by completing simple tasks.</p>
          </div>

          {/* Offer Walls Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OFFER_WALLS.map((wall, i) => (
              <motion.div key={wall.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }} whileHover={{ y: -4 }}>
                <div className="cyber-card cyber-corner rounded-2xl overflow-hidden cursor-pointer group" onClick={() => openWall(wall.id)}>
                  {/* top colour bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${wall.color}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg group-hover:text-green-400 transition-colors">{wall.name}</h3>
                          <span className="tag-cyber">{wall.tag}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{wall.desc}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${wall.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg overflow-hidden`}>
                        <img src={wall.logo} alt={wall.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    </div>
                    <div className="divider-cyber mb-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-bold">{wall.rating}</span>
                        </div>
                        <span className="text-xs text-green-400 font-bold">{wall.reward}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-xs font-bold group-hover:gap-2 transition-all">
                        Earn Now <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/8", title: "Instant Tracking", desc: "Most offers track instantly. Some premium offers may take up to 24h to verify." },
              { icon: Shield,       color: "text-cyan-400",  bg: "bg-cyan-500/8",  title: "Safe & Secure",    desc: "We only partner with trusted offer providers to ensure your data is protected." },
              { icon: Sparkles,     color: "text-purple-400",bg: "bg-purple-500/8",title: "High Rates",        desc: "RewardsVerse offers the highest payout rates in the industry for all walls." },
            ].map((item, i) => (
              <div key={i} className="cyber-card p-6 rounded-2xl">
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Offer Wall Provider Modal — offerwall page only, not offer details */}
      <AnimatePresence>
        {activeWall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:p-6 lg:p-10 ${isWallFullscreen ? "p-0" : ""}`}
            onClick={(event) => { if (event.target === event.currentTarget) closeWall(); }}>
            <motion.div initial={{ scale: 0.97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 8 }}
              transition={{ duration: 0.18 }}
              className={`flex h-[78vh] w-[78vw] max-w-[1180px] min-h-0 flex-col overflow-hidden rounded-2xl border border-green-500/20 bg-background shadow-2xl shadow-slate-950/40 ${isWallFullscreen ? "h-screen w-screen max-w-none rounded-none border-0" : "max-sm:h-[86vh] max-sm:w-full"}`}>
              <div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-green-500/15 bg-background/95 px-4 py-3 backdrop-blur-md sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-green-500/20 bg-green-500/10 p-1">
                    <img src={OFFER_WALLS.find(w => w.id === activeWall)?.logo} alt="" className="h-full w-full object-contain" />
                  </div>
                  <span className="truncate text-sm font-bold text-gradient sm:text-base">{OFFER_WALLS.find(w => w.id === activeWall)?.name}</span>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setIsWallFullscreen(value => !value)} className="text-xs text-muted-foreground hover:text-green-400">
                    {isWallFullscreen ? <Minimize2 className="mr-1.5 h-4 w-4" /> : <Maximize2 className="mr-1.5 h-4 w-4" />}
                    <span className="hidden sm:inline">{isWallFullscreen ? "THU NHỎ" : "MỞ TOÀN MÀN HÌNH"}</span>
                  </Button>
                  <Button variant="ghost" size="sm" aria-label="Đóng Offerwall" onClick={closeWall} className="text-muted-foreground hover:text-red-400"><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-white">
                {wallUrlQuery.isFetching ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" /><span>Loading offer wall…</span></div>
                  </div>
                ) : wallUrl ? (
                  <iframe src={wallUrl} className="block h-full min-h-full w-full border-0" title="Offer Wall Provider"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">This provider is not configured yet.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
