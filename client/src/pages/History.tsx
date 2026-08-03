import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins, LogOut, LayoutDashboard, Gift as OfferIcon, Wallet,
  History as HistoryIcon, Sparkles, ArrowUpRight, ArrowDownLeft,
  CheckCircle2, Clock, XCircle, Calendar, Zap, Trophy,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";

function getStatusIcon(status: string) {
  if (status === "approved") return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
  if (status === "pending")  return <Clock className="w-3.5 h-3.5 text-yellow-400" />;
  return <XCircle className="w-3.5 h-3.5 text-red-400" />;
}

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

export default function History() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const historyQuery = trpc.history.getAllHistory.useQuery();
  const earnings    = historyQuery.data?.earnings    || [];
  const withdrawals = historyQuery.data?.withdrawals || [];

  const mergedHistory = (() => {
    const items: any[] = [];
    earnings.forEach((e: any)    => items.push({ ...e, txType: "earning",    icon: ArrowDownLeft, colorClass: "green" }));
    withdrawals.forEach((w: any) => items.push({ ...w, txType: "withdrawal", icon: ArrowUpRight,  colorClass: "cyan"  }));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  })();

  useSSE({
    onPostback: () => { historyQuery.refetch(); refreshProfile(); },
    onBalanceUpdate: () => { historyQuery.refetch(); refreshProfile(); },
    onError: (err) => console.error("[History] SSE:", err),
    enabled: !!user?.id,
  });

  useEffect(() => { if (!loading && !user) setLocation("/"); }, [user, loading, setLocation]);
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => { historyQuery.refetch(); refreshProfile(); }, 5000);
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin glow-green" /></div>;
  if (!user) return null;

  const balance = parseFloat(user.balance || "0") || 0;
  const navItems = [
    { label: "Dashboard",   icon: LayoutDashboard, path: "/dashboard",   active: false },
    { label: "Offer Walls", icon: OfferIcon,        path: "/offers",      active: false },
    { label: "Withdraw",    icon: Wallet,            path: "/withdraw",    active: false },
    { label: "History",     icon: HistoryIcon,       path: "/history",     active: true  },
    { label: "Leaderboard", icon: Trophy,            path: "/leaderboard", active: false },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin", active: false }] : []),
  ];

  const EmptyState = ({ icon: Icon, title, desc, action }: any) => (
    <div className="cyber-card rounded-2xl p-16 text-center">
      <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{desc}</p>
      {action}
    </div>
  );

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
              <Zap className="w-3 h-3" /> Live Updates
            </div>
            <h2 className="text-3xl font-extrabold">Transaction <span className="text-gradient">History</span></h2>
            <p className="text-sm text-muted-foreground mt-1">All your earnings and withdrawals in real-time. Updates every 5 seconds.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="cyber-card rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Earnings</p>
                <p className="text-2xl font-black text-green-400">${parseFloat(user.totalEarned || "0").toFixed(2)}</p>
              </div>
            </div>
            <div className="cyber-card rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Withdrawn</p>
                <p className="text-2xl font-black text-cyan-400">
                  ${(withdrawals || []).filter((w: any) => w.status === "approved").reduce((acc: number, w: any) => acc + parseFloat(w.amount || "0"), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 h-12 bg-muted/20 border border-border/30">
              <TabsTrigger value="all" className="h-10 px-6 font-bold text-xs data-[state=active]:text-green-400">
                <Zap className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> All ({mergedHistory.length})
              </TabsTrigger>
              <TabsTrigger value="earnings" className="h-10 px-6 font-bold text-xs data-[state=active]:text-green-400">
                <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5 text-green-400" /> Earnings ({earnings.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="h-10 px-6 font-bold text-xs data-[state=active]:text-green-400">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Withdrawals ({withdrawals.length})
              </TabsTrigger>
            </TabsList>

            {/* All tab */}
            <TabsContent value="all" className="space-y-3">
              {mergedHistory.length === 0
                ? <EmptyState icon={HistoryIcon} title="No Transactions Yet" desc="Start earning or withdraw to see your history!" />
                : mergedHistory.map((item: any, i: number) => {
                    const isEarning = item.txType === "earning";
                    return (
                      <motion.div key={`${item.txType}-${item.id}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                        <div className={`cyber-card rounded-xl p-4 flex items-center justify-between ${isEarning ? "hover:border-green-500/30" : "hover:border-cyan-500/30"} transition-all`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${isEarning ? "bg-green-500/10" : "bg-cyan-500/10"} flex items-center justify-center`}>
                              <item.icon className={`w-5 h-5 ${isEarning ? "text-green-400" : "text-cyan-400"}`} />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{isEarning ? item.source : `${item.cryptoType} Withdrawal`}</p>
                              {!isEarning && (
                                <div className="flex items-center gap-2 mb-0.5">
                                  {getStatusIcon(item.status)}
                                  <Badge variant="outline" className={`text-[9px] py-0 h-4 ${item.status === "approved" ? "text-green-400 border-green-500/30 bg-green-500/10" : item.status === "pending" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}>
                                    {item.status.toUpperCase()}
                                  </Badge>
                                </div>
                              )}
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Calendar size={10} /> {new Date(item.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className={`font-black text-lg ${isEarning ? "text-green-400" : "text-cyan-400"}`}>
                            {isEarning ? "+" : "-"}${parseFloat(item.amount || "0").toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
            </TabsContent>

            {/* Earnings tab */}
            <TabsContent value="earnings" className="space-y-3">
              {earnings.length === 0
                ? <EmptyState icon={HistoryIcon} title="No Earnings Yet" desc="Complete some offer walls to start earning!"
                    action={<Button onClick={() => setLocation("/offers")} variant="outline" className="border-green-500/30 hover:border-green-400 text-green-400">Go to Offer Walls</Button>} />
                : earnings.map((e: any, i: number) => (
                    <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <div className="cyber-card rounded-xl p-4 flex items-center justify-between hover:border-green-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <ArrowDownLeft className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{e.source}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={10} /> {new Date(e.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="font-black text-lg text-green-400">+${parseFloat(e.amount || "0").toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
            </TabsContent>

            {/* Withdrawals tab */}
            <TabsContent value="withdrawals" className="space-y-3">
              {withdrawals.length === 0
                ? <EmptyState icon={Wallet} title="No Withdrawals Yet" desc="Make your first withdrawal request!"
                    action={<Button onClick={() => setLocation("/withdraw")} variant="outline" className="border-cyan-500/30 hover:border-cyan-400 text-cyan-400">Withdraw Now</Button>} />
                : withdrawals.map((w: any, i: number) => (
                    <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <div className="cyber-card rounded-xl p-4 flex items-center justify-between hover:border-cyan-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm">{w.cryptoType}</p>
                              {getStatusIcon(w.status)}
                              <Badge variant="outline" className={`text-[9px] py-0 h-4 ${w.status === "approved" ? "text-green-400 border-green-500/30 bg-green-500/10" : w.status === "pending" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}>
                                {w.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{w.walletAddress}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar size={10} /> {new Date(w.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="font-black text-lg text-cyan-400">-${parseFloat(w.amount || "0").toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
