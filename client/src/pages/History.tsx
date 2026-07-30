import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  LogOut,
  LayoutDashboard,
  Gift as OfferIcon,
  Wallet,
  History as HistoryIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Zap,
  Trophy,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";

export default function History() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const historyQuery = trpc.history.getAllHistory.useQuery();
  const earnings = historyQuery.data?.earnings || [];
  const withdrawals = historyQuery.data?.withdrawals || [];

  // IMPROVED: Merged chronological history - combines earnings and withdrawals
  const mergedHistory = (() => {
    const items: any[] = [];
    earnings.forEach((e: any) => {
      items.push({ ...e, txType: 'earning', icon: ArrowDownLeft, color: 'green' });
    });
    withdrawals.forEach((w: any) => {
      items.push({ ...w, txType: 'withdrawal', icon: ArrowUpRight, color: 'cyan' });
    });
    // Sort by date, newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  })();

  useEffect(() => {
    if (!loading && !user) setLocation("/");
  }, [user, loading, setLocation]);

  // IMPROVED: Faster polling - every 5 seconds instead of 20
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      historyQuery.refetch();
    }, 5000); // Poll every 5 seconds for faster updates

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [historyQuery]);

  // IMPROVED: Subscribe to SSE postback events for real-time history updates
  useSSE({
    onPostback: (event) => {
      // Immediately refetch history when postback event received
      console.log("[History] Postback received, refreshing history", event);
      historyQuery.refetch();
    },
    enabled: !!user?.id,
  });

  // Refresh history when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to the tab - refresh history immediately
        historyQuery.refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [historyQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const balance = parseFloat(user.balance || "0") || 0;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", active: false },
    { label: "Offer Walls", icon: OfferIcon, path: "/offers", active: false },
    { label: "Withdraw", icon: Wallet, path: "/withdraw", active: false },
    { label: "History", icon: HistoryIcon, path: "/history", active: true },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard", active: false },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin", active: false }] : []),
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-400" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

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
            <h2 className="text-2xl font-bold">Transaction <span className="text-gradient">History</span></h2>
            <p className="text-sm text-muted-foreground mt-1">Track all your earnings and withdrawal requests in real-time. Updates every 5 seconds.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Earnings</p>
                  <p className="text-2xl font-black text-green-400">${parseFloat(user.totalEarned || "0").toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Withdrawn</p>
                  <p className="text-2xl font-black text-cyan-400">
                    ${(withdrawals || []).filter((w: any) => w.status === "approved").reduce((acc: number, w: any) => acc + parseFloat(w.amount || "0"), 0).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 h-12">
              <TabsTrigger value="all" className="h-10 px-6 font-bold text-xs">
                <Zap className="w-4 h-4 mr-2 text-purple-400" />
                All Transactions ({mergedHistory.length})
              </TabsTrigger>
              <TabsTrigger value="earnings" className="h-10 px-6 font-bold text-xs">
                <ArrowDownLeft className="w-4 h-4 mr-2 text-green-400" />
                Earnings ({earnings.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="h-10 px-6 font-bold text-xs">
                <ArrowUpRight className="w-4 h-4 mr-2 text-cyan-400" />
                Withdrawals ({withdrawals.length})
              </TabsTrigger>
            </TabsList>

            {/* IMPROVED: All Transactions Tab - Merged chronological view */}
            <TabsContent value="all" className="space-y-3">
              {mergedHistory.length === 0 ? (
                <Card className="border-dashed border-border/50 bg-background/50 p-12 text-center">
                  <HistoryIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-bold mb-2">No Transactions Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start earning or withdraw to see your history!</p>
                </Card>
              ) : (
                mergedHistory.map((item: any, i: number) => {
                  const isEarning = item.txType === 'earning';
                  const Icon = isEarning ? ArrowDownLeft : ArrowUpRight;
                  const colorClass = isEarning ? 'green' : 'cyan';
                  
                  return (
                    <motion.div key={`${item.txType}-${item.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                      <Card className="border-border/50 bg-card/50 hover:border-green-500/30 transition-all">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${isEarning ? 'bg-green-500/10' : 'bg-cyan-500/10'} flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${isEarning ? 'text-green-400' : 'text-cyan-400'}`} />
                            </div>
                            <div>
                              <p className="font-bold text-sm">
                                {isEarning ? item.source : `${item.cryptoType} Withdrawal`}
                              </p>
                              {!isEarning && (
                                <div className="flex items-center gap-2 mb-1">
                                  {getStatusIcon(item.status)}
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[9px] py-0 h-4 ${
                                      item.status === "approved" ? "text-green-400 border-green-500/30 bg-green-500/10" :
                                      item.status === "pending" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
                                      "text-red-400 border-red-500/30 bg-red-500/10"
                                    }`}
                                  >
                                    {item.status.toUpperCase()}
                                  </Badge>
                                </div>
                              )}
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Calendar size={10} /> {new Date(item.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${isEarning ? 'text-green-400' : 'text-cyan-400'} text-lg`}>
                              {isEarning ? '+' : '-'}${parseFloat(item.amount || "0").toFixed(2)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>

            {/* IMPROVED: Earnings Tab - No 20 item limit */}
            <TabsContent value="earnings" className="space-y-3">
              {earnings.length === 0 ? (
                <Card className="border-dashed border-border/50 bg-background/50 p-12 text-center">
                  <HistoryIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-bold mb-2">No Earnings Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Complete some offer walls to start earning!</p>
                  <Button onClick={() => setLocation("/offers")} variant="outline">
                    Go to Offer Walls
                  </Button>
                </Card>
              ) : (
                earnings.map((e: any, i: number) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-border/50 bg-card/50 hover:border-green-500/30 transition-all">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <ArrowDownLeft className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{e.source}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar size={10} /> {new Date(e.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400 text-lg">+${parseFloat(e.amount || "0").toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            {/* IMPROVED: Withdrawals Tab - No 20 item limit */}
            <TabsContent value="withdrawals" className="space-y-3">
              {withdrawals.length === 0 ? (
                <Card className="border-dashed border-border/50 bg-background/50 p-12 text-center">
                  <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-bold mb-2">No Withdrawals Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Make your first withdrawal request!</p>
                  <Button onClick={() => setLocation("/withdraw")} variant="outline">
                    Withdraw Now
                  </Button>
                </Card>
              ) : (
                withdrawals.map((w: any, i: number) => (
                  <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-border/50 bg-card/50 hover:border-cyan-500/30 transition-all">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm">{w.cryptoType}</p>
                              {getStatusIcon(w.status)}
                              <Badge 
                                variant="outline" 
                                className={`text-[9px] py-0 h-4 ${
                                  w.status === "approved" ? "text-green-400 border-green-500/30 bg-green-500/10" :
                                  w.status === "pending" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
                                  "text-red-400 border-red-500/30 bg-red-500/10"
                                }`}
                              >
                                {w.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{w.walletAddress}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar size={10} /> {new Date(w.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-cyan-400 text-lg">-${parseFloat(w.amount || "0").toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
