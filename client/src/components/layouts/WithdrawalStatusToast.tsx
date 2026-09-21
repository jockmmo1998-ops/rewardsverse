import { CheckCircle2, Clock3, X, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';

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

  const status = String(latest.status || 'pending').toLowerCase();
  const isSuccess = ['approved', 'paid', 'completed', 'success'].includes(status);
  const isRejected = ['rejected', 'failed', 'cancelled'].includes(status);
  const ageAnchor = isSuccess || isRejected ? timestamp(latest.updatedAt) || timestamp(latest.createdAt) : timestamp(latest.createdAt);
  if (!ageAnchor || Date.now() - ageAnchor > DISPLAY_WINDOW_MS) return null;

  const tone = isSuccess
    ? { border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-700', title: 'Withdrawal successful', text: 'Your payment has been sent.' }
    : isRejected
      ? { border: 'border-red-200', icon: 'bg-red-100 text-red-700', title: 'Withdrawal needs attention', text: 'Please check your withdrawal details.' }
      : { border: 'border-amber-200', icon: 'bg-amber-100 text-amber-700', title: 'Withdrawal pending', text: 'Your request is waiting for payment review.' };

  return (
    <aside className={`fixed bottom-4 left-4 z-[70] w-[min(340px,calc(100vw-2rem))] rounded-xl border ${tone.border} bg-white/95 p-3 shadow-[0_14px_30px_rgba(15,23,42,.14)] backdrop-blur-md dark:border-[#25444a] dark:bg-[#102127]/95`} role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
          {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : isRejected ? <XCircle className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{tone.title}</p>
            <button type="button" onClick={() => setDismissedId(Number(latest.id))} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#173036] dark:hover:text-slate-100" aria-label="Dismiss withdrawal status">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-300">{tone.text}</p>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{money(latest.amount)} · {String(latest.cryptoType || 'payout')}</span>
            <span className={isSuccess ? 'font-bold text-emerald-700 dark:text-emerald-300' : isRejected ? 'font-bold text-red-600 dark:text-red-300' : 'font-bold text-amber-700 dark:text-amber-300'}>{isSuccess ? 'PAID' : isRejected ? 'REVIEW' : 'PENDING'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

