import { Activity, ArrowRight, ArrowUpRight, Award, CheckCircle2, Clock3, Gift, Search, ShieldCheck, Sparkles, Tag, Timer, WalletCards, X, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, Surface } from '@/components/shared/RewardUI';
import { NEW_TAB_WALL_IDS, OFFER_WALLS, OPINION_UNIVERSE_URL, OPINION_UNIVERSE_WALL_ID } from './OfferWalls';

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
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('featured');
  const [search, setSearch] = useState('');
  const [activeOffer, setActiveOffer] = useState<any | null>(null);
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const [wallUrl, setWallUrl] = useState('');
  const featured = trpc.user.getFeaturedOffers.useQuery(undefined, { staleTime: 60_000, gcTime: 5 * 60_000, placeholderData: (previousData) => previousData, refetchOnWindowFocus: false, retry: false });
  const summary = trpc.user.getDashboardSummary.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false });
  const weeklyQuery = trpc.user.getWeeklyProgress.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false });
  const wallStatusQuery = trpc.user.getOfferWallStatuses.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 60_000, refetchOnWindowFocus: false, retry: false });
  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery({ wall: activeWall || '' }, { enabled: Boolean(activeWall && activeWall !== OPINION_UNIVERSE_WALL_ID && user?.id), retry: false, refetchOnWindowFocus: false });

  useEffect(() => {
    if (activeWall === OPINION_UNIVERSE_WALL_ID) {
      const sid = String(user?.username || user?.name || user?.id || '').trim();
      setWallUrl(sid ? `${OPINION_UNIVERSE_URL}&SID=${encodeURIComponent(sid)}` : '');
      return;
    }
    if (wallUrlQuery.data?.url) setWallUrl(wallUrlQuery.data.url);
  }, [activeWall, user?.id, user?.name, user?.username, wallUrlQuery.data?.url]);

  const allOffers = featured.data ?? [];
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
          <div className="dashboard-hero-copy">
            <div className="dashboard-hero-kicker"><span className="hud-status-dot" /><span>REWARDSVERSE · WELCOME, {displayName}</span><span className="hero-public-tag">MEMBER SPACE</span></div>
            <h1 className="dashboard-hero-title">Your rewards space.<br /><span>Built for clarity.</span></h1>
            <p className="dashboard-hero-description">Progress, live offers, partner ratings and payout details—in one clear place.</p>
            <div className="dashboard-hero-actions"><Link to={startEarningPath} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-105"><Zap className="h-4 w-4" /> {user ? 'Start earning' : 'Register now'} <ArrowRight className="h-4 w-4" /></Link><Link to="/history" className="dashboard-hero-secondary focus-ring"><Activity className="h-4 w-4" /> View activity</Link></div>
            <div className="dashboard-hero-proof"><span><CheckCircle2 className="h-3.5 w-3.5" /> Verified provider callbacks</span><span><ShieldCheck className="h-3.5 w-3.5" /> Server-validated payouts</span></div>
          </div>
          <div className="dashboard-hero-visual" aria-label="RewardsVerse community and account snapshot">
            <img className="dashboard-hero-art" src="/rewardsverse-community-banner.webp" alt="RewardsVerse chibi community gathered around a branded laptop" decoding="async" fetchPriority="high" />
            <div className="dashboard-hero-visual-shade" aria-hidden="true" />
            <div className="dashboard-hero-art-top"><span>REWARDSVERSE · MEMBER SPACE</span><span><i /> LIVE</span></div>
            <div className="hero-balance-overlay">
              <div className="hero-balance-top"><span className="hero-balance-label">ACCOUNT SNAPSHOT</span><span className="hero-status">{user ? 'MEMBER' : 'PUBLIC VIEW'}</span></div>
              <span className="hero-balance-caption">TOTAL EARNED</span>
              <strong>{money(totalEarned)}</strong>
              <span className="hero-balance-note">Verified rewards earned to date</span>
              <div className="hero-balance-footer"><span>Available balance <b>{user && profile?.balance != null ? money(profile.balance) : '—'}</b></span><span>Offers completed <b>{profile?.offersCompleted ?? profile?.completed_offers ?? 0}</b></span></div>
            </div>
          </div>
        </section>

        <section className="dashboard-metrics-grid" aria-label="Reward overview metrics">
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><CheckCircle2 className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Offers completed</p><strong>{profile?.offersCompleted ?? profile?.completed_offers ?? 0}</strong><small>Verified completions</small></div></Surface>
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><Timer className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Today’s earnings</p><strong>{money(summary.data?.todayEarnings)}</strong><small>Rewards credited today</small></div></Surface>
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><Award className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Total earned</p><strong>{money(totalEarned)}</strong><small>All-time rewards</small></div></Surface>
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><Clock3 className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Pending rewards</p><strong>{money(pendingRewards)}</strong><small>Awaiting verification</small></div></Surface>
        </section>

      <section className="offer-marketplace featured-primary">
        <div className="flex flex-col gap-5 border-b border-border/70 pb-5 xl:flex-row xl:items-end xl:justify-between"><div><div className="flex items-center gap-2"><span className="featured-live-dot" aria-hidden="true" /><span className="featured-activity-label">LIVE</span><p className="rv-eyebrow">Offer catalog</p></div><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl">Featured offers</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Start with live offers from the current configured provider feed.</p></div><label className="hud-search offer-search" aria-label="Search offers"><Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search offers…" /></label></div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Offer filters">{offerFilters.map(({ label, value, icon: Icon }) => <button key={value} type="button" role="tab" aria-selected={activeFilter === value} onClick={() => setActiveFilter(value)} className={`filter-pill focus-ring ${activeFilter === value ? 'filter-pill-active' : ''}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
        <div className="featured-activity-bar mt-5" role="status"><span className={`featured-live-dot ${featured.isError && !allOffers.length ? 'featured-live-dot-offline' : ''}`} aria-hidden="true" /><span className="featured-activity-label">{featured.isError && !allOffers.length ? 'Offline' : featured.isLoading && !allOffers.length ? 'Updating' : 'Live now'}</span><span className="featured-activity-separator" aria-hidden="true" /><span>{featured.isError && !allOffers.length ? 'Live catalog unavailable' : featured.isLoading && !allOffers.length ? 'Checking the live catalog' : `${allOffers.length} ${allOffers.length === 1 ? 'offer' : 'offers'} available`}</span></div>
        <div className="mt-4">{featured.isLoading && !allOffers.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-10 featured-offer-grid" aria-label="Loading featured offers">{Array.from({ length: 20 }, (_, index) => <FeaturedOfferSkeleton key={index} />)}</div> : featured.isError && !allOffers.length ? <EmptyState title="Unable to load offers" description="The live provider feed is temporarily unavailable. Try again shortly or open the earn center." icon={Zap} action={<button type="button" onClick={() => featured.refetch()} className="text-sm font-semibold text-primary">Retry <ArrowRight className="ml-1 inline h-4 w-4" /></button>} /> : filteredOffers.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-10 featured-offer-grid">{filteredOffers.slice(0, 20).map((offer: any, index: number) => <button type="button" onClick={() => setActiveOffer(offer)} key={`${offer.provider}-${offer.id || index}`} className={`offer-card group featured-offer-enter text-left ${offer.featured ? 'offer-card-featured' : ''}`}><div className="flex items-start justify-between gap-3"><div className="featured-offer-logo relative flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-border bg-secondary p-2 shadow-sm"><span className="relative z-10 text-sm font-bold text-primary">{String(offer.offerName || offer.provider || 'O').slice(0, 1).toUpperCase()}</span>{offer.imageUrl ? <img src={offer.imageUrl} alt="" loading="lazy" decoding="async" width="30" height="30" className="absolute z-10 h-[30px] w-[30px] object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}</div><span className="status-badge status-success">{offer.featured ? 'Featured' : 'Available'}</span></div><div className="mt-5"><div className="flex flex-wrap items-center gap-2"><span className="offer-category">{offer.category || 'Offer'}</span><span className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">{offer.provider}</span></div><h3 className="mt-2 line-clamp-2 font-display text-base font-semibold text-foreground transition group-hover:text-primary">{offer.offerName}</h3><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{offer.description || 'Open the provider offer to see the current requirements and completion details.'}</p></div><div className="mt-auto flex items-center justify-end border-t border-border/70 pt-4"><span className="offer-cta">Start offer <ArrowRight className="h-3.5 w-3.5" /></span></div></button>)}</div> : <EmptyState title="No matching offers" description="Try another filter or search term. New provider offers will appear here when available." icon={Search} action={<Link to="/offerwalls" className="text-sm font-semibold text-primary">Open earn center <ArrowRight className="ml-1 inline h-4 w-4" /></Link>} />}</div>
        <div className="mt-6 flex justify-end"><Link to="/offerwalls" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">View all offers <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <section className="provider-rail" aria-label="Offer wall partners">
        <div className="provider-rail-heading"><div><p className="rv-eyebrow">Reward network</p><h2>Offer wall partners</h2><p>Choose a provider to browse surveys, apps, games and tasks.</p></div><span className="provider-rail-count">{OFFER_WALLS.length} walls</span></div>
        <div className="provider-rail-grid">{OFFER_WALLS.map((wall) => { const status = wallStatusQuery.data?.find((item) => item.provider === wall.id); const configured = wall.id === 'opinionuniverse' || status?.configured !== false; const ratingPercent = Math.round((wall.rating / 5) * 100); return <button type="button" key={wall.id} onClick={() => { if (!configured) return; if (NEW_TAB_WALL_IDS.has(wall.id)) { navigate(`/offerwalls/${wall.id}`); return; } setWallUrl(''); setActiveWall(wall.id); }} disabled={!configured} className={`provider-mini-card provider-partner-card text-left ${!configured ? 'provider-logo-card-disabled cursor-not-allowed opacity-60' : ''}`} style={{ '--provider-accent': wall.accent, '--provider-brand': wall.brandColor } as CSSProperties}><span className="provider-partner-badge">{wall.tag}</span><span className="provider-partner-main"><span className="provider-mini-logo">{wall.logo ? <img src={wall.logo} alt="" loading="lazy" /> : wall.name.slice(0, 1)}</span><span className="provider-mini-copy"><strong>{wall.name}</strong><span className="provider-partner-rating"><small>USER RATING</small><i><b style={{ width: `${ratingPercent}%` }} /></i><em>{wall.rating.toFixed(1)}</em></span></span></span><span className={`provider-mini-status ${configured ? 'is-ready' : 'is-pending'}`} aria-label={configured ? 'Available' : 'Setup required'} /></button>; })}</div>
      </section>

      <AnimatePresence>{activeOffer && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:p-6 lg:p-10" onClick={(event) => { if (event.target === event.currentTarget) setActiveOffer(null); }}><motion.div initial={{ scale: .97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .97, y: 8 }} transition={{ duration: .18 }} className="flex h-[78vh] w-[50vw] max-w-[1180px] min-h-0 flex-col overflow-hidden rounded-2xl border border-green-500/20 bg-background shadow-2xl shadow-slate-950/40 max-sm:h-[86vh] max-sm:w-full"><div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-green-500/15 bg-background/95 px-4 py-3 backdrop-blur-md sm:px-5"><div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-green-500/20 bg-green-500/10 p-1"><span className="text-sm font-bold text-primary">{String(activeOffer.provider || activeOffer.offerName || 'O').slice(0, 1).toUpperCase()}</span>{activeOffer.imageUrl ? <img src={activeOffer.imageUrl} alt="" className="h-full w-full object-contain" /> : null}</div><div className="min-w-0"><span className="block truncate text-sm font-bold text-gradient sm:text-base">{activeOffer.offerName || activeOffer.provider || 'Offer'}</span><span className="block truncate text-[10px] text-muted-foreground">{activeOffer.provider || activeOffer.category || 'Live offer'}</span></div></div><div className="ml-auto flex shrink-0 items-center gap-1.5"><a href={activeOffer.clickUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"><ArrowUpRight className="h-4 w-4" /><span className="hidden sm:inline">OPEN OFFER PAGE</span></a><button type="button" onClick={() => setActiveOffer(null)} className="focus-ring rounded-xl p-2 text-muted-foreground transition hover:bg-red-50 hover:text-destructive" aria-label="Close offer"><X className="h-5 w-5" /></button></div></div><div className="min-h-0 flex-1 overflow-auto bg-white">{activeOffer.clickUrl ? <iframe src={activeOffer.clickUrl} className="block h-full min-h-full w-full border-0 bg-white" title={`${activeOffer.offerName || activeOffer.provider || 'Offer'} details`} sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation" /> : <div className="flex h-full items-center justify-center bg-background"><EmptyState title="Offer unavailable" description="This offer did not return a valid provider URL." icon={Zap} /></div>}</div></motion.div></motion.div>}</AnimatePresence>
      <AnimatePresence>{activeWall && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:p-6 lg:p-10" onClick={(event) => { if (event.target === event.currentTarget) { setActiveWall(null); setWallUrl(''); } }}><motion.div initial={{ scale: .97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .97, y: 8 }} transition={{ duration: .18 }} className="flex h-[78vh] w-[50vw] max-w-[1180px] min-h-0 flex-col overflow-hidden rounded-2xl border border-green-500/20 bg-background shadow-2xl shadow-slate-950/40 max-sm:h-[86vh] max-sm:w-full"><div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-green-500/15 bg-background/95 px-4 py-3 backdrop-blur-md sm:px-5"><div className="flex min-w-0 items-center gap-3"><div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-green-500/20 bg-green-500/10 p-1">{OFFER_WALLS.find((wall) => wall.id === activeWall)?.logo ? <img src={OFFER_WALLS.find((wall) => wall.id === activeWall)?.logo} alt="" className="h-full w-full object-contain" /> : <span className="grid h-full w-full place-items-center text-sm font-bold text-primary">{OFFER_WALLS.find((wall) => wall.id === activeWall)?.name.slice(0, 1)}</span>}</div><span className="truncate text-sm font-bold text-gradient sm:text-base">{OFFER_WALLS.find((wall) => wall.id === activeWall)?.name}</span></div><div className="ml-auto flex shrink-0 items-center gap-1.5"><a href={`/offerwalls/${activeWall}`} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"><ArrowUpRight className="h-4 w-4" /><span className="hidden sm:inline">OPEN OFFER PAGE</span></a><button type="button" onClick={() => { setActiveWall(null); setWallUrl(''); }} className="focus-ring rounded-xl p-2 text-muted-foreground transition hover:bg-red-50 hover:text-destructive" aria-label="Close offerwall"><X className="h-5 w-5" /></button></div></div><div className="min-h-0 flex-1 overflow-auto bg-white">{wallUrlQuery.isFetching || (activeWall === OPINION_UNIVERSE_WALL_ID && !wallUrl) ? <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />Loading offer wall…</div> : wallUrl ? <iframe src={wallUrl} className="block h-full min-h-full w-full border-0 bg-white" title="Offer wall" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation" /> : <div className="flex h-full items-center justify-center bg-background"><EmptyState title="Provider unavailable" description="This provider did not return a valid offerwall URL." icon={Zap} /></div>}</div></motion.div></motion.div>}</AnimatePresence>
      <section className="weekly-progress-panel" aria-label="Your weekly progress">
        <div className="weekly-progress-copy"><p className="rv-eyebrow"><span className="section-dot" /> Your weekly progress</p><h2>Small steps add up.</h2><p>Keep your rhythm with a few minutes of surveys, apps or games each day.</p><div className="weekly-progress-row"><span>Weekly goal <b>{money(weeklyTotal)}</b> of {money(weeklyGoal)}</span><strong>{weeklyPercent}%</strong></div><div className="weekly-progress-track"><span style={{ width: `${weeklyPercent}%` }} /></div><div className="weekly-progress-meta"><span>ϟ &nbsp;{weeklyQuery.data?.streak ?? 0}-day activity streak</span><span>Rewards this week <b>{money(weeklyTotal)}</b></span></div></div>
        <div className="weekly-chart-card"><div className="weekly-chart-heading"><span>Activity this week</span><small>This week⌄</small></div><div className="weekly-chart" aria-label="Real earnings by day this week">{weeklyDays.map((day: any) => <div className="weekly-chart-bar" key={day.label}><i style={{ height: `${Math.max(8, Math.round((Number(day.amount || 0) / weeklyMax) * 100))}%` }} /><span>{day.label}</span></div>)}</div></div>
      </section>
      </div>

    </div>
  );
}
