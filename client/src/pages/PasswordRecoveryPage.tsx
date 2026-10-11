import { type FormEvent, useEffect, useState } from 'react';
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
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (resetMode) void supabase.auth.getSession();
  }, [resetMode]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setSubmitError('');
    try {
      if (!resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent(true);
        toast.success('Password reset email sent.');
        return;
      }

      if (password.length < 6 || password !== confirm) {
        throw new Error('Use at least 6 characters and make both passwords match.');
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password reset successfully.');
      navigate('/login', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background px-4 py-8 text-foreground sm:py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <KeyRound className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-black">{resetMode ? 'Choose a new password' : 'Forgot password?'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {resetMode ? 'Set a new password for your account.' : 'We will email you a secure password reset link.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xl sm:p-6">
          {!resetMode ? (
            <>
              <label htmlFor="recovery-email" className="block text-sm font-medium">
                Email
                <input
                  id="recovery-email"
                  autoComplete="email"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </label>
              {sent && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Check your inbox and open the reset link.</p>}
            </>
          ) : (
            <>
              <label htmlFor="new-password" className="block text-sm font-medium">
                New password
                <input
                  id="new-password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </label>
              <label htmlFor="confirm-password" className="block text-sm font-medium">
                Confirm password
                <input
                  id="confirm-password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </label>
            </>
          )}
          {submitError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</p>}
          <button type="submit" disabled={busy} className="min-h-11 w-full rounded-lg bg-emerald-600 font-bold text-white disabled:opacity-50">
            {busy ? 'Processing…' : resetMode ? 'Save new password' : 'Send reset email'}
          </button>
          <Link to="/login" className="block min-h-11 text-center text-sm leading-[44px] text-emerald-400 hover:underline">Back to login</Link>
        </form>
      </div>
    </main>
  );
}
