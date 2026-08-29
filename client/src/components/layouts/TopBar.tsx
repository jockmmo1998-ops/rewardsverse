import { Link } from 'react-router-dom';
import { Menu, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#071c16]/80 backdrop-blur-xl border-b border-green-400/15 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-green-200/70 hover:text-green-300 rounded-lg hover:bg-green-400/10 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-cyber flex items-center justify-center glow-green">
            <Coins className="w-5 h-5 text-[#06140f]" />
          </div>
          <div>
            <h1 className="text-base font-bold"><span className="text-gradient">Rewards</span>Verse</h1>
            <p className="text-[9px] text-green-300/70 tracking-[0.2em] uppercase font-bold">Fast Payouts</p>
          </div>
        </Link>
      </div>

      <Link to="/wallet" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/25 hover:bg-green-400/20 transition-colors">
        <Coins className="w-4 h-4 text-green-300" />
        <span className="text-green-200/70 text-xs hidden sm:inline">Balance</span>
        <span className="font-heading font-bold text-sm text-green-300">${Number(profile?.balance || 0).toFixed(2)}</span>
      </Link>
    </header>
  );
}
