import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Award, CheckCircle2, Clock3, KeyRound, Mail, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeading, Surface } from '@/components/shared/RewardUI';
import { EmailVerificationGate } from '@/components/EmailVerificationGate';
import { UserAvatar } from '@/components/AvatarSystem';
import { trpc } from '@/lib/trpc';

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const updateMutation = trpc.user.updateProfile.useMutation();
  const summary = trpc.user.getDashboardSummary.useQuery(undefined, {
    enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false,
  });
  const withdrawals = trpc.withdraw.getMyWithdrawals.useQuery(undefined, {
    enabled: Boolean(profile?.id), staleTime: 30_000, refetchOnWindowFocus: false, retry: false,
  });

  useEffect(() => setUsername(profile?.username || ''), [profile?.username]);

  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    try {
      await updateMutation.mutateAsync({ username });
      toast.success('Profile updated successfully');
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.message || 'Could not update profile');
    }
  };

  const name = profile?.username || profile?.name || 'Member';
  const emailVerified = Boolean(profile?.emailVerifiedAt);
  const balance = Number(profile?.balance || 0);
  const totalEarned = Number(summary.data?.totalEarned ?? profile?.totalEarned ?? profile?.lifetime_earnings ?? 0);
  const pendingRewardsValue = summary.isLoading || summary.isError ? '—' : money(summary.data?.pendingRewards);
  const pendingWithdrawals = withdrawals.isLoading || withdrawals.isError
    ? '—'
    : String((withdrawals.data ?? []).filter((item: any) => item.status === 'pending').length);

  return (
    <div className="unified-page profile-page mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading
        eyebrow="Account identity"
        title="Profile"
        description="Manage your identity, email verification, and account details."
        action={<span className={`unified-page-chip ${emailVerified ? '' : 'is-warning'}`}><span className="status-dot" />{emailVerified ? 'Email verified' : 'Verification needed'}</span>}
      />

      <section className="profile-reward-overview" aria-label="Rewards overview">
        <div className="profile-reward-overview-heading">
          <div><p className="rv-eyebrow">Your rewards hub</p><h2>Offers, points and withdrawals</h2><p>Everything connected to your earning account in one view.</p></div>
          <Link to="/offerwalls" className="unified-primary-button"><ArrowUpRight className="h-4 w-4" /> Browse offers</Link>
        </div>
        <div className="profile-reward-grid">
          <div className="profile-reward-card is-primary"><span className="profile-reward-icon"><WalletCards className="h-4 w-4" /></span><p>Available balance</p><strong>{money(balance)}</strong><Link to="/withdraw">Withdraw now <ArrowDownToLine className="h-3.5 w-3.5" /></Link></div>
          <div className="profile-reward-card"><span className="profile-reward-icon"><Award className="h-4 w-4" /></span><p>Total earned</p><strong>{money(totalEarned)}</strong><span>{profile?.completed_offers || profile?.offersCompleted || 0} offers completed</span></div>
          <div className="profile-reward-card"><span className="profile-reward-icon"><Clock3 className="h-4 w-4" /></span><p>Pending rewards</p><strong>{pendingRewardsValue}</strong><span>{summary.isError ? 'Status temporarily unavailable' : 'Awaiting verification'}</span></div>
          <div className="profile-reward-card"><span className="profile-reward-icon"><ArrowDownToLine className="h-4 w-4" /></span><p>Pending withdrawals</p><strong>{pendingWithdrawals}</strong><Link to="/history">View activity <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Surface className="unified-surface p-6 text-center">
            <UserAvatar userId={profile?.id} avatarId={profile?.avatarId} alt="Your selected avatar" className="mx-auto h-24 w-24 rounded-full border border-primary/30 object-cover shadow-lg" />
            <h2 className="mt-5 font-display text-xl font-semibold">{name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email || 'No email available'}</p>
            <span className="unified-status mt-4"><ShieldCheck className="h-3.5 w-3.5" /> Level {profile?.level || 1} member</span>
          </Surface>
          <Surface className="unified-surface p-5">
            <p className="rv-eyebrow">Member details</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Joined</span><span className="text-right text-foreground">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Offers completed</span><span className="text-foreground">{profile?.completed_offers || 0}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Referral code</span><span className="text-primary">{profile?.refCode || profile?.referral_code || '—'}</span></div>
            </div>
          </Surface>
        </div>

        <div className="space-y-6">
          <Surface className="unified-surface p-5 sm:p-7">
            <div className="flex items-center gap-3"><div className="unified-icon"><UserRound className="h-4 w-4" /></div><div><p className="rv-eyebrow">Basic information</p><h2 className="mt-1 font-display text-lg font-semibold">Personal details</h2></div></div>
            <form onSubmit={updateProfile} className="mt-6 space-y-5">
              <div>
                <label htmlFor="profile-email" className="unified-label">Email address</label>
                <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="profile-email" type="email" value={user?.email || ''} disabled className="unified-input h-11 w-full pl-10 text-muted-foreground" /></div>
                <p className={`mt-2 flex items-center gap-1.5 text-xs ${emailVerified ? 'text-primary' : 'text-amber-300'}`}>{emailVerified ? <><CheckCircle2 className="h-3.5 w-3.5" /> Email is verified</> : 'Email verification required before withdrawing'}</p>
              </div>
              <div><label htmlFor="profile-display-name" className="unified-label">Display name</label><input id="profile-display-name" autoComplete="nickname" value={username} onChange={(event) => setUsername(event.target.value)} className="unified-input h-11 w-full" /></div>
              <button type="submit" disabled={updateMutation.isPending} className="unified-primary-button">{updateMutation.isPending ? 'Saving…' : 'Save changes'}</button>
            </form>
          </Surface>

          {!emailVerified && <EmailVerificationGate email={user?.email || profile?.email} onVerified={() => refreshProfile()} />}

          <Surface className="unified-surface p-5 sm:p-7">
            <div className="flex items-center gap-3"><div className="unified-icon"><KeyRound className="h-4 w-4" /></div><div><p className="rv-eyebrow">Security</p><h2 className="mt-1 font-display text-lg font-semibold">Password settings</h2></div></div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">Change your password from Settings, or use Forgot password on the login page if you cannot sign in.</p>
          </Surface>
        </div>
      </div>
    </div>
  );
}
