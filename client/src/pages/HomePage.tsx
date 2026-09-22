import { ArrowRight, Award, CheckCircle2, Clock3, Gift, Search, ShieldCheck, Sparkles, Tag, Timer, WalletCards, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, LoadingRows, Surface } from '@/components/shared/RewardUI';
import { AnimatedCurrency } from '@/components/AnimatedNumber';

const offerFilters = [
  { label: 'Featured', value: 'featured', icon: Sparkles },
  { label: 'Highest Reward', value: 'highest', icon: Award },
  { label: 'Surveys', value: 'surveys', icon: Tag },
  { label: 'Apps', value: 'apps', icon: WalletCards },
  { label: 'Games', value: 'games', icon: Gift },
  { label: 'Easy Tasks', value: 'tasks', icon: Zap },
];

const trustItems = [
  { title: 'Verified providers', text: 'Offers connect to configured provider systems.', icon: ShieldCheck },
  { title: 'Fast rewards', text: 'Balance updates after verified callbacks arrive.', icon: Zap },
  { title: 'Secure platform', text: 'Account and payout actions stay server-validated.', icon: CheckCircle2 },
  { title: 'Clear payouts', text: 'Supported methods and minimums are shown before submission.', icon: WalletCards },
];

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

function rewardLabel(value: unknown) {
  if (value === undefined || value === null || value === '') return 'View details';
  if (value === '*') return 'Variable reward';
  const amount = Number(value);
  return Number.isFinite(amount) ? money(amount) : String(value);
}

function categoryMatch(offer: any, filter: string) {
  const category = String(offer.category || '').toLowerCase();
  const title = String(offer.offerName || '').toLowerCase();
  if (filter === 'surveys') return category.includes('survey') || title.includes('survey');
  if (filter === 'apps') return category.includes('app') || category.includes('mobile') || title.includes('app');
  if (filter === 'games') return category.includes('game') || title.includes('game');
  if (filter === 'tasks') return category.includes('task') || category.includes('easy');
  return true;
}

function offerSortValue(offer: any) {
  const value = Number(offer.reward ?? offer.payout);
  return Number.isFinite(value) ? value : 0;
}

export default function HomePage() {
  const { user, profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState('featured');
  const [search, setSearch] = useState('');
  const featured = trpc.user.getFeaturedOffers.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false, retry: false });
  const summary = trpc.user.getDashboardSummary.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false });
  const withdrawals = trpc.withdraw.getMyWithdrawals.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false });

  const allOffers = featured.data ?? [];
  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();
    let offers = allOffers.filter((offer: any) => {
      const searchText = `${offer.offerName || ''} ${offer.provider || ''} ${offer.category || ''} ${offer.description || ''}`.toLowerCase();
      return !query || searchText.includes(query);
    });
    if (activeFilter === 'highest') return [...offers].sort((left, right) => offerSortValue(right) - offerSortValue(left));
    if (activeFilter === 'featured') {
      const marked = offers.filter((offer: any) => Boolean(offer.featured));
      return marked.length ? marked : offers;
    }
    return offers.filter((offer: any) => categoryMatch(offer, activeFilter));
  }, [activeFilter, allOffers, search]);

  const displayName = profile?.username || profile?.name || user?.username || user?.name || 'Member';
  const balance = Number(profile?.balance || 0);
  const totalEarned = summary.data?.totalEarned ?? Number(profile?.totalEarned ?? profile?.lifetime_earnings ?? 0);
  const pendingRewards = Number(summary.data?.pendingRewards || 0);
  const pendingWithdrawalTotal = (withdrawals.data ?? []).filter((item: any) => item.status === 'pending').reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const startEarningPath = user ? '/offerwalls' : '/register';

  return (
    <div className="dashboard-page mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="welcome-panel dashboard-hero">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2"><span className="hud-status-dot" /><p className="rv-eyebrow">Your rewards workspace</p></div>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-[-0.055em] text-foreground sm:text-5xl">Good to see you, <span className="text-primary">{displayName}</span> <span aria-hidden="true">👋</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Earn rewards from verified surveys, apps, games and tasks, then follow every balance and payout update in one clear place.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to={startEarningPath} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-105"><Zap className="h-4 w-4" /> {user ? 'Start' : 'Register Now'} <ArrowRight className="h-4 w-4" /></Link><Link to="/withdraw" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-muted"><WalletCards className="h-4 w-4 text-primary" /> Withdraw</Link></div>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-t border-border/70 pt-5 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Verified provider callbacks</span><span className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Server-validated payouts</span></div>
        </div>
        <div className="hero-side-card"><div className="flex items-center justify-between border-b border-border/70 pb-4"><div><p className="dashboard-kicker">Your next step</p><p className="mt-1 font-display text-lg font-semibold text-foreground">Choose an offer</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Zap className="h-4 w-4" /></span></div><div className="mt-4 space-y-3"><div className="hero-step"><span>01</span><div><p className="text-xs font-semibold text-foreground">Browse live providers</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Use the configured provider catalog.</p></div></div><div className="hero-step"><span>02</span><div><p className="text-xs font-semibold text-foreground">Complete and verify</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Rewards appear after a valid callback.</p></div></div><div className="hero-step"><span>03</span><div><p className="text-xs font-semibold text-foreground">Withdraw clearly</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Submit an eligible payout request.</p></div></div></div></div>
      </section>

      <section className="balance-stats-grid">
        <Surface className="balance-panel p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="dashboard-kicker text-primary/85">Available balance</p><p className="mt-3 font-display text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl"><AnimatedCurrency key={balance} value={balance} /></p></div><span className="balance-icon"><WalletCards className="h-6 w-6" /></span></div><div className="mt-7 grid grid-cols-2 gap-4 border-t border-border/70 pt-4 text-xs"><div><p className="text-muted-foreground">Pending rewards</p><p className="mt-1 font-semibold text-amber-300">{money(pendingRewards)}</p></div><div><p className="text-muted-foreground">Lifetime earned</p><p className="mt-1 font-semibold text-foreground">{money(totalEarned)}</p></div></div><div className="mt-5 flex items-center justify-between gap-3"><p className="text-[11px] text-muted-foreground">{pendingWithdrawalTotal ? `${money(pendingWithdrawalTotal)} in pending withdrawals` : 'Ready when you are'}</p><Link to="/withdraw" className="focus-ring inline-flex items-center rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:brightness-105">Withdraw balance</Link></div></Surface>
        <div className="quick-stats-grid"><Surface className="quick-stat"><span className="quick-stat-icon"><CheckCircle2 className="h-4 w-4" /></span><p className="dashboard-kicker">Offers completed</p><p className="mt-2 font-display text-2xl font-semibold text-foreground">{profile?.offersCompleted ?? profile?.completed_offers ?? 0}</p><p className="mt-1 text-[11px] text-muted-foreground">Verified completions</p></Surface><Surface className="quick-stat"><span className="quick-stat-icon"><Timer className="h-4 w-4" /></span><p className="dashboard-kicker">Today’s earnings</p><p className="mt-2 font-display text-2xl font-semibold text-foreground">{money(summary.data?.todayEarnings)}</p><p className="mt-1 text-[11px] text-muted-foreground">Rewards credited today</p></Surface><Surface className="quick-stat"><span className="quick-stat-icon"><Award className="h-4 w-4" /></span><p className="dashboard-kicker">Total earned</p><p className="mt-2 font-display text-2xl font-semibold text-foreground">{money(totalEarned)}</p><p className="mt-1 text-[11px] text-muted-foreground">All-time rewards</p></Surface><Surface className="quick-stat"><span className="quick-stat-icon"><Clock3 className="h-4 w-4" /></span><p className="dashboard-kicker">Pending rewards</p><p className="mt-2 font-display text-2xl font-semibold text-foreground">{money(pendingRewards)}</p><p className="mt-1 text-[11px] text-muted-foreground">Awaiting verification</p></Surface></div>
      </section>

      <section className="offer-marketplace featured-primary">
        <div className="flex flex-col gap-5 border-b border-border/70 pb-5 xl:flex-row xl:items-end xl:justify-between"><div><p className="rv-eyebrow">Live offer catalog</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl">Featured offers</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Start with live offers from the current configured provider feed.</p></div><label className="hud-search offer-search" aria-label="Search offers"><Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search offers…" /></label></div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Offer filters">{offerFilters.map(({ label, value, icon: Icon }) => <button key={value} type="button" role="tab" aria-selected={activeFilter === value} onClick={() => setActiveFilter(value)} className={`filter-pill focus-ring ${activeFilter === value ? 'filter-pill-active' : ''}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
        <div className="mt-6">{featured.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><LoadingRows count={4} /></div> : featured.isError ? <EmptyState title="Unable to load offers" description="The live provider feed is temporarily unavailable. Try again shortly or open the earn center." icon={Zap} action={<button type="button" onClick={() => featured.refetch()} className="text-sm font-semibold text-primary">Retry <ArrowRight className="ml-1 inline h-4 w-4" /></button>} /> : filteredOffers.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{filteredOffers.slice(0, 12).map((offer: any, index: number) => <a href={offer.clickUrl} target="_blank" rel="noreferrer" key={`${offer.provider}-${offer.id || index}`} className="offer-card group"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary p-2">{offer.imageUrl ? <img src={offer.imageUrl} alt="" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <Gift className="h-5 w-5 text-primary" />}</div><span className="status-badge status-success">{offer.featured ? 'Featured' : 'Available'}</span></div><div className="mt-5"><div className="flex flex-wrap items-center gap-2"><span className="offer-category">{offer.category || 'Offer'}</span><span className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">{offer.provider}</span></div><h3 className="mt-2 line-clamp-2 font-display text-base font-semibold text-foreground transition group-hover:text-primary">{offer.offerName}</h3><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{offer.description || 'Open the provider offer to see the current requirements and completion details.'}</p></div><div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-4"><div><p className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">Reward</p><strong className="mt-1 block font-display text-xl text-emerald-300">{rewardLabel(offer.reward ?? offer.payout)}</strong></div><span className="offer-cta">Start offer <ArrowRight className="h-3.5 w-3.5" /></span></div></a>)}</div> : <EmptyState title="No matching offers" description="Try another filter or search term. New provider offers will appear here when available." icon={Search} action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Open earn center <ArrowRight className="ml-1 inline h-4 w-4" /></Link>} />}</div>
        <div className="mt-6 flex justify-end"><Link to="/offerwalls" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">View all offers <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <section className="trust-strip" aria-label="Why RewardsVerse"><div className="trust-strip-heading"><p className="rv-eyebrow">Built for clarity</p><h2 className="mt-2 font-display text-xl font-semibold text-foreground">Why RewardsVerse</h2></div>{trustItems.map(({ title, text, icon: Icon }) => <div key={title} className="trust-item"><span className="trust-icon"><Icon className="h-4 w-4" /></span><div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></div>)}</section>
    </div>
  );
}
