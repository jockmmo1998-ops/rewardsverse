import { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeading, Surface } from '@/components/shared/RewardUI';
import { EmailVerificationGate } from '@/components/EmailVerificationGate';
import { AvatarPicker, avatarDataUri } from '@/components/AvatarPicker';
import { trpc } from '@/lib/trpc';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [avatar, setAvatar] = useState(profile?.avatar || avatarDataUri('mint-orbit'));
  const updateMutation = trpc.user.updateProfile.useMutation();
  useEffect(() => setUsername(profile?.username || ''), [profile?.username]);
  useEffect(() => setAvatar(profile?.avatar || avatarDataUri('mint-orbit')), [profile?.avatar]);

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    try {
      await updateMutation.mutateAsync({ username, avatar });
      toast.success('Profile updated successfully');
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.message || 'Could not update profile');
    }
  };
  const name = profile?.username || profile?.name || 'Member';
  const emailVerified = Boolean(profile?.emailVerifiedAt);
  return <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <SectionHeading eyebrow="Account identity" title="Profile" description="Manage your identity, avatar, email verification, and account details." />
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="space-y-6">
        <Surface className="p-6 text-center"><img src={avatar} alt="Your selected avatar" className="mx-auto h-24 w-24 rounded-3xl border border-primary/25 object-cover shadow-lg" /><h2 className="mt-5 font-display text-xl font-semibold">{name}</h2><p className="mt-1 text-sm text-muted-foreground">{user?.email || 'No email available'}</p><span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[.06] px-3 py-1.5 text-xs font-semibold text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Level {profile?.level || 1} member</span></Surface>
        <Surface className="p-5"><p className="rv-eyebrow">Member details</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Joined</span><span className="text-right text-foreground">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Offers completed</span><span className="text-foreground">{profile?.completed_offers || 0}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Referral code</span><span className="text-primary">{profile?.refCode || profile?.referral_code || '—'}</span></div></div></Surface>
      </div>
      <div className="space-y-6">
        <Surface className="p-5 sm:p-7"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-4 w-4" /></div><div><p className="rv-eyebrow">Profile style</p><h2 className="mt-1 font-display text-lg font-semibold">Choose your avatar</h2></div></div><p className="mt-4 text-sm text-muted-foreground">Pick a reward-themed avatar. It will appear next to your account throughout RewardsVerse.</p><div className="mt-5"><AvatarPicker value={avatar} onChange={setAvatar} /></div></Surface>
        <Surface className="p-5 sm:p-7"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-4 w-4" /></div><div><p className="rv-eyebrow">Basic information</p><h2 className="mt-1 font-display text-lg font-semibold">Personal details</h2></div></div><form onSubmit={updateProfile} className="mt-6 space-y-5"><div><label className="mb-2 block text-sm font-semibold text-foreground">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="email" value={user?.email || ''} disabled className="h-11 w-full rounded-xl border border-white/8 bg-white/[.025] pl-10 pr-4 text-sm text-muted-foreground" /></div><p className={`mt-2 flex items-center gap-1.5 text-xs ${emailVerified ? 'text-primary' : 'text-amber-300'}`}>{emailVerified ? <><CheckCircle2 className="h-3.5 w-3.5" /> Email is verified</> : 'Email verification required before withdrawing'}</p></div><div><label className="mb-2 block text-sm font-semibold text-foreground">Display name</label><input value={username} onChange={(event) => setUsername(event.target.value)} className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-white/[.04] px-4 text-sm text-foreground outline-none focus:border-primary/40" /></div><button disabled={updateMutation.isPending} className="focus-ring rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-50">{updateMutation.isPending ? 'Saving…' : 'Save changes'}</button></form></Surface>
        {!emailVerified && <EmailVerificationGate email={user?.email || profile?.email} onVerified={() => refreshProfile()} />}
        <Surface className="p-5 sm:p-7"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/12 text-accent"><KeyRound className="h-4 w-4" /></div><div><p className="rv-eyebrow">Security</p><h2 className="mt-1 font-display text-lg font-semibold">Password settings</h2></div></div><p className="mt-5 text-sm leading-6 text-muted-foreground">Change your password from Settings, or use Forgot password on the login page if you cannot sign in.</p></Surface>
      </div>
    </div>
  </div>;
}
