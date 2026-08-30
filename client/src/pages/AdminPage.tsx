import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Activity, Check, CheckCircle2, Clock3, Copy, DollarSign, Link2, RefreshCw, Search, ShieldCheck, Users, WalletCards, XCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, LoadingRows, SectionHeading, Surface } from '@/components/shared/RewardUI';

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

function dateLabel(value: unknown) {
  if (!value) return '—';
  try { return new Date(String(value)).toLocaleString(); } catch { return '—'; }
}

function statusClass(status: string) {
  if (status === 'approved' || status === 'processed') return 'status-success';
  if (status === 'rejected' || status === 'failed') return 'status-failed';
  return 'status-pending';
}

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [copiedProvider, setCopiedProvider] = useState<string | null>(null);

  const statsQuery = trpc.admin.getStats.useQuery(undefined, { enabled: Boolean(isAdmin), retry: false });
  const usersQuery = trpc.admin.getUsers.useQuery(undefined, { enabled: Boolean(isAdmin), retry: false });
  const withdrawalsQuery = trpc.admin.getWithdrawals.useQuery(undefined, { enabled: Boolean(isAdmin), retry: false });
  const postbackUrlsQuery = trpc.admin.getPostbackUrls.useQuery(undefined, { enabled: Boolean(isAdmin), retry: false });
  const postbacksQuery = trpc.admin.getPostbacks.useQuery(undefined, { enabled: Boolean(isAdmin), retry: false });
  const approveMutation = trpc.admin.approveWithdrawal.useMutation({
    onSuccess: () => { toast.success('Withdrawal approved.'); void withdrawalsQuery.refetch(); void statsQuery.refetch(); },
    onError: (error) => toast.error(error.message),
  });
  const rejectMutation = trpc.admin.rejectWithdrawal.useMutation({
    onSuccess: () => { toast.success('Withdrawal rejected and refunded.'); setRejectingId(null); setRejectReason(''); void withdrawalsQuery.refetch(); void statsQuery.refetch(); },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (!isAdmin) { toast.error('Admin access required.'); navigate('/dashboard', { replace: true }); }
  }, [isAdmin, loading, navigate, user]);

  const users = usersQuery.data ?? [];
  const withdrawals = withdrawalsQuery.data ?? [];
  const postbackUrls = postbackUrlsQuery.data ?? [];
  const postbacks = postbacksQuery.data ?? [];
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((item: any) => `${item.username || ''} ${item.name || ''} ${item.email || ''}`.toLowerCase().includes(query));
  }, [searchQuery, users]);
  const latestPostbacks = useMemo(() => {
    const map = new Map<string, any>();
    for (const item of postbacks as any[]) {
      const current = map.get(item.provider);
      if (!current || new Date(String(item.createdAt)).getTime() > new Date(String(current.createdAt)).getTime()) map.set(item.provider, item);
    }
    return map;
  }, [postbacks]);
  const stats = statsQuery.data as any;
  const statTiles = [
    { label: 'Total users', value: String(stats?.userCount ?? 0), icon: Users },
    { label: 'Active users · 30d', value: String(stats?.activeUserCount ?? 0), icon: Activity },
    { label: 'Total rewards', value: money(stats?.totalRewards), icon: DollarSign },
    { label: 'Pending withdrawals', value: String(stats?.pendingWithdrawals ?? 0), icon: Clock3 },
    { label: 'Approved withdrawals', value: String(stats?.approvedWithdrawals ?? 0), icon: CheckCircle2 },
    { label: 'Rejected withdrawals', value: String(stats?.rejectedWithdrawals ?? 0), icon: XCircle },
    { label: 'Completed offers', value: String(stats?.totalOffersCompleted ?? 0), icon: ShieldCheck },
  ];

  const copyPostbackUrl = async (provider: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedProvider(provider);
      toast.success('Postback URL copied.');
      window.setTimeout(() => setCopiedProvider(null), 1800);
    } catch { toast.error('Unable to copy the URL.'); }
  };

  if (loading || !user || !isAdmin) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading eyebrow="Restricted workspace" title="Admin console" description="Monitor RewardsVerse activity and process sensitive requests with server-side authorization." action={<button type="button" onClick={() => { void statsQuery.refetch(); void usersQuery.refetch(); void withdrawalsQuery.refetch(); void postbackUrlsQuery.refetch(); void postbacksQuery.refetch(); }} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/35"><RefreshCw className="h-3.5 w-3.5" />Refresh data</button>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">{statTiles.map(({ label, value, icon: Icon }) => <Surface key={label} className="p-4"><span className="quick-stat-icon"><Icon className="h-4 w-4" /></span><p className="mt-4 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</p><p className="mt-1 font-display text-xl font-semibold text-foreground">{value}</p></Surface>)}</div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,.85fr)]">
        <Surface className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="rv-eyebrow">Account directory</p><h2 className="mt-1 font-display text-xl font-semibold">Users</h2></div><label className="hud-search w-full sm:max-w-xs" aria-label="Search users"><Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search username or email…" /></label></div><div className="overflow-x-auto">{usersQuery.isLoading ? <div className="p-5"><LoadingRows count={4} /></div> : filteredUsers.length ? <table className="w-full min-w-[700px] text-left text-xs"><thead className="border-b border-border/70 bg-secondary/40 text-[10px] uppercase tracking-[.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">User</th><th className="px-5 py-3 font-semibold">Balance</th><th className="px-5 py-3 font-semibold">Rewards</th><th className="px-5 py-3 font-semibold">Offers</th><th className="px-5 py-3 font-semibold">Last active</th></tr></thead><tbody className="divide-y divide-border/60">{filteredUsers.map((item: any) => <tr key={item.id} className="transition hover:bg-secondary/30"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-bold text-primary">{String(item.username || item.name || 'U').slice(0, 1).toUpperCase()}</span><div><p className="font-semibold text-foreground">{item.username || item.name || `User #${item.id}`}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{item.email || 'No email provided'} {item.role === 'admin' ? '· ADMIN' : ''}</p></div></div></td><td className="px-5 py-3.5 font-semibold text-emerald-300">{money(item.balance)}</td><td className="px-5 py-3.5 text-foreground">{money(item.totalEarned)}</td><td className="px-5 py-3.5 text-foreground">{item.offersCompleted ?? 0}</td><td className="px-5 py-3.5 text-muted-foreground">{dateLabel(item.lastSignedIn || item.createdAt)}</td></tr>)}</tbody></table> : <div className="p-5"><EmptyState title="No users found" description="Try a different username or email search." icon={Users} /></div>}</div></Surface>

        <Surface className="overflow-hidden"><div className="flex items-end justify-between border-b border-border/70 p-5"><div><p className="rv-eyebrow">Payout queue</p><h2 className="mt-1 font-display text-xl font-semibold">Withdrawals</h2></div><WalletCards className="h-5 w-5 text-primary" /></div><div className="max-h-[560px] overflow-y-auto p-4">{withdrawalsQuery.isLoading ? <LoadingRows count={4} /> : withdrawals.length ? <div className="space-y-3">{withdrawals.map((item: any) => <div key={item.id} className="rounded-xl border border-border/70 bg-secondary/35 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-foreground">{item.username || `User #${item.userId}`}</p><p className="mt-1 text-xs text-muted-foreground">{money(item.amount)} · {String(item.cryptoType || '').toUpperCase()}</p></div><span className={`status-badge ${statusClass(item.status)}`}>{item.status}</span></div><p className="mt-3 truncate font-mono text-[10px] text-muted-foreground" title={item.walletAddress}>{item.walletAddress}</p><p className="mt-2 text-[10px] text-muted-foreground">Requested {dateLabel(item.createdAt)}</p>{item.adminNote && <p className="mt-2 rounded-lg border border-border/60 bg-background/60 p-2 text-xs text-muted-foreground">Reason: {item.adminNote}</p>}{item.status === 'pending' && <div className="mt-4 flex gap-2"><button type="button" onClick={() => { if (window.confirm(`Approve ${money(item.amount)} for ${item.username || `user #${item.userId}`}?`)) approveMutation.mutate({ id: item.id }); }} disabled={approveMutation.isPending || rejectMutation.isPending} className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"><Check className="h-3.5 w-3.5" />Approve</button><button type="button" onClick={() => { setRejectingId(item.id); setRejectReason(''); }} disabled={approveMutation.isPending || rejectMutation.isPending} className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-400/25 bg-red-400/[.06] px-3 py-2 text-xs font-bold text-red-300 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" />Reject</button></div>}</div>)}</div> : <EmptyState title="No withdrawal requests" description="Pending and processed payout requests will appear here." icon={WalletCards} />}</div></Surface>
      </div>

      <Surface className="overflow-hidden"><div className="border-b border-border/70 p-5"><div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /><div><p className="rv-eyebrow">Provider operations</p><h2 className="mt-1 font-display text-xl font-semibold">Postback & tracking center</h2></div></div><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Copy the provider-specific callback URL into each provider dashboard. Secrets remain server-side and are not shown in this interface.</p></div><div className="divide-y divide-border/70">{postbackUrlsQuery.isLoading ? <div className="p-5"><LoadingRows count={4} /></div> : postbackUrls.map((item: any) => { const latest = latestPostbacks.get(item.provider); return <div key={item.provider} className="grid gap-4 p-5 lg:grid-cols-[160px_minmax(0,1fr)_260px] lg:items-center"><div><p className="text-sm font-semibold text-foreground">{item.label || item.provider}</p><div className="mt-2 flex flex-wrap gap-2"><span className={`status-badge ${item.configured ? 'status-success' : 'status-pending'}`}>{item.configured ? 'Configured' : 'Setup required'}</span>{latest && <span className={`status-badge ${statusClass(latest.status)}`}>{latest.status}</span>}</div></div><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">Postback URL</p><code className="block break-all rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-[10px] leading-5 text-muted-foreground">{item.url || 'Set the provider placement and postback secret in deployment environment variables.'}</code><div className="mt-2 flex flex-wrap gap-4 text-[10px] text-muted-foreground"><span>Last callback: {dateLabel(latest?.createdAt)}</span><span>Last successful: {dateLabel((postbacks as any[]).find((entry) => entry.provider === item.provider && entry.status === 'processed')?.createdAt)}</span></div></div><div className="flex flex-col gap-2 lg:items-end"><button type="button" disabled={!item.url} onClick={() => item.url && void copyPostbackUrl(item.provider, item.url)} className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/35 disabled:cursor-not-allowed disabled:opacity-50">{copiedProvider === item.provider ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}{copiedProvider === item.provider ? 'Copied!' : 'Copy URL'}</button>{latest?.status === 'failed' && <p className="text-[10px] text-red-300">Last callback failed; inspect server postback logs.</p>}</div></div>; })}</div></Surface>

      {rejectingId !== null && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="reject-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"><p className="rv-eyebrow">Admin action</p><h2 id="reject-title" className="mt-1 font-display text-xl font-semibold">Reject withdrawal</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">A reason is required and will be returned to the user with the reserved balance.</p><textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} maxLength={500} rows={4} placeholder="Enter the rejection reason…" className="focus-ring mt-5 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" /><div className="mt-5 flex gap-3"><button type="button" onClick={() => setRejectingId(null)} className="focus-ring flex-1 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary/30">Cancel</button><button type="button" disabled={!rejectReason.trim() || rejectMutation.isPending} onClick={() => rejectMutation.mutate({ id: rejectingId, note: rejectReason.trim() })} className="focus-ring flex-1 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{rejectMutation.isPending ? 'Processing…' : 'Reject and refund'}</button></div></div></div>}
    </div>
  );
}
