import { useState } from "react";
import { CheckCircle2, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Surface } from "@/components/shared/RewardUI";

type Props = { email?: string | null; onVerified?: () => void };

export function EmailVerificationGate({ email, onVerified }: Props) {
  const resend = trpc.user.resendVerificationEmail.useMutation();
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    try {
      const result = await resend.mutateAsync();
      if (result.alreadyVerified) {
        toast.success("Your email is already verified.");
        onVerified?.();
        return;
      }
      setSent(true);
      toast.success("Verification email sent again.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to send the verification email.");
    }
  };

  return (
    <Surface className="border-amber-400/25 bg-amber-400/[.045] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="rv-eyebrow text-amber-300">Email verification</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                <Mail className="h-3 w-3" /> Required for withdrawals
              </span>
            </div>
            <h2 className="mt-1 font-display text-base font-semibold">Verify your email to unlock payouts</h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">{email || "Add an email address to your account"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={resend.isPending || !email}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${resend.isPending ? "animate-spin" : ""}`} />
          {resend.isPending ? "Sending…" : sent ? "Send again" : "Resend email"}
        </button>
      </div>
      {sent && (
        <div className="mt-3 flex items-center gap-2 border-t border-amber-400/15 pt-3 text-xs text-amber-100/80">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Check your inbox and spam folder, then open the verification link.
        </div>
      )}
    </Surface>
  );
}
