import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, Grid2X2, Search, ShieldCheck, Smartphone, Sparkles, Star, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { useSSE } from '@/hooks/useSSE';
import { playBellSound } from '@/utils/bellSound';
import { EmptyState, LoadingRows, SectionHeading, Surface } from '@/components/shared/RewardUI';

const OFFER_WALLS = [
  { id: 'gemiwall', name: 'Gemiwall', desc: 'Premium survey & offer wall', reward: '$0.10–$5.00', logo: 'https://gemiwall.com/favicon.ico', tag: 'POPULAR', rating: 4.8 },
  { id: 'revtoo', name: 'Revtoo', desc: 'High-paying mobile offers', reward: '$0.25–$8.00', logo: 'https://revtoo.com/assets/offerwall/images/revtoo-dark.svg', tag: 'HIGH PAY', category: 'Mobile', rating: 4.9 },
  { id: 'clickwall', name: 'Clickwall', desc: 'Quick tasks & downloads', reward: '$0.10–$3.00', logo: 'https://www.google.com/s2/favicons?domain=clickwall.com&sz=128', tag: 'EASY', category: 'Tasks', rating: 4.5 },
  { id: 'moustache', name: 'MoustacheLeads', desc: 'CPI & CPA offers worldwide', reward: '$0.50–$10.00', logo: 'https://moustacheleads.com/logo.png', tag: 'PREMIUM', category: 'Apps', rating: 4.7 },
  { id: 'taskwall', name: 'Taskwall', desc: 'Sign-up & engagement tasks', reward: '$0.15–$6.00', logo: 'https://taskwall.io/taskwall_theme/assets/images/logo/logo.svg', tag: 'SIGN-UPS', category: 'Tasks', rating: 4.6 },
  { id: 'cointo', name: 'CoinToMedia', desc: 'Crypto-focused offers', reward: '$0.20–$4.00', logo: 'https://cointomedia.com/asset/images/iframe-logo.webp', tag: 'CRYPTO', category: 'Apps', rating: 4.4 },
  { id: 'klink', name: 'Klink Finance', desc: 'Finance & trading offers', reward: '$0.30–$7.00', logo: 'https://assets.klink.finance/CDN/opengraph.jpg', tag: 'FINANCE', category: 'Apps', rating: 4.8 },
  { id: 'adswedmedia', name: 'AdsWedMedia', desc: 'CPA & incent offers worldwide', reward: '$0.10–$6.00', logo: 'https://adswedmedia.com/asset/storage/photos/logo-img.png', tag: 'NEW', rating: 4.7 },
  { id: 'admaxflow', name: 'AdMaxFlow', desc: 'Surveys, apps & tasks worldwide', reward: '$0.10–$5.00', logo: 'https://www.google.com/s2/favicons?domain=www.admaxflow.com&sz=128', tag: 'NEW', category: 'Tasks', rating: 4.6 },
  { id: 'gaintwall', name: 'Gaintwall', desc: 'Earn with surveys & tasks worldwide', reward: '$0.10–$6.00', logo: 'https://www.google.com/s2/favicons?domain=gaintwall.com&sz=128', tag: 'NEW', rating: 4.7 },
  { id: 'buckswall', name: 'BucksWall', desc: 'Mobile apps, surveys & gaming offers', reward: '$0.10–$6.00', logo: 'https://www.google.com/s2/favicons?domain=buckswall.com&sz=128', tag: 'SETUP', category: 'Mobile', rating: 4.6 },
];
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
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [previousBalance, setPreviousBalance] = useState<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wallStatusQuery = trpc.user.getOfferWallStatuses.useQuery(undefined, { enabled: Boolean(user?.id) && !loading, retry: false, refetchOnWindowFocus: false });
  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery({ wall: activeWall || '' }, { enabled: Boolean(activeWall && user?.id) && !loading, retry: false, refetchOnWindowFocus: false });

  useEffect(() => { if (!loading && !user) navigate('/login'); }, [user, loading, navigate]);
  useEffect(() => { if (wallUrlQuery.data?.url) setWallUrl(wallUrlQuery.data.url); }, [wallUrlQuery.data]);
  useEffect(() => { if (!wallUrlQuery.error) return; setWallUrl(''); toast.error(wallUrlQuery.error.message || 'This offer wall is not available yet.'); setActiveWall(null); }, [wallUrlQuery.error]);
  useEffect(() => {
    if (!user?.balance) return;
    const current = parseFloat(String(user.balance));
    const previous = previousBalance ? parseFloat(previousBalance) : current;
    if (current > previous) { playBellSound().catch(() => {}); toast.success(`Balance updated +$${(current - previous).toFixed(2)}`); }
    setPreviousBalance(String(user.balance));
  }, [user?.balance]);
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
  useSSE({
    onPostback: async (event) => { await playBellSound().catch(() => {}); toast.success(`+$${event.amount.toFixed(2)} from ${event.provider}${event.offerName ? ` — ${event.offerName}` : ''}`, { duration: 6000 }); refreshProfile(); setTimeout(() => refreshProfile(), 1500); },
    onBalanceUpdate: () => refreshProfile(),
  });

  const visibleWalls = useMemo(() => OFFER_WALLS.filter((wall) => (category === 'All' || wall.category === category) && `${wall.name} ${wall.desc} ${wall.tag}`.toLowerCase().includes(search.toLowerCase())), [category, search]);
  const openWall = (wallId: string) => {
    if (loading) return;
    if (!user) { toast.info('Please sign in before opening an offer wall.'); navigate('/login', { state: { from: '/offerwalls' } }); return; }
    const status = wallStatusQuery.data?.find((item) => item.provider === wallId);
    if (status && !status.configured) { toast.info('This offer wall is not configured yet. Please contact support.'); return; }
    setWallUrl(''); setActiveWall(wallId);
  };
  const closeWall = useCallback(() => { refreshProfile(); setTimeout(() => refreshProfile(), 1000); setActiveWall(null); setWallUrl(''); }, [refreshProfile]);
  const activeName = OFFER_WALLS.find((wall) => wall.id === activeWall)?.name;

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="earn-hero relative overflow-hidden rounded-[1.1rem] border border-primary/20 p-6 sm:p-8"><div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="rv-eyebrow">The earn center</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.05em] text-white">Choose your next <span className="text-primary">opportunity.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Compare verified providers, open a live offerwall and track rewards directly in your balance.</p></div><div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3"><p className="text-xs text-slate-400">Available providers</p><p className="mt-1 font-display text-2xl font-semibold text-white">{OFFER_WALLS.length}</p></div></div></section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(({ label, icon: Icon }) => <button key={label} onClick={() => setCategory(label)} className={`focus-ring inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${category === label ? 'border-primary/25 bg-primary/12 text-primary' : 'border-white/8 bg-white/3 text-muted-foreground hover:bg-white/7 hover:text-foreground'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div><label className="relative block w-full lg:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search providers" className="focus-ring h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/40" /></label></div>
      <Surface className="p-5 sm:p-6"><SectionHeading eyebrow="Live provider catalog" title="Find your best fit" description="All provider cards connect to the existing configured offerwall flow." /><div className="mt-6">{wallStatusQuery.isLoading ? <LoadingRows count={6} /> : visibleWalls.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleWalls.map((wall, index) => { const status = wallStatusQuery.data?.find((item) => item.provider === wall.id); const configured = status?.configured !== false; return <motion.button type="button" key={wall.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .025 }} onClick={() => openWall(wall.id)} disabled={!configured} className={`group text-left ${!configured ? 'cursor-not-allowed opacity-65' : ''}`}><div className="h-full rounded-xl border border-white/8 bg-[#0f1b1a] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[.06]"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[.06] p-2"><img src={wall.logo} alt="" className="h-full w-full object-contain" onError={(event) => { (event.currentTarget as HTMLImageElement).style.display = 'none'; }} /></div><div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{wall.name}</h3><span className="rounded-full bg-white/7 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{wall.tag}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{wall.desc}</p></div></div><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary" /></div><div className="mt-5 flex items-center justify-between border-t border-white/8 pt-3"><div className="flex items-center gap-3"><span className="flex items-center gap-1 text-xs text-amber-300"><Star className="h-3 w-3 fill-current" /> {wall.rating}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" /> 5–20 min</span></div><span className="text-xs font-semibold text-primary">{configured ? `Earn ${wall.reward}` : 'Setup required'}</span></div></div></motion.button>; })}</div> : <EmptyState title="No matching providers" description="Try another category or search term to find an available provider." icon={Search} />}</div></Surface>
      <div className="grid gap-4 md:grid-cols-3">{[{ icon: CheckCircle2, title: 'Clear tracking', text: 'Your balance refreshes after provider callbacks are received.' }, { icon: ShieldCheck, title: 'Built for trust', text: 'Provider status is checked before the offerwall opens.' }, { icon: Sparkles, title: 'Made for momentum', text: 'Pick a small task and keep your earning streak moving.' }].map(({ icon: Icon, title, text }) => <div key={title} className="rv-surface-soft p-5 transition hover:border-primary/20"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p></div>)}</div>
      <AnimatePresence>{activeWall && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col bg-[#101a29]"><div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#111d2c]/95 px-4 backdrop-blur-xl sm:px-6"><div className="flex min-w-0 items-center gap-3"><button onClick={closeWall} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/6 hover:text-foreground"><ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span></button><div className="min-w-0"><p className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">Live offerwall</p><p className="truncate text-sm font-semibold text-foreground">{activeName}</p></div></div><button onClick={closeWall} className="focus-ring rounded-xl p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive" aria-label="Close offerwall"><X className="h-5 w-5" /></button></div>{wallUrlQuery.isFetching ? <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />Loading offer wall…</div> : wallUrl ? <iframe src={wallUrl} className="h-full w-full flex-1 border-0 bg-white" title={`${activeName} offer wall`} sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation" /> : <div className="flex flex-1 items-center justify-center"><EmptyState title="Provider unavailable" description="This provider is not configured yet. Please choose another offerwall or contact support." icon={Zap} /></div>}</motion.div>}</AnimatePresence>
    </div>
  );
}
