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
  LogOut, Coins, X, ExternalLink, Star,
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
  const [previousBalance, setPreviousBalance] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery({ wall: activeWall || "" }, { enabled: !!activeWall });
  const recordMutation = trpc.user.recordOfferComplete.useMutation({
    onSuccess: async (data) => { await playBellSound(); toast.success(`Reward credited! +$${data.reward}`); },
    onSettled: () => refreshProfile(),
  });

  useEffect(() => { if (!loading && !user) setLocation("/"); }, [user, loading, setLocation]);
  useEffect(() => { if (wallUrlQuery.data?.url) setWallUrl(wallUrlQuery.data.url); }, [wallUrlQuery.data]);

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

  const openWall = (wallId: string) => { setActiveWall(wallId); setWallUrl(""); };
  const closeWall = useCallback(() => {
    refreshProfile();
    setTimeout(() => refreshProfile(), 1000);
    setActiveWall(null); setWallUrl("");
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-500/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-green-500/4 blur-[120px] rounded-full" />
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
              <Zap className="w-3 h-3" /> 8 Providers
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

      {/* Offer Wall Iframe Overlay */}
      <AnimatePresence>
        {activeWall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background flex flex-col">
            <div className="h-14 border-b border-green-500/15 flex items-center justify-between px-4 bg-background/90 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={closeWall} className="text-muted-foreground hover:text-green-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <span className="text-sm font-bold text-gradient">{OFFER_WALLS.find(w => w.id === activeWall)?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={closeWall} className="text-muted-foreground hover:text-red-400"><X className="w-4 h-4" /></Button>
            </div>
            {wallUrl && (
              <iframe src={wallUrl} className="flex-1 w-full border-0" title="Offer Wall"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
