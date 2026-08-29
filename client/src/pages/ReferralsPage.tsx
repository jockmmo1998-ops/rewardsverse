import { useState } from 'react';
import { Users, Copy, CheckCircle2, TrendingUp, Gift } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

export default function ReferralsPage() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const referralsQuery = trpc.referrals.getMine.useQuery(undefined, { enabled: Boolean(profile?.id), retry: false });
  const referrals = referralsQuery.data?.referrals ?? [];
  const totalCommission = Number(referralsQuery.data?.totalCommission ?? profile?.refEarnings ?? 0);
  const referralCode = profile?.refCode || '';
  const referralLink = `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Referrals & Rewards" subtitle="Invite friends and track commissions from verified activity." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Friends" value={referrals.length.toString()} icon={<Users className="w-5 h-5" />} delay={0} />
        <StatCard title="Commissions Earned" value={`$${totalCommission.toFixed(2)}`} icon={<TrendingUp className="w-5 h-5 text-success" />} gradient delay={0.1} />
        <StatCard title="Commission Rate" value="10%" icon={<Gift className="w-5 h-5 text-primary" />} delay={0.2} />
      </div>

      <GlassCard className="p-6 md:p-8 text-center bg-gradient-to-b from-primary/10 to-transparent border-primary/20">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-2xl mb-4">Share your referral link</h2>
          <p className="text-muted-foreground mb-6">Your commission is calculated from recorded referral earnings in the RewardsVerse ledger.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto">
            <div className="flex-1 w-full bg-muted/70 border border-border rounded-xl p-4 text-left overflow-x-auto">
              <code className="text-primary font-mono text-sm whitespace-nowrap">{referralLink}</code>
            </div>
            <button onClick={copyToClipboard} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl btn-cyber font-semibold shrink-0">
              {copied ? <><CheckCircle2 className="w-5 h-5" /> Copied</> : <><Copy className="w-5 h-5" /> Copy Link</>}
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden mt-6">
        <div className="p-6 border-b border-border"><h3 className="font-heading font-bold text-lg">Your Referrals</h3></div>
        {referralsQuery.isLoading ? <div className="text-center py-16 text-muted-foreground">Loading referral ledger...</div> : referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/70 border-b border-border"><tr><th className="px-6 py-4 font-medium">User</th><th className="px-6 py-4 font-medium">Joined Date</th><th className="px-6 py-4 font-medium text-right">Recorded Earnings</th></tr></thead>
              <tbody className="divide-y divide-border/50">
                {referrals.map(ref => <tr key={ref.id} className="hover:bg-primary/5 transition-colors"><td className="px-6 py-4 font-medium text-foreground">{ref.username || 'User'}</td><td className="px-6 py-4 text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 text-right font-medium">${Number(ref.totalEarned || 0).toFixed(2)}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <div className="text-center py-16 text-muted-foreground">You have no recorded referrals yet. Share your link to get started.</div>}
      </GlassCard>
    </div>
  );
}
