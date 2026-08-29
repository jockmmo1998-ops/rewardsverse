import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, Clock3, Flame, Gift, History, Target, TrendingUp, Trophy, WalletCards, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserTransactions } from '@/api';
import { EmptyState, LoadingRows, SectionHeading, StatTile, StatusBadge, Surface } from '@/components/shared/RewardUI';

const money = (value: unknown) => `$${Number(value || 0).toFixed(2)}`;

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const featured = trpc.user.getFeaturedOffers.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false });
  const displayName = profile?.username || profile?.name || user?.username || user?.name || 'Member';
  const level = Number(profile?.level || 1);
  const xp = Number(profile?.xp || 0);
  const nextLevelXp = Math.max(level * 1000, 1000);
  const xpPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));
  const streak = Number(profile?.daily_streak || 0);

  useEffect(() => {
    if (!user?.id) {
      setLoadingTransactions(false);
      return;
    }
    setLoadingTransactions(true);
    fetchUserTransactions(user.id)
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoadingTransactions(false));
  }, [user?.id]);

  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="dashboard-hero relative overflow-hidden rounded-[1.1rem] border p-6 sm:p-8">
        <div className="dashboard-hero-grid pointer-events-none absolute inset-0" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_260px] lg:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="hud-status-dot" />
              <p className="rv-eyebrow">Command center // online</p>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Welcome back, <span className="text-primary">{displayName}.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Your earning workspace is ready. Pick an offer, follow your progress and keep your balance moving forward.
            </p>
            <div className="mt-6 flex flex-wrap items-end gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Available balance</p>
                <p className="mt-1 font-display text-3xl font-semibold tracking-[-0.05em] text-white">{money(profile?.balance)}</p>
              </div>
              <div className="hidden h-10 w-px bg-white/10 sm:block" />
              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Current streak</p>
                <p className="mt-1 font-display text-lg font-semibold text-primary">{streak} days</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/offerwalls" className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-105">
                <Zap className="h-4 w-4" /> Start earning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/withdraw" className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[.05] px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/10">
                <WalletCards className="h-4 w-4" /> Withdraw
              </Link>
            </div>
          </div>
          <div className="mission-radar mx-auto flex h-44 w-44 items-center justify-center rounded-full border">
            <div className="mission-radar-inner flex h-32 w-32 flex-col items-center justify-center rounded-full border border-primary/25 bg-[#0b1815]/90">
              <span className="font-mono text-[9px] uppercase tracking-[.2em] text-primary/70">Current level</span>
              <strong className="mt-1 font-display text-4xl text-white">{level}</strong>
              <span className="text-[10px] text-slate-400">{xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Available balance" value={money(profile?.balance)} helper="Ready to withdraw" icon={WalletCards} accent="mint" />
        <StatTile label="Pending balance" value={money(profile?.pending_balance)} helper="Being verified" icon={History} accent="amber" />
        <StatTile label="Lifetime earnings" value={money(profile?.lifetime_earnings)} helper="All-time rewards" icon={TrendingUp} accent="violet" />
        <StatTile label="Offers completed" value={String(profile?.completed_offers || 0)} helper="Keep momentum" icon={Target} accent="sky" />
        <StatTile label="Daily streak" value={`${streak} days`} helper="Consistency bonus" icon={Flame} accent="mint" />
      </div>

      <Surface className="overflow-hidden p-5 sm:p-6">
        <SectionHeading
          eyebrow="Live opportunity feed"
          title="Featured offers"
          description="Real opportunities from your active provider catalog."
          action={<Link to="/offerwalls" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">View all <ArrowRight className="h-4 w-4" /></Link>}
        />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {featured.isLoading ? <LoadingRows count={6} /> : featured.data?.length ? featured.data.map((offer: any, index: number) => (
            <Link to="/offerwalls" key={`${offer.provider}-${offer.offerName || index}`} className="mission-card group relative overflow-hidden rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/[.08] text-primary"><Gift className="h-5 w-5" /></div>
                <span className="rounded-md border border-primary/15 px-2 py-1 font-mono text-[9px] text-primary">MISSION {String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-5 truncate text-sm font-semibold text-white group-hover:text-primary">{offer.offerName || `${offer.provider} offer`}</h3>
              <p className="mt-1 truncate text-sm text-slate-300">{offer.provider} · {offer.category || 'Featured task'}</p>
              <div className="mt-5 flex items-end justify-between border-t border-white/8 pt-3">
                <span className="flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3 w-3" /> 5–20 min</span>
                <strong className="font-display text-xl text-primary">{money(offer.averageReward)}</strong>
              </div>
            </Link>
          )) : (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-6">
              <EmptyState title="More offers are on the way" description="Explore the earn center to see available providers." action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Explore offers <ArrowRight className="ml-1 inline h-4 w-4" /></Link>} />
            </div>
          )}
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.8fr)]">
        <Surface className="p-5 sm:p-6">
          <SectionHeading eyebrow="Progress overview" title="Earnings progress" description="Your current progress toward the next reward level." />
          <div className="mt-7 grid gap-6 sm:grid-cols-[170px_1fr] sm:items-center">
            <div className="earnings-ring mx-auto flex h-36 w-36 items-center justify-center rounded-full"><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#0b1514]"><span className="font-mono text-[9px] text-slate-400">LEVEL {level}</span><strong className="mt-1 font-display text-xl text-white">{xpPercent}%</strong><span className="text-[9px] text-primary">SYNCED</span></div></div>
            <div className="space-y-5">
              <div><div className="flex justify-between text-xs"><span className="text-slate-400">XP progress</span><span className="font-semibold text-primary">{xp.toLocaleString()} / {nextLevelXp.toLocaleString()}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${xpPercent}%` }} /></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-primary/12 bg-primary/[.04] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-400">This streak</p><p className="mt-1 font-display text-xl text-white">{streak} <span className="text-sm text-primary">days</span></p></div><div className="rounded-lg border border-primary/12 bg-primary/[.04] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-400">Next level</p><p className="mt-1 font-display text-xl text-primary">{Math.max(0, nextLevelXp - xp)} <span className="text-sm text-slate-400">XP</span></p></div></div>
            </div>
          </div>
        </Surface>
        <Surface className="p-5 sm:p-6">
          <SectionHeading eyebrow="Shortcuts" title="Quick actions" />
          <div className="mt-5 space-y-3">{[{ label: 'Find an offer', sub: 'Open live missions', icon: Gift, path: '/offerwalls' }, { label: 'Review activity', sub: 'See your latest rewards', icon: Activity, path: '/history' }, { label: 'Manage wallet', sub: 'Check payout options', icon: WalletCards, path: '/wallet' }].map(({ label, sub, icon: Icon, path }) => <Link key={path} to={path} className="group flex items-center gap-3 rounded-lg border border-primary/10 bg-white/[.025] p-3 transition hover:border-primary/35 hover:bg-primary/[.06]"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-white group-hover:text-primary">{label}</strong><small className="text-xs text-slate-400">{sub}</small></span><ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-primary" /></Link>)}</div>
        </Surface>
      </div>

      <Surface className="overflow-hidden p-5 sm:p-6">
        <SectionHeading eyebrow="Account activity" title="Recent activity" action={<Link to="/history" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary">Open history <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="mt-5">{loadingTransactions ? <LoadingRows count={3} /> : recent.length ? <div className="divide-y divide-white/8">{recent.map((tx: any) => <div key={tx.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tx.type === 'withdrawal' ? 'bg-amber-400/10 text-amber-300' : 'bg-primary/10 text-primary'}`}>{tx.type === 'withdrawal' ? <WalletCards className="h-4 w-4" /> : <Activity className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{tx.description}</p><p className="mt-1 text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p></div></div><div className="flex shrink-0 items-center gap-3"><span className={`text-sm font-semibold ${tx.type === 'withdrawal' ? 'text-white' : 'text-primary'}`}>{tx.type === 'withdrawal' ? '-' : '+'}{money(tx.amount)}</span><StatusBadge status={tx.status} /></div></div>)}</div> : <EmptyState title="No activity yet" description="Complete an offer to see your first reward appear here." icon={Activity} action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Start earning</Link>} />}</div>
      </Surface>
    </div>
  );
}
