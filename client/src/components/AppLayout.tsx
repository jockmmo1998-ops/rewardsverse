import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard, ListChecks, ArrowDownToLine, History,
  Trophy, Users, Settings, LogOut, Menu, Zap, ShieldCheck,
  Bell, User, DollarSign, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: '#22C55E' },
  { label: 'Offerwall', path: '/offers', icon: ListChecks, color: '#3B82F6' },
  { label: 'Withdraw', path: '/withdraw', icon: ArrowDownToLine, color: '#A855F7' },
  { label: 'History', path: '/history', icon: History, color: '#F59E0B' },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy, color: '#F97316' },
  { label: 'Referrals', path: '/referrals', icon: Users, color: '#06B6D4' },
  { label: 'Settings', path: '/settings', icon: Settings, color: '#9CA3AF' },
];

interface NavItemProps {
  item: { label: string; path: string; icon: React.ElementType; color: string };
  active: boolean;
  onClick?: () => void;
}

function NavItem({ item, active, onClick }: NavItemProps) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative overflow-hidden',
      )}
      style={active ? {
        background: `${item.color}15`,
        border: `1px solid ${item.color}30`,
        color: item.color,
      } : {
        color: 'rgba(244,244,245,0.5)',
        border: '1px solid transparent',
      }}
    >
      <Icon size={15} strokeWidth={active ? 2.5 : 1.75} style={active ? { color: item.color } : {}} />
      <span className="font-heading font-semibold text-xs tracking-wide uppercase">{item.label}</span>
      {active && <ChevronRight size={11} className="ml-auto opacity-60" style={{ color: item.color }} />}
    </Link>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const location = useLocation();
  const { profile } = useAuth();

  return (
    <div className="flex flex-col h-full" style={{ background: 'hsl(var(--sidebar-background))', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 0 16px rgba(34,197,94,0.35)' }}>
          <Zap size={14} className="text-black" />
        </div>
        <div>
          <span className="font-bold tracking-tight font-heading text-sm" style={{ color: '#F4F4F5' }}>RewardsVerse</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: '#22C55E' }} />
            <span className="text-xs" style={{ color: 'rgba(34,197,94,0.8)' }}>Online</span>
          </div>
        </div>
      </div>

      <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Balance chip */}
      {profile && (
        <div className="mx-3 mt-3 px-4 py-3 rounded-xl relative overflow-hidden"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', transform: 'translate(20%,-20%)' }} />
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={11} style={{ color: '#22C55E' }} />
            <p className="text-xs font-medium" style={{ color: 'rgba(244,244,245,0.5)' }}>Available Balance</p>
          </div>
          <p className="text-xl font-bold font-heading" style={{ color: '#22C55E' }}>
            ${profile.balance.toFixed(2)}
          </p>
          <Link to="/withdraw" onClick={onNavClick}>
            <button className="mt-2 w-full text-xs font-semibold py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
              Withdraw →
            </button>
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.path} item={item} active={location.pathname === item.path} onClick={onNavClick} />
        ))}

        {profile?.is_admin && (
          <>
            <div className="my-2 mx-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <NavItem
              item={{ label: 'Admin', path: '/admin', icon: ShieldCheck, color: '#F97316' }}
              active={location.pathname.startsWith('/admin')}
              onClick={onNavClick}
            />
          </>
        )}
      </nav>

      <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* User footer */}
      {profile && (
        <div className="p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate font-heading" style={{ color: '#F4F4F5' }}>{profile.username}</p>
              <p className="text-xs" style={{ color: 'rgba(244,244,245,0.35)' }}>
                {profile.is_admin ? 'Administrator' : 'Member'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AppLayoutProps { children: ReactNode }

export default function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full" style={{ background: '#09090B' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0">
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-6 h-14"
          style={{ background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'rgba(244,244,245,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Menu size={16} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0" style={{ background: 'hsl(var(--sidebar-background))', border: 'none' }}>
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0" />

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 relative"
              style={{ color: 'rgba(244,244,245,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Bell size={14} />
            </button>

            {profile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all hover:bg-white/5"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold hidden md:block" style={{ color: '#F4F4F5' }}>{profile.username}</span>
                    <span className="text-xs font-bold hidden md:block" style={{ color: '#22C55E' }}>${profile.balance.toFixed(2)}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 max-w-[calc(100%-2rem)]"
                  style={{ background: '#10141F', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold font-heading" style={{ color: '#F4F4F5' }}>{profile.username}</p>
                    <p className="text-xs" style={{ color: '#22C55E' }}>${profile.balance.toFixed(2)} available</p>
                  </div>
                  <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <DropdownMenuItem asChild className="text-sm" style={{ color: 'rgba(244,244,245,0.7)' }}>
                    <Link to="/settings"><User size={13} className="mr-2" />Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <DropdownMenuItem onClick={handleSignOut} className="text-sm" style={{ color: '#F87171' }}>
                    <LogOut size={13} className="mr-2" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
