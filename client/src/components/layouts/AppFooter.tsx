import { ArrowUpRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/shared/RewardUI';

const navigation = [
  { label: 'Earn rewards', to: '/offerwalls' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Activity', to: '/history' },
  { label: 'Referrals', to: '/referrals' },
  { label: 'Withdraw', to: '/withdraw' },
];

const account = [
  { label: 'Profile', to: '/profile' },
  { label: 'Settings', to: '/settings' },
  { label: 'Support', to: '/support' },
];

const legal = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
  { label: 'Reward Policy', to: '/reward-policy' },
  { label: 'Withdrawal Policy', to: '/withdrawal-policy' },
];

function FooterColumn({ title, links }: { title: string; links: Array<{ label: string; to: string }> }) {
  return (
    <div>
      <p className="footer-title">{title}</p>
      <div className="mt-4 space-y-2.5">
        {links.map((link) => <Link key={link.to} to={link.to} className="footer-link">{link.label}</Link>)}
      </div>
    </div>
  );
}

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-content mx-auto grid w-full max-w-[1500px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))] lg:px-8 lg:py-12">
        <div className="max-w-xs">
          <Link to="/home" className="focus-ring inline-flex items-center gap-3"><BrandMark /></Link>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Earn rewards from verified surveys, apps, games and tasks.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[.06] px-3 py-1.5 text-[11px] font-semibold text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> Verified activity and clear payouts</div>
        </div>
        <FooterColumn title="Navigation" links={navigation} />
        <FooterColumn title="Account" links={account} />
        <FooterColumn title="Legal" links={legal} />
        <div>
          <p className="footer-title">Support</p>
          <div className="mt-4 space-y-2.5">
            <a className="footer-link" href="https://t.me/wilsonrobertul804" target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" />Telegram Support <ArrowUpRight className="h-3 w-3" /></a>
            <Link className="footer-link" to="/faq">FAQ</Link>
            <Link className="footer-link" to="/support">Contact support</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="app-footer-content mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RewardsVerse. All rights reserved.</p>
          <p>Clear terms. Verified rewards. Responsible withdrawals.</p>
        </div>
      </div>
    </footer>
  );
}
