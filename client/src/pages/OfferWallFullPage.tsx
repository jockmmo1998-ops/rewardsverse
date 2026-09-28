import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/shared/RewardUI';
import { NEW_TAB_WALL_IDS, OFFER_WALLS, OPINION_UNIVERSE_URL, OPINION_UNIVERSE_WALL_ID } from './OfferWalls';

export default function OfferWallPage() {
  const { wallId = '' } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const [wallUrl, setWallUrl] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const wall = useMemo(() => OFFER_WALLS.find((item) => item.id === wallId), [wallId]);
  const wallStatusQuery = trpc.user.getOfferWallStatuses.useQuery(undefined, { enabled: Boolean(user?.id) && !authLoading, retry: false, refetchOnWindowFocus: false });
  const wallUrlQuery = trpc.user.getOfferWallUrl.useQuery({ wall: wallId }, { enabled: Boolean(user?.id && wallId && wallId !== OPINION_UNIVERSE_WALL_ID) && !authLoading, retry: false, refetchOnWindowFocus: false });

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: `/offerwalls/${wallId}` }, replace: true });
  }, [authLoading, user, navigate, wallId]);

  useEffect(() => {
    if (!wall) return;
    if (wallId === OPINION_UNIVERSE_WALL_ID) {
      const sid = String(user?.username || user?.name || user?.id || '').trim();
      setWallUrl(sid ? `${OPINION_UNIVERSE_URL}&SID=${encodeURIComponent(sid)}` : '');
      return;
    }
    if (wallUrlQuery.data?.url) setWallUrl(wallUrlQuery.data.url);
  }, [wall, wallId, user?.id, user?.name, user?.username, wallUrlQuery.data?.url]);

  useEffect(() => {
    if (wallUrlQuery.error) toast.error(wallUrlQuery.error.message || 'This offer wall is not available yet.');
  }, [wallUrlQuery.error]);

  useEffect(() => {
    if (!user || !wall) return;
    const interval = window.setInterval(() => refreshProfile(), 15000);
    const onVisibility = () => { if (!document.hidden) refreshProfile(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisibility); };
  }, [user, wall, refreshProfile]);

  useEffect(() => {
    if (!wallUrl || !NEW_TAB_WALL_IDS.has(wallId) || redirecting) return;
    setRedirecting(true);
    window.location.replace(wallUrl);
  }, [wallUrl, wallId, redirecting]);

  const configured = wallStatusQuery.data?.find((item) => item.provider === wallId)?.configured !== false;
  const loading = authLoading || wallStatusQuery.isLoading || wallUrlQuery.isFetching || (wallId === OPINION_UNIVERSE_WALL_ID && !wallUrl);

  if (!wall) {
    return <div className="flex min-h-screen items-center justify-center bg-background p-6"><EmptyState title="Offerwall not found" description="This provider page does not exist." icon={Zap} action={<button type="button" onClick={() => navigate('/offerwalls')} className="font-semibold text-primary">Back to offerwalls</button>} /></div>;
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex min-h-16 shrink-0 items-center gap-3 border-b border-green-500/15 bg-background/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
        <button type="button" onClick={() => navigate('/offerwalls')} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to offerwalls</span></button>
        <div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-green-500/20 bg-green-500/10 p-1">{wall.logo ? <img src={wall.logo} alt="" className="h-full w-full object-contain" /> : <span className="text-sm font-bold text-primary">{wall.name.slice(0, 1)}</span>}</div><div className="min-w-0"><h1 className="truncate text-sm font-bold text-foreground sm:text-base">{wall.name}</h1><p className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex"><ShieldCheck className="h-3 w-3 text-emerald-400" /> Secure provider page</p></div></div>
        <div className="ml-auto flex items-center gap-2"><span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary md:inline-flex"><Sparkles className="h-3 w-3" /> Full offerwall view</span><button type="button" onClick={() => navigate('/offerwalls')} className="focus-ring rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close offerwall"><X className="h-5 w-5" /></button></div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        {!configured ? <div className="flex h-full min-h-[70vh] items-center justify-center bg-background"><EmptyState title="Provider unavailable" description="This offerwall is not configured yet. Please choose another provider or contact support." icon={Zap} action={<button type="button" onClick={() => navigate('/offerwalls')} className="font-semibold text-primary">Back to offerwalls</button>} /></div> : loading ? <div className="flex h-full min-h-[70vh] flex-col items-center justify-center gap-3 bg-background text-sm text-muted-foreground"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />Loading {wall.name}…</div> : redirecting ? <div className="flex h-full min-h-[70vh] flex-col items-center justify-center gap-3 bg-background text-sm text-muted-foreground"><ExternalLink className="h-7 w-7 text-primary" />Opening {wall.name}…</div> : wallUrl ? <iframe src={wallUrl} className="block h-full min-h-[calc(100vh-4rem)] w-full border-0 bg-white" title={`${wall.name} offer wall`} sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation allow-top-navigation-by-user-activation" /> : <div className="flex h-full min-h-[70vh] items-center justify-center bg-background"><EmptyState title="Provider unavailable" description="The provider did not return a valid offerwall URL." icon={Zap} action={<button type="button" onClick={() => navigate('/offerwalls')} className="font-semibold text-primary">Back to offerwalls</button>} /></div>}
      </div>
    </main>
  );
}
