import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins, LogOut, LayoutDashboard, Gift as OfferIcon, Wallet,
  History as HistoryIcon, Sparkles, Trophy, Medal, TrendingUp, Zap,
} from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

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

export default function Leaderboard() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const leaderboardQuery = trpc.user.getLeaderboard.useQuery();

  useEffect(() => { if (!loading && !user) setLocation("/"); }, [user, loading, setLocation]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin glow-green" /></div>;
  if (!user) return null;

  const balance = parseFloat(user.balance || "0") || 0;
  const leaderboard = leaderboardQuery.data || [];
  const navItems = [
    { label: "Dashboard",   icon: LayoutDashboard, path: "/dashboard",   active: false },
    { label: "Offer Walls", icon: OfferIcon,        path: "/offers",      active: false },
    { label: "Withdraw",    icon: Wallet,            path: "/withdraw",    active: false },
    { label: "History",     icon: HistoryIcon,       path: "/history",     active: false },
    { label: "Leaderboard", icon: Trophy,            path: "/leaderboard", active: true  },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Sparkles, path: "/admin", active: false }] : []),
  ];

  const podiumStyles = [
    { rank: 2, height: "h-28", bg: "bg-slate-400/8",   border: "border-slate-400/25",  textColor: "text-slate-300",   nameSize: "text-sm"  },
    { rank: 1, height: "h-40", bg: "bg-yellow-400/8",  border: "border-yellow-400/25", textColor: "text-yellow-300",  nameSize: "text-base" },
    { rank: 3, height: "h-20", bg: "bg-amber-600/8",   border: "border-amber-600/25",  textColor: "text-amber-500",   nameSize: "text-sm"  },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid bg-scan">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[40%] h-[20%] bg-yellow-400/3 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[20%] h-[20%] bg-green-500/4 blur-[120px] rounded-full" />
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
              <Trophy className="w-5 h-5 text-[#060818]" />
            </div>
            <div>
              <h1 className="text-base font-bold"><span className="text-gradient">Leader</span>board</h1>
              <p className="text-[9px] text-green-400/70 tracking-[0.2em] uppercase font-bold">Top Earners</p>
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
      <main className="relative z-10 pt-[10.5rem] pb-10 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 tag-gold mb-4" style={{ background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.3)", color: "#f5c842", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Trophy className="w-3 h-3" /> Top 50
            </div>
            <h2 className="text-4xl font-extrabold mb-2">Wall of <span className="text-gradient">Fame</span></h2>
            <p className="text-sm text-muted-foreground">The top 50 highest earners on RewardsVerse. Can you make it to the top?</p>
          </div>

          {/* Podium — reorder: 2nd | 1st | 3rd */}
          {leaderboard.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-14">
              {podiumStyles.map((pod) => {
                const entry = leaderboard[pod.rank - 1];
                return (
                  <motion.div
                    key={pod.rank}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: pod.rank === 1 ? 0 : pod.rank === 2 ? 0.2 : 0.4 }}
                    className="flex flex-col items-center flex-1 max-w-[140px]"
                  >
                    {pod.rank === 1 && (
                      <Trophy className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
                    )}
                    <div className={`w-full ${pod.height} ${pod.bg} border ${pod.border} rounded-t-2xl flex flex-col items-center justify-end pb-4 relative`}
                      style={{ boxShadow: pod.rank === 1 ? "0 0 30px rgba(245,200,66,0.15)" : undefined }}>
                      {pod.rank === 1 && (
                        <div className="absolute -top-6 w-12 h-12 rounded-full gradient-gold flex items-center justify-center text-[#060818] font-black text-xl shadow-lg ring-4 ring-background"
                          style={{ background: "linear-gradient(135deg,#f5c842,#f97316)" }}>
                          1
                        </div>
                      )}
                      {pod.rank !== 1 && (
                        <div className={`w-10 h-10 rounded-full ${pod.bg} border ${pod.border} flex items-center justify-center font-black text-lg ${pod.textColor} mb-2`}>
                          {pod.rank}
                        </div>
                      )}
                      <p className={`${pod.nameSize} font-bold truncate w-full text-center px-2 mt-${pod.rank === 1 ? "3" : "0"}`}>{entry?.username || "---"}</p>
                      <p className="text-xs text-green-400 font-bold">${parseFloat(entry?.totalEarned || "0").toFixed(2)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Table */}
          <div className="cyber-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-green-500/10 bg-green-500/3">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Total Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-14 text-center text-sm text-muted-foreground">
                        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        Leaderboard is empty. Start earning to be the first!
                      </td>
                    </tr>
                  ) : leaderboard.map((entry: any, i: number) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`border-b border-green-500/5 transition-colors ${entry.userId === user.id ? "bg-green-500/5" : "hover:bg-green-500/2"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8">
                          {i === 0 ? <Medal className="w-5 h-5 text-yellow-400" /> :
                           i === 1 ? <Medal className="w-5 h-5 text-slate-400" /> :
                           i === 2 ? <Medal className="w-5 h-5 text-amber-600" /> :
                           <span className="text-sm font-black text-muted-foreground">#{i + 1}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center text-[10px] font-bold border border-green-500/20">
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold flex items-center gap-2">
                              {entry.username}
                              {entry.userId === user.id && <span className="tag-cyber text-[8px] h-3.5">YOU</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-green-400">${parseFloat(entry.totalEarned || "0").toFixed(2)}</p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 cyber-card rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="font-bold">Climb the Ranks!</h4>
                <p className="text-xs text-muted-foreground">Complete more offers to unlock exclusive rewards and reach the top.</p>
              </div>
            </div>
            <Button onClick={() => setLocation("/offers")} className="btn-cyber rounded-xl h-11 px-8 font-black tracking-widest uppercase text-sm shrink-0">
              Start Earning
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
