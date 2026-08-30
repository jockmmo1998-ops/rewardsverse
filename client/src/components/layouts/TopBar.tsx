import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const labels: Record<string, string> = {
  '/dashboard': 'Overview', '/offerwalls': 'Earn rewards', '/leaderboard': 'Leaderboard', '/achievements': 'Achievements',
  '/history': 'Activity', '/referrals': 'Referrals', '/wallet': 'Wallet', '/withdraw': 'Withdraw', '/profile': 'Profile',
  '/settings': 'Settings', '/support': 'Support', '/admin': 'Admin console',
};

function getInitials(user: any) {
  const value = String(user?.username || user?.name || user?.email || 'RV');
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'RV';
}

function notificationTime(value: unknown) {
  if (!value) return 'Just now';
  try {
    return formatDistanceToNow(new Date(String(value)), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<'notifications' | 'profile' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pageLabel = labels[location.pathname] || 'Command center';
  const notifications = trpc.notifications.getAll.useQuery(undefined, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });
  const unread = trpc.notifications.getUnread.useQuery(undefined, { enabled: Boolean(user), retry: false, refetchOnWindowFocus: false });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => { void notifications.refetch(); void unread.refetch(); } });
  const markAllRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => { void notifications.refetch(); void unread.refetch(); } });
  const avatarUrl = (user as any)?.avatarUrl || (user as any)?.avatar || (user as any)?.imageUrl;
  const initials = useMemo(() => getInitials(user), [user]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenMenu(null); };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleMenu = (menu: 'notifications' | 'profile') => setOpenMenu((current) => current === menu ? null : menu);

  return (
    <header className="hud-topbar">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenuClick} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
        <div className="flex min-w-0 items-center gap-2.5"><span className="hud-status-dot" /><span className="truncate font-display text-sm font-semibold text-foreground">{pageLabel}</span></div>
      </div>
      <div ref={menuRef} className="relative flex items-center gap-2 sm:gap-3">
        <label className="hud-search hidden lg:flex" aria-label="Search rewards"><Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><input placeholder="Search rewards..." /></label>
        <button type="button" onClick={() => toggleMenu('notifications')} className={cn('focus-ring relative rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground', openMenu === 'notifications' && 'bg-primary/[.09] text-primary')} aria-label="Notifications" aria-expanded={openMenu === 'notifications'}>
          <Bell className="h-[17px] w-[17px]" />
          {Boolean(unread.data?.length) && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" aria-label={`${unread.data?.length} unread notifications`} />}
        </button>
        <button type="button" onClick={() => toggleMenu('profile')} className={cn('focus-ring flex items-center gap-2 rounded-xl border border-transparent p-1.5 pr-2 transition hover:border-border hover:bg-muted', openMenu === 'profile' && 'border-primary/20 bg-primary/[.08]')} aria-label="Open profile menu" aria-expanded={openMenu === 'profile'}>
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-primary/10 text-[10px] font-bold text-primary">{avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}</span>
          <span className="hidden max-w-[110px] truncate text-left text-xs font-semibold text-foreground xl:block">{user?.username || user?.name || 'Profile'}</span>
        </button>
        {openMenu === 'notifications' && <div className="rv-dropdown absolute right-14 top-[calc(100%+.65rem)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5"><div><p className="font-display text-sm font-semibold text-foreground">Notifications</p><p className="mt-0.5 text-[11px] text-muted-foreground">Your latest account activity</p></div>{Boolean(unread.data?.length) && <button type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending} className="text-[11px] font-semibold text-primary hover:text-primary/80">Mark all read</button>}</div>
          <div className="max-h-[min(360px,60vh)] overflow-y-auto p-2">{!user ? <p className="px-3 py-8 text-center text-xs text-muted-foreground">Sign in to view notifications.</p> : notifications.isLoading ? <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading notifications...</p> : notifications.data?.length ? notifications.data.map((item: any) => <button key={item.id} type="button" onClick={() => { if (!item.isRead) markRead.mutate({ id: item.id }); }} className={cn('flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-muted', !item.isRead && 'bg-primary/[.05]')}><span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', item.isRead ? 'bg-slate-200' : 'bg-primary')} /><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-foreground">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.message}</span><span className="mt-1.5 block text-[10px] text-muted-foreground/70">{notificationTime(item.createdAt)}</span></span>{item.isRead ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" /> : null}</button>) : <p className="px-3 py-8 text-center text-xs text-muted-foreground">No notifications yet.</p>}</div>
        </div>}
        {openMenu === 'profile' && <div className="rv-dropdown absolute right-0 top-[calc(100%+.65rem)] z-50 w-52 overflow-hidden rounded-2xl p-1.5">
          <div className="border-b border-border px-3 py-3"><p className="truncate text-xs font-semibold text-foreground">{user?.username || user?.name || 'RewardsVerse member'}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{user?.email || 'Account menu'}</p></div>
          <Link to="/profile" onClick={() => setOpenMenu(null)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"><UserRound className="h-4 w-4" />Profile</Link>
          <Link to="/settings" onClick={() => setOpenMenu(null)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"><Settings className="h-4 w-4" />Settings</Link>
          <button type="button" onClick={() => { setOpenMenu(null); void logout(); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground transition hover:bg-red-50 hover:text-red-700"><LogOut className="h-4 w-4" />Logout</button>
        </div>}
      </div>
    </header>
  );
}
