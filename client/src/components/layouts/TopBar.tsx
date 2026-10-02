import { Bell, Check, ChevronDown, ExternalLink, LogOut, Menu, Settings, UserRound, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { useSSE } from '@/hooks/useSSE';
import { playBellSound, unlockBellSound } from '@/utils/bellSound';
import { UserAvatar } from '@/components/AvatarSystem';

function getInitials(user: any) {
  const value = String(user?.username || user?.name || user?.email || 'RV');
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'RV';
}

function notificationTime(value: unknown) {
  if (!value) return 'Just now';
  try { return formatDistanceToNow(new Date(String(value)), { addSuffix: true }); } catch { return 'Recently'; }
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

export function TopBar({ onMenuClick, sidebarOpen = false }: { onMenuClick: () => void; sidebarOpen?: boolean }) {
  const { user, profile, logout, refreshProfile } = useAuth();
  const [openMenu, setOpenMenu] = useState<'notifications' | 'profile' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifications = trpc.notifications.getAll.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
  const unread = trpc.notifications.getUnread.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
  const refreshNotifications = useCallback(() => {
    void notifications.refetch();
    void unread.refetch();
  }, [notifications.refetch, unread.refetch]);
  const handlePostback = useCallback(async (event: { amount: number; offerName: string; provider: string }) => {
    if (event.amount <= 0) return;
    if (localStorage.getItem('rewardsverse-reward-sound') !== 'off') {
      await playBellSound();
    }
    refreshNotifications();
    void refreshProfile();
    toast.success(`Reward received! +$${event.amount.toFixed(2)}`, {
      description: `${event.offerName} via ${event.provider}`,
      duration: 6000,
    });
  }, [refreshNotifications, refreshProfile]);
  const handleBalanceUpdate = useCallback(() => {
    refreshNotifications();
    void refreshProfile();
  }, [refreshNotifications, refreshProfile]);
  const handleSSEError = useCallback((error: Error) => {
    console.warn('[TopBar] Realtime notification error:', error.message);
  }, []);
  useSSE({
    onPostback: handlePostback,
    onBalanceUpdate: handleBalanceUpdate,
    onError: handleSSEError,
    enabled: Boolean(user?.id),
  });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: refreshNotifications });
  const markAllRead = trpc.notifications.markAllRead.useMutation({ onSuccess: refreshNotifications });
  const initials = useMemo(() => getInitials(user), [user]);

  useEffect(() => {
    let unlocked = false;
    const unlockAudio = () => {
      if (unlocked) return;
      unlocked = true;
      void unlockBellSound();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenu(null); };
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenMenu(null); };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('pointerdown', handlePointerDown); document.removeEventListener('keydown', handleKeyDown); };
  }, []);

  const toggleMenu = (menu: 'notifications' | 'profile') => setOpenMenu((current) => current === menu ? null : menu);
  const displayName = profile?.username || profile?.name || user?.username || user?.name || 'Member';
  const unreadCount = unread.data?.length ?? 0;

  return (
    <header className="hud-topbar">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenuClick} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden" aria-label="Open navigation" aria-controls="primary-navigation" aria-expanded={sidebarOpen}><Menu className="h-5 w-5" /></button>
      </div>
      <div ref={menuRef} className="relative flex items-center gap-1.5 sm:gap-3">
        <button type="button" onClick={() => toggleMenu('notifications')} className={cn('focus-ring relative rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground', openMenu === 'notifications' && 'bg-primary/[.09] text-primary')} aria-label="Notifications" aria-expanded={openMenu === 'notifications'}>
          <Bell className="h-[17px] w-[17px]" />
          {unreadCount > 0 && <span className="notification-count" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <Link to="/withdraw" className="balance-pill focus-ring hidden items-center gap-2 sm:flex" aria-label="View balance and withdraw"><span>{profile ? money(profile.balance) : '—'}</span><WalletCards className="h-4 w-4 text-primary" /></Link>
        <button type="button" onClick={() => toggleMenu('profile')} className={cn('focus-ring flex items-center gap-2 rounded-xl border border-transparent p-1.5 pr-1.5 transition hover:border-border hover:bg-muted', openMenu === 'profile' && 'border-primary/20 bg-primary/[.08]')} aria-label="Open profile menu" aria-expanded={openMenu === 'profile'}>
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-primary/10 text-[10px] font-bold text-primary shadow-sm">{user ? <UserAvatar userId={(profile as any)?.id || (user as any)?.id} avatarId={(profile as any)?.avatarId || (user as any)?.avatarId} alt={`${displayName} avatar`} className="h-full w-full" /> : initials}</span>
          <span className="hidden max-w-[110px] truncate text-left text-xs font-semibold text-foreground xl:block">{displayName}</span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground xl:block" />
        </button>
        {openMenu === 'notifications' && <div className="rv-dropdown absolute right-0 top-[calc(100%+.65rem)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5"><div><p className="font-display text-sm font-semibold text-foreground">Notifications</p><p className="mt-0.5 text-[11px] text-muted-foreground">Reward and account activity</p></div>{unreadCount > 0 && <button type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending} className="text-[11px] font-semibold text-primary hover:text-primary/80">Mark all read</button>}</div>
          <div className="max-h-[min(360px,60vh)] overflow-y-auto p-2">{!user ? <p className="px-3 py-8 text-center text-xs text-muted-foreground">Sign in to view notifications.</p> : notifications.isLoading ? <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading notifications…</p> : notifications.data?.length ? notifications.data.map((item: any) => <button key={item.id} type="button" onClick={() => { if (!item.isRead) markRead.mutate({ id: item.id }); }} className={cn('flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-muted', !item.isRead && 'bg-primary/[.05]')}><span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', item.isRead ? 'bg-slate-500' : 'bg-primary')} /><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-foreground">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.message}</span><span className="mt-1.5 block text-[10px] text-muted-foreground/70">{notificationTime(item.createdAt)}</span></span>{item.isRead ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" /> : null}</button>) : <p className="px-3 py-8 text-center text-xs text-muted-foreground">No notifications yet.</p>}</div>
        </div>}
        {openMenu === 'profile' && <div className="rv-dropdown absolute right-0 top-[calc(100%+.65rem)] z-50 w-56 overflow-hidden rounded-2xl p-1.5">
          <div className="border-b border-border px-3 py-3"><p className="truncate text-xs font-semibold text-foreground">{displayName}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{user?.email || 'RewardsVerse member'}</p></div>
          <Link to="/profile" onClick={() => setOpenMenu(null)} className="dropdown-link"><UserRound className="h-4 w-4" />Profile</Link>
          <Link to="/settings" onClick={() => setOpenMenu(null)} className="dropdown-link"><Settings className="h-4 w-4" />Settings</Link>
          <a href="https://t.me/wilsonrobertul804" target="_blank" rel="noreferrer" className="dropdown-link"><ExternalLink className="h-4 w-4" />Telegram support</a>
          <button type="button" onClick={() => { setOpenMenu(null); void logout(); }} className="dropdown-link hover:bg-red-400/[.06] hover:text-red-300"><LogOut className="h-4 w-4" />Logout</button>
        </div>}
      </div>
    </header>
  );
}
