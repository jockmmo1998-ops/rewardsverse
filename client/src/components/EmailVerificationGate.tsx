import { FormEvent, useEffect, useState } from "react";
import { MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/db/supabase";
import { trpc } from "@/lib/trpc";
import { Surface } from "@/components/shared/RewardUI";

type Props = { onVerified?: () => void };
const PROFILE_REDIRECT = `${window.location.origin}/profile`;

export function EmailVerificationGate({ onVerified }: Props) {
  const linkEmail = trpc.user.linkVerifiedEmail.useMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const syncVerifiedSession = async () => {
    let { data: sessionData } = await supabase.auth.getSession();
    let session = sessionData.session;
    let authUser = session?.user;
    if (!session?.access_token) return false;

    let confirmed = Boolean(authUser?.email_confirmed_at || (authUser as any)?.confirmed_at);
    if (!confirmed) {
      const refreshed = await supabase.auth.refreshSession();
      session = refreshed.data.session || session;
      authUser = session?.user;
      confirmed = Boolean(authUser?.email_confirmed_at || (authUser as any)?.confirmed_at);
    }
    if (!confirmed || !session?.access_token) return false;

    await linkEmail.mutateAsync({ accessToken: session.access_token });
    onVerified?.();
    return true;
  };

  useEffect(() => {
    void syncVerifiedSession().catch(() => undefined);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const existing = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      let session = existing.data.session;
      if (existing.error && /invalid login credentials|user not found/i.test(existing.error.message)) {
        const created = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: PROFILE_REDIRECT },
        });
        if (created.error) throw created.error;
        session = created.data.session;
        if (!session) {
          setWaiting(true);
          toast.success("Verification email sent. Confirm it, then return to your Profile.");
          return;
        }
      } else if (existing.error) {
        throw existing.error;
      }
      if (!session?.user.email_confirmed_at && !(session?.user as any)?.confirmed_at) {
        setWaiting(true);
        toast.success("Please confirm the verification email, then open your Profile to finish.");
        return;
      }
      await linkEmail.mutateAsync({ accessToken: session.access_token });
      toast.success("Email verified. You can now withdraw.");
      onVerified?.();
    } catch (error: any) {
      toast.error(error?.message || "Unable to verify this email.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) return toast.error("Enter your email first.");
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: PROFILE_REDIRECT } });
    if (error) toast.error(error.message);
    else toast.success("Verification email sent again.");
  };

  return (
    <Surface className="border-amber-400/30 bg-amber-400/5 p-5 sm:p-6">
      <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300"><ShieldCheck className="h-5 w-5" /></div><div><p className="rv-eyebrow text-amber-300">Verification required</p><h2 className="mt-1 font-display text-xl font-semibold">Verify your email before withdrawing</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">This is required only for payouts. We use Supabase Auth to protect your balance and help you recover your password.</p></div></div>
      <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label><label className="text-sm font-medium">Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label><button disabled={busy} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><MailCheck className="h-4 w-4" />{busy ? "Checking…" : "Verify email"}</button></form>
      {waiting && <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span>Confirm the link, then return to Profile and press refresh if needed.</span><button type="button" onClick={() => void resend()} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><RefreshCw className="h-3 w-3" /> Resend email</button></div>}
    </Surface>
  );
}
