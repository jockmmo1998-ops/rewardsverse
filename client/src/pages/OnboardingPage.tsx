import { useEffect, useMemo, useState } from 'react';
import { Shuffle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar, avatarDefinition } from '@/components/AvatarSystem';
import HomePage from './HomePage';

const randomUserNames = ['Liam', 'Noah', 'Olivia', 'Ava', 'Mia', 'Luna', 'Grace', 'Mateo', 'Sofia', 'Arjun', 'Mira', 'Zara', 'Hiro', 'Yuki', 'Aiko', 'Omar', 'Amina', 'Nour'];

function createRandomUsername() {
  const name = randomUserNames[Math.floor(Math.random() * randomUserNames.length)];
  return `${name}${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [username, setUsername] = useState(() => createRandomUsername());
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      await refreshProfile();
      toast.success('Profile ready. Welcome to RewardsVerse!');
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => toast.error(error.message || 'Could not save your profile.'),
  });
  const validUsername = /^[a-zA-Z][a-zA-Z0-9_]{2,63}$/.test(username);
  const canContinue = Boolean(user && !loading && validUsername && !updateProfile.isPending);
  const selectedAvatar = useMemo(() => avatarDefinition(profile?.avatarId ?? user?.avatarId), [profile?.avatarId, user?.avatarId]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="onboarding-page relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none select-none blur-[1px] brightness-[0.52] saturate-[0.7]"><HomePage /></div>
      <div className="rv-modal-backdrop onboarding-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6" role="presentation">
        <section role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="onboarding-dialog my-auto w-full max-w-lg rounded-2xl border border-primary/25 bg-card/95 p-5 text-foreground shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:p-7">
          <div className="mb-5 flex items-center gap-2.5 border-b border-border/70 pb-4">
            <img src="/rewardsverse-icon.png" alt="RewardsVerse" className="h-7 w-7 rounded-md object-contain" />
            <span className="text-[10px] font-extrabold tracking-[.12em] text-foreground">REWARDSVERSE</span>
          </div>
          <div className="flex items-start gap-3">
            <UserAvatar userId={profile?.id ?? user?.id} avatarId={profile?.avatarId ?? user?.avatarId} alt={`${selectedAvatar.name} avatar`} className="h-11 w-11 shrink-0 rounded-xl border border-primary/30 object-cover" />
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-primary"><Sparkles className="h-3.5 w-3.5" /> Almost there</p>
              <h1 id="onboarding-title" className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Choose your username</h1>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Your avatar is saved from sign-up. Set a username to finish your profile.</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-border/60 bg-background/50 p-4">
            <label htmlFor="rv-username" className="text-xs font-bold text-foreground">Username</label>
            <input id="rv-username" readOnly value={username} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-center font-mono text-sm font-bold text-foreground" />
            <button type="button" onClick={() => setUsername(createRandomUsername())} className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/35 bg-primary/10 px-3 text-xs font-bold text-primary transition hover:bg-primary/20"><Shuffle className="h-3.5 w-3.5" /> Generate another username</button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">Avatar selected: {selectedAvatar.name} · You can change it later from Profile.</p>
          </div>
          <button type="button" disabled={!canContinue} onClick={() => updateProfile.mutate({ username })} className="mt-4 h-11 w-full rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{updateProfile.isPending ? 'Saving profile…' : 'Continue to dashboard'}</button>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">Signed in as {profile?.email || 'your new account'}</p>
        </section>
      </div>
    </div>
  );
}
