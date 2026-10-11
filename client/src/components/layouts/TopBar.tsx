import {
  Activity,
  ArrowDownToLine,
  Bell,
  Check,
  ChevronDown,
  ExternalLink,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { useSSE } from '@/hooks/useSSE';
import { playBellSound, unlockBellSound } from '@/utils/bellSound';
import { BrandMark } from '@/components/shared/RewardUI';
import { UserAvatar } from '@/components/AvatarSystem';

const primaryNavigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Offers', to: '/offerwalls', icon: Zap },
  { label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
  { label: 'Activity', to: '/history', icon: Activity },
  { label: 'Referrals', to: '/referrals', icon: Users },
  { label: 'Withdraw', to: '/withdraw', icon: ArrowDownToLine },
];

function notificationTime(value: unknown) {
  if (!value) return 'Just now';
  try { return formatDistanceToNow(new Date(String(value)), { addSuffix: true }); } catch { return 'Recently'; }
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

function isNavigationActive(pathname: string, path: string) {
  if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/home';
  if (path === '/offerwalls') return pathname === path || pathname.startsWith(`${path}/`);
  return pathname === path;
}

export function TopBar({
  onMenuClick,
  onMenuClose,
  sidebarOpen = false,
}: {
  onMenuClick: () => void;
  onMenuClose?: () => void;
  sidebarOpen?: boolean;
}) {
  const { user, profile, logout, refreshProfile } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<'notifications' | 'profile' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
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
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    onMenuClose?.();
  }, [location.pathname, onMenuClose]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : mobileMenuButtonRef.current;
    const nav = mobileNavRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFirst = window.requestAnimationFrame(() => {
      const first = nav?.querySelector<HTMLElement>(focusableSelector);
      (first ?? nav)?.focus();
    });
    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onMenuClose?.();
        return;
      }
      if (event.key !== 'Tab' || !nav) return;
      const focusable = Array.from(nav.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => element.getAttribute('aria-hidden') !== 'true');
      if (!focusable.length) {
        event.preventDefault();
        nav.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleMenuKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFirst);
      document.removeEventListener('keydown', handleMenuKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onMenuClose, sidebarOpen]);

  const toggleMenu = (menu: 'notifications' | 'profile') => setOpenMenu((current) => current === menu ? null : menu);
  const displayName = profile?.username || profile?.name || user?.username || user?.name || 'Member';
  const unreadCount = unread.data?.length ?? 0;
  const isAdmin = Boolean((profile as any)?.is_admin);

  const renderNavigation = (mobile = false) => primaryNavigation.map(({ label, to, icon: Icon }) => {
    const active = isNavigationActive(location.pathname, to);
    return (
      <Link
        key={to}
        to={to}
        onClick={onMenuClose}
        aria-current={active ? 'page' : undefined}
        className={cn(mobile ? 'rv-mobile-nav-link' : 'rv-nav-link', active && 'is-active')}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  });

  const handleLogout = async () => {
    setOpenMenu(null);
    onMenuClose?.();
    await logout();
    window.location.href = '/home';
  };

  return (
    <header className="rv-site-header">
      <div className="rv-topbar-inner">
        <div className="rv-brand-slot">
          <button
            type="button"
            ref={mobileMenuButtonRef}
            onClick={onMenuClick}
            className="rv-mobile-menu-button focus-ring"
            aria-label={sidebarOpen ? 'Close primary navigation' : 'Open primary navigation'}
            aria-controls="primary-navigation"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <Link to="/home" onClick={onMenuClose} className="rv-brand focus-ring" aria-label="RewardsVerse home">
            <BrandMark compact />
          </Link>
        </div>

        <nav className="rv-primary-nav" aria-label="Primary navigation">
          {renderNavigation()}
        </nav>

        <div ref={menuRef} className="rv-header-actions">
          <button
            type="button"
            onClick={() => toggleMenu('notifications')}
            className={cn('rv-icon-button focus-ring', openMenu === 'notifications' && 'is-open')}
            aria-label="Notifications"
            aria-expanded={openMenu === 'notifications'}
          >
            <Bell aria-hidden="true" />
            {unreadCount > 0 && <span className="notification-count" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {user && <Link to="/withdraw" className="rv-balance-pill focus-ring" aria-label="View balance and withdraw">
            <span>{profile ? money(profile.balance) : '—'}</span>
            <WalletCards aria-hidden="true" />
          </Link>}

          {user ? (
            <button
              type="button"
              onClick={() => toggleMenu('profile')}
              className={cn('rv-profile-button focus-ring', openMenu === 'profile' && 'is-open')}
              aria-label="Open profile menu"
              aria-expanded={openMenu === 'profile'}
            >
              <UserAvatar userId={(profile as any)?.id ?? (user as any)?.id} avatarId={(profile as any)?.avatarId ?? (user as any)?.avatarId} src={(profile as any)?.avatarUrl ?? (user as any)?.avatarUrl} alt={`${displayName} avatar`} className="rv-profile-avatar" />
              <span className="rv-profile-name">{displayName}</span>
              <ChevronDown aria-hidden="true" />
            </button>
          ) : (
            <div className="rv-auth-actions">
              <Link to="/login" className="rv-login-link focus-ring">Log in</Link>
              <Link to="/register" className="rv-signup-button focus-ring">Sign up</Link>
            </div>
          )}

          {openMenu === 'notifications' && <div className="rv-dropdown rv-notifications-dropdown">
            <div className="rv-dropdown-heading">
              <div><p className="rv-dropdown-title">Notifications</p><p className="rv-dropdown-subtitle">Reward and account activity</p></div>
              {unreadCount > 0 && <button type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending} className="rv-dropdown-action">Mark all read</button>}
            </div>
            <div className="rv-notifications-list">
              {!user ? <p className="rv-dropdown-empty">Sign in to view notifications.</p> : notifications.isLoading ? <p className="rv-dropdown-empty">Loading notifications…</p> : notifications.data?.length ? notifications.data.map((item: any) => <button key={item.id} type="button" onClick={() => { if (!item.isRead) markRead.mutate({ id: item.id }); }} className={cn('rv-notification-item', !item.isRead && 'is-unread')}><span className={cn('rv-notification-dot', item.isRead ? 'is-read' : '')} /><span className="rv-notification-copy"><span className="rv-notification-title">{item.title}</span><span className="rv-notification-message">{item.message}</span><span className="rv-notification-time">{notificationTime(item.createdAt)}</span></span>{item.isRead ? <Check className="rv-notification-check" aria-hidden="true" /> : null}</button>) : <p className="rv-dropdown-empty">No notifications yet.</p>}
            </div>
          </div>}

          {openMenu === 'profile' && user && <div className="rv-dropdown rv-profile-dropdown">
            <div className="rv-profile-dropdown-heading"><div className="flex min-w-0 items-center gap-2"><UserAvatar userId={(profile as any)?.id ?? (user as any)?.id} avatarId={(profile as any)?.avatarId ?? (user as any)?.avatarId} alt="" className="h-8 w-8 shrink-0 rounded-full" /><div className="min-w-0"><p className="rv-profile-dropdown-name">{displayName}</p><p className="rv-profile-dropdown-email">{user.email || 'RewardsVerse member'}</p></div></div></div>
            <Link to="/profile" onClick={() => setOpenMenu(null)} className="dropdown-link"><UserRound aria-hidden="true" />Profile</Link>
            <Link to="/settings" onClick={() => setOpenMenu(null)} className="dropdown-link"><Settings aria-hidden="true" />Settings</Link>
            <Link to="/wallet" onClick={() => setOpenMenu(null)} className="dropdown-link"><WalletCards aria-hidden="true" />Wallet</Link>
            <Link to="/achievements" onClick={() => setOpenMenu(null)} className="dropdown-link"><Trophy aria-hidden="true" />Achievements</Link>
            <Link to="/support" onClick={() => setOpenMenu(null)} className="dropdown-link"><Gift aria-hidden="true" />Support</Link>
            <a href="https://t.me/wilsonrobertul804" target="_blank" rel="noreferrer" className="dropdown-link"><ExternalLink aria-hidden="true" />Telegram support</a>
            {isAdmin && <Link to="/admin" onClick={() => setOpenMenu(null)} className="dropdown-link"><ShieldCheck aria-hidden="true" />Admin console</Link>}
            <button type="button" onClick={() => void handleLogout()} className="dropdown-link rv-logout-link"><LogOut aria-hidden="true" />Logout</button>
          </div>}
        </div>
      </div>

      {sidebarOpen && <>
        <button type="button" className="rv-mobile-nav-backdrop" aria-label="Close navigation" onClick={onMenuClose} />
        <nav ref={mobileNavRef} id="primary-navigation" role="dialog" aria-modal="true" tabIndex={-1} className="rv-mobile-nav" aria-label="Primary navigation">
          <div className="rv-mobile-nav-links">{renderNavigation(true)}</div>
          {user ? <div className="rv-mobile-account-links">
            <p className="rv-mobile-nav-label">Account</p>
            <Link to="/profile" onClick={onMenuClose} className="rv-mobile-nav-link"><UserRound aria-hidden="true" /><span>Profile</span></Link>
            <Link to="/settings" onClick={onMenuClose} className="rv-mobile-nav-link"><Settings aria-hidden="true" /><span>Settings</span></Link>
            <Link to="/support" onClick={onMenuClose} className="rv-mobile-nav-link"><Gift aria-hidden="true" /><span>Support</span></Link>
            {isAdmin && <Link to="/admin" onClick={onMenuClose} className="rv-mobile-nav-link"><ShieldCheck aria-hidden="true" /><span>Admin console</span></Link>}
            <button type="button" onClick={() => void handleLogout()} className="rv-mobile-nav-link rv-mobile-logout"><LogOut aria-hidden="true" /><span>Logout</span></button>
          </div> : <div className="rv-mobile-auth-actions"><Link to="/login" onClick={onMenuClose} className="rv-login-link">Log in</Link><Link to="/register" onClick={onMenuClose} className="rv-signup-button">Sign up</Link></div>}
        </nav>
      </>}
    </header>
  );
}
