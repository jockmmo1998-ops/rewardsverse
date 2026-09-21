import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/db/supabase";
import { Surface } from "@/components/shared/RewardUI";

export function PasswordSecurityCard() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6 || password !== confirm) return toast.error("Use at least 6 characters and make both passwords match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { setPassword(""); setConfirm(""); toast.success("Password updated successfully."); }
  };
  return <Surface className="p-5 sm:p-7"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><KeyRound className="h-4 w-4" /></div><div><p className="rv-eyebrow">Account security</p><h2 className="mt-1 font-display text-lg font-semibold">Change password</h2></div></div><form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2"><input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /><input required minLength={6} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /><button disabled={busy} className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:col-span-2">{busy ? "Updating…" : "Update password"}</button></form></Surface>;
}
