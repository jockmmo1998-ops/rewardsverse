import { Activity, ArrowRight, ArrowUpRight, Award, CheckCircle2, Clock3, Gift, Search, ShieldCheck, Sparkles, Tag, Timer, WalletCards, X, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, Surface } from '@/components/shared/RewardUI';
import { OfferFeedShelf } from '@/components/dashboard/OfferFeedShelf';
import { OfferCatalogResults } from '@/components/dashboard/OfferCatalogResults';
import { CommunityActivityPanel } from '@/components/dashboard/CommunityActivityPanel';
import { PartnerDirectory } from '@/components/dashboard/PartnerDirectory';
import { WeeklyProgressPanel } from '@/components/dashboard/WeeklyProgressPanel';
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
  const weeklyTotal = Number(weeklyQuery.data?.total ?? 0);
  const weeklyGoal = Number(weeklyQuery.data?.goal ?? 10);
  const weeklyPercent = Math.min(100, Math.round((weeklyTotal / Math.max(weeklyGoal, 1)) * 100));
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
  const visualPreview = import.meta.env.DEV && import.meta.env.VITE_VISUAL_PREVIEW === 'true';
  const previewDataUnavailable = visualPreview && !profile && !summary.data;
  const totalEarnedLabel = previewDataUnavailable ? '—' : money(totalEarned);
  const completedOffersLabel = previewDataUnavailable ? '—' : (profile?.offersCompleted ?? profile?.completed_offers ?? 0);
  const todayEarningsLabel = previewDataUnavailable ? '—' : money(summary.data?.todayEarnings);
  const pendingRewardsLabel = previewDataUnavailable ? '—' : money(pendingRewards);
  const weeklyDataUnavailable = previewDataUnavailable && !weeklyQuery.data;
  const weeklyTotalLabel = weeklyDataUnavailable ? '—' : money(weeklyTotal);
  const weeklyGoalLabel = weeklyDataUnavailable ? '—' : money(weeklyGoal);
  const weeklyPercentLabel = weeklyDataUnavailable ? '—' : `${weeklyPercent}%`;

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
            <div className="dashboard-hero-art-top"><span>REWARDSVERSE · MEMBER SPACE</span><span><i /> {previewDataUnavailable ? 'PREVIEW' : 'LIVE'}</span></div>
            <div className="hero-balance-overlay">
              <div className="hero-balance-top"><span className="hero-balance-label">ACCOUNT SNAPSHOT</span><span className="hero-status">{user ? 'MEMBER' : 'PUBLIC VIEW'}</span></div>
              <span className="hero-balance-caption">TOTAL EARNED</span>
              <strong>{totalEarnedLabel}</strong>
              <span className="hero-balance-note">Verified rewards earned to date</span>
              <div className="hero-balance-footer"><span>Available balance <b>{user && profile?.balance != null ? money(profile.balance) : '—'}</b></span><span>Offers completed <b>{completedOffersLabel}</b></span></div>
            </div>
          </div>
        </section>

        <section className="dashboard-metrics-grid" aria-label="Reward overview metrics">
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><CheckCircle2 className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Offers completed</p><strong>{completedOffersLabel}</strong><small>Verified completions</small></div></Surface>
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><Timer className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Today’s earnings</p><strong>{todayEarningsLabel}</strong><small>Rewards credited today</small></div></Surface>
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><Clock3 className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Pending rewards</p><strong>{pendingRewardsLabel}</strong><small>Awaiting verification</small></div></Surface>
        </section>

        <OfferFeedShelf
          eyebrow="CURRENT FEED"
          title="Offers in the feed."
          description="Real provider cards will appear here when records are available."
          offers={allOffers}
          loading={featured.isLoading}
          error={featured.isError}
          visualPreview={visualPreview}
          onSelect={setActiveOffer}
          emptyCount={15}
        />
      <section className="offer-marketplace featured-primary">
        <div className="rv-verified-feed-heading">
          <div>
            <p className="rv-eyebrow"><span className="section-dot" /> VERIFIED OFFER FEED</p>
            <h2>Offers, when they’re live.</h2>
            <p>Only real records from the provider feed appear in this section.</p>
          </div>
          <label className="hud-search offer-search" aria-label="Search offers">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search offers…" />
          </label>
        </div>
        <div className="rv-verified-filter-row" role="tablist" aria-label="Offer filters">
          {offerFilters.map(({ label, value, icon: Icon }) => (
            <button key={value} type="button" role="tab" aria-selected={activeFilter === value} onClick={() => setActiveFilter(value)} className={`filter-pill focus-ring ${activeFilter === value ? 'filter-pill-active' : ''}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>
        <div className="rv-feed-results-meta" role="status">
          <span>{featured.isError && !allOffers.length ? 'LIVE FEED' : 'RESULTS IN THIS VIEW'}</span>
          <strong>{featured.isError && !allOffers.length ? '—' : filteredOffers.length}</strong>
        </div>
        <OfferCatalogResults
          allOffers={allOffers}
          offers={filteredOffers}
          loading={featured.isLoading}
          error={featured.isError}
          visualPreview={visualPreview}
          onSelect={setActiveOffer}
          onRetry={() => { void featured.refetch(); }}
        />
        <div className="rv-verified-feed-footer"><span>Search and filters apply to the live feed only.</span><Link to="/offerwalls">View all offers <ArrowRight aria-hidden="true" /></Link></div>
      </section>

      <AnimatePresence>{activeOffer && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:p-6 lg:p-10" onClick={(event) => { if (event.target === event.currentTarget) setActiveOffer(null); }}><motion.div initial={{ scale: .97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .97, y: 8 }} transition={{ duration: .18 }} className="flex h-[78vh] w-[50vw] max-w-[1180px] min-h-0 flex-col overflow-hidden rounded-2xl border border-green-500/20 bg-background shadow-2xl shadow-slate-950/40 max-sm:h-[86vh] max-sm:w-full"><div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-green-500/15 bg-background/95 px-4 py-3 backdrop-blur-md sm:px-5"><div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-green-500/20 bg-green-500/10 p-1"><span className="text-sm font-bold text-primary">{String(activeOffer.provider || activeOffer.offerName || 'O').slice(0, 1).toUpperCase()}</span>{activeOffer.imageUrl ? <img src={activeOffer.imageUrl} alt="" className="h-full w-full object-contain" /> : null}</div><div className="min-w-0"><span className="block truncate text-sm font-bold text-gradient sm:text-base">{activeOffer.offerName || activeOffer.provider || 'Offer'}</span><span className="block truncate text-[10px] text-muted-foreground">{activeOffer.provider || activeOffer.category || 'Live offer'}</span></div></div><div className="ml-auto flex shrink-0 items-center gap-1.5"><a href={activeOffer.clickUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"><ArrowUpRight className="h-4 w-4" /><span className="hidden sm:inline">OPEN OFFER PAGE</span></a><button type="button" onClick={() => setActiveOffer(null)} className="focus-ring rounded-xl p-2 text-muted-foreground transition hover:bg-red-50 hover:text-destructive" aria-label="Close offer"><X className="h-5 w-5" /></button></div></div><div className="min-h-0 flex-1 overflow-auto bg-white">{activeOffer.clickUrl ? <iframe src={activeOffer.clickUrl} className="block h-full min-h-full w-full border-0 bg-white" title={`${activeOffer.offerName || activeOffer.provider || 'Offer'} details`} sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation" /> : <div className="flex h-full items-center justify-center bg-background"><EmptyState title="Offer unavailable" description="This offer did not return a valid provider URL." icon={Zap} /></div>}</div></motion.div></motion.div>}</AnimatePresence>
      <AnimatePresence>{activeWall && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:p-6 lg:p-10" onClick={(event) => { if (event.target === event.currentTarget) { setActiveWall(null); setWallUrl(''); } }}><motion.div initial={{ scale: .97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .97, y: 8 }} transition={{ duration: .18 }} className="flex h-[78vh] w-[50vw] max-w-[1180px] min-h-0 flex-col overflow-hidden rounded-2xl border border-green-500/20 bg-background shadow-2xl shadow-slate-950/40 max-sm:h-[86vh] max-sm:w-full"><div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-green-500/15 bg-background/95 px-4 py-3 backdrop-blur-md sm:px-5"><div className="flex min-w-0 items-center gap-3"><div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-green-500/20 bg-green-500/10 p-1">{OFFER_WALLS.find((wall) => wall.id === activeWall)?.logo ? <img src={OFFER_WALLS.find((wall) => wall.id === activeWall)?.logo} alt="" className="h-full w-full object-contain" /> : <span className="grid h-full w-full place-items-center text-sm font-bold text-primary">{OFFER_WALLS.find((wall) => wall.id === activeWall)?.name.slice(0, 1)}</span>}</div><span className="truncate text-sm font-bold text-gradient sm:text-base">{OFFER_WALLS.find((wall) => wall.id === activeWall)?.name}</span></div><div className="ml-auto flex shrink-0 items-center gap-1.5"><a href={`/offerwalls/${activeWall}`} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"><ArrowUpRight className="h-4 w-4" /><span className="hidden sm:inline">OPEN OFFER PAGE</span></a><button type="button" onClick={() => { setActiveWall(null); setWallUrl(''); }} className="focus-ring rounded-xl p-2 text-muted-foreground transition hover:bg-red-50 hover:text-destructive" aria-label="Close offerwall"><X className="h-5 w-5" /></button></div></div><div className="min-h-0 flex-1 overflow-auto bg-white">{wallUrlQuery.isFetching || (activeWall === OPINION_UNIVERSE_WALL_ID && !wallUrl) ? <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />Loading offer wall…</div> : wallUrl ? <iframe src={wallUrl} className="block h-full min-h-full w-full border-0 bg-white" title="Offer wall" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation" /> : <div className="flex h-full items-center justify-center bg-background"><EmptyState title="Provider unavailable" description="This provider did not return a valid offerwall URL." icon={Zap} /></div>}</div></motion.div></motion.div>}</AnimatePresence>
      <div className="rv-dashboard-split">
        <WeeklyProgressPanel
          unavailable={weeklyDataUnavailable}
          percent={weeklyPercent}
          percentLabel={weeklyPercentLabel}
          totalLabel={weeklyTotalLabel}
          goalLabel={weeklyGoalLabel}
          streak={Number(weeklyQuery.data?.streak ?? 0)}
        />
        <CommunityActivityPanel />
      </div>
      <PartnerDirectory
        statuses={wallStatusQuery.data}
        onSelect={(wallId) => {
          const status = wallStatusQuery.data?.find((item) => item.provider === wallId);
          if (!user) {
            navigate('/login', { state: { from: '/offerwalls' } });
            return;
          }
          if (status && !status.configured) return;
          if (NEW_TAB_WALL_IDS.has(wallId)) {
            navigate(`/offerwalls/${wallId}`);
            return;
          }
          setWallUrl('');
          setActiveWall(wallId);
        }}
      />
      </div>

    </div>
  );
}
