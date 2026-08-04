import { useEffect, useState } from 'react';
import { Users, Copy, CheckCircle2, TrendingUp, Gift } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';

export default function ReferralsPage() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      supabase.from('profiles').select('id, username, created_at, lifetime_earnings').eq('referred_by', profile.id)
        .then(({ data }) => setReferrals(data || []));
      
      supabase.from('transactions').select('amount').eq('user_id', profile.id).eq('type', 'referral_commission')
        .then(({ data }) => {
          const total = (data || []).reduce((acc, curr) => acc + curr.amount, 0);
          setTotalCommission(total);
        });
    }
  }, [profile]);

  const referralLink = `${window.location.origin}/register?ref=${profile?.referral_code || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Referrals & Rewards" subtitle="Invite friends and earn 15% lifetime commission from their earnings." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Friends" value={referrals.length.toString()} icon={<Users className="w-5 h-5" />} delay={0} />
        <StatCard title="Commissions Earned" value={`$${totalCommission.toFixed(2)}`} icon={<TrendingUp className="w-5 h-5 text-success" />} gradient delay={0.1} />
        <StatCard title="Commission Rate" value="15%" icon={<Gift className="w-5 h-5 text-primary" />} delay={0.2} />
      </div>

      <GlassCard className="p-6 md:p-8 text-center bg-gradient-to-b from-primary/10 to-transparent border-primary/20">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-2xl mb-4">Share your link</h2>
          <p className="text-muted-foreground mb-6">You'll receive a 15% commission for every task your referred friends complete. Forever!</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto">
            <div className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl p-4 text-left overflow-x-auto">
              <code className="text-primary font-mono text-sm whitespace-nowrap">{referralLink}</code>
            </div>
            <button 
              onClick={copyToClipboard}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shrink-0"
            >
              {copied ? <><CheckCircle2 className="w-5 h-5" /> Copied</> : <><Copy className="w-5 h-5" /> Copy Link</>}
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden mt-6">
        <div className="p-6 border-b border-border">
          <h3 className="font-heading font-bold text-lg">Your Referrals</h3>
        </div>
        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-black/20 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                  <th className="px-6 py-4 font-medium text-right">Their Total Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {referrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{ref.username}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-medium">${(ref.lifetime_earnings || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            You haven't referred anyone yet. Share your link now!
          </div>
        )}
      </GlassCard>
    </div>
  );
}
