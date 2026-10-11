import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Grid2X2, Search, ShieldCheck, Smartphone, Sparkles, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, LoadingRows, Surface } from '@/components/shared/RewardUI';
import { EmbeddedOfferDialog } from '@/components/dashboard/EmbeddedOfferDialog';
import { NEW_TAB_WALL_IDS, OFFER_WALLS, OPINION_UNIVERSE_URL, OPINION_UNIVERSE_WALL_ID } from '@/lib/offerwallCatalog';
export { NEW_TAB_WALL_IDS, OFFER_WALLS, OPINION_UNIVERSE_URL, OPINION_UNIVERSE_WALL_ID } from '@/lib/offerwallCatalog';

const categories = [
  { label: 'All', icon: Grid2X2 },
  { label: 'Tasks', icon: Zap },
  { label: 'Mobile', icon: Smartphone },
  { label: 'Apps', icon: Sparkles },
];

export default function OfferWalls() {
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const [wallUrl, setWallUrl] = useState('');
  const wallTriggerRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wallStatusQuery = trpc.user.getOfferWallStatuses.useQuery(undefined, { enabled: Boolean(user?.id) && !loading, retry: false, refetchOnWindowFocus: false });
  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery({ wall: activeWall || '' }, { enabled: Boolean(activeWall && activeWall !== OPINION_UNIVERSE_WALL_ID && user?.id) && !loading, retry: false, refetchOnWindowFocus: false });

  useEffect(() => {
    // Warm up DNS/TLS while the earn-center is visible. This is especially
    // useful for Cointo, whose origin has a slower first connection.
    const links = ['dns-prefetch', 'preconnect'].map((rel) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = 'https://cointomedia.com';
      if (rel === 'preconnect') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach((link) => link.remove());
  }, []);

  useEffect(() => { if (!loading && !user) navigate('/login'); }, [user, loading, navigate]);
  useEffect(() => {
    if (activeWall === OPINION_UNIVERSE_WALL_ID) {
      const sid = String(user?.username || user?.name || user?.id || '').trim();
      setWallUrl(sid ? `${OPINION_UNIVERSE_URL}&SID=${encodeURIComponent(sid)}` : '');
      return;
    }
    const url = wallUrlQuery.data?.url;
    if (!url) return;
    setWallUrl(url);
  }, [activeWall, user?.id, user?.name, user?.username, wallUrlQuery.data]);
  useEffect(() => {
    if (!wallUrlQuery.error) return;
    setWallUrl('');
    toast.error(wallUrlQuery.error.message || 'This offer wall is not available yet.');
    setActiveWall(null);
  }, [activeWall, wallUrlQuery.error]);

  useEffect(() => {
    if (!activeWall) return;
    pollingIntervalRef.current = setInterval(() => refreshProfile(), 15000);
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); pollingIntervalRef.current = null; };
  }, [activeWall, refreshProfile]);
  useEffect(() => {
    const onVisibility = () => { if (!document.hidden && activeWall) refreshProfile(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [activeWall, refreshProfile]);
  const visibleWalls = useMemo(() => OFFER_WALLS.filter((wall) => (category === 'All' || wall.category === category) && `${wall.name} ${wall.desc} ${wall.tag}`.toLowerCase().includes(search.toLowerCase())), [category, search]);
  const openWall = (wallId: string) => {
    if (loading) return;
    if (!user) { toast.info('Please sign in before opening an offer wall.'); navigate('/login', { state: { from: '/offerwalls' } }); return; }
    const status = wallStatusQuery.data?.find((item) => item.provider === wallId);
    if (status && !status.configured) { toast.info('This offer wall is not configured yet. Please contact support.'); return; }
    if (NEW_TAB_WALL_IDS.has(wallId)) { navigate(`/offerwalls/${wallId}`); return; }
    wallTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setWallUrl('');
    setActiveWall(wallId);
  };
  const prefetchWall = (wallId: string) => {
    if (wallId === 'cointo' && user?.id) void utils.user.getOfferWallUrl.prefetch({ wall: wallId });
  };
  const closeWall = useCallback(() => {
    refreshProfile();
    setTimeout(() => refreshProfile(), 1000);
    setActiveWall(null);
    setWallUrl('');
  }, [refreshProfile]);
  const activeName = OFFER_WALLS.find((wall) => wall.id === activeWall)?.name;

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div className="unified-page w-full space-y-6 px-3 py-4 sm:px-5 lg:px-7 xl:px-9 lg:py-8">
      <section className="earn-center-hero relative overflow-hidden rounded-[1.25rem] border p-6 shadow-sm sm:p-8">
        <div className="earn-center-aurora" aria-hidden="true" />
        <div className="earn-center-grid" aria-hidden="true" />
        <div className="relative z-[1] flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="earn-center-kicker"><Sparkles className="h-3 w-3" /> The Earn Center</span>
              <span className="earn-center-live"><span className="earn-center-live-dot" /> Live partners</span>
            </div>
            <h1 className="earn-center-title font-display text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Choose your next <span>opportunity.</span></h1>
            <p className="earn-center-description mt-3 max-w-2xl text-sm leading-6">Compare verified providers, open a live offerwall and track rewards directly in your balance.</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              <span className="earn-center-proof"><ShieldCheck className="h-3.5 w-3.5" /> Provider status checked before opening</span>
              <span className="earn-center-proof"><CheckCircle2 className="h-3.5 w-3.5" /> Rewards follow verified callbacks</span>
            </div>
          </div>
          <aside className="earn-center-count shrink-0" aria-label={`${OFFER_WALLS.length} available providers`}>
            <div className="earn-center-count-label"><span className="earn-center-count-icon"><Sparkles className="h-3.5 w-3.5" /></span> Available providers</div>
            <div className="earn-center-count-value">{OFFER_WALLS.length}<span>partners</span></div>
            <div className="earn-center-count-foot"><span className="earn-center-live-dot" /> Browse the catalog below</div>
          </aside>
        </div>
      </section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div role="group" aria-label="Filter providers by category" className="flex gap-2 overflow-x-auto pb-1">{categories.map(({ label, icon: Icon }) => <button key={label} type="button" aria-pressed={category === label} onClick={() => setCategory(label)} className={`focus-ring inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${category === label ? 'border-primary/35 bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div><label className="relative block w-full lg:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input aria-label="Search offerwall providers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search providers" className="focus-ring h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/40" /></label></div>
      <Surface className="offers-partners-panel p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 text-emerald-400" /><h2 className="text-sm font-semibold tracking-wide text-foreground">Offers Partners</h2><button type="button" onClick={() => toast.info('Select a provider card to open its offerwall.')} title="Select a provider to open its offerwall" aria-label="About offer partners" className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-muted-foreground/40 text-[11px] font-bold text-muted-foreground transition hover:border-primary/50 hover:text-primary">?</button></div><button type="button" onClick={() => setCategory('All')} className="offers-partners-viewall rounded-lg px-3 py-1.5 text-[10px] font-semibold transition">View All</button></div><div className="mt-5">{wallStatusQuery.isLoading ? <LoadingRows count={6} /> : visibleWalls.length ? <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">{visibleWalls.map((wall, index) => { const status = wallStatusQuery.data?.find((item) => item.provider === wall.id); const configured = status?.configured !== false; return <motion.button type="button" key={wall.id} aria-label={`${wall.name}. ${wall.desc}. Rating ${wall.rating} out of 5. Earn ${wall.reward}. ${configured ? 'Available' : 'Setup required'}`} title={`${wall.name} · ${wall.desc} · Earn ${wall.reward}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .025 }} onClick={() => openWall(wall.id)} onMouseEnter={() => prefetchWall(wall.id)} disabled={!configured} className={`group w-full text-left ${!configured ? 'cursor-not-allowed opacity-65' : ''}`}><div className="provider-card relative flex aspect-[1.76/1] min-h-[144px] w-full flex-col items-center overflow-hidden rounded-[15px] border p-3 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl" style={{ borderColor: wall.border, '--provider-accent': wall.accent, '--provider-brand': wall.border } as CSSProperties}><span className="provider-border-side provider-border-top" aria-hidden="true" /><span className="provider-border-side provider-border-right" aria-hidden="true" /><span className="provider-border-side provider-border-bottom" aria-hidden="true" /><span className="provider-border-side provider-border-left" aria-hidden="true" /><span className="provider-badge absolute right-2.5 top-2.5 z-[4] rounded-md px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide shadow-sm" style={{ '--provider-badge': wall.accent } as CSSProperties}>{wall.tag}</span><div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center pt-2"><div className={`mb-2 flex h-10 w-full max-w-[148px] items-center justify-center ${wall.id === 'revtoo' ? 'provider-revtoo-logo rounded-md px-3 py-1' : ''}`}>{wall.logo ? <img src={wall.logo} alt={`${wall.name} official logo`} loading="lazy" decoding="async" width="148" height="40" className="max-h-full max-w-full object-contain" onError={(event) => { (event.currentTarget as HTMLImageElement).style.display = 'none'; }} /> : <span className="provider-logo-fallback text-xl font-black" style={{ color: wall.brandColor }}>{wall.name.slice(0, 1)}</span>}</div><h3 className="provider-card-title max-w-full truncate text-[12px] font-semibold drop-shadow-sm">{wall.name}</h3><div className="provider-card-stars mt-1 flex items-center justify-center gap-0.5 drop-shadow-sm" aria-label={`Rating ${wall.rating} out of 5`} title={`${wall.rating} / 5`}>{Array.from({ length: 5 }, (_, starIndex) => <Star key={starIndex} className="h-2.5 w-2.5 fill-current" aria-hidden="true" />)}<span className="sr-only">{wall.rating} out of 5</span></div></div><p className="provider-card-description absolute bottom-1.5 left-2 right-2 z-[4] truncate text-[8px] font-medium uppercase tracking-[.08em] drop-shadow-sm">{wall.desc}</p></div></motion.button>; })}</div> : <EmptyState title="No matching providers" description="Try another category or search term to find an available provider." icon={Search} />}</div></Surface>
      <div className="grid gap-4 md:grid-cols-3">{[{ icon: CheckCircle2, title: 'Clear tracking', text: 'Your balance refreshes after provider callbacks are received.' }, { icon: ShieldCheck, title: 'Built for trust', text: 'Provider status is checked before the offerwall opens.' }, { icon: Sparkles, title: 'Made for momentum', text: 'Pick a small task and keep your earning streak moving.' }].map(({ icon: Icon, title, text }) => <div key={title} className="rv-surface-soft p-5 transition hover:border-primary/20"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p></div>)}</div>
      <EmbeddedOfferDialog
        open={Boolean(activeWall && !NEW_TAB_WALL_IDS.has(activeWall))}
        title={activeName || 'Offer wall'}
        subtitle="Secure provider page"
        logoUrl={OFFER_WALLS.find((wall) => wall.id === activeWall)?.logo || undefined}
        url={wallUrl || undefined}
        loading={wallUrlQuery.isFetching || (activeWall === OPINION_UNIVERSE_WALL_ID && !wallUrl)}
        loadingLabel={activeName ? `Loading ${activeName}…` : 'Loading offer wall…'}
        openPageHref={activeWall ? `/offerwalls/${activeWall}` : undefined}
        emptyTitle="Provider unavailable"
        emptyDescription="This provider is not configured yet. Please choose another offerwall or contact support."
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation"
        onClose={closeWall}
        returnFocusRef={wallTriggerRef}
      />
    </div>
  );
}
