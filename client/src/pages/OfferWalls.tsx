import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Grid2X2, Maximize2, Minimize2, Search, ShieldCheck, Smartphone, Sparkles, Star, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, LoadingRows, Surface } from '@/components/shared/RewardUI';

type OfferWall = {
  id: string;
  name: string;
  desc: string;
  reward: string;
  logo: string;
  tag: string;
  category?: string;
  rating: number;
  surface: string;
  border: string;
  logoSurface: string;
  accent: string;
  brandColor: string;
  track: string;
  gradient: string;
  badgeSurface: string;
};

const OFFER_WALLS: OfferWall[] = [
  { id: 'offerwallme', name: 'Offerwall.me', desc: 'Official rewarded offers & tasks', reward: '$0.10–$10.00', logo: "/assets/provider-logos/offerwallme.svg", tag: 'OFFICIAL', category: 'Tasks', rating: 4.9, surface: '#ffffff', border: "#00B8A9", logoSurface: "#06111D", accent: "#8BD450", brandColor: "#00B8A9", track: "#123F3D", gradient: "linear-gradient(90deg, #00B8A9, #8BD450)", badgeSurface: "#163F3A" },
  { id: 'gemiwall', name: 'GemiWall', desc: 'Premium survey & offer wall', reward: '$0.10–$5.00', logo: "/assets/provider-logos/gemiwall.png", tag: 'POPULAR', rating: 4.8, surface: '#ffffff', border: "#7A31F7", logoSurface: "#ffffff", accent: "#B256F7", brandColor: "#7A31F7", track: "#39204F", gradient: "linear-gradient(90deg, #7A31F7, #B256F7)", badgeSurface: "#2A1645" },
  { id: 'revtoo', name: 'Revtoo', desc: 'High-paying mobile offers', reward: '$0.25–$8.00', logo: "/assets/provider-logos/revtoo.svg", tag: 'HIGH PAY', category: 'Mobile', rating: 4.9, surface: '#ffffff', border: "#38B6FF", logoSurface: "#0B1420", accent: "#5CE1E6", brandColor: "#5CE1E6", track: "#123840", gradient: "linear-gradient(90deg, #5CE1E6, #00BF63, #38B6FF)", badgeSurface: "#143D45" },
  { id: 'moustache', name: 'Moustache Leads', desc: 'CPI & CPA offers worldwide', reward: '$0.50–$10.00', logo: "/assets/provider-logos/moustache.png", tag: 'PREMIUM', category: 'Apps', rating: 4.7, surface: '#ffffff', border: "#A23BD0", logoSurface: "#ffffff", accent: "#FCA824", brandColor: "#480060", track: "#3D1D42", gradient: "linear-gradient(90deg, #480060, #A23BD0, #FCA824)", badgeSurface: "#412040" },
  { id: 'taskwall', name: 'Taskwall', desc: 'Sign-up & engagement tasks', reward: '$0.15–$6.00', logo: "/assets/provider-logos/taskwall.svg", tag: 'SIGN-UPS', category: 'Tasks', rating: 4.6, surface: '#ffffff', border: "#059FFB", logoSurface: "#ffffff", accent: "#019EFC", brandColor: "#213244", track: "#123747", gradient: "linear-gradient(90deg, #019EFC, #059FFB)", badgeSurface: "#122C41" },
  { id: 'cointo', name: 'Cointo', desc: 'Crypto-focused offers', reward: '$0.20–$4.00', logo: "/assets/provider-logos/cointo.png", tag: 'CRYPTO', category: 'Apps', rating: 4.4, surface: '#ffffff', border: "#10B981", logoSurface: "#ffffff", accent: "#059669", brandColor: "#10B981", track: "#104537", gradient: "linear-gradient(90deg, #10B981, #059669)", badgeSurface: "#104738" },
  { id: 'klink', name: 'Klink Labs', desc: 'Finance & trading offers', reward: '$0.30–$7.00', logo: "/assets/provider-logos/klink.webp", tag: 'FINANCE', category: 'Apps', rating: 4.8, surface: '#ffffff', border: "#664DFF", logoSurface: "#ffffff", accent: "#9583FF", brandColor: "#664DFF", track: "#302768", gradient: "linear-gradient(90deg, #664DFF, #9583FF)", badgeSurface: "#282047" },
  { id: 'adswedmedia', name: 'AdsWedMedia', desc: 'CPA & incent offers worldwide', reward: '$0.10–$6.00', logo: "/assets/provider-logos/adswedmedia.png", tag: 'NEW', rating: 4.7, surface: '#ffffff', border: "#3B82F6", logoSurface: "#ffffff", accent: "#06B6D4", brandColor: "#3B82F6", track: "#173C59", gradient: "linear-gradient(90deg, #3B82F6, #06B6D4)", badgeSurface: "#173852" },
  { id: 'admaxflow', name: 'AdMaxFlow', desc: 'Surveys, apps & tasks worldwide', reward: '$0.10–$5.00', logo: "/assets/provider-logos/admaxflow.png", tag: 'NEW', category: 'Tasks', rating: 4.6, surface: '#ffffff', border: "#F97316", logoSurface: "#ffffff", accent: "#FCD34D", brandColor: "#F97316", track: "#49301D", gradient: "linear-gradient(90deg, #F97316, #FCD34D)", badgeSurface: "#4A2A17" },
  { id: 'gaintwall', name: 'Gaintwall', desc: 'Earn with surveys & tasks worldwide', reward: '$0.10–$6.00', logo: "/assets/provider-logos/gaintwall.svg", tag: 'NEW', rating: 4.7, surface: '#ffffff', border: "#E11D48", logoSurface: "#ffffff", accent: "#FBBF24", brandColor: "#E11D48", track: "#4A1C2B", gradient: "linear-gradient(90deg, #E11D48, #F43F5E, #FBBF24)", badgeSurface: "#491B2A" },
  { id: 'opinionuniverse', name: 'OpinionUniverse', desc: 'Surveys, apps & rewarded tasks', reward: '$0.10–$10.00', logo: "/assets/provider-logos/opinionuniverse.png", tag: 'NEW', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: "#FF5300", logoSurface: "#ffffff", accent: "#FF8C00", brandColor: "#FF5300", track: "#4B291C", gradient: "linear-gradient(90deg, #FF5300, #FF8C00)", badgeSurface: "#4B2817" },
  { id: 'buckswall', name: 'BucksWall', desc: 'Mobile apps, surveys & gaming offers', reward: '$0.10–$6.00', logo: "", tag: 'SETUP', category: 'Mobile', rating: 4.6, surface: '#ffffff', border: "#2563EB", logoSurface: "#ffffff", accent: "#0D9488", brandColor: "#2563EB", track: "#16384D", gradient: "linear-gradient(90deg, #2563EB, #0D9488)", badgeSurface: "#18344C" },
  { id: 'offermintx', name: 'OfferMintX', desc: 'Premium CPA offers worldwide', reward: '$0.10–$25.00', logo: "/assets/provider-logos/offermintx.png", tag: 'NEW', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: "#22C55E", logoSurface: "#ffffff", accent: "#16A34A", brandColor: "#22C55E", track: "#164633", gradient: "linear-gradient(90deg, #22C55E, #16A34A)", badgeSurface: "#174631" },
  { id: 'cpxresearch', name: 'CPX Research', desc: 'Paid surveys worldwide', reward: '$0.10–$5.00', logo: "/assets/provider-logos/cpxresearch.svg", tag: 'SURVEYS', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: "#00BE9D", logoSurface: "#ffffff", accent: "#00FF87", brandColor: "#00BE9D", track: "#11463C", gradient: "linear-gradient(90deg, #00BE9D, #00FF87)", badgeSurface: "#104236" },
  { id: 'theoremreach', name: 'TheoremReach', desc: 'Rewarded surveys worldwide', reward: '$0.10–$5.00', logo: "/assets/provider-logos/theoremreach.svg", tag: 'SURVEYS', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: "#9855FC", logoSurface: "#241D46", accent: "#E22B82", brandColor: "#241D46", track: "#30204C", gradient: "linear-gradient(90deg, #6A28C8, #6A34FC, #E22B82)", badgeSurface: "#322345" },
  { id: 'timewall', name: 'TimeWall', desc: 'Surveys, microtasks & paid offers', reward: '$0.10–$8.00', logo: "/assets/provider-logos/timewall.png", tag: 'SURVEYS', category: 'Tasks', rating: 4.8, surface: '#ffffff', border: "#00B4C6", logoSurface: "#ffffff", accent: "#4EB76E", brandColor: "#00B4C6", track: "#124345", gradient: "linear-gradient(90deg, #00B4C6, #4EB76E)", badgeSurface: "#154239" },
  { id: 'pocketsfull', name: 'PocketFull', desc: 'Rewarded surveys worldwide', reward: '$0.10–$5.00', logo: "/assets/provider-logos/pocketsfull.ico", tag: 'SURVEYS', category: 'Tasks', rating: 4.7, surface: '#ffffff', border: "#9829EF", logoSurface: "#ffffff", accent: "#FC4504", brandColor: "#9829EF", track: "#382249", gradient: "linear-gradient(90deg, #9829EF, #FC4504)", badgeSurface: "#352140" },
];

// OfferMintX starts offer links in a new browsing context. Keeping it outside the
// embedded iframe avoids sandboxed-popup restrictions on provider redirects.
const NEW_TAB_WALL_IDS = new Set(['admaxflow', 'gaintwall', 'offermintx', 'timewall', 'pocketsfull']);
const OPINION_UNIVERSE_WALL_ID = 'opinionuniverse';
const OPINION_UNIVERSE_URL = 'https://opinionuniverse.com/offerwall?pubId=4078&appId=ID_95cdecb90aad77eaa007a2a89e6661d9';

const categories = [
  { label: 'All', icon: Grid2X2 },
  { label: 'Tasks', icon: Zap },
  { label: 'Mobile', icon: Smartphone },
  { label: 'Apps', icon: Sparkles },
];

export default function OfferWalls() {
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const [wallUrl, setWallUrl] = useState('');
  const [isWallFullscreen, setIsWallFullscreen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offerWallWindowRef = useRef<Window | null>(null);
  const wallStatusQuery = trpc.user.getOfferWallStatuses.useQuery(undefined, { enabled: Boolean(user?.id) && !loading, retry: false, refetchOnWindowFocus: false });
  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery({ wall: activeWall || '' }, { enabled: Boolean(activeWall && activeWall !== OPINION_UNIVERSE_WALL_ID && user?.id) && !loading, retry: false, refetchOnWindowFocus: false });

  useEffect(() => { if (!loading && !user) navigate('/login'); }, [user, loading, navigate]);
  useEffect(() => {
    if (activeWall === OPINION_UNIVERSE_WALL_ID) {
      const sid = String(user?.username || user?.name || user?.id || '').trim();
      setWallUrl(sid ? `${OPINION_UNIVERSE_URL}&SID=${encodeURIComponent(sid)}` : '');
      return;
    }
    const url = wallUrlQuery.data?.url;
    if (!url) return;
    if (NEW_TAB_WALL_IDS.has(activeWall ?? '')) {
      const offerWallWindow = offerWallWindowRef.current;
      if (offerWallWindow && !offerWallWindow.closed) {
        offerWallWindow.location.replace(url);
        offerWallWindowRef.current = null;
      }
      return;
    }
    setWallUrl(url);
  }, [activeWall, user?.id, user?.name, user?.username, wallUrlQuery.data]);
  useEffect(() => {
    if (!wallUrlQuery.error) return;
    if (NEW_TAB_WALL_IDS.has(activeWall ?? '') && offerWallWindowRef.current && !offerWallWindowRef.current.closed) {
      offerWallWindowRef.current.close();
      offerWallWindowRef.current = null;
    }
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
    if (NEW_TAB_WALL_IDS.has(wallId)) {
      const offerWallWindow = window.open('', '_blank');
      if (!offerWallWindow) {
        toast.error('Please allow pop-ups to open this offer wall in a new tab.');
        return;
      }
      offerWallWindow.opener = null;
      offerWallWindowRef.current = offerWallWindow;
    }
    setWallUrl('');
    setIsWallFullscreen(false);
    setActiveWall(wallId);
  };
  const closeWall = useCallback(() => {
    if (offerWallWindowRef.current && !offerWallWindowRef.current.closed) offerWallWindowRef.current.close();
    offerWallWindowRef.current = null;
    refreshProfile();
    setTimeout(() => refreshProfile(), 1000);
    setActiveWall(null);
    setWallUrl('');
    setIsWallFullscreen(false);
  }, [refreshProfile]);
  const activeName = OFFER_WALLS.find((wall) => wall.id === activeWall)?.name;

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div className="unified-page mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(({ label, icon: Icon }) => <button key={label} onClick={() => setCategory(label)} className={`focus-ring inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${category === label ? 'border-primary/35 bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div><label className="relative block w-full lg:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search providers" className="focus-ring h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/40" /></label></div>
      <Surface className="offers-partners-panel p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 text-emerald-400" /><h2 className="text-sm font-semibold tracking-wide text-foreground">Offers Partners</h2><button type="button" title="Select a provider to open its offerwall" aria-label="About offer partners" className="grid h-4 w-4 place-items-center rounded-full border border-muted-foreground/40 text-[10px] font-bold text-muted-foreground">?</button></div><button type="button" onClick={() => setCategory('All')} className="offers-partners-viewall rounded-lg px-3 py-1.5 text-[10px] font-semibold transition">View All</button></div><div className="mt-5">{wallStatusQuery.isLoading ? <LoadingRows count={6} /> : visibleWalls.length ? <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">{visibleWalls.map((wall, index) => { const status = wallStatusQuery.data?.find((item) => item.provider === wall.id); const configured = status?.configured !== false; return <motion.button type="button" key={wall.id} aria-label={`${wall.name}. ${wall.desc}. Rating ${wall.rating} out of 5. Earn ${wall.reward}. ${configured ? 'Available' : 'Setup required'}`} title={`${wall.name} · ${wall.desc} · Earn ${wall.reward}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .025 }} onClick={() => openWall(wall.id)} disabled={!configured} className={`group w-full text-left ${!configured ? 'cursor-not-allowed opacity-65' : ''}`}><div className="provider-card relative flex aspect-[1.76/1] min-h-[144px] w-full flex-col items-center overflow-hidden rounded-[15px] border p-3 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl" style={{ borderColor: wall.border, '--provider-accent': wall.accent, '--provider-brand': wall.border } as CSSProperties}><span className="provider-border-side provider-border-top" aria-hidden="true" /><span className="provider-border-side provider-border-right" aria-hidden="true" /><span className="provider-border-side provider-border-bottom" aria-hidden="true" /><span className="provider-border-side provider-border-left" aria-hidden="true" /><span className="provider-badge absolute right-2.5 top-2.5 z-[4] rounded-md px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide shadow-sm" style={{ '--provider-badge': wall.accent } as CSSProperties}>{wall.tag}</span><div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center pt-2"><div className={`mb-2 flex h-10 w-full max-w-[148px] items-center justify-center ${wall.id === 'revtoo' ? 'provider-revtoo-logo rounded-md px-3 py-1' : ''}`}>{wall.logo ? <img src={wall.logo} alt={`${wall.name} official logo`} loading="lazy" decoding="async" width="148" height="40" className="max-h-full max-w-full object-contain" onError={(event) => { (event.currentTarget as HTMLImageElement).style.display = 'none'; }} /> : <span className="provider-logo-fallback text-xl font-black" style={{ color: wall.brandColor }}>{wall.name.slice(0, 1)}</span>}</div><h3 className="provider-card-title max-w-full truncate text-[12px] font-semibold drop-shadow-sm">{wall.name}</h3><div className="provider-card-stars mt-1 flex items-center justify-center gap-0.5 drop-shadow-sm" aria-label={`Rating ${wall.rating} out of 5`} title={`${wall.rating} / 5`}>{Array.from({ length: 5 }, (_, starIndex) => <Star key={starIndex} className="h-2.5 w-2.5 fill-current" aria-hidden="true" />)}<span className="sr-only">{wall.rating} out of 5</span></div></div><p className="provider-card-description absolute bottom-1.5 left-2 right-2 z-[4] truncate text-[8px] font-medium uppercase tracking-[.08em] drop-shadow-sm">{wall.desc}</p></div></motion.button>; })}</div> : <EmptyState title="No matching providers" description="Try another category or search term to find an available provider." icon={Search} />}</div></Surface>
      <div className="grid gap-4 md:grid-cols-3">{[{ icon: CheckCircle2, title: 'Clear tracking', text: 'Your balance refreshes after provider callbacks are received.' }, { icon: ShieldCheck, title: 'Built for trust', text: 'Provider status is checked before the offerwall opens.' }, { icon: Sparkles, title: 'Made for momentum', text: 'Pick a small task and keep your earning streak moving.' }].map(({ icon: Icon, title, text }) => <div key={title} className="rv-surface-soft p-5 transition hover:border-primary/20"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p></div>)}</div>
      <AnimatePresence>{activeWall && !NEW_TAB_WALL_IDS.has(activeWall) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm sm:p-6 lg:p-10 ${isWallFullscreen ? 'p-0' : ''}`} onClick={(event) => { if (event.target === event.currentTarget) closeWall(); }}><motion.div initial={{ scale: .97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .97, y: 8 }} transition={{ duration: .18 }} className={`flex h-[78vh] w-[50vw] max-w-[1180px] min-h-0 flex-col overflow-hidden rounded-2xl border border-green-500/20 bg-background shadow-2xl shadow-slate-950/40 ${isWallFullscreen ? 'h-screen w-screen max-w-none rounded-none border-0' : 'max-sm:h-[86vh] max-sm:w-full'}`}><div className="flex min-h-16 shrink-0 items-center gap-3 border-b border-green-500/15 bg-background/95 px-4 py-3 backdrop-blur-md sm:px-5"><div className="flex min-w-0 items-center gap-3"><div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-green-500/20 bg-green-500/10 p-1">{OFFER_WALLS.find(w => w.id === activeWall)?.logo ? <img src={OFFER_WALLS.find(w => w.id === activeWall)?.logo} alt="" className="h-full w-full object-contain" /> : <span className="grid h-full w-full place-items-center text-sm font-bold text-primary">{activeName?.slice(0, 1)}</span>}</div><span className="truncate text-sm font-bold text-gradient sm:text-base">{activeName}</span></div><div className="ml-auto flex shrink-0 items-center gap-1.5"><button type="button" onClick={() => setIsWallFullscreen(value => !value)} className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-primary">{isWallFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}<span className="hidden sm:inline">{isWallFullscreen ? 'EXIT FULL SCREEN' : 'OPEN FULL SCREEN'}</span></button><button type="button" onClick={closeWall} className="focus-ring rounded-xl p-2 text-muted-foreground transition hover:bg-red-50 hover:text-destructive" aria-label="Close offerwall"><X className="h-5 w-5" /></button></div></div><div className="min-h-0 flex-1 overflow-auto bg-white">{wallUrlQuery.isFetching ? <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />Loading offer wall…</div> : wallUrl ? <iframe src={wallUrl} className="block h-full min-h-full w-full border-0 bg-white" title={`${activeName} offer wall`} sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation" /> : <div className="flex h-full items-center justify-center"><EmptyState title="Provider unavailable" description="This provider is not configured yet. Please choose another offerwall or contact support." icon={Zap} /></div>}</div></motion.div></motion.div>}</AnimatePresence>
    </div>
  );
}
