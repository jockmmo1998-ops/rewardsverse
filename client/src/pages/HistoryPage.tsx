import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import AppLayout from '@/components/layouts/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { CheckCircle2, ArrowDownToLine, Clock, XCircle, AlertCircle } from 'lucide-react';
import { getUserCompletions, getUserWithdrawals } from '@/lib/api';
import type { Completion, Withdrawal } from '@/types/types';
import { WITHDRAWAL_METHODS } from '@/types/types';

const W_STATUS: Record<Withdrawal['status'], { icon: React.ElementType; label: string; color: string; bg: string }> = {
  pending:    { icon: Clock,         label: 'Pending',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  processing: { icon: AlertCircle,   label: 'Processing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  approved:   { icon: CheckCircle2,  label: 'Approved',   color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   },
  rejected:   { icon: XCircle,       label: 'Rejected',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
};

function Pagination({ page, total, size, onPrev, onNext }: { page: number; total: number; size: number; onPrev: () => void; onNext: () => void }) {
  const pages = Math.ceil(total / size);
  if (total <= size) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <button onClick={onPrev} disabled={page === 0}
        className="text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}>
        ← Previous
      </button>
      <span className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>Page {page + 1} of {pages}</span>
      <button onClick={onNext} disabled={(page + 1) * size >= total}
        className="text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}>
        Next →
      </button>
    </div>
  );
}

function CompletionsTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getUserCompletions(userId, page, PAGE);
    setItems(r.data); setTotal(r.count); setLoading(false);
  }, [userId, page]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>;
  if (!items.length) return <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,244,245,0.35)' }}>No completions found.</div>;

  return (
    <div className="space-y-2">
      {items.map((c, i) => (
        <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(16,20,31,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle2 size={12} style={{ color: '#22C55E' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#F4F4F5' }}>{c.offer_name}</p>
            <p className="text-xs" style={{ color: 'rgba(244,244,245,0.35)' }}>
              {c.offer_provider && `${c.offer_provider} · `}
              {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold" style={{ color: '#22C55E' }}>+${c.amount.toFixed(2)}</p>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: c.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: c.status === 'completed' ? '#22C55E' : '#F59E0B' }}>
              {c.status}
            </span>
          </div>
        </motion.div>
      ))}
      <Pagination page={page} total={total} size={PAGE} onPrev={() => setPage(p => Math.max(0, p - 1))} onNext={() => setPage(p => p + 1)} />
    </div>
  );
}

function WithdrawalsTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getUserWithdrawals(userId, page, PAGE);
    setItems(r.data); setTotal(r.count); setLoading(false);
  }, [userId, page]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>;
  if (!items.length) return <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,244,245,0.35)' }}>No withdrawals found.</div>;

  return (
    <div className="space-y-2">
      {items.map((w, i) => {
        const cfg = W_STATUS[w.status];
        const Icon = cfg.icon;
        return (
          <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(16,20,31,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <ArrowDownToLine size={12} style={{ color: '#3B82F6' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium" style={{ color: '#F4F4F5' }}>
                  {WITHDRAWAL_METHODS.find(m => m.value === w.method)?.label ?? w.method}
                </p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  <Icon size={9} />
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(244,244,245,0.35)' }}>
                {new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' · '}{w.account_info}
              </p>
            </div>
            <p className="text-sm font-bold shrink-0" style={{ color: '#F4F4F5' }}>${w.amount.toFixed(2)}</p>
          </motion.div>
        );
      })}
      <Pagination page={page} total={total} size={PAGE} onPrev={() => setPage(p => Math.max(0, p - 1))} onNext={() => setPage(p => p + 1)} />
    </div>
  );
}

export default function HistoryPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'completions' | 'withdrawals'>('completions');

  return (
    <>
      <PageMeta title="History — RewardsVerse" description="Your earnings and withdrawal history" />
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-5">
          <div>
            <h1 className="text-xl font-bold font-heading" style={{ color: '#F4F4F5' }}>History</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
              All your completed offers and withdrawals.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-2 p-1 rounded-xl w-fit" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { key: 'completions', label: 'Completions', icon: CheckCircle2 },
              { key: 'withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
            ].map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={active
                    ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }
                    : { border: '1px solid transparent', color: 'rgba(244,244,245,0.45)' }}>
                  <Icon size={11} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'rgba(16,20,31,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {!profile ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>
            ) : tab === 'completions' ? (
              <CompletionsTab userId={profile.id} />
            ) : (
              <WithdrawalsTab userId={profile.id} />
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
