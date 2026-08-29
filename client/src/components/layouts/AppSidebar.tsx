import { Link, useLocation } from 'react-router-dom';
import { ArrowDownToLine, Award, BarChart3, Clock3, Grid2X2, HelpCircle, History, LayoutDashboard, LogOut, Settings, ShieldCheck, Trophy, UserRound, Users, WalletCards, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { BrandMark } from '@/components/shared/RewardUI';

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard; badge?: string };
const primaryItems: NavItem[] = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Earn', path: '/offerwalls', icon: Zap, badge: 'Live' },
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

export function AppSidebar({ open, onOpenChange, onClose }: { open?: boolean; onOpenChange?: (open: boolean) => void; onClose?: () => void }) {
  const location = useLocation();
  const { profile, logout } = useAuth();
  const active = (path: string) => location.pathname === path;
  const handleLogout = async () => { await logout(); window.location.href = '/home'; };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="space-y-1.5">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/65">{title}</p>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.path} to={item.path} onClick={onClose} className={cn('focus-ring group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition duration-200', active(item.path) ? 'nav-link-active' : 'nav-link-idle')}>
            <span className="flex min-w-0 items-center gap-3"><Icon className="h-[17px] w-[17px] shrink-0" /><span className="truncate">{item.label}</span></span>
            {item.badge && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">{item.badge}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-sm lg:hidden" />}
      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-sidebar-border bg-sidebar-background/95 px-4 py-5 shadow-2xl backdrop-blur-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-2">
          <Link to="/home" onClick={onClose} className="focus-ring"><BrandMark /></Link>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden" aria-label="Close navigation"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-8 flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto pr-1">
          <NavSection title="Workspace" items={primaryItems} />
          <NavSection title="Your money" items={accountItems} />
          <NavSection title="Account" items={settingsItems} />
          {profile?.is_admin && <NavSection title="Admin" items={[{ label: 'Admin console', path: '/admin', icon: ShieldCheck }]} />}
          <div className="mt-auto rounded-2xl border border-primary/15 bg-primary/8 p-3.5">
            <div className="flex items-center gap-2 text-primary"><BarChart3 className="h-4 w-4" /><span className="text-xs font-semibold">Keep your streak</span></div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Complete one offer today to keep progressing.</p>
          </div>
        </div>
        <div className="mt-5 border-t border-sidebar-border pt-4">
          <button onClick={handleLogout} className="focus-ring flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-[17px] w-[17px]" /> Log out</button>
        </div>
      </aside>
    </>
  );
}
