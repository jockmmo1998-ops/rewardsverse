import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Users, ArrowDownToLine, ListChecks, BarChart2, Search,
  CheckCircle2, XCircle, Clock, Shield, Ban, AlertCircle,
} from 'lucide-react';
import {
  getAllProfiles, getAllWithdrawalsAdmin, getAllCompletionsAdmin,
  getAdminStats, updateWithdrawalStatus, adminUpdateProfile,
  type AdminStats,
} from '@/lib/api';
import type { Profile, Withdrawal, Completion } from '@/types/types';
import { WITHDRAWAL_METHODS } from '@/types/types';

// ── Primitives ──────────────────────────────────────────────────────────────

const W_STATUS: Record<Withdrawal['status'], { icon: React.ElementType; label: string; color: string; bg: string }> = {
  pending:    { icon: Clock,        label: 'Pending',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  processing: { icon: AlertCircle,  label: 'Processing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  approved:   { icon: CheckCircle2, label: 'Approved',   color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   },
  rejected:   { icon: XCircle,      label: 'Rejected',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
};

function Pager({ page, total, size, onPrev, onNext }: { page: number; total: number; size: number; onPrev: () => void; onNext: () => void }) {
  if (total <= size) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <button onClick={onPrev} disabled={page === 0}
        className="text-xs px-4 py-2 rounded-xl disabled:opacity-40"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}>
        ← Previous
      </button>
      <span className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>Page {page + 1} / {Math.ceil(total / size)}</span>
      <button onClick={onNext} disabled={(page + 1) * size >= total}
        className="text-xs px-4 py-2 rounded-xl disabled:opacity-40"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}>
        Next →
      </button>
    </div>
  );
}

function THead({ cols }: { cols: { label: string; align?: string }[] }) {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {cols.map(c => (
          <th key={c.label} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-${c.align ?? 'left'}`}
            style={{ color: 'rgba(244,244,245,0.35)' }}>{c.label}</th>
        ))}
      </tr>
    </thead>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function StatsRow({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  const items = [
    { label: 'Total Users',          value: stats?.totalUsers ?? 0,                                  icon: Users,          color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
    { label: 'Total Paid',           value: `$${(stats?.totalPaid ?? 0).toFixed(2)}`,                icon: BarChart2,      color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
    { label: 'Pending Withdrawals',  value: stats?.pendingWithdrawals ?? 0,                          icon: Clock,          color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
    { label: "Today's Completions",  value: stats?.completionsToday ?? 0,                            icon: ListChecks,     color: '#A855F7', bg: 'rgba(168,85,247,0.1)'  },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div key={item.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(16,20,31,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(244,244,245,0.4)' }}>{item.label}</p>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                <Icon size={12} style={{ color: item.color }} />
              </div>
            </div>
            {loading ? <div className="h-7 w-20 shimmer rounded-lg" /> : (
              <p className="text-2xl font-bold font-heading" style={{ color: item.color }}>{String(item.value)}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getAllProfiles(page, 20);
    setUsers(r.data); setTotal(r.count); setLoading(false);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const toggleBan = async (user: Profile) => {
    const { error } = await adminUpdateProfile(user.id, { is_banned: !user.is_banned });
    if (error) { toast.error(error); return; }
    toast.success(user.is_banned ? 'User unbanned.' : 'User banned.');
    load();
  };

  const toggleAdmin = async (user: Profile) => {
    const { error } = await adminUpdateProfile(user.id, { is_admin: !user.is_admin });
    if (error) { toast.error(error); return; }
    toast.success(user.is_admin ? 'Admin removed.' : 'Admin granted.');
    load();
  };

  const filtered = search.trim() ? users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())) : users;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(244,244,245,0.3)' }} />
        <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <THead cols={[{ label: 'User' }, { label: 'Balance', align: 'right' }, { label: 'Earned', align: 'right' }, { label: 'Status', align: 'center' }, { label: 'Actions', align: 'center' }]} />
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded" /></td>)}
                </tr>
              )) : filtered.map(user => (
                <tr key={user.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: '#F4F4F5' }}>{user.username}</p>
                    <p className="text-xs" style={{ color: 'rgba(244,244,245,0.35)' }}>{new Date(user.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm" style={{ color: '#F4F4F5' }}>${user.balance.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-sm" style={{ color: '#22C55E' }}>${user.total_earned.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {user.is_admin && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.12)', color: '#A855F7' }}>Admin</span>}
                      {user.is_banned && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>Banned</span>}
                      {!user.is_admin && !user.is_banned && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>Active</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => toggleAdmin(user)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#A855F7' }}>
                        <Shield size={10} />
                        {user.is_admin ? 'Revoke' : 'Admin'}
                      </button>
                      <button onClick={() => toggleBan(user)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                        <Ban size={10} />
                        {user.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pager page={page} total={total} size={20} onPrev={() => setPage(p => Math.max(0, p - 1))} onNext={() => setPage(p => p + 1)} />
    </div>
  );
}

// ── Withdrawals Tab ───────────────────────────────────────────────────────────

type WithdrawalWithProfile = Withdrawal & { profiles: Pick<Profile, 'username' | 'email'> | null };

function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [reviewItem, setReviewItem] = useState<WithdrawalWithProfile | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getAllWithdrawalsAdmin(statusFilter, page, 20);
    setWithdrawals(r.data); setTotal(r.count); setLoading(false);
  }, [statusFilter, page]);
  useEffect(() => { load(); }, [load]);

  const handleAction = async (status: Withdrawal['status']) => {
    if (!reviewItem) return;
    setProcessing(true);
    const { error } = await updateWithdrawalStatus(reviewItem.id, status, adminNote);
    setProcessing(false);
    if (error) { toast.error(error); return; }
    toast.success(`Withdrawal ${status}.`);
    setReviewItem(null); setAdminNote(''); load();
  };

  return (
    <div className="space-y-3">
      <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
        <SelectTrigger className="w-44 h-9 text-xs" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#F4F4F5' }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['all', 'pending', 'processing', 'approved', 'rejected'].map(s => (
            <SelectItem key={s} value={s} className="capitalize">{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <THead cols={[{ label: 'User' }, { label: 'Method' }, { label: 'Amount', align: 'right' }, { label: 'Status', align: 'center' }, { label: 'Date' }, { label: 'Action', align: 'center' }]} />
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded" /></td>)}
                </tr>
              )) : withdrawals.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(244,244,245,0.35)' }}>No withdrawals found.</td></tr>
              ) : withdrawals.map(w => {
                const cfg = W_STATUS[w.status];
                const Icon = cfg.icon;
                return (
                  <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: '#F4F4F5' }}>{w.profiles?.username ?? 'Unknown'}</p>
                      <p className="text-xs truncate max-w-32" style={{ color: 'rgba(244,244,245,0.35)' }}>{w.account_info}</p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'rgba(244,244,245,0.5)' }}>
                      {WITHDRAWAL_METHODS.find(m => m.value === w.method)?.label ?? w.method}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: '#F4F4F5' }}>${w.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={9} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {w.status === 'pending' && (
                        <button onClick={() => { setReviewItem(w); setAdminNote(''); }}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Pager page={page} total={total} size={20} onPrev={() => setPage(p => Math.max(0, p - 1))} onNext={() => setPage(p => p + 1)} />

      {/* Review Dialog */}
      <Dialog open={!!reviewItem} onOpenChange={open => { if (!open) setReviewItem(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg"
          style={{ background: '#10141F', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#F4F4F5' }}>Review Withdrawal</DialogTitle>
          </DialogHeader>
          {reviewItem && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'User', value: reviewItem.profiles?.username },
                  { label: 'Amount', value: `$${reviewItem.amount.toFixed(2)}`, highlight: true },
                  { label: 'Method', value: WITHDRAWAL_METHODS.find(m => m.value === reviewItem.method)?.label ?? reviewItem.method },
                  { label: 'Account', value: reviewItem.account_info, truncate: true },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs mb-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>{f.label}</p>
                    <p className={`font-semibold ${f.truncate ? 'truncate' : ''}`}
                      style={{ color: f.highlight ? '#22C55E' : '#F4F4F5' }}>{f.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
                  Admin Note (optional)
                </p>
                <Textarea placeholder="Add a note…" value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  rows={3} className="text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F4F4F5' }} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => handleAction('rejected')} disabled={processing}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}>
              <XCircle size={13} /> Reject
            </button>
            <button onClick={() => handleAction('approved')} disabled={processing}
              className="btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
              {processing ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <CheckCircle2 size={13} />}
              {processing ? 'Processing…' : 'Approve'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Completions Tab ───────────────────────────────────────────────────────────

function CompletionsTab() {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getAllCompletionsAdmin(page, 20);
    setCompletions(r.data); setTotal(r.count); setLoading(false);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <THead cols={[{ label: 'Offer' }, { label: 'Provider' }, { label: 'Amount', align: 'right' }, { label: 'Status', align: 'center' }, { label: 'Date' }]} />
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded" /></td>)}
                </tr>
              )) : completions.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-3 text-sm font-medium max-w-48 truncate" style={{ color: '#F4F4F5' }}>{c.offer_name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'rgba(244,244,245,0.45)' }}>{c.offer_provider ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: '#22C55E' }}>+${c.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={c.status === 'completed'
                        ? { background: 'rgba(34,197,94,0.1)', color: '#22C55E' }
                        : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pager page={page} total={total} size={20} onPrev={() => setPage(p => Math.max(0, p - 1))} onNext={() => setPage(p => p + 1)} />
    </div>
  );
}

// ── Admin Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tab, setTab] = useState<'withdrawals' | 'users' | 'completions'>('withdrawals');

  useEffect(() => {
    getAdminStats().then(data => { setStats(data); setStatsLoading(false); });
  }, []);

  const tabs = [
    { key: 'withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
    { key: 'users',       label: 'Users',        icon: Users           },
    { key: 'completions', label: 'Completions',  icon: ListChecks      },
  ] as const;

  return (
    <>
      <PageMeta title="Admin Panel — RewardsVerse" description="Platform administration" />
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <Shield size={15} style={{ color: '#A855F7' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading" style={{ color: '#F4F4F5' }}>Admin Panel</h1>
              <p className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>Manage users, withdrawals, and platform settings.</p>
            </div>
          </div>

          <StatsRow stats={stats} loading={statsLoading} />

          {/* Tab bar */}
          <div className="flex items-center gap-2 p-1 rounded-xl w-fit"
            style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={active
                    ? { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#A855F7' }
                    : { border: '1px solid transparent', color: 'rgba(244,244,245,0.45)' }}>
                  <Icon size={11} />{t.label}
                </button>
              );
            })}
          </div>

          <div>
            {tab === 'withdrawals' && <WithdrawalsTab />}
            {tab === 'users' && <UsersTab />}
            {tab === 'completions' && <CompletionsTab />}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
