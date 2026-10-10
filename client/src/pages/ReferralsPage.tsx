import { useState } from 'react';
import { Check, Copy, Gift, Link2, MousePointerClick, Users, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/AvatarSystem';
import { EmptyState, LoadingRows, SectionHeading, StatTile, Surface } from '@/components/shared/RewardUI';

export default function ReferralsPage() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const query = trpc.referrals.getMine.useQuery(undefined, { enabled: Boolean(profile?.id), retry: false });
  const referrals = query.data?.referrals ?? [];
  const totalCommission = Number(query.data?.totalCommission ?? profile?.refEarnings ?? 0);
  const code = profile?.refCode || '';
  const link = `${window.location.origin}/register?ref=${encodeURIComponent(code)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Referral link copied');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <div className="unified-page mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading eyebrow="Grow together" title="Referral program" description="Invite people you trust and follow your referral activity in one place." action={<span className="unified-page-chip"><Users className="h-3.5 w-3.5" /> 10% commission</span>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Friends invited" value={String(referrals.length)} helper="Recorded referrals" icon={Users} accent="mint" />
        <StatTile label="Commission earned" value={`$${totalCommission.toFixed(2)}`} helper="From verified activity" icon={WalletCards} accent="violet" />
        <StatTile label="Commission rate" value="10%" helper="Current program rate" icon={Gift} accent="amber" />
      </div>

      <Surface className="unified-surface overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rv-eyebrow">Your invite link</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Share your edge</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Your commission is calculated from recorded referral earnings in the RewardsVerse ledger.</p>
          </div>
          <div className="unified-icon"><Link2 className="h-5 w-5" /></div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="unified-copy-field min-w-0"><code className="block truncate text-sm text-primary">{link}</code></div>
          <button type="button" onClick={copy} aria-live="polite" className="unified-primary-button h-12 shrink-0">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy link'}</button>
        </div>
      </Surface>

      <Surface className="unified-surface overflow-hidden p-5 sm:p-6">
        <SectionHeading eyebrow="Referral ledger" title="Your activity" />
        <div className="mt-5">
          {query.isLoading ? <LoadingRows count={3} /> : query.isError ? (
            <EmptyState title="Referrals could not be loaded" description="The referral service is temporarily unavailable. Your referral records have not been changed." icon={Users} action={<button type="button" onClick={() => void query.refetch()} className="text-sm font-semibold text-primary">Try again</button>} />
          ) : referrals.length ? (
            <div className="overflow-x-auto">
              <table className="unified-table w-full min-w-[580px] text-left text-sm">
                <thead><tr><th>Member</th><th>Joined</th><th className="text-right">Recorded earnings</th></tr></thead>
                <tbody>{referrals.map((ref: any) => (
                  <tr key={ref.id}>
                    <td><div className="flex items-center gap-3"><UserAvatar userId={ref.userId || ref.id} avatarId={ref.avatarId} alt="Referral member avatar" className="h-8 w-8 rounded-full" /><span className="font-medium text-foreground">{ref.username || 'Member'}<small className="block text-xs text-muted-foreground">Referral member</small></span></div></td>
                    <td className="text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString()}</td>
                    <td className="text-right font-semibold text-primary">${Number(ref.totalEarned || 0).toFixed(2)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <EmptyState title="No referrals yet" description="Share your invite link to start building your referral network." icon={MousePointerClick} />}
        </div>
      </Surface>
    </div>
  );
}
