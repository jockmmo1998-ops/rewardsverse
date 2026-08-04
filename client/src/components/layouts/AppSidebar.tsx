import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, Trophy, Award, History, Users, Wallet, ArrowDownToLine, User, Settings, HelpCircle, ShieldAlert, LogOut, Grid3X3, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Grid3X3, label: 'Offerwalls', path: '/offerwalls' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Users, label: 'Referrals', path: '/referrals' },
];

const financeItems = [
  { icon: ArrowDownToLine, label: 'Withdraw', path: '/withdraw' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
];

const accountItems = [
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Support', path: '/support' },
];

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { profile } = useAuth(); // lấy profile từ context

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const NavLink = ({ item, isHot = false, className = '' }: { item: any, isHot?: boolean, className?: string }) => {
    const active = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={onClose}
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group',
          active
            ? 'bg-primary/10 text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
          <span>{item.label}</span>
        </div>
        {isHot && (
          <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-wider">
            Hot
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card/80 backdrop-blur-2xl border-r border-border overflow-y-auto hidden-scrollbar">
      {/* Logo */}
      <div className="p-6 sticky top-0 bg-card/80 backdrop-blur-xl z-10 border-b border-border/50">
        <Link to="/" onClick={onClose} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary group-hover:scale-105 transition-transform">
            <Coins className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-foreground">
            Rewards<span className="text-primary">verse</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 p-4 flex flex-col space-y-8">
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Menu</p>
          {navItems.map(item => <NavLink key={item.path} item={item} isHot={item.path === '/offerwalls'} />)}
        </div>

        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Finance</p>
          {financeItems.map(item => <NavLink key={item.path} item={item} />)}
        </div>

        {/* Đẩy Account và Admin xuống dưới cùng */}
        <div className="mt-auto space-y-1 pt-8">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Account</p>
          {accountItems.map(item => <NavLink key={item.path} item={item} />)}
          
          {/* Chỉ hiển thị Admin khi profile.is_admin là true */}
          {profile?.is_admin && (
            <NavLink 
              item={{ icon: ShieldAlert, label: 'Admin', path: '/admin' }} 
              className="text-warning hover:bg-warning/10 hover:text-warning" 
            />
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border/50 bg-card/50">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
