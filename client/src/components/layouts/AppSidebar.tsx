import { Link, useLocation } from 'react-router-dom';
import { ArrowDownToLine, Award, BarChart3, HelpCircle, History, LayoutDashboard, LogOut, Settings, ShieldCheck, Trophy, UserRound, Users, WalletCards, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { BrandMark } from '@/components/shared/RewardUI';

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard; badge?: string };
const primaryItems: NavItem[] = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Earn rewards', path: '/offerwalls', icon: Zap, badge: 'LIVE' },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { label: 'Achievements', path: '/achievements', icon: Award },
];
const accountItems: NavItem[] = [
  { label: 'Activity', path: '/history', icon: History },
  { label: 'Referrals', path: '/referrals', icon: Users },
  { label: 'Wallet', path: '/wallet', icon: WalletCards },
  { label: 'Withdraw', path: '/withdraw', icon: ArrowDownToLine },
];
const settingsItems: NavItem[] = [
  { label: 'Profile', path: '/profile', icon: UserRound },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Support', path: '/support', icon: HelpCircle },
];

export function AppSidebar({ open, onClose }: { open?: boolean; onOpenChange?: (open: boolean) => void; onClose?: () => void }) {
  const location = useLocation();
  const { profile, logout } = useAuth();
  const active = (path: string) => location.pathname === path;
  const handleLogout = async () => { await logout(); window.location.href = '/home'; };
  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="space-y-2">
      <p className="hud-label px-3">{title}</p>
      {items.map(({ label, path, icon: Icon, badge }) => (
        <Link key={path} to={path} onClick={onClose} className={cn('hud-nav-link focus-ring group', active(path) ? 'nav-link-active' : 'nav-link-idle')}>
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
          <Link to="/home" onClick={onClose} className="focus-ring flex items-center gap-3"><BrandMark /><span className="font-display text-base font-bold tracking-tight">Rewards<span className="text-primary">Verse</span><small className="ml-2 align-middle text-[8px] uppercase tracking-[.18em] text-muted-foreground">OS</small></span></Link>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden" aria-label="Close navigation"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-10 flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pr-1">
          <NavSection title="Command center" items={primaryItems} />
          <NavSection title="Your rewards" items={accountItems} />
          <NavSection title="System" items={settingsItems} />
          {profile?.is_admin && <NavSection title="Admin" items={[{ label: 'Admin console', path: '/admin', icon: ShieldCheck }]} />}
          <div className="hud-callout mt-auto"><div className="flex items-center gap-2 text-primary"><BarChart3 className="h-4 w-4" /><span className="text-xs font-semibold">STREAK PROTOCOL</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Complete one offer today to keep your progress online.</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 bg-primary shadow-[0_0_12px_var(--primary)]" /></div></div>
        </div>
        <div className="mt-5 border-t border-primary/15 pt-4"><button onClick={handleLogout} className="focus-ring flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-slate-200 transition hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-[17px] w-[17px]" /> Disconnect</button></div>
      </aside>
    </>
  );
}
