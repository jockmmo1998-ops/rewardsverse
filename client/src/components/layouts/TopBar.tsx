import { Link } from 'react-router-dom';
import { Menu, Search, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { profile } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-card/80 backdrop-blur-2xl border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden sm:flex relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search offers, providers..." 
            className="w-64 xl:w-96 h-10 pl-10 pr-4 rounded-full bg-black/40 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <Link to="/wallet" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-border hover:bg-white/10 transition-colors">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">Balance</span>
          <span className="font-heading font-bold text-sm text-primary">${(profile?.balance || 0).toFixed(2)}</span>
        </Link>
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

        <Link to="/profile" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-white/10 border-2 border-border group-hover:border-primary overflow-hidden transition-colors flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
