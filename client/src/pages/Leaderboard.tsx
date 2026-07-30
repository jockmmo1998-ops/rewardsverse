import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Trophy, Crown, Medal, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const RANK_META: Record<number, { bar: string; badge: string; badgeBg: string; glow: string }> = {
  1: { bar:"linear-gradient(90deg,#f59e0b,#ef4444)", badge:"#fbbf24", badgeBg:"rgba(245,158,11,0.15)", glow:"0 0 30px rgba(245,158,11,0.20)" },
  2: { bar:"linear-gradient(90deg,#94a3b8,#64748b)", badge:"#94a3b8", badgeBg:"rgba(148,163,184,0.12)", glow:"0 0 20px rgba(148,163,184,0.12)" },
  3: { bar:"linear-gradient(90deg,#f97316,#f59e0b)", badge:"#f97316", badgeBg:"rgba(249,115,22,0.12)", glow:"0 0 20px rgba(249,115,22,0.12)" },
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data, isLoading } = trpc.leaderboard.getTop.useQuery({ limit: 20 });

  const users: any[] = data?.users || [];
  const top3 = users.slice(0, 3);
  const rest  = users.slice(3);

  return (
    <div className="min-h-screen" style={{ background:"#0a0a0f", color:"#f4f4f8" }}>
      <div className="noise-overlay" /><div className="grid-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-15%", right:"-10%", width:"30%", height:"30%", background:"radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)", filter:"blur(60px)" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-5%",  width:"25%", height:"25%", background:"radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)", filter:"blur(60px)" }} />
      </div>

      {/* Header */}
      <div className="relative z-10" style={{ background:"rgba(10,10,15,0.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="max-w-4xl mx-auto px-5 py-5 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">Leaderboard</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem" }}>Top earners this month</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 py-8 space-y-8">

        {/* Top 3 Podium */}
        {!isLoading && top3.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((u: any, idx: number) => {
              const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
              const rm = RANK_META[rank];
              const isFirst = rank === 1;
              const isMe = u.username === user?.username;
              return (
                <motion.div key={u.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx*0.1 }}
                  className="glass rounded-2xl overflow-hidden relative"
                  style={isFirst ? { boxShadow:rm.glow, border:"1px solid rgba(245,158,11,0.25)" } : {}}>
                  {/* Top bar */}
                  <div className="h-1.5 w-full" style={{ background:rm.bar }} />
                  <div className="p-5 text-center">
                    {isFirst && <Crown className="w-6 h-6 mx-auto mb-2 animate-float" style={{ color:"#fbbf24" }} />}
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-14 h-14 rounded-full mx-auto mb-2" style={{ border:`2px solid ${rm.badge}40` }} alt={u.username} />
                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black mb-2"
                      style={{ background:rm.badgeBg, color:rm.badge }}>#{rank}</div>
                    <p className={`font-black text-sm truncate ${isMe ? "" : ""}`}
                      style={{ color:isMe ? "#818cf8" : "#f4f4f8" }}>{u.username}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color:"#4ade80" }}>${parseFloat(u.totalEarned||"0").toFixed(2)}</p>
                    {isMe && <span className="tag-gpt text-[10px] mt-2 inline-block">YOU</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* thead */}
          <div className="px-5 py-3 grid grid-cols-12" style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            {[["1","Rank"],["6","User"],["3","Earned"],["2","XP"]].map(([span, label]) => (
              <div key={label} className={`col-span-${span} text-[10px] font-black uppercase tracking-widest`}
                style={{ color:"rgba(255,255,255,0.28)", textAlign: span==="3"||span==="2" ? "right":"left" }}>{label}</div>
            ))}
          </div>

          <div>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-5 py-4 h-16 animate-pulse" style={{ background:i%2===0?"rgba(255,255,255,0.01)":"transparent", borderBottom:"1px solid rgba(255,255,255,0.04)" }} />
              ))
            ) : users.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color:"rgba(99,102,241,0.35)" }} />
                <p style={{ color:"rgba(255,255,255,0.30)", fontSize:"0.875rem" }}>No rankings yet — be the first!</p>
              </div>
            ) : (
              users.map((u: any, i: number) => {
                const rank = i + 1;
                const rm = RANK_META[rank];
                const isMe = u.username === user?.username;
                return (
                  <motion.div key={u.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.025 }}
                    className="px-5 py-3.5 grid grid-cols-12 items-center tr-gpt transition-colors"
                    style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background: isMe?"rgba(99,102,241,0.06)":"transparent" }}>
                    <div className="col-span-1">
                      {rm ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black"
                          style={{ background:rm.badgeBg, color:rm.badge }}>#{rank}</span>
                      ) : (
                        <span style={{ fontSize:"0.875rem", fontWeight:700, color:"rgba(255,255,255,0.35)" }}>#{rank}</span>
                      )}
                    </div>
                    <div className="col-span-6 flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-8 h-8 rounded-full" style={{ border:"1px solid rgba(255,255,255,0.08)" }} alt={u.username} />
                      <div>
                        <p className="text-sm font-bold" style={{ color:isMe?"#818cf8":"#f4f4f8" }}>{u.username}</p>
                        {isMe && <span className="tag-gpt text-[9px]">YOU</span>}
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="text-sm font-black" style={{ color:"#4ade80" }}>${parseFloat(u.totalEarned||"0").toFixed(2)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.28)", fontWeight:600 }}>{u.xp||0} XP</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-elevated rounded-2xl p-8 text-center">
          <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color:"#818cf8" }} />
          <h2 className="text-2xl font-black mb-2">Climb the <span className="text-g-primary">Rankings</span></h2>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.875rem", marginBottom:"1.25rem", maxWidth:"28rem", margin:"0 auto 1.25rem" }}>
            Complete more offers, invite friends, and claim daily bonuses to rise to the top.
          </p>
          <button onClick={() => setLocation("/offers")} className="btn-gpt inline-flex items-center gap-2 px-7 py-3">
            Start Earning <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
