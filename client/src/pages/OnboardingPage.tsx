import { useMemo, useState } from 'react';
import { Shuffle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarPicker, avatarDefinition } from '@/components/AvatarSystem';

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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-3xl rounded-3xl border border-border/60 bg-card/90 p-6 shadow-2xl shadow-black/20 sm:p-9">
        <div className="mx-auto max-w-2xl text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"><Sparkles className="h-6 w-6" /></div><p className="mt-5 text-[11px] font-bold uppercase tracking-[.18em] text-emerald-400">One last step</p><h1 className="mt-2 text-3xl font-black tracking-tight">Personalize your RewardsVerse profile</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Choose your avatar and generate a username. Both are required before you can enter the dashboard.</p></div>
        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_230px]">
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Choose an avatar</h2><p className="mt-1 text-xs text-muted-foreground">You can change it later from Profile.</p></div>{selectedAvatar && <span className="text-xs font-semibold text-primary">{selectedAvatar.name}</span>}</div><div className="mt-5"><AvatarPicker value={avatarId} onChange={setAvatarId} /></div></div>
          <div className="rounded-2xl border border-border/60 bg-background/40 p-5"><h2 className="font-display text-lg font-semibold">Random username</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Generate a name with letters and numbers. You can regenerate until you like it.</p><div className="mt-5 space-y-3"><input readOnly value={username} placeholder="Click Generate" className="h-12 w-full rounded-xl border border-border bg-background px-3 text-center font-mono text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /><button type="button" onClick={() => setUsername(createRandomUsername())} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 text-sm font-bold text-primary transition hover:bg-primary/20"><Shuffle className="h-4 w-4" /> Generate username</button><p className="text-center text-[11px] text-muted-foreground">{username ? 'Username selected' : 'Required before continuing'}</p></div></div>
        </div>
        <button type="button" disabled={!canContinue} onClick={() => updateProfile.mutate({ username, avatarId: avatarId as number })} className="mt-7 h-12 w-full rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{updateProfile.isPending ? 'Saving profile…' : 'Continue to dashboard'}</button>
        <p className="mt-4 text-center text-xs text-muted-foreground">Signed in as {profile?.email || 'your new account'}</p>
      </section>
    </main>
  );
}
