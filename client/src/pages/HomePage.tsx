import { ArrowRight, Award, CheckCircle2, Clock3, Gift, Search, ShieldCheck, Sparkles, Tag, Timer, WalletCards, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type CSSProperties, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, Surface } from '@/components/shared/RewardUI';
import { UserAvatar } from '@/components/AvatarSystem';
import { OFFER_WALLS } from './OfferWalls';

const offerFilters = [
  { label: 'Featured', value: 'featured', icon: Sparkles },
  { label: 'Highest Reward', value: 'highest', icon: Award },
  { label: 'Surveys', value: 'surveys', icon: Tag },
  { label: 'Apps', value: 'apps', icon: WalletCards },
  { label: 'Games', value: 'games', icon: Gift },
  { label: 'Easy Tasks', value: 'tasks', icon: Zap },
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

function FeaturedOfferSkeleton() {
  return <div className="offer-card featured-offer-skeleton min-h-[300px]" aria-hidden="true">
    <div className="flex items-start justify-between gap-3"><div className="skeleton-shimmer h-12 w-12 rounded-xl" /><div className="skeleton-shimmer h-6 w-20 rounded-full" /></div>
    <div className="mt-5 space-y-3"><div className="flex gap-2"><div className="skeleton-shimmer h-3 w-16 rounded" /><div className="skeleton-shimmer h-3 w-20 rounded" /></div><div className="skeleton-shimmer h-5 w-4/5 rounded" /><div className="skeleton-shimmer h-3 w-full rounded" /><div className="skeleton-shimmer h-3 w-2/3 rounded" /></div>
    <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-4"><div className="space-y-2"><div className="skeleton-shimmer h-2.5 w-12 rounded" /><div className="skeleton-shimmer h-6 w-20 rounded" /></div><div className="skeleton-shimmer h-4 w-24 rounded" /></div>
  </div>;
}

export default function HomePage() {
  const { user, profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState('featured');
  const [search, setSearch] = useState('');
  const featured = trpc.user.getFeaturedOffers.useQuery(undefined, { staleTime: 60_000, gcTime: 5 * 60_000, placeholderData: (previousData) => previousData, refetchOnWindowFocus: false, retry: false });
  const summary = trpc.user.getDashboardSummary.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false });
  const weeklyQuery = trpc.user.getWeeklyProgress.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false });
  const leaderboardQuery = trpc.user.getLeaderboard.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false, retry: false });
  const wallStatusQuery = trpc.user.getOfferWallStatuses.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 60_000, refetchOnWindowFocus: false, retry: false });

  const allOffers = featured.data ?? [];
  const leaderboard = (leaderboardQuery.data ?? []).slice(0, 10) as any[];
  const trendingOffers = allOffers.slice(0, 10);
  const weeklyDays = weeklyQuery.data?.days ?? [];
  const weeklyTotal = Number(weeklyQuery.data?.total ?? 0);
  const weeklyGoal = Number(weeklyQuery.data?.goal ?? 10);
  const weeklyPercent = Math.min(100, Math.round((weeklyTotal / Math.max(weeklyGoal, 1)) * 100));
  const weeklyMax = Math.max(...weeklyDays.map((day: any) => Number(day.amount || 0)), 0.01);
  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();
    let offers = allOffers.filter((offer: any) => {
      const searchText = `${offer.offerName || ''} ${offer.provider || ''} ${offer.category || ''} ${offer.description || ''}`.toLowerCase();
      return !query || searchText.includes(query);
    });
    if (activeFilter === 'highest') return [...offers].sort((left, right) => offerSortValue(right) - offerSortValue(left));
    if (activeFilter === 'featured') return offers;
    return offers.filter((offer: any) => categoryMatch(offer, activeFilter));
  }, [activeFilter, allOffers, search]);

  const displayName = profile?.username || profile?.name || user?.username || user?.name || 'Member';
  const totalEarned = summary.data?.totalEarned ?? Number(profile?.totalEarned ?? profile?.lifetime_earnings ?? 0);
  const pendingRewards = Number(summary.data?.pendingRewards || 0);
  const startEarningPath = user ? '/offerwalls' : '/register';

  return (
    <div className="dashboard-page dashboard-layout-grid mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="dashboard-main-column">
      <section className="welcome-panel dashboard-hero">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2"><span className="hud-status-dot" /><p className="rv-eyebrow">Your rewards workspace</p></div>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-[-0.055em] text-foreground sm:text-5xl">Good to see you, <span className="text-primary">{displayName}</span> <span aria-hidden="true">👋</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Earn rewards from verified surveys, apps, games and tasks, then follow every balance and payout update in one clear place.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to={startEarningPath} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-105"><Zap className="h-4 w-4" /> {user ? 'Start' : 'Register Now'} <ArrowRight className="h-4 w-4" /></Link><Link to="/withdraw" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-muted"><WalletCards className="h-4 w-4 text-primary" /> Withdraw</Link></div>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-t border-border/70 pt-5 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Verified provider callbacks</span><span className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Server-validated payouts</span></div>
        </div>
        <div className="hero-side-card"><div className="quick-stats-grid"><Surface className="quick-stat"><span className="quick-stat-icon"><CheckCircle2 className="h-4 w-4" /></span><p className="dashboard-kicker">Offers completed</p><p className="mt-2 font-display text-2xl font-semibold text-foreground">{profile?.offersCompleted ?? profile?.completed_offers ?? 0}</p><p className="mt-1 text-[11px] text-muted-foreground">Verified completions</p></Surface><Surface className="quick-stat"><span className="quick-stat-icon"><Timer className="h-4 w-4" /></span><p className="dashboard-kicker">Today’s earnings</p><p className="mt-2 font-display text-2xl font-semibold text-foreground">{money(summary.data?.todayEarnings)}</p><p className="mt-1 text-[11px] text-muted-foreground">Rewards credited today</p></Surface><Surface className="quick-stat"><span className="quick-stat-icon"><Award className="h-4 w-4" /></span><p className="dashboard-kicker">Total earned</p><p className="mt-2 font-display text-2xl font-semibold text-foreground">{money(totalEarned)}</p><p className="mt-1 text-[11px] text-muted-foreground">All-time rewards</p></Surface><Surface className="quick-stat"><span className="quick-stat-icon"><Clock3 className="h-4 w-4" /></span><p className="dashboard-kicker">Pending rewards</p><p className="mt-2 font-display text-2xl font-semibold text-foreground">{money(pendingRewards)}</p><p className="mt-1 text-[11px] text-muted-foreground">Awaiting verification</p></Surface></div></div>
      </section>

      <section className="offer-marketplace featured-primary">
        <div className="flex flex-col gap-5 border-b border-border/70 pb-5 xl:flex-row xl:items-end xl:justify-between"><div><div className="flex items-center gap-2"><span className="featured-live-dot" aria-hidden="true" /><span className="featured-activity-label">LIVE</span><p className="rv-eyebrow">Offer catalog</p></div><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl">Featured offers</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Start with live offers from the current configured provider feed.</p></div><label className="hud-search offer-search" aria-label="Search offers"><Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search offers…" /></label></div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Offer filters">{offerFilters.map(({ label, value, icon: Icon }) => <button key={value} type="button" role="tab" aria-selected={activeFilter === value} onClick={() => setActiveFilter(value)} className={`filter-pill focus-ring ${activeFilter === value ? 'filter-pill-active' : ''}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
        <div className="featured-activity-bar mt-5" role="status"><span className={`featured-live-dot ${featured.isError && !allOffers.length ? 'featured-live-dot-offline' : ''}`} aria-hidden="true" /><span className="featured-activity-label">{featured.isError && !allOffers.length ? 'Offline' : featured.isLoading && !allOffers.length ? 'Updating' : 'Live now'}</span><span className="featured-activity-separator" aria-hidden="true" /><span>{featured.isError && !allOffers.length ? 'Live catalog unavailable' : featured.isLoading && !allOffers.length ? 'Checking the live catalog' : `${allOffers.length} ${allOffers.length === 1 ? 'offer' : 'offers'} available`}</span></div>
        <div className="mt-4">{featured.isLoading && !allOffers.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-10 featured-offer-grid" aria-label="Loading featured offers">{Array.from({ length: 20 }, (_, index) => <FeaturedOfferSkeleton key={index} />)}</div> : featured.isError && !allOffers.length ? <EmptyState title="Unable to load offers" description="The live provider feed is temporarily unavailable. Try again shortly or open the earn center." icon={Zap} action={<button type="button" onClick={() => featured.refetch()} className="text-sm font-semibold text-primary">Retry <ArrowRight className="ml-1 inline h-4 w-4" /></button>} /> : filteredOffers.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-10 featured-offer-grid">{filteredOffers.slice(0, 20).map((offer: any, index: number) => <a href={offer.clickUrl} target="_blank" rel="noreferrer" key={`${offer.provider}-${offer.id || index}`} className={`offer-card group featured-offer-enter ${offer.featured ? 'offer-card-featured' : ''}`}><div className="flex items-start justify-between gap-3"><div className="featured-offer-logo relative flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-border bg-secondary p-2 shadow-sm"><span className="relative z-10 text-sm font-bold text-primary">{String(offer.offerName || offer.provider || 'O').slice(0, 1).toUpperCase()}</span>{offer.imageUrl ? <img src={offer.imageUrl} alt="" loading="lazy" decoding="async" width="30" height="30" className="absolute z-10 h-[30px] w-[30px] object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}</div><span className="status-badge status-success">{offer.featured ? 'Featured' : 'Available'}</span></div><div className="mt-5"><div className="flex flex-wrap items-center gap-2"><span className="offer-category">{offer.category || 'Offer'}</span><span className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">{offer.provider}</span></div><h3 className="mt-2 line-clamp-2 font-display text-base font-semibold text-foreground transition group-hover:text-primary">{offer.offerName}</h3><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{offer.description || 'Open the provider offer to see the current requirements and completion details.'}</p></div><div className="mt-auto flex items-center justify-end border-t border-border/70 pt-4"><span className="offer-cta">Start offer <ArrowRight className="h-3.5 w-3.5" /></span></div></a>)}</div> : <EmptyState title="No matching offers" description="Try another filter or search term. New provider offers will appear here when available." icon={Search} action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Open earn center <ArrowRight className="ml-1 inline h-4 w-4" /></Link>} />}</div>
        <div className="mt-6 flex justify-end"><Link to="/offerwalls" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">View all offers <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <section className="provider-rail" aria-label="Offer wall partners">
        <div className="provider-rail-heading"><div><p className="rv-eyebrow">Reward network</p><h2>Offer wall partners</h2><p>Choose a provider to browse surveys, apps, games and tasks.</p></div><span className="provider-rail-count">{OFFER_WALLS.length} walls</span></div>
        <div className="provider-rail-grid">{OFFER_WALLS.map((wall) => { const status = wallStatusQuery.data?.find((item) => item.provider === wall.id); const configured = wall.id === 'opinionuniverse' || status?.configured !== false; return <Link key={wall.id} to={`/offerwalls/${wall.id}`} className="provider-mini-card" style={{ '--provider-accent': wall.accent, '--provider-brand': wall.brandColor } as CSSProperties}><span className="provider-mini-logo">{wall.logo ? <img src={wall.logo} alt="" loading="lazy" /> : wall.name.slice(0, 1)}</span><span className="provider-mini-copy"><strong>{wall.name}</strong></span><span className={`provider-mini-status ${configured ? 'is-ready' : 'is-pending'}`} aria-label={configured ? 'Available' : 'Setup required'} /></Link>; })}</div>
      </section>

      <section className="weekly-progress-panel" aria-label="Your weekly progress">
        <div className="weekly-progress-copy"><p className="rv-eyebrow"><span className="section-dot" /> Your weekly progress</p><h2>Small steps add up.</h2><p>Keep your rhythm with a few minutes of surveys, apps or games each day.</p><div className="weekly-progress-row"><span>Weekly goal <b>{money(weeklyTotal)}</b> of {money(weeklyGoal)}</span><strong>{weeklyPercent}%</strong></div><div className="weekly-progress-track"><span style={{ width: `${weeklyPercent}%` }} /></div><div className="weekly-progress-meta"><span>ϟ &nbsp;{weeklyQuery.data?.streak ?? 0}-day activity streak</span><span>Rewards this week <b>{money(weeklyTotal)}</b></span></div></div>
        <div className="weekly-chart-card"><div className="weekly-chart-heading"><span>Activity this week</span><small>This week⌄</small></div><div className="weekly-chart" aria-label="Real earnings by day this week">{weeklyDays.map((day: any) => <div className="weekly-chart-bar" key={day.label}><i style={{ height: `${Math.max(8, Math.round((Number(day.amount || 0) / weeklyMax) * 100))}%` }} /><span>{day.label}</span></div>)}</div></div>
      </section>
      </div>
      <aside className="dashboard-side-rail" aria-label="Dashboard insights">
        <section className="dashboard-side-panel"><div className="dashboard-side-heading"><div><h2><i className="section-dot" /> Top earners</h2><p>Latest users with the highest rewards</p></div><span className="side-select">This week</span></div><div className="dashboard-earner-list">{leaderboard.length ? leaderboard.map((entry: any, index: number) => <div className="dashboard-earner" key={entry.id ?? `${entry.username}-${index}`}><span className={`dashboard-rank rank-${index + 1}`}>{index + 1}</span><UserAvatar userId={entry.userId} avatarId={entry.avatarId} alt="" className="dashboard-mini-avatar rounded-full" /><div className="dashboard-earner-copy"><strong>{entry.username || 'Member'}</strong><span>{index + 1} place</span></div><b>{money(entry.totalEarned)}</b></div>) : <p className="dashboard-empty">No leaderboard data yet.</p>}</div><p className="dashboard-side-note">Figures update from verified rewards.</p></section>
        <section className="dashboard-side-panel"><div className="dashboard-side-heading"><div><h2><i className="section-dot" /> Trending offers</h2><p>Popular offers from the live catalog</p></div><Link to="/offerwalls" className="dashboard-side-link">View all</Link></div><div className="dashboard-trending-list">{trendingOffers.length ? trendingOffers.map((offer: any, index: number) => <a className="dashboard-trending" href={offer.clickUrl} target="_blank" rel="noreferrer" key={`${offer.provider}-${offer.id ?? index}`}><span className="dashboard-trending-logo">{String(offer.provider || offer.offerName || 'O').slice(0, 1).toUpperCase()}</span><span className="dashboard-trending-copy"><strong>{offer.offerName || offer.provider || 'Offer'}</strong><span>{offer.category || 'Offer'}</span></span><b>{rewardLabel(offer.reward ?? offer.payout)}</b></a>) : <p className="dashboard-empty">Live offers will appear here.</p>}</div></section>
      </aside>
    </div>
  );
}
