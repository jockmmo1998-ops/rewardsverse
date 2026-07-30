import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import {
  ChevronLeft, TrendingUp, Wallet, Gift, Users,
  CheckCircle2, Clock, XCircle, Sparkles, ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";

type Tab = "all" | "earnings" | "withdrawals";

const STATUS_MAP: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "#4ade80", bg: "rgba(74,222,128,0.10)",  label: "Completed" },
  pending:   { icon: Clock,        color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  label: "Pending"   },
  failed:    { icon: XCircle,      color: "#f87171", bg: "rgba(248,113,113,0.10)", label: "Failed"    },
};

const TYPE_MAP: Record<string, { icon: any; color: string; label: string }> = {
  offer_complete: { icon: Sparkles, color: "#818cf8", label: "Offer"    },
  withdrawal:     { icon: Wallet,   color: "#22d3ee", label: "Withdraw" },
  daily_claim:    { icon: Gift,     color: "#fbbf24", label: "Bonus"    },
  referral:       { icon: Users,    color: "#4ade80", label: "Referral" },
};

export default function History() {
  const { user, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);

  useSSE({ onPostback: () => { refetch(); refreshProfile(); }, enabled: !!user?.id });

  const { data, isLoading, refetch } = trpc.user.getTransactions.useQuery(
    { page, limit: 20, type: tab === "all" ? undefined : tab === "earnings" ? "earn" : "withdraw" },
    { enabled: !!user?.id }
  );

  useEffect(() => { setPage(1); }, [tab]);

  const transactions = data?.transactions || [];
  const total = data?.total || 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all",         label: "All" },
    { key: "earnings",    label: "Earnings" },
    { key: "withdrawals", label: "Withdrawals" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#f4f4f8" }}>
      <div className="noise-overlay" /><div className="grid-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-10%", right:"-10%", width:"28%", height:"28%", background:"radial-gradient(circle, rgba(99,102,241,0.09), transparent 70%)", filter:"blur(60px)" }} />
      </div>

      {/* Header */}
      <div className="relative z-10" style={{ background:"rgba(10,10,15,0.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(99,102,241,0.10)" }}>
        <div className="max-w-4xl mx-auto px-5 py-5 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">Transaction History</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.8rem" }}>{total} transactions total</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 py-8 space-y-6">

        {/* Tabs */}
        <div className="flex gap-0.5 p-1 rounded-xl w-fit" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
              style={tab === t.key
                ? { background:"linear-gradient(135deg,#6366f1,#a855f7)", color:"#fff", boxShadow:"0 4px 16px rgba(99,102,241,0.35)" }
                : { color:"rgba(255,255,255,0.38)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 h-20 animate-pulse" style={{ background:"rgba(17,17,24,0.50)" }} />
            ))
          ) : transactions.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:"rgba(99,102,241,0.12)" }}>
                <TrendingUp className="w-8 h-8" style={{ color:"#818cf8" }} />
              </div>
              <h3 className="text-lg font-black mb-2">No transactions yet</h3>
              <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.875rem", marginBottom:"1.25rem" }}>Start completing offers to see your earnings here.</p>
              <button onClick={() => setLocation("/offers")} className="btn-gpt inline-flex items-center gap-2 px-6 py-2.5">
                Browse Offers <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            transactions.map((tx: any, i: number) => {
              const meta   = TYPE_MAP[tx.type]   || TYPE_MAP.offer_complete;
              const status = STATUS_MAP[tx.status] || STATUS_MAP.completed;
              return (
                <motion.div key={tx.id || i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}
                  className="glass rounded-2xl p-4 flex items-center gap-4 tr-gpt transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${meta.color}15` }}>
                    <meta.icon className="w-5 h-5" style={{ color:meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold truncate">{tx.description}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:status.bg, color:status.color }}>
                        <status.icon className="w-3 h-3" />{status.label}
                      </span>
                    </div>
                    <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.75rem" }}>{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <div className={`text-base font-black shrink-0 ${tx.type === "withdrawal" ? "" : ""}`}
                    style={{ color: tx.type === "withdrawal" ? "#f87171" : "#4ade80" }}>
                    {tx.type === "withdrawal" ? "-" : "+"}${parseFloat(tx.amount||"0").toFixed(2)}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="btn-surface px-4 py-2 rounded-xl text-sm disabled:opacity-30">Previous</button>
            <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.875rem" }}>Page {page} of {Math.ceil(total/20)}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page*20>=total}
              className="btn-surface px-4 py-2 rounded-xl text-sm disabled:opacity-30">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
