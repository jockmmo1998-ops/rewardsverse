import { Bell, Menu, Search, WalletCards } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const labels: Record<string, string> = {
  '/dashboard': 'Overview', '/offerwalls': 'Earn rewards', '/leaderboard': 'Leaderboard', '/achievements': 'Achievements',
  '/history': 'Activity', '/referrals': 'Referrals', '/wallet': 'Wallet', '/withdraw': 'Withdraw', '/profile': 'Profile', '/settings': 'Settings', '/support': 'Support', '/admin': 'Admin console',
};

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { profile } = useAuth();
  const location = useLocation();
  const displayName = profile?.username || profile?.name || 'Member';
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/8 bg-[#111d2c]/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenuClick} className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span>Workspace</span><span className="text-white/20">/</span><span className="truncate font-medium text-foreground">{labels[location.pathname] || 'RewardsVerse'}</span></div>
        <div className="flex items-center gap-2 sm:hidden"><span className="font-display font-semibold text-foreground">{labels[location.pathname] || 'RewardsVerse'}</span></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="focus-ring hidden rounded-xl border border-white/8 p-2.5 text-muted-foreground transition hover:border-white/15 hover:bg-white/5 hover:text-foreground md:block" aria-label="Search"><Search className="h-[17px] w-[17px]" /></button>
        <button className="focus-ring relative rounded-xl border border-white/8 p-2.5 text-muted-foreground transition hover:border-white/15 hover:bg-white/5 hover:text-foreground" aria-label="Notifications"><Bell className="h-[17px] w-[17px]" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" /></button>
        <Link to="/wallet" className="focus-ring flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2 transition hover:bg-primary/14"><WalletCards className="h-4 w-4 text-primary" /><span className="hidden text-xs text-muted-foreground sm:inline">Balance</span><span className="font-display text-sm font-semibold text-primary">${Number(profile?.balance || 0).toFixed(2)}</span></Link>
        <Link to="/profile" className="focus-ring hidden items-center gap-2 border-l border-white/8 pl-3 sm:flex"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-accent/90 text-xs font-bold text-primary-foreground">{initials}</span><span className={cn('max-w-[100px] truncate text-sm font-medium', !profile && 'text-muted-foreground')}>{displayName}</span></Link>
      </div>
    </header>
  );
}
