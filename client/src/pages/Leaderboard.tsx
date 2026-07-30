import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  LogOut,
  LayoutDashboard,
  Gift as OfferIcon,
  Wallet,
  History as HistoryIcon,
  Sparkles,
  Trophy,
  Medal,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();

  const leaderboardQuery = trpc.user.getLeaderboard.useQuery();

  useEffect(() => {
    if (!loading && !user) setLocation("/");
  }, [user, loading, setLocation]);

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
  const leaderboard = leaderboardQuery.data || [];

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", active: false },
    { label: "Offer Walls", icon: OfferIcon, path: "/offers", active: false },
    { label: "Withdraw", icon: Wallet, path: "/withdraw", active: false },
    { label: "History", icon: HistoryIcon, path: "/history", active: false },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard", active: true },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin", active: false }] : []),
  ];

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <Medal className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-slate-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-sm font-black text-muted-foreground">#{rank}</span>;
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
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold"><span className="text-gradient">Leader</span>board</h1>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-bold">Top Earners</p>
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
      <main className="pt-[10.5rem] pb-8 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black tracking-tight">Wall of <span className="text-gradient">Fame</span></h2>
            <p className="text-sm text-muted-foreground mt-2">The top 50 highest earners on RewardsVerse. Can you make it to the top?</p>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-12 items-end">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <motion.div initial={{ height: 0 }} animate={{ height: 100 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-[100px] bg-slate-400/10 border-x border-t border-slate-400/20 rounded-t-2xl flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 rounded-full bg-slate-400/20 flex items-center justify-center mb-2 border-2 border-slate-400/30">
                  <span className="text-lg font-black text-slate-300">2</span>
                </div>
                <p className="text-xs font-bold truncate w-full text-center">{leaderboard[1]?.username || "---"}</p>
                <p className="text-[10px] text-green-400 font-bold">${parseFloat(leaderboard[1]?.totalEarned || "0").toFixed(2)}</p>
              </motion.div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 mb-2">
                <Trophy className="w-full h-full text-yellow-400 animate-bounce" />
              </div>
              <motion.div initial={{ height: 0 }} animate={{ height: 140 }} transition={{ duration: 0.6 }} className="w-full max-w-[120px] bg-yellow-400/10 border-x border-t border-yellow-400/20 rounded-t-2xl flex flex-col items-center justify-center p-4 relative">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20 border-4 border-background">
                  <span className="text-xl font-black text-background">1</span>
                </div>
                <p className="text-sm font-bold truncate w-full text-center mt-4">{leaderboard[0]?.username || "---"}</p>
                <p className="text-xs text-green-400 font-bold">${parseFloat(leaderboard[0]?.totalEarned || "0").toFixed(2)}</p>
              </motion.div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <motion.div initial={{ height: 0 }} animate={{ height: 80 }} transition={{ duration: 0.6, delay: 0.4 }} className="w-full max-w-[100px] bg-amber-600/10 border-x border-t border-amber-600/20 rounded-t-2xl flex flex-col items-center justify-center p-4">
                <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center mb-2 border-2 border-amber-600/30">
                  <span className="text-base font-black text-amber-600">3</span>
                </div>
                <p className="text-xs font-bold truncate w-full text-center">{leaderboard[2]?.username || "---"}</p>
                <p className="text-[10px] text-green-400 font-bold">${parseFloat(leaderboard[2]?.totalEarned || "0").toFixed(2)}</p>
              </motion.div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Total Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-sm text-muted-foreground">
                          Leaderboard is currently empty. Start earning to be the first!
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry, i) => (
                        <motion.tr 
                          key={entry.userId} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${entry.userId === user.id ? "bg-green-500/5" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center w-8">
                              {getRankBadge(i + 1)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                {entry.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold flex items-center gap-2">
                                  {entry.username}
                                  {entry.userId === user.id && <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[8px] h-3.5 py-0">YOU</Badge>}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-black text-green-400">${parseFloat(entry.totalEarned || "0").toFixed(2)}</p>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="font-bold">Climb the Ranks!</h4>
                <p className="text-xs text-muted-foreground">Earn more points to unlock exclusive rewards and reach the top of the leaderboard.</p>
              </div>
            </div>
            <Button onClick={() => setLocation("/offers")} className="gradient-green-cyan text-white font-bold h-11 px-8 shadow-lg shadow-green-500/20">
              Start Earning Now
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
