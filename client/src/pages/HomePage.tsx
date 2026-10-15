import { Activity, ArrowRight, Award, CheckCircle2, Clock3, Gift, Search, ShieldCheck, Sparkles, Tag, Timer, WalletCards, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/AvatarSystem';
import { Surface } from '@/components/shared/RewardUI';
import { OfferCatalogResults } from '@/components/dashboard/OfferCatalogResults';
import { EmbeddedOfferDialog } from '@/components/dashboard/EmbeddedOfferDialog';
import { PartnerDirectory } from '@/components/dashboard/PartnerDirectory';
import { NEW_TAB_WALL_IDS, OFFER_WALLS, OPINION_UNIVERSE_URL, OPINION_UNIVERSE_WALL_ID, SURVEY_WALL_IDS, SURVEY_WALLS } from '@/lib/offerwallCatalog';

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

function useNearViewport<T extends HTMLElement>(rootMargin = '600px') {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, visible]);
  return [ref, visible] as const;
}

export default function HomePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('featured');
  const [search, setSearch] = useState('');
  const [activeOffer, setActiveOffer] = useState<any | null>(null);
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const offerTriggerRef = useRef<HTMLElement | null>(null);
  const wallTriggerRef = useRef<HTMLElement | null>(null);
  const [partnerSectionRef, partnerSectionVisible] = useNearViewport<HTMLDivElement>();
  const [wallUrl, setWallUrl] = useState('');
  const featured = trpc.user.getFeaturedOffers.useQuery(undefined, { staleTime: 60_000, gcTime: 5 * 60_000, placeholderData: (previousData) => previousData, refetchOnWindowFocus: false, retry: false });
  const summary = trpc.user.getDashboardSummary.useQuery(undefined, { enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false });
  const wallStatusQuery = trpc.user.getOfferWallStatuses.useQuery(undefined, { enabled: Boolean(profile?.id && partnerSectionVisible), staleTime: 60_000, refetchOnWindowFocus: false, retry: false });
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
  const surveyWallIds = new Set<string>(SURVEY_WALL_IDS);
  const rewardNetworkWalls = OFFER_WALLS.filter((wall) => !surveyWallIds.has(wall.id));
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
  const pendingRewards = Number(summary.data?.pendingRewards || 0);
  const startEarningPath = user ? '/offerwalls' : '/register';
  const visualPreview = import.meta.env.DEV && import.meta.env.VITE_VISUAL_PREVIEW === 'true';
  const previewDataUnavailable = visualPreview && !profile && !summary.data;
  const completedOffersLabel = !user || previewDataUnavailable ? '—' : (profile?.offersCompleted ?? profile?.completed_offers ?? 0);
  const todayEarningsLabel = !user || previewDataUnavailable ? '—' : money(summary.data?.todayEarnings);
  const pendingRewardsLabel = !user || previewDataUnavailable ? '—' : money(pendingRewards);
  return (
    <div className="dashboard-page dashboard-layout-grid mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="dashboard-main-column">
        <section className="welcome-panel dashboard-hero">
          <div className="dashboard-hero-copy">
            <div className="dashboard-hero-kicker"><span className="hud-status-dot" />{user && <UserAvatar userId={profile?.id ?? user?.id} avatarId={profile?.avatarId ?? user?.avatarId} alt={`${displayName} avatar`} className="h-6 w-6 rounded-full border border-primary/40 object-cover" />}<span>{user ? `REWARDSVERSE · WELCOME, ${displayName}` : 'REWARDSVERSE · WELCOME'}</span><span className="hero-public-tag">{user ? 'MEMBER SPACE' : 'PUBLIC PREVIEW'}</span></div>
            <h1 className="dashboard-hero-title">Your rewards space.<br /><span>Built for clarity.</span></h1>
            <p className="dashboard-hero-description">Progress, live offers, partner ratings and payout details—in one clear place.</p>
            <div className="dashboard-hero-actions"><Link to={startEarningPath} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-105"><Zap className="h-4 w-4" /> {user ? 'Start earning' : 'Register now'} <ArrowRight className="h-4 w-4" /></Link><Link to="/history" className="dashboard-hero-secondary focus-ring"><Activity className="h-4 w-4" /> View activity</Link></div>
            <div className="dashboard-hero-proof"><span><CheckCircle2 className="h-3.5 w-3.5" /> Verified provider callbacks</span><span><ShieldCheck className="h-3.5 w-3.5" /> Server-validated payouts</span></div>
          </div>
          <div className="dashboard-hero-visual" aria-label="RewardsVerse community artwork">
            <img className="dashboard-hero-art" src="/rewardsverse-community-cutout-1280.webp" srcSet="/rewardsverse-community-cutout-640.webp 640w, /rewardsverse-community-cutout-1280.webp 1280w" sizes="(max-width: 700px) calc(100vw - 48px), 44vw" width="1672" height="941" alt="RewardsVerse community gathered around a branded laptop, holding green reward devices, on a transparent background" decoding="async" loading="eager" fetchPriority="high" />
            <div className="dashboard-hero-visual-shade" aria-hidden="true" />
          </div>
        </section>

        <section className="dashboard-metrics-grid" aria-label="Reward overview metrics">
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><CheckCircle2 className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Offers completed</p><strong>{completedOffersLabel}</strong><small>Verified completions</small></div></Surface>
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><Timer className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Today’s earnings</p><strong>{todayEarningsLabel}</strong><small>Rewards credited today</small></div></Surface>
          <Surface className="dashboard-metric-card"><span className="dashboard-metric-icon"><Clock3 className="h-4 w-4" /></span><div className="dashboard-metric-copy"><p className="dashboard-kicker">Pending rewards</p><strong>{pendingRewardsLabel}</strong><small>Awaiting verification</small></div></Surface>
        </section>

      <section className="offer-marketplace featured-primary">
        <div className="rv-verified-feed-heading">
          <div>
            <p className="rv-eyebrow"><span className="section-dot" /> LIVE PARTNER FEED</p>
            <h2>Offers, when they’re live.</h2>
            <p>Current listings returned by connected providers—no demo offers or placeholder rewards.</p>
          </div>
          <label className="hud-search offer-search" aria-label="Search offers">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input aria-label="Search live offers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search offers…" />
          </label>
        </div>
        <div className="rv-verified-filter-row" aria-label="Offer filters">
          {offerFilters.map(({ label, value, icon: Icon }) => (
            <button key={value} type="button" aria-pressed={activeFilter === value} onClick={() => setActiveFilter(value)} className={`filter-pill focus-ring ${activeFilter === value ? 'filter-pill-active' : ''}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>
        <div className="rv-feed-results-meta" role="status">
          <span>{featured.isLoading && !allOffers.length ? 'SYNCING PARTNER FEED' : featured.isError && !allOffers.length ? 'PARTNER FEED UNAVAILABLE' : 'LIVE OFFERS IN VIEW'}</span>
          <strong>{featured.isLoading && !allOffers.length ? '…' : featured.isError && !allOffers.length ? '—' : filteredOffers.length}</strong>
        </div>
        <OfferCatalogResults
          allOffers={allOffers}
          offers={filteredOffers}
          loading={featured.isLoading}
          error={featured.isError}
          visualPreview={visualPreview}
          onSelect={(offer, trigger) => {
            offerTriggerRef.current = trigger ?? null;
            setActiveOffer(offer);
          }}
          onRetry={() => { void featured.refetch(); }}
        />
        <div className="rv-verified-feed-footer"><span>Search and filters apply to the live feed only.</span><Link to="/offerwalls">View all offers <ArrowRight aria-hidden="true" /></Link></div>
      </section>

      <EmbeddedOfferDialog
        open={Boolean(activeOffer)}
        title={String(activeOffer?.offerName || activeOffer?.provider || 'Offer')}
        subtitle={String(activeOffer?.provider || activeOffer?.category || 'Live offer')}
        logoUrl={activeOffer?.imageUrl ? String(activeOffer.imageUrl) : undefined}
        url={activeOffer?.clickUrl ? String(activeOffer.clickUrl) : undefined}
        loading={false}
        loadingLabel="Opening offer…"
        openPageHref={activeOffer?.clickUrl ? String(activeOffer.clickUrl) : undefined}
        emptyTitle="Offer unavailable"
        emptyDescription="This offer did not return a valid provider URL."
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation"
        onClose={() => setActiveOffer(null)}
        returnFocusRef={offerTriggerRef}
      />
      <EmbeddedOfferDialog
        open={Boolean(activeWall)}
        title={OFFER_WALLS.find((wall) => wall.id === activeWall)?.name || 'Offer wall'}
        subtitle="Secure provider page"
        logoUrl={OFFER_WALLS.find((wall) => wall.id === activeWall)?.logo || undefined}
        url={wallUrl || undefined}
        loading={wallUrlQuery.isFetching || (activeWall === OPINION_UNIVERSE_WALL_ID && !wallUrl)}
        loadingLabel="Loading offer wall…"
        openPageHref={activeWall ? `/offerwalls/${activeWall}` : undefined}
        emptyTitle="Provider unavailable"
        emptyDescription="This provider did not return a valid offerwall URL."
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation"
        onClose={() => { setActiveWall(null); setWallUrl(''); }}
        returnFocusRef={wallTriggerRef}
      />
      <PartnerDirectory
        sectionRef={partnerSectionRef}
        walls={rewardNetworkWalls}
        statuses={wallStatusQuery.data}
        onSelect={(wallId, trigger) => {
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
          wallTriggerRef.current = trigger ?? null;
          setWallUrl('');
          setActiveWall(wallId);
        }}
      />
      <PartnerDirectory
        walls={SURVEY_WALLS}
        statuses={wallStatusQuery.data}
        eyebrow="SURVEY NETWORK"
        title="Surveys. Your voice, rewarded."
        description="Choose a survey partner and turn your opinions into verified rewards."
        ariaLabel="Survey providers"
        onSelect={(wallId, trigger) => {
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
          wallTriggerRef.current = trigger ?? null;
          setWallUrl('');
          setActiveWall(wallId);
        }}
      />
      </div>

    </div>
  );
}
