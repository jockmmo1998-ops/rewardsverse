import { LayoutDashboard, LogOut, ShieldCheck, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { BrandMark } from '@/components/shared/RewardUI';

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard; badge?: string };

const primaryItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
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
      <aside id="primary-navigation" aria-label="Primary navigation" className={cn('hud-sidebar fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[272px] flex-col px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] transition-transform duration-200 lg:sticky lg:top-0 lg:bottom-auto lg:z-10 lg:h-[100dvh] lg:max-h-[100dvh] lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-2">
          <Link to="/home" onClick={onClose} className="focus-ring flex items-center gap-3" aria-label="RewardsVerse" title="RewardsVerse"><BrandMark compact /></Link>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden" aria-label="Close navigation"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-7 flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain pr-1 lg:mt-9">
          <NavSection title="Command center" items={primaryItems} />
          {profile?.is_admin && <NavSection title="Admin" items={[{ label: 'Admin console', path: '/admin', icon: ShieldCheck }]} />}
        </div>
        <div className="mt-4 shrink-0 space-y-3 border-t border-primary/15 pt-4 lg:mt-5">
          <button onClick={handleLogout} className="hud-nav-link nav-link-idle focus-ring group w-full text-left hover:border-red-400/20 hover:bg-red-400/[.06] hover:text-red-300"><span className="flex min-w-0 items-center gap-3"><LogOut className="h-[17px] w-[17px]" /> <span>Disconnect</span></span></button>
        </div>
      </aside>
    </>
  );
}
