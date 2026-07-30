import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import {
  ChevronLeft, TrendingUp, Wallet, Gift, Users,
  CheckCircle2, Clock, XCircle, Sparkles, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";

type Tab = "all" | "earnings" | "withdrawals";

const STATUS_STYLE: Record<string, { icon: any; cls: string; label: string }> = {
  completed: { icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 border-emerald-200",  label: "Completed"  },
  pending:   { icon: Clock,        cls: "text-amber-600  bg-amber-50  border-amber-200",        label: "Pending"    },
  failed:    { icon: XCircle,      cls: "text-red-500    bg-red-50    border-red-200",           label: "Failed"     },
};

const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
  offer_complete: { icon: Sparkles,  color: "#7c3aed", label: "Offer"     },
  withdrawal:     { icon: Wallet,    color: "#06b6d4", label: "Withdraw"  },
  daily_claim:    { icon: Gift,      color: "#f59e0b", label: "Bonus"     },
  referral:       { icon: Users,     color: "#10b981", label: "Referral"  },
};

export default function History() {
  const { user, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);

  useSSE({
    onPostback: () => { refetch(); refreshProfile(); },
    enabled: !!user?.id,
  });

  const { data, isLoading, refetch } = trpc.user.getTransactions.useQuery(
    { page, limit: 20, type: tab === "all" ? undefined : tab === "earnings" ? "earn" : "withdraw" },
    { enabled: !!user?.id }
  );

  useEffect(() => { setPage(1); }, [tab]);

  const transactions = data?.transactions || [];
  const total = data?.total || 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all",         label: "All Transactions" },
    { key: "earnings",    label: "Earnings"         },
    { key: "withdrawals", label: "Withdrawals"      },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Transaction History</h1>
            <p className="text-muted-foreground text-sm">{total} transactions total</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border/60 rounded-xl p-1 w-fit shadow-sm">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key ? "bg-violet-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pc-card rounded-2xl p-5 h-20 animate-pulse bg-gray-50" />
            ))
          ) : transactions.length === 0 ? (
            <div className="pc-card rounded-2xl p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No transactions yet</h3>
              <p className="text-muted-foreground text-sm mb-5">Start completing offers to see your earnings here.</p>
              <button onClick={() => setLocation("/offers")} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2">
                Browse Offers <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            transactions.map((tx: any, i: number) => {
              const meta   = TYPE_META[tx.type]   || TYPE_META.offer_complete;
              const status = STATUS_STYLE[tx.status] || STATUS_STYLE.completed;
              const Icon   = meta.icon;
              const StatusIcon = status.icon;
              return (
                <motion.div key={tx.id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="pc-card rounded-2xl p-5 flex items-center gap-4 table-row-pc">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-foreground truncate">{tx.description}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.cls}`}>
                        <StatusIcon className="w-3 h-3" />{status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <div className={`text-base font-extrabold shrink-0 ${tx.type === "withdrawal" ? "text-red-500" : "text-emerald-600"}`}>
                    {tx.type === "withdrawal" ? "-" : "+"}${parseFloat(tx.amount || "0").toFixed(2)}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <span className="text-sm text-muted-foreground font-medium">Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
