import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, Clock3, Flame, Gift, History, Target, TrendingUp, WalletCards, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserTransactions } from '@/api';
import { EmptyState, LoadingRows, SectionHeading, StatusBadge, Surface } from '@/components/shared/RewardUI';

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
    if (!user?.id) { setLoadingTransactions(false); return; }
    setLoadingTransactions(true);
    fetchUserTransactions(user.id).then(setTransactions).catch(() => setTransactions([])).finally(() => setLoadingTransactions(false));
  }, [user?.id]);

  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);
  const metrics = [
    { label: 'Lifetime earnings', value: money(profile?.lifetime_earnings), helper: 'All-time rewards', icon: TrendingUp },
    { label: 'Offers completed', value: String(profile?.completed_offers || 0), helper: 'Keep momentum', icon: Target },
    { label: 'Pending balance', value: money(profile?.pending_balance), helper: 'Being verified', icon: History },
    { label: 'Daily streak', value: `${streak} days`, helper: 'Consistency bonus', icon: Flame },
  ];

  return (
    <div className="dashboard-page mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="dashboard-command-grid">
        <div className="welcome-panel">
          <div className="flex items-center gap-2"><span className="hud-status-dot" /><p className="rv-eyebrow">Today in RewardsVerse</p></div>
          <h1 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-[-0.055em] text-white sm:text-[2.7rem]">Good to see you, <span className="text-primary">{displayName}.</span></h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">Ready to earn more today? Start with a focused offer and keep your progress moving.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/offerwalls" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-105"><Zap className="h-4 w-4" /> Explore offers <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/history" className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/30 hover:bg-white/[.07]"><Activity className="h-4 w-4 text-primary" /> View activity</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5">
            <div><p className="dashboard-kicker">Current level</p><p className="mt-1 font-display text-lg font-semibold text-white">Level {level}</p></div>
            <div><p className="dashboard-kicker">XP progress</p><p className="mt-1 font-display text-lg font-semibold text-white">{xp.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {nextLevelXp.toLocaleString()}</span></p></div>
            <div><p className="dashboard-kicker">Streak</p><p className="mt-1 font-display text-lg font-semibold text-primary">{streak} days</p></div>
          </div>
        </div>
        <div className="balance-panel">
          <div className="flex items-start justify-between gap-3"><div><p className="dashboard-kicker text-primary/75">Available balance</p><p className="mt-3 font-display text-4xl font-semibold tracking-[-0.06em] text-white">{money(profile?.balance)}</p></div><span className="balance-icon"><WalletCards className="h-5 w-5" /></span></div>
          <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-xs"><span className="text-slate-400">Ready to withdraw</span><span className="font-semibold text-primary">Live balance</span></div>
          <div className="mt-5 grid grid-cols-2 gap-2"><Link to="/withdraw" className="focus-ring inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition hover:brightness-105">Withdraw</Link><Link to="/offerwalls" className="focus-ring inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/[.04] px-3 py-2.5 text-xs font-semibold text-white transition hover:border-primary/35 hover:bg-primary/[.08]">Earn more</Link></div>
        </div>
      </section>

      <section className="offer-marketplace">
        <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="rv-eyebrow">Live opportunity feed</p><h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-white">Featured offers</h2><p className="mt-1.5 text-sm text-muted-foreground">Hand-picked opportunities from your active provider catalog.</p></div><Link to="/offerwalls" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">Browse all offers <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {featured.isLoading ? <LoadingRows count={5} /> : featured.data?.length ? featured.data.map((offer: any, index: number) => (
            <Link to="/offerwalls" key={`${offer.provider}-${offer.offerName || index}`} className="offer-card group">
              <div className="flex items-start justify-between gap-3"><span className="offer-icon"><Gift className="h-5 w-5" /></span><span className="offer-index">0{index + 1}</span></div>
              <div className="mt-6"><p className="offer-category">{offer.category || 'Featured task'}</p><h3 className="mt-1.5 truncate font-display text-base font-semibold text-white group-hover:text-primary">{offer.offerName || `${offer.provider} offer`}</h3><p className="mt-1 truncate text-xs text-slate-400">{offer.provider}</p></div>
              <div className="mt-6 flex items-end justify-between gap-3 border-t border-white/8 pt-4"><div><p className="text-[10px] uppercase tracking-wider text-slate-500">Estimated reward</p><strong className="mt-1 block font-display text-xl text-primary">+{money(offer.averageReward)}</strong></div><span className="offer-cta">Earn now <ArrowRight className="h-3.5 w-3.5" /></span></div>
            </Link>
          )) : <div className="col-span-full"><EmptyState title="More offers are on the way" description="Explore the earn center to see available providers." action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Explore offers <ArrowRight className="ml-1 inline h-4 w-4" /></Link>} /></div>}
        </div>
      </section>

      <section className="dashboard-lower-grid">
        <Surface className="metrics-panel p-5 sm:p-6"><SectionHeading eyebrow="Account overview" title="Your progress at a glance" description="A concise view of the numbers that matter most." /><div className="metrics-list mt-6">{metrics.map(({ label, value, helper, icon: Icon }) => <div key={label} className="metric-row"><span className="metric-icon"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-semibold text-white">{label}</strong><small className="text-xs text-slate-400">{helper}</small></span><span className="font-display text-lg font-semibold text-white">{value}</span></div>)}</div><div className="mt-6 rounded-lg border border-primary/12 bg-primary/[.04] p-4"><div className="flex items-center justify-between text-xs"><span className="text-slate-400">Progress to level {level + 1}</span><span className="font-semibold text-primary">{xpPercent}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${xpPercent}%` }} /></div></div></Surface>
        <Surface className="activity-panel p-5 sm:p-6"><div className="flex items-end justify-between gap-3"><div><p className="rv-eyebrow">Money movement</p><h2 className="mt-1 font-display text-xl font-semibold text-white">Recent activity</h2></div><Link to="/history" className="focus-ring text-xs font-semibold text-primary hover:text-primary/80">View history <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div><div className="mt-6">{loadingTransactions ? <LoadingRows count={3} /> : recent.length ? <div className="divide-y divide-white/8">{recent.map((tx: any) => <div key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tx.type === 'withdrawal' ? 'bg-amber-400/10 text-amber-300' : 'bg-primary/10 text-primary'}`}>{tx.type === 'withdrawal' ? <WalletCards className="h-4 w-4" /> : <Activity className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{tx.description}</p><p className="mt-1 text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p></div><div className="text-right"><p className={`text-sm font-semibold ${tx.type === 'withdrawal' ? 'text-white' : 'text-primary'}`}>{tx.type === 'withdrawal' ? '-' : '+'}{money(tx.amount)}</p><StatusBadge status={tx.status} /></div></div>)}</div> : <EmptyState title="No activity yet" description="Complete an offer to see your first reward appear here." icon={Activity} action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Start earning</Link>} />}</div></Surface>
      </section>
    </div>
  );
}
