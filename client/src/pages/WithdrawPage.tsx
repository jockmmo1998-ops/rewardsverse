import { useState } from 'react';
import { AlertTriangle, ArrowRight, Check, Clock3, LockKeyhole, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeading, StatTile, Surface } from '@/components/shared/RewardUI';

const cryptoOptions = [
  { id: 'usdt', symbol: 'USDT', name: 'Tether', network: 'TRC20', min: 5, fee: 1 },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', min: 20, fee: 2.5 },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', network: 'ERC20', min: 30, fee: 5 },
  { id: 'ltc', symbol: 'LTC', name: 'Litecoin', network: 'Litecoin', min: 2, fee: .1 },
];

export default function WithdrawPage() {
  const { profile, refreshProfile } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const balance = Number(profile?.balance || 0);
  const numAmount = Number.parseFloat(amount) || 0;
  const receiveAmount = numAmount > selectedCrypto.fee ? numAmount - selectedCrypto.fee : 0;

  const requestWithdraw = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile?.id) return;
    if (numAmount < selectedCrypto.min) { toast.error(`Minimum amount is $${selectedCrypto.min}`); return; }
    if (numAmount > balance) { toast.error('Insufficient balance'); return; }
    if (!address.trim()) { toast.error('Please enter your wallet address'); return; }
    setConfirmOpen(true);
  };
  const confirmWithdraw = async () => {
    if (!profile?.id) return;
    setSubmitting(true);
    try {
      const { error: txError } = await supabase.from('transactions').insert({ user_id: profile.id, type: 'withdrawal', amount: numAmount, status: 'pending', description: `Withdraw to ${selectedCrypto.name} (${selectedCrypto.network})` });
      if (txError) throw txError;
      const { error: profileError } = await supabase.rpc('decrement_balance', { user_id: profile.id, amount: numAmount });
      if (profileError) await supabase.from('profiles').update({ balance: balance - numAmount }).eq('id', profile.id);
      toast.success('Withdrawal request submitted successfully!');
      setAddress(''); setAmount(''); setConfirmOpen(false); refreshProfile();
    } catch (error: any) { toast.error(error.message || 'Error withdrawing funds'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading eyebrow="Fintech wallet" title="Withdraw your rewards" description="Choose a payout method and send your available balance to a verified wallet." />
      <div className="grid gap-4 sm:grid-cols-2"><StatTile label="Available to withdraw" value={`$${balance.toFixed(2)}`} helper="Live balance" icon={WalletCards} accent="mint" /><StatTile label="Processing time" value="24–48h" helper="Typical review window" icon={Clock3} accent="violet" /></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <Surface className="p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="rv-eyebrow">Create request</p><h2 className="mt-1 font-display text-xl font-semibold">Payout details</h2></div><div className="flex items-center gap-1.5 text-xs text-primary"><LockKeyhole className="h-3.5 w-3.5" /> Secure flow</div></div><form onSubmit={requestWithdraw} className="mt-7 space-y-6">
          <div><label className="mb-3 block text-sm font-semibold text-foreground">1. Payment method</label><div className="grid gap-3 sm:grid-cols-2">{cryptoOptions.map((crypto) => <button type="button" key={crypto.id} onClick={() => setSelectedCrypto(crypto)} className={`focus-ring rounded-2xl border p-4 text-left transition ${selectedCrypto.id === crypto.id ? 'border-primary/40 bg-primary/8 shadow-[0_0_0_1px_rgba(130,240,183,.12)]' : 'border-white/9 bg-white/[.03] hover:border-white/20'}`}><div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 font-display text-xs font-bold text-foreground">{crypto.symbol.slice(0, 2)}</span><div><p className="text-sm font-semibold text-foreground">{crypto.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{crypto.symbol} · {crypto.network}</p></div></div>{selectedCrypto.id === crypto.id && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" /></span>}</div><p className="mt-3 text-xs text-muted-foreground">Min ${crypto.min} · Fee ${crypto.fee.toFixed(2)}</p></button>)}</div></div>
          <div><label className="mb-2 block text-sm font-semibold text-foreground">2. Destination address</label><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder={`Enter ${selectedCrypto.network} address`} className="focus-ring h-12 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 font-mono text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/40" /><p className="mt-2 text-xs text-muted-foreground">Double-check the network before submitting. Crypto transfers cannot be reversed.</p></div>
          <div><div className="mb-2 flex items-center justify-between"><label className="text-sm font-semibold text-foreground">3. Amount</label><button type="button" onClick={() => setAmount(balance.toFixed(2))} className="text-xs font-semibold text-primary hover:text-primary/80">Use max</button></div><div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span><input type="number" min={selectedCrypto.min} step=".01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={`Minimum $${selectedCrypto.min}`} className="focus-ring h-12 w-full rounded-xl border border-white/10 bg-white/[.04] pl-9 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/40" /></div></div>
          <div className="rounded-2xl border border-white/8 bg-white/[.035] p-4"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Network fee</span><span className="text-foreground">${selectedCrypto.fee.toFixed(2)}</span></div><div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3"><span className="font-semibold text-foreground">You receive</span><span className="font-display text-xl font-semibold text-primary">${receiveAmount.toFixed(2)}</span></div></div>
          <button disabled={submitting || numAmount < selectedCrypto.min || numAmount > balance} className="focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45">Review withdrawal <ArrowRight className="h-4 w-4" /></button>
        </form></Surface>
        <div className="space-y-6"><Surface className="p-5 sm:p-6"><div className="flex items-center gap-2 text-amber-200"><AlertTriangle className="h-4 w-4" /><h2 className="font-display text-base font-semibold">Before you submit</h2></div><ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground"><li>Use an address you control and select the correct network.</li><li>Requests are reviewed within the typical 24–48 hour window.</li><li>The displayed fee is deducted from the requested amount.</li></ul></Surface><Surface className="p-5 sm:p-6"><p className="rv-eyebrow">Need help?</p><h2 className="mt-2 font-display text-lg font-semibold">Keep your account safe</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">RewardsVerse will never ask for your private key or seed phrase.</p></Surface></div>
      </div>
      {confirmOpen && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-white/12 bg-[#1c2b3d] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="rv-eyebrow">Final review</p><h2 className="mt-1 font-display text-xl font-semibold">Confirm withdrawal</h2></div><button onClick={() => setConfirmOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/6 hover:text-foreground" aria-label="Close"><span className="text-xl leading-none">×</span></button></div><div className="mt-6 space-y-3 rounded-xl border border-white/8 bg-white/[.035] p-4 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Method</span><span className="font-medium text-foreground">{selectedCrypto.symbol} · {selectedCrypto.network}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Amount</span><span className="font-medium text-foreground">${numAmount.toFixed(2)}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Destination</span><span className="max-w-[190px] truncate font-mono text-xs text-foreground">{address}</span></div></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Please confirm the destination address and network. Submitted requests cannot be edited.</p><div className="mt-6 flex gap-3"><button onClick={() => setConfirmOpen(false)} className="focus-ring flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-white/6 hover:text-foreground">Cancel</button><button onClick={confirmWithdraw} disabled={submitting} className="focus-ring flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{submitting ? 'Submitting…' : 'Confirm request'}</button></div></div></div>}
    </div>
  );
}
