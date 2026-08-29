import { useState } from 'react';
import { Check, Copy, Gift, Link2, MousePointerClick, Users, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, LoadingRows, SectionHeading, StatTile, Surface } from '@/components/shared/RewardUI';

export default function ReferralsPage() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const query = trpc.referrals.getMine.useQuery(undefined, { enabled: Boolean(profile?.id), retry: false });
  const referrals = query.data?.referrals ?? [];
  const totalCommission = Number(query.data?.totalCommission ?? profile?.refEarnings ?? 0);
  const code = profile?.refCode || '';
  const link = `${window.location.origin}/register?ref=${encodeURIComponent(code)}`;
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); toast.success('Referral link copied'); setTimeout(() => setCopied(false), 1800); } catch { toast.error('Could not copy the link'); } };
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading eyebrow="Grow together" title="Referral program" description="Invite people you trust and follow your referral activity in one place." />
      <div className="grid gap-4 sm:grid-cols-3"><StatTile label="Friends invited" value={String(referrals.length)} helper="Recorded referrals" icon={Users} accent="mint" /><StatTile label="Commission earned" value={`$${totalCommission.toFixed(2)}`} helper="From verified activity" icon={WalletCards} accent="violet" /><StatTile label="Commission rate" value="10%" helper="Current program rate" icon={Gift} accent="amber" /></div>
      <Surface className="overflow-hidden p-5 sm:p-7"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="rv-eyebrow">Your invite link</p><h2 className="mt-1 font-display text-xl font-semibold">Share your edge</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Your commission is calculated from recorded referral earnings in the RewardsVerse ledger.</p></div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Link2 className="h-5 w-5" /></div></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1 rounded-xl border border-white/8 bg-white/[.035] px-4 py-3.5"><code className="block truncate text-sm text-primary">{link}</code></div><button onClick={copy} className="focus-ring inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:brightness-105">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy link'}</button></div></Surface>
      <Surface className="overflow-hidden p-5 sm:p-6"><SectionHeading eyebrow="Referral ledger" title="Your activity" /><div className="mt-5">{query.isLoading ? <LoadingRows count={3} /> : referrals.length ? <div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead><tr className="border-b border-white/8 text-[10px] uppercase tracking-[.13em] text-muted-foreground"><th className="px-3 py-3 font-semibold">Member</th><th className="px-3 py-3 font-semibold">Joined</th><th className="px-3 py-3 text-right font-semibold">Recorded earnings</th></tr></thead><tbody className="divide-y divide-white/7">{referrals.map((ref: any) => <tr key={ref.id} className="transition hover:bg-white/[.025]"><td className="px-3 py-4 font-medium text-foreground">{ref.username || 'Member'}</td><td className="px-3 py-4 text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString()}</td><td className="px-3 py-4 text-right font-semibold text-primary">${Number(ref.totalEarned || 0).toFixed(2)}</td></tr>)}</tbody></table></div> : <EmptyState title="No referrals yet" description="Share your invite link to start building your referral network." icon={MousePointerClick} />}</div></Surface>
    </div>
  );
}
