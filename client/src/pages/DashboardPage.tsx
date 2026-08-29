import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, Flame, Gift, History, Target, TrendingUp, Trophy, WalletCards, Zap } from 'lucide-react';
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

  useEffect(() => {
    if (!user?.id) { setLoadingTransactions(false); return; }
    setLoadingTransactions(true);
    fetchUserTransactions(user.id).then(setTransactions).catch(() => setTransactions([])).finally(() => setLoadingTransactions(false));
  }, [user?.id]);

  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden rounded-[1.35rem] border border-primary/15 bg-[linear-gradient(120deg,rgba(42,69,79,.95),rgba(28,42,63,.96)_58%,rgba(47,39,76,.9))] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><p className="rv-eyebrow">Your rewards workspace</p><h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">Good to see you, {displayName}.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Turn a few minutes into meaningful rewards. Your next offer is waiting.</p></div>
          <div className="flex flex-wrap gap-3"><Link to="/offerwalls" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-105"><Zap className="h-4 w-4" /> Start earning</Link><Link to="/withdraw" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/6 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><WalletCards className="h-4 w-4" /> Withdraw</Link></div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Available balance" value={money(profile?.balance)} helper="Ready to withdraw" icon={WalletCards} accent="mint" />
        <StatTile label="Pending balance" value={money(profile?.pending_balance)} helper="Being verified" icon={History} accent="amber" />
        <StatTile label="Lifetime earnings" value={money(profile?.lifetime_earnings)} helper="All-time rewards" icon={TrendingUp} accent="violet" />
        <StatTile label="Offers completed" value={String(profile?.completed_offers || 0)} helper="Keep the momentum" icon={Target} accent="sky" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,.85fr)]">
        <Surface className="overflow-hidden p-5 sm:p-6">
          <SectionHeading eyebrow="Opportunity feed" title="Featured offers" description="High-intent opportunities selected from your live offer catalog." action={<Link to="/offerwalls" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">View all <ArrowRight className="h-4 w-4" /></Link>} />
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {featured.isLoading ? <LoadingRows count={4} /> : featured.data?.length ? featured.data.slice(0, 4).map((offer: any, index: number) => (
              <Link to="/offerwalls" key={`${offer.provider}-${offer.offerName || index}`} className="group rv-surface-soft p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5">
                <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Gift className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{offer.offerName || `${offer.provider} offer`}</p><p className="mt-1 text-xs text-muted-foreground">{offer.provider}</p></div></div><span className="text-xs font-bold text-primary">#{index + 1}</span></div>
                <div className="mt-4 flex items-center justify-between text-xs"><span className="text-muted-foreground">{offer.completionCount || 0} completions</span><span className="font-semibold text-primary">Avg. {money(offer.averageReward)}</span></div>
              </Link>
            )) : <div className="md:col-span-2"><EmptyState title="More offers are on the way" description="Featured offers will appear here as activity builds. Explore the offer center to see available providers." action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Explore offers <ArrowRight className="ml-1 inline h-4 w-4" /></Link>} /></div>}
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface className="p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="rv-eyebrow">Progress</p><h2 className="mt-1 font-display text-lg font-semibold">Level {level}</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent"><Trophy className="h-5 w-5" /></div></div><div className="mt-6 flex items-end justify-between text-xs"><span className="text-muted-foreground">{xp.toLocaleString()} XP</span><span className="font-semibold text-primary">{xpPercent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${xpPercent}%` }} /></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{Math.max(0, nextLevelXp - xp).toLocaleString()} XP until your next level.</p></Surface>
          <Surface className="p-5 sm:p-6"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/12 text-amber-300"><Flame className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-foreground">{profile?.daily_streak || 0} day streak</p><p className="text-xs text-muted-foreground">Consistency unlocks momentum</p></div></div><div className="mt-5 grid grid-cols-7 gap-1.5">{Array.from({ length: 7 }).map((_, index) => <span key={index} className={`h-1.5 rounded-full ${index < (Number(profile?.daily_streak || 0) % 7) ? 'bg-primary' : 'bg-white/10'}`} />)}</div></Surface>
        </div>
      </div>

      <Surface className="overflow-hidden p-5 sm:p-6"><SectionHeading eyebrow="Account activity" title="Recent transactions" action={<Link to="/history" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary">Open history <ArrowRight className="h-4 w-4" /></Link>} /><div className="mt-5">{loadingTransactions ? <LoadingRows count={3} /> : recent.length ? <div className="divide-y divide-white/8">{recent.map((tx: any) => <div key={tx.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tx.type === 'withdrawal' ? 'bg-amber-400/10 text-amber-300' : 'bg-primary/10 text-primary'}`}>{tx.type === 'withdrawal' ? <WalletCards className="h-4 w-4" /> : <Activity className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{tx.description}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p></div></div><div className="flex shrink-0 items-center gap-3"><span className={`text-sm font-semibold ${tx.type === 'withdrawal' ? 'text-foreground' : 'text-primary'}`}>{tx.type === 'withdrawal' ? '-' : '+'}{money(tx.amount)}</span><StatusBadge status={tx.status} /></div></div>)}</div> : <EmptyState title="No activity yet" description="Complete an offer to see your first reward appear here." icon={Activity} action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Start earning</Link>} />}</div></Surface>
    </div>
  );
}
