import { ArrowDownToLine, Gift, History, LayoutDashboard, LogOut, ShieldCheck, Trophy, UserRound, Users, X, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { BrandMark } from '@/components/shared/RewardUI';

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard; badge?: string };

const primaryItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Earn rewards', path: '/offerwalls', icon: Zap, badge: 'LIVE' },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
];

const rewardItems: NavItem[] = [
  { label: 'Activity', path: '/history', icon: History },
  { label: 'Referrals', path: '/referrals', icon: Users },
  { label: 'Withdraw', path: '/withdraw', icon: ArrowDownToLine },
];

const accountItems: NavItem[] = [
  { label: 'Profile', path: '/profile', icon: UserRound },
];

export function AppSidebar({ open, onOpenChange, onClose }: { open?: boolean; onOpenChange?: (open: boolean) => void; onClose?: () => void }) {
  const location = useLocation();
  const { profile, logout } = useAuth();
  const isActive = (path: string) => path === '/dashboard'
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
      {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" />}
      <aside className={cn('hud-sidebar fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col px-4 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-2">
          <Link to="/home" onClick={onClose} className="focus-ring flex items-center gap-3" aria-label="RewardsVerse" title="RewardsVerse"><BrandMark compact /></Link>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden" aria-label="Close navigation"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-10 flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pr-1">
          <NavSection title="Command center" items={primaryItems} />
          <NavSection title="Your rewards" items={rewardItems} />
          <NavSection title="Account" items={accountItems} />
          {profile?.is_admin && <NavSection title="Admin" items={[{ label: 'Admin console', path: '/admin', icon: ShieldCheck }]} />}
        </div>
        <div className="mt-5 space-y-3 border-t border-primary/15 pt-4">
          <Link to="/support" onClick={onClose} className="focus-ring flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground"><Gift className="h-[17px] w-[17px]" /> Support</Link>
          <button onClick={handleLogout} className="focus-ring flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-muted-foreground transition hover:border-red-400/20 hover:bg-red-400/[.06] hover:text-red-300"><LogOut className="h-[17px] w-[17px]" /> Disconnect</button>
        </div>
      </aside>
    </>
  );
}
