import { CheckCircle2, Clock3, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { playBellSound } from '@/utils/bellSound';

const DISPLAY_WINDOW_MS = 10 * 60 * 1000;

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
  const [now, setNow] = useState(() => Date.now());
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

  if (!latest || latest.id === dismissedId) return null;

  const status = String(latest?.status || 'pending').toLowerCase();
  const isSuccess = ['approved', 'paid', 'completed', 'success'].includes(status);
  const isRejected = ['rejected', 'failed', 'cancelled'].includes(status);
  const ageAnchor = isSuccess || isRejected ? timestamp(latest?.updatedAt) || timestamp(latest?.createdAt) : timestamp(latest?.createdAt);

  useEffect(() => {
    if (!latest || latest.id === dismissedId) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [dismissedId, latest]);

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

  if (!latest || latest.id === dismissedId || !ageAnchor || now - ageAnchor > DISPLAY_WINDOW_MS) return null;

  const tone = isSuccess
    ? { border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-700', title: 'Withdrawal successful', text: 'Your payment has been sent.' }
    : isRejected
      ? { border: 'border-red-200', icon: 'bg-red-100 text-red-700', title: 'Withdrawal needs attention', text: 'Please check your withdrawal details.' }
      : { border: 'border-amber-200', icon: 'bg-amber-100 text-amber-700', title: 'Withdrawal pending', text: 'Your request is waiting for payment review.' };

  return (
    <aside className={`fixed bottom-3 left-3 z-[70] w-[min(280px,calc(100vw-1.5rem))] rounded-lg border ${tone.border} bg-white/95 px-2.5 py-2 shadow-[0_10px_24px_rgba(15,23,42,.12)] backdrop-blur-md dark:border-[#25444a] dark:bg-[#102127]/95`} role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${tone.icon}`}>
          {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : isRejected ? <XCircle className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">{tone.title}</p>
            <button type="button" onClick={() => setDismissedId(Number(latest.id))} className="shrink-0 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#173036] dark:hover:text-slate-100" aria-label="Dismiss withdrawal status">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px]">
            <span className="truncate text-slate-500 dark:text-slate-300">{money(latest.amount)} · {String(latest.cryptoType || 'payout')}</span>
            <span className={isSuccess ? 'font-bold text-emerald-700 dark:text-emerald-300' : isRejected ? 'font-bold text-red-600 dark:text-red-300' : 'font-bold text-amber-700 dark:text-amber-300'}>{isSuccess ? 'PAID' : isRejected ? 'REVIEW' : 'PENDING'}</span>
          </div>
          {!isSuccess && !isRejected && <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-300">Visible for 10 minutes while your request is reviewed.</p>}
        </div>
      </div>
    </aside>
  );
}
