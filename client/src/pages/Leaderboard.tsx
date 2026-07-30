import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Trophy, Crown, Medal, Star, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const RANK_STYLES: Record<number, { icon: any; bg: string; text: string; badge: string }> = {
  1: { icon: Crown,  bg: "from-amber-50 to-yellow-50", text: "text-amber-600",  badge: "bg-amber-100 text-amber-700 border-amber-300" },
  2: { icon: Medal,  bg: "from-gray-50  to-slate-50",  text: "text-slate-500",  badge: "bg-gray-100  text-slate-600  border-gray-300"  },
  3: { icon: Medal,  bg: "from-orange-50 to-amber-50", text: "text-orange-500", badge: "bg-orange-100 text-orange-700 border-orange-300" },
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data, isLoading } = trpc.leaderboard.getTop.useQuery({ limit: 20 });

  const users: any[] = data?.users || [];
  const top3 = users.slice(0, 3);
  const rest  = users.slice(3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Leaderboard</h1>
            <p className="text-muted-foreground text-sm">Top earners this month</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Podium */}
        {!isLoading && top3.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((u: any, idx: number) => {
              const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
              const rs = RANK_STYLES[rank];
              const isFirst = rank === 1;
              return (
                <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className={`pc-card rounded-2xl p-5 text-center bg-gradient-to-b ${rs.bg} ${isFirst ? "ring-2 ring-amber-300 scale-105 shadow-lg" : ""}`}>
                  {isFirst && <Crown className="w-6 h-6 text-amber-500 mx-auto mb-2 animate-float" />}
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-14 h-14 rounded-full mx-auto mb-2 bg-gray-100" alt={u.username} />
                  <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold mb-2 ${rs.badge}`}>#{rank}</div>
                  <p className={`font-bold text-sm truncate ${u.username === user?.username ? "text-violet-600" : "text-foreground"}`}>{u.username}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">${parseFloat(u.totalEarned || "0").toFixed(2)}</p>
                  {u.username === user?.username && <span className="mt-2 inline-block tag-primary text-[10px]">YOU</span>}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="pc-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 bg-gray-50/70">
            <div className="grid grid-cols-12 text-xs font-bold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-1">Rank</div>
              <div className="col-span-6">User</div>
              <div className="col-span-3 text-right">Earned</div>
              <div className="col-span-2 text-right">XP</div>
            </div>
          </div>
          <div className="divide-y divide-border/40">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="px-6 py-4 h-16 animate-pulse bg-gray-50/30" />
              ))
            ) : users.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Trophy className="w-10 h-10 text-violet-300 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No rankings yet — be the first!</p>
              </div>
            ) : (
              users.map((u: any, i: number) => {
                const rank = i + 1;
                const isMe = u.username === user?.username;
                const rs = RANK_STYLES[rank];
                return (
                  <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`px-6 py-4 grid grid-cols-12 items-center table-row-pc transition-colors ${isMe ? "bg-violet-50/60" : ""}`}>
                    <div className="col-span-1">
                      {rs ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold ${rs.badge}`}>#{rank}</span>
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
                      )}
                    </div>
                    <div className="col-span-6 flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-9 h-9 rounded-full bg-gray-100" alt={u.username} />
                      <div>
                        <p className={`text-sm font-bold ${isMe ? "text-violet-700" : "text-foreground"}`}>{u.username}</p>
                        {isMe && <span className="tag-primary text-[9px]">YOU</span>}
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="text-sm font-extrabold text-emerald-600">${parseFloat(u.totalEarned || "0").toFixed(2)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-xs text-muted-foreground font-medium">{u.xp || 0} XP</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e0533, #0c0a2e)" }}>
          <TrendingUp className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Climb the Ranks</h2>
          <p className="text-white/60 text-sm mb-5 max-w-sm mx-auto">Complete more offers, invite friends, and claim daily bonuses to rise to the top.</p>
          <button onClick={() => setLocation("/offers")} className="btn-white text-sm font-bold px-7 py-3 rounded-xl inline-flex items-center gap-2">
            Start Earning <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
