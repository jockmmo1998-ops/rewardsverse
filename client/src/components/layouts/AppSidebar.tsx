import { ArrowDownToLine, Award, History, LayoutDashboard, LogOut, MessageCircle, Settings, ShieldCheck, Trophy, UserRound, Users, WalletCards, X, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { BrandMark } from '@/components/shared/RewardUI';
import { UserAvatar } from '@/components/AvatarSystem';
import { trpc } from '@/lib/trpc';

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard; badge?: string };

const primaryItems: NavItem[] = [
  { label: 'Dashboard', path: '/home', icon: LayoutDashboard },
  { label: 'Earn rewards', path: '/offerwalls', icon: Zap, badge: 'LIVE' },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
];

const rewardItems: NavItem[] = [
  { label: 'Wallet', path: '/wallet', icon: WalletCards },
  { label: 'Activity', path: '/history', icon: History },
  { label: 'Referrals', path: '/referrals', icon: Users },
  { label: 'Withdraw', path: '/withdraw', icon: ArrowDownToLine },
];

const accountItems: NavItem[] = [
  { label: 'Profile', path: '/profile', icon: UserRound },
  { label: 'Achievements', path: '/achievements', icon: Award },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function AppSidebar({ open, onOpenChange, onClose }: { open?: boolean; onOpenChange?: (open: boolean) => void; onClose?: () => void }) {
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const leaderboardQuery = trpc.user.getLeaderboard.useQuery(undefined, {
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const communityAvatars = (leaderboardQuery.data ?? []).slice(0, 4);
  const communityCount = leaderboardQuery.data?.length ?? 0;
  const isActive = (path: string) => path === '/home'
    ? location.pathname === '/dashboard' || location.pathname === '/home'
    : location.pathname === path;
  const handleLogout = async () => { await logout(); window.location.href = '/home'; };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="space-y-2">
      <p className="hud-label px-3">{title}</p>
      {items.map(({ label, path, icon: Icon, badge }) => (
        <Link key={path} to={path} onClick={onClose} className={cn('hud-nav-link focus-ring group', isActive(path) ? 'nav-link-active' : 'nav-link-idle')}>
          <span className="flex min-w-0 items-center gap-3"><Icon className="h-[17px] w-[17px] shrink-0" /><span className="truncate">{label}</span></span>
          {badge && <span className="hud-live-badge">{badge}</span>}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {open && <button aria-label="Close navigation" onClick={onClose} className="hud-sidebar-backdrop fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />}
      <aside id="primary-navigation" aria-label="Primary navigation" aria-hidden={!open ? true : undefined} inert={!open ? true : undefined} className={cn('hud-sidebar fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[272px] flex-col px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] transition-transform duration-200', open ? 'is-open translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-2">
          <Link to="/home" onClick={onClose} className="focus-ring flex items-center gap-3" aria-label="RewardsVerse" title="RewardsVerse"><BrandMark compact /></Link>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close navigation"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain pr-1 lg:mt-7">
          {communityAvatars.length > 0 && (
            <Link
              to="/leaderboard"
              onClick={onClose}
              aria-label={`View the leaderboard with ${communityCount} top members`}
              className="focus-ring group flex min-h-11 shrink-0 items-center gap-3 rounded-xl border border-primary/15 bg-primary/[.04] px-2.5 py-2 transition hover:border-primary/30 hover:bg-primary/[.08]"
            >
              <span className="flex shrink-0 -space-x-2" aria-hidden="true">
                {communityAvatars.map((member) => (
                  <UserAvatar
                    key={member.userId}
                    userId={member.userId}
                    avatarId={member.avatarId}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-background shadow-sm transition group-hover:-translate-y-0.5"
                  />
                ))}
                {communityCount > communityAvatars.length && (
                  <span className="grid h-8 min-w-8 place-items-center rounded-full border-2 border-background bg-primary/15 px-1 text-[9px] font-bold text-primary">
                    +{communityCount - communityAvatars.length}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[9px] font-semibold uppercase tracking-[.12em] text-foreground/80">Top members</span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">See the leaderboard</span>
              </span>
              <Trophy className="h-3.5 w-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )}
          <NavSection title="Command center" items={primaryItems} />
          <NavSection title="Your rewards" items={rewardItems} />
          <NavSection title="Account" items={accountItems} />
          {profile?.is_admin && <NavSection title="Admin" items={[{ label: 'Admin console', path: '/admin', icon: ShieldCheck }]} />}
        </div>
        <div className="mt-4 shrink-0 space-y-3 border-t border-primary/15 pt-4 lg:mt-5">
          <Link to="/support" onClick={onClose} className="hud-nav-link nav-link-idle focus-ring group w-full"><span className="flex min-w-0 items-center gap-3"><MessageCircle className="h-[17px] w-[17px]" /> <span>Support</span></span></Link>
          {user && <button onClick={handleLogout} className="hud-nav-link nav-link-idle focus-ring group w-full text-left hover:border-red-400/20 hover:bg-red-400/[.06] hover:text-red-300"><span className="flex min-w-0 items-center gap-3"><LogOut className="h-[17px] w-[17px]" /> <span>Log out</span></span></button>}
        </div>
      </aside>
    </>
  );
}
