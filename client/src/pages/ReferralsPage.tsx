import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import AppLayout from '@/components/layouts/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { toast } from 'sonner';
import { Copy, Users, Gift, CheckCircle2, ArrowRight } from 'lucide-react';
import { getUserReferrals } from '@/lib/api';
import type { Referral } from '@/types/types';

export default function ReferralsPage() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      getUserReferrals(profile.id).then(data => { setReferrals(data); setLoading(false); });
    }
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const referralLink = profile ? `${window.location.origin}/register?ref=${profile.referral_code}` : '';

  const copyLink = () => { navigator.clipboard.writeText(referralLink); toast.success('Referral link copied!'); };
  const copyCode = () => { if (!profile?.referral_code) return; navigator.clipboard.writeText(profile.referral_code); toast.success('Referral code copied!'); };

  const totalEarned = referrals.reduce((acc, r) => acc + r.bonus_amount, 0);

  return (
    <>
      <PageMeta title="Referrals — RewardsVerse" description="Invite friends and earn referral bonuses" />
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-5">
          <div>
            <h1 className="text-xl font-bold font-heading" style={{ color: '#F4F4F5' }}>Referrals</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
              Invite friends and earn bonuses when they join and complete offers.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5" style={{ background: 'rgba(16,20,31,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(244,244,245,0.4)' }}>Total Referrals</p>
              <p className="text-3xl font-bold font-heading" style={{ color: '#3B82F6' }}>{referrals.length}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
              className="rounded-2xl p-5" style={{ background: 'rgba(16,20,31,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(244,244,245,0.4)' }}>Total Earned</p>
              <p className="text-3xl font-bold font-heading" style={{ color: '#22C55E' }}>${totalEarned.toFixed(2)}</p>
            </motion.div>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: Copy,  step: '01', text: 'Share your unique referral link or code with friends', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
              { icon: Users, step: '02', text: 'Friends sign up using your code and start earning', color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
              { icon: Gift,  step: '03', text: 'You earn a bonus for every friend who completes offers', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                    <Icon size={14} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: item.color }}>Step {item.step}</p>
                    <p className="text-xs" style={{ color: 'rgba(244,244,245,0.5)' }}>{item.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Your referral details */}
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(16,20,31,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-semibold font-heading" style={{ color: '#F4F4F5' }}>Your Referral Details</h2>

            {/* Code */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(244,244,245,0.4)' }}>Referral Code</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm font-bold tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#22C55E' }}>
                  {profile?.referral_code ?? '—'}
                </div>
                <button onClick={copyCode} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>

            {/* Link */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(244,244,245,0.4)' }}>Referral Link</p>
              <div className="flex items-center gap-2">
                <input readOnly value={referralLink}
                  className="flex-1 px-3 py-2.5 rounded-xl text-xs"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(244,244,245,0.5)' }} />
                <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Referral list */}
          <div>
            <h2 className="text-sm font-semibold font-heading mb-3" style={{ color: '#F4F4F5' }}>Referred Members</h2>
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)
              ) : referrals.length === 0 ? (
                <div className="rounded-2xl py-10 text-center"
                  style={{ background: 'rgba(16,20,31,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Users size={26} className="mx-auto mb-2" style={{ color: 'rgba(244,244,245,0.2)' }} />
                  <p className="text-sm font-medium" style={{ color: 'rgba(244,244,245,0.35)' }}>No referrals yet.</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(244,244,245,0.25)' }}>Share your link to get started!</p>
                </div>
              ) : referrals.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(16,20,31,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle2 size={12} style={{ color: '#22C55E' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>
                      Joined {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#22C55E' }}>+${r.bonus_amount.toFixed(2)}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={r.paid_at
                        ? { background: 'rgba(34,197,94,0.1)', color: '#22C55E' }
                        : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                      {r.paid_at ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

