import { useEffect, useMemo, useState } from 'react';
import { Shuffle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarPicker, avatarDefinition } from '@/components/AvatarSystem';
import HomePage from './HomePage';

const randomUserNames = ['Liam', 'Noah', 'Olivia', 'Ava', 'Mia', 'Luna', 'Grace', 'Mateo', 'Sofia', 'Arjun', 'Mira', 'Zara', 'Hiro', 'Yuki', 'Aiko', 'Omar', 'Amina', 'Nour'];

function createRandomUsername() {
  const name = randomUserNames[Math.floor(Math.random() * randomUserNames.length)];
  return `${name}${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      await refreshProfile();
      toast.success('Profile ready. Welcome to RewardsVerse!');
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => toast.error(error.message || 'Could not save your profile.'),
  });
  const validUsername = /^[a-zA-Z][a-zA-Z0-9]{2,23}$/.test(username);
  const canContinue = Boolean(user && !loading && avatarId && validUsername && !updateProfile.isPending);
  const selectedAvatar = useMemo(() => avatarId ? avatarDefinition(avatarId) : null, [avatarId]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="onboarding-page relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none select-none blur-[1px] brightness-[0.52] saturate-[0.7]">
        <HomePage />
      </div>

      <div className="rv-modal-backdrop onboarding-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6" role="presentation">
        <section role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="onboarding-dialog my-auto w-full max-w-3xl rounded-[1.75rem] border border-primary/30 bg-card/95 p-5 text-foreground shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"><Sparkles className="h-6 w-6" /></div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[.18em] text-emerald-400">Welcome to RewardsVerse</p>
            <h1 id="onboarding-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Finish setting up your profile</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Choose an avatar and generate your username to unlock your dashboard.</p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Choose an avatar</h2><p className="mt-1 text-xs text-muted-foreground">You can change it later from Profile.</p></div>{selectedAvatar && <span className="text-xs font-semibold text-primary">{selectedAvatar.name}</span>}</div>
              <div className="mt-5"><AvatarPicker value={avatarId} onChange={setAvatarId} /></div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-5"><h2 className="font-display text-lg font-semibold">Random username</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Generate a name with letters and numbers. Regenerate until you like it.</p><div className="mt-5 space-y-3"><input readOnly value={username} placeholder="Click Generate" className="h-12 w-full rounded-xl border border-border bg-background px-3 text-center font-mono text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /><button type="button" onClick={() => setUsername(createRandomUsername())} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 text-sm font-bold text-primary transition hover:bg-primary/20"><Shuffle className="h-4 w-4" /> Generate username</button><p className="text-center text-[11px] text-muted-foreground">{username ? 'Username selected' : 'Required before continuing'}</p></div></div>
          </div>

          <button type="button" disabled={!canContinue} onClick={() => updateProfile.mutate({ username, avatarId: avatarId as number })} className="mt-6 h-12 w-full rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{updateProfile.isPending ? 'Saving profile…' : 'Continue to dashboard'}</button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Signed in as {profile?.email || 'your new account'} · This step is required</p>
        </section>
      </div>
    </div>
  );
}
