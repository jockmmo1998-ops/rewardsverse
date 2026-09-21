import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, Check, Clock3, LockKeyhole, ShieldCheck, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeading, StatTile, Surface } from '@/components/shared/RewardUI';
import { EmailVerificationGate } from '@/components/EmailVerificationGate';

type PaymentMethod = 'litecoin' | 'binance';

const paymentMethods: Array<{ id: PaymentMethod; symbol: string; name: string; network: string }> = [
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', network: 'Litecoin network' },
  { id: 'binance', symbol: 'BNB', name: 'Binance', network: 'Binance wallet' },
];

const MIN_WITHDRAWAL = 0.3;

function statusLabel(status: string) {
  if (status === 'approved') return 'Completed';
  if (status === 'rejected') return 'Rejected';
  if (status === 'processing') return 'Processing';
  return 'Pending';
}

export default function WithdrawPage() {
  const { profile, refreshProfile } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('litecoin');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const balance = Number(profile?.balance || 0);
  const emailVerified = Boolean(profile?.emailVerifiedAt);
  const amountValue = Number.parseFloat(amount);
  const validAmount = Number.isFinite(amountValue) && amountValue >= MIN_WITHDRAWAL && amountValue <= balance;
  const selected = paymentMethods.find((method) => method.id === selectedMethod) || paymentMethods[0];
  const withdrawalsQuery = trpc.withdraw.getMyWithdrawals.useQuery(undefined, { enabled: Boolean(profile?.id), retry: false });
  const withdrawMutation = trpc.withdraw.create.useMutation({
    onSuccess: () => {
      toast.success('Withdrawal request submitted for review.');
      setAddress('');
      setAmount('');
      setConfirmOpen(false);
      refreshProfile();
      withdrawalsQuery.refetch();
    },
    onError: (error) => toast.error(error.message || 'Unable to submit withdrawal.'),
  });

  const canReview = validAmount && address.trim().length >= 10 && !withdrawMutation.isPending;
  const formattedAmount = useMemo(() => (Number.isFinite(amountValue) ? amountValue.toFixed(2) : '0.00'), [amountValue]);

  const requestWithdraw = (event: FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(amountValue) || amountValue < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is $${MIN_WITHDRAWAL.toFixed(2)}.`);
      return;
    }
    if (amountValue > balance) {
      toast.error('Insufficient balance.');
      return;
    }
    if (address.trim().length < 10) {
      toast.error('Enter a valid wallet address.');
      return;
    }
    setConfirmOpen(true);
  };

  const confirmWithdraw = () => {
    if (!canReview) return;
    withdrawMutation.mutate({
      amount: Number(formattedAmount),
      cryptoType: selectedMethod,
      walletAddress: address.trim(),
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading
        eyebrow="Secure payouts"
        title="Withdraw your rewards"
        description="Choose a supported payout method and submit a request from your verified balance."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Available to withdraw" value={`$${balance.toFixed(2)}`} helper="Live balance" icon={WalletCards} accent="mint" />
        <StatTile label="Minimum withdrawal" value={`$${MIN_WITHDRAWAL.toFixed(2)}`} helper="Applied on the server" icon={ShieldCheck} accent="violet" />
      </div>

      {!emailVerified && <EmailVerificationGate onVerified={() => refreshProfile()} />}

      {emailVerified && <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <Surface className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="rv-eyebrow">Create request</p><h2 className="mt-1 font-display text-xl font-semibold">Payout details</h2></div>
            <div className="flex items-center gap-1.5 text-xs text-primary"><LockKeyhole className="h-3.5 w-3.5" /> Server verified</div>
          </div>
          <form onSubmit={requestWithdraw} className="mt-7 space-y-6">
            <div>
              <label className="mb-3 block text-sm font-semibold text-foreground">1. Payment method</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <button type="button" key={method.id} onClick={() => setSelectedMethod(method.id)} className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${selectedMethod === method.id ? 'border-primary/50 bg-primary/10 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}>
                    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted font-display text-xs font-bold text-foreground">{method.symbol}</span><div><p className="text-sm font-semibold text-foreground">{method.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{method.network}</p></div></div>{selectedMethod === method.id && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" /></span>}</div>
                    <p className="mt-3 text-xs text-muted-foreground">Minimum ${MIN_WITHDRAWAL.toFixed(2)} · Review required</p>
                  </button>
                ))}
              </div>
            </div>

            <div><label className="mb-2 block text-sm font-semibold text-foreground">2. Wallet address</label><input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder={`Enter your ${selected.name} wallet address`} maxLength={256} className="h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /><p className="mt-2 text-xs text-muted-foreground">Double-check the network. Crypto transfers cannot be reversed.</p></div>

            <div><div className="mb-2 flex items-center justify-between"><label className="text-sm font-semibold text-foreground">3. Amount</label><button type="button" onClick={() => setAmount(balance.toFixed(2))} className="text-xs font-semibold text-primary hover:underline">Use max</button></div><div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span><input required type="number" min={MIN_WITHDRAWAL} max={balance} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={`Minimum $${MIN_WITHDRAWAL.toFixed(2)}`} className="h-12 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></div></div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Requested amount</span><span className="font-semibold text-foreground">${formattedAmount}</span></div><div className="mt-3 flex items-center justify-between border-t border-border pt-3"><span className="font-semibold text-foreground">Estimated payout</span><span className="font-display text-xl font-semibold text-primary">${formattedAmount}</span></div><p className="mt-2 text-xs text-muted-foreground">Any processing fee, if applicable, will be confirmed by the payout team.</p></div>
            <button type="submit" disabled={!canReview} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">Review withdrawal <ArrowRight className="h-4 w-4" /></button>
          </form>
        </Surface>

        <div className="space-y-6"><Surface className="p-5 sm:p-6"><div className="flex items-center gap-2 text-foreground"><Clock3 className="h-4 w-4 text-primary" /><h2 className="font-display text-base font-semibold">What happens next?</h2></div><ol className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground"><li><span className="font-semibold text-foreground">1.</span> Your balance is reserved atomically when the request is accepted.</li><li><span className="font-semibold text-foreground">2.</span> The payout team reviews the destination and request.</li><li><span className="font-semibold text-foreground">3.</span> You can follow the status in your activity history.</li></ol></Surface><Surface className="p-5 sm:p-6"><p className="rv-eyebrow">Recent requests</p>{withdrawalsQuery.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading requests…</p> : withdrawalsQuery.data?.length ? <div className="mt-3 space-y-2">{withdrawalsQuery.data.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm"><div><p className="font-medium text-foreground">${Number(item.amount).toFixed(2)} · {item.cryptoType === 'litecoin' ? 'LTC' : 'Binance'}</p><p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p></div><span className="text-xs font-semibold text-muted-foreground">{statusLabel(item.status)}</span></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No withdrawal requests yet.</p>}</Surface></div>
      </div>}

      {confirmOpen && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"><p className="rv-eyebrow">Final review</p><h2 className="mt-1 font-display text-xl font-semibold text-foreground">Confirm withdrawal</h2><div className="mt-6 space-y-3 rounded-xl border border-border bg-muted/50 p-4 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Method</span><span className="font-medium text-foreground">{selected.symbol} · {selected.network}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Amount</span><span className="font-medium text-foreground">${formattedAmount}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Destination</span><span className="max-w-[190px] truncate font-mono text-xs text-foreground">{address}</span></div></div><p className="mt-4 text-xs leading-5 text-muted-foreground">The server will re-check your balance, payment method and duplicate requests before creating the record.</p><div className="mt-6 flex gap-3"><button type="button" onClick={() => setConfirmOpen(false)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">Cancel</button><button type="button" onClick={confirmWithdraw} disabled={!canReview} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{withdrawMutation.isPending ? 'Submitting…' : 'Confirm request'}</button></div></div></div>}
    </div>
  );
}
