import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

export default function PasswordRecoveryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetMode = location.pathname === '/reset-password';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => { if (resetMode) void supabase.auth.getSession(); }, [resetMode]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true);
    if (!resetMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false); if (error) toast.error(error.message); else { setSent(true); toast.success('Password reset email sent.'); }
      return;
    }
    if (password.length < 6 || password !== confirm) { setBusy(false); toast.error('Use at least 6 characters and make both passwords match.'); return; }
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false); if (error) toast.error(error.message); else { toast.success('Password reset successfully.'); navigate('/login', { replace: true }); }
  };
  return <main className="min-h-screen bg-background px-4 py-12 text-foreground"><div className="mx-auto max-w-md"><div className="mb-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white"><KeyRound className="h-6 w-6" /></div><h1 className="mt-4 text-2xl font-black">{resetMode ? 'Choose a new password' : 'Forgot password?'}</h1><p className="mt-2 text-sm text-muted-foreground">{resetMode ? 'Set a new Supabase Auth password for your account.' : 'We will email you a secure password reset link.'}</p></div><form onSubmit={submit} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-xl">{!resetMode ? <><label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none focus:border-emerald-400" /></label>{sent && <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Check your inbox and open the reset link.</p>}</> : <><label className="block text-sm font-medium">New password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none focus:border-emerald-400" /></label><label className="block text-sm font-medium">Confirm password<input required minLength={6} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none focus:border-emerald-400" /></label></>}<button disabled={busy} className="h-11 w-full rounded-lg bg-emerald-600 font-bold text-white disabled:opacity-50">{busy ? 'Processing…' : resetMode ? 'Save new password' : 'Send reset email'}</button><Link to="/login" className="block text-center text-sm text-emerald-400 hover:underline">Back to login</Link></form></div></main>;
}
