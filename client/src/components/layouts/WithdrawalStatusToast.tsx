import { CheckCircle2, Clock3, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { playBellSound } from '@/utils/bellSound';

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

function timestamp(value: unknown) {
  const parsed = value ? new Date(String(value)).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function WithdrawalStatusToast() {
  const { user } = useAuth();
  const [dismissedId, setDismissedId] = useState<number | null>(null);
  const previousStatus = useRef<{ id: number; status: string } | null>(null);
  const withdrawals = trpc.withdraw.getMyWithdrawals.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  const latest = useMemo(() => {
    const rows = (withdrawals.data ?? []) as any[];
    return [...rows].sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))[0] ?? null;
  }, [withdrawals.data]);

  const status = String(latest?.status || 'pending').toLowerCase();
  const isSuccess = ['approved', 'paid', 'completed', 'success'].includes(status);
  const isRejected = ['rejected', 'failed', 'cancelled'].includes(status);

  useEffect(() => {
    if (!latest) return;
    const current = { id: Number(latest.id), status };
    const previous = previousStatus.current;
    const becamePaid = previous?.id === current.id
      && !['approved', 'paid', 'completed', 'success'].includes(previous.status)
      && isSuccess;
    if (becamePaid && localStorage.getItem('rewardsverse-reward-sound') !== 'off') {
      void playBellSound();
    }
    previousStatus.current = current;
  }, [isSuccess, latest, status]);

  if (!latest || latest.id === dismissedId) return null;

  const tone = isSuccess
    ? { border: 'border-emerald-400/40', icon: 'bg-emerald-400/15 text-emerald-300', title: 'Withdrawal successful', text: 'Your payment has been sent.' }
    : isRejected
      ? { border: 'border-red-400/40', icon: 'bg-red-400/15 text-red-300', title: 'Withdrawal needs attention', text: 'Please check your withdrawal details.' }
      : { border: 'border-amber-400/50', icon: 'bg-amber-400/15 text-amber-300', title: 'Withdrawal pending', text: 'Your request is waiting for payment review.' };

  return (
    <aside className={`withdrawal-status-toast fixed right-4 top-[5.25rem] z-[70] w-[min(320px,calc(100vw-2rem))] rounded-2xl border ${tone.border} p-4 shadow-[0_18px_48px_rgba(0,0,0,.4)] backdrop-blur-md`} role="status" aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-[#25444a]">
        <div>
          <p className="withdrawal-status-kicker text-[10px] font-bold uppercase tracking-[0.16em]">Withdrawal status</p>
          <p className="withdrawal-status-subtitle mt-0.5 text-xs">Payout activity</p>
        </div>
        <button type="button" onClick={() => setDismissedId(Number(latest.id))} className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#173036] dark:hover:text-slate-100" aria-label="Dismiss withdrawal status">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
          {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : isRejected ? <XCircle className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{tone.title}</p>
          <div className="mt-1 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-slate-500 dark:text-slate-300">{money(latest.amount)} · {String(latest.cryptoType || 'payout')}</span>
            <span className={isSuccess ? 'font-bold text-emerald-700 dark:text-emerald-300' : isRejected ? 'font-bold text-red-600 dark:text-red-300' : 'font-bold text-amber-700 dark:text-amber-300'}>{isSuccess ? 'PAID' : isRejected ? 'REVIEW' : 'PENDING'}</span>
          </div>
          {!isSuccess && !isRejected && <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-300">Your request is waiting for payment review.</p>}
        </div>
      </div>
    </aside>
  );
}
