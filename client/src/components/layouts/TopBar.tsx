import { Activity, Menu, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const labels: Record<string, string> = {
  '/dashboard': 'Overview', '/offerwalls': 'Earn rewards', '/leaderboard': 'Leaderboard', '/achievements': 'Achievements',
  '/history': 'Activity', '/referrals': 'Referrals', '/wallet': 'Wallet', '/withdraw': 'Withdraw', '/profile': 'Profile',
  '/settings': 'Settings', '/support': 'Support', '/admin': 'Admin console',
};
const quickLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Earn', path: '/offerwalls' },
  { label: 'Withdraw', path: '/withdraw' },
  { label: 'History', path: '/history' },
  { label: 'Referrals', path: '/referrals' },
];

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const pageLabel = labels[location.pathname] || 'Command center';

  return (
    <header className="hud-topbar">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenuClick} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
          <span className="hud-status-dot" />
          <span className="hud-label">RewardsVerse /</span>
          <span className="truncate font-display text-sm font-semibold text-foreground">{pageLabel}</span>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-display text-sm font-semibold text-foreground">{pageLabel}</span>
        </div>
      </div>

      <nav className="hidden items-center gap-0.5 rounded-lg border border-white/[.07] bg-white/[.025] p-1 xl:flex" aria-label="Quick navigation">
        {quickLinks.map(({ label, path }) => (
          <Link key={path} to={path} className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition', location.pathname === path ? 'bg-primary/[.12] text-primary' : 'text-muted-foreground hover:bg-white/[.05] hover:text-foreground')}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden font-mono text-[9px] uppercase tracking-[.18em] text-primary/70 2xl:block">SYS // ONLINE</span>
        <label className="hud-search hidden lg:flex" aria-label="Search rewards">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input placeholder="Search rewards..." />
        </label>

      </div>
    </header>
  );
}
