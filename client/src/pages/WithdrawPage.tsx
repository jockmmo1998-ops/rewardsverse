import { useState } from 'react';
import { Wallet, AlertCircle, Check } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

const cryptoOptions = [
  { id: 'usdt', name: 'Tether (USDT)', network: 'TRC20', min: 5, fee: 1 },
  { id: 'btc', name: 'Bitcoin (BTC)', network: 'Bitcoin', min: 20, fee: 2.5 },
  { id: 'eth', name: 'Ethereum (ETH)', network: 'ERC20', min: 30, fee: 5 },
  { id: 'ltc', name: 'Litecoin (LTC)', network: 'Litecoin', min: 2, fee: 0.1 },
];

export default function WithdrawPage() {
  const { profile, refreshProfile } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const balance = profile?.balance || 0;
  const numAmount = parseFloat(amount) || 0;
  const receiveAmount = numAmount > selectedCrypto.fee ? numAmount - selectedCrypto.fee : 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    if (numAmount < selectedCrypto.min) {
      toast.error(`Minimum amount is $${selectedCrypto.min}`);
      return;
    }
    if (numAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (!address) {
      toast.error('Please enter your wallet address');
      return;
    }

    setSubmitting(true);
    try {
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'withdrawal',
        amount: numAmount,
        status: 'pending',
        description: `Withdraw to ${selectedCrypto.name} (${selectedCrypto.network})`
      });
      if (txError) throw txError;

      const { error: profileError } = await supabase.rpc('decrement_balance', { user_id: profile.id, amount: numAmount });
      if (profileError) {
         await supabase.from('profiles').update({ balance: balance - numAmount }).eq('id', profile.id);
      }
      
      toast.success('Withdrawal request submitted successfully!');
      setAddress('');
      setAmount('');
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Error withdrawing funds');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <PageHeader title="Withdraw" subtitle="Convert your balance into cryptocurrency." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 text-center bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
            <p className="text-muted-foreground mb-2">Available Balance</p>
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">${balance.toFixed(2)}</h2>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-heading font-bold text-lg mb-6">Create Withdrawal Request</h3>
            <form onSubmit={handleWithdraw} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">1. Select Cryptocurrency</label>
                <div className="grid grid-cols-2 gap-3">
                  {cryptoOptions.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCrypto(c)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedCrypto.id === c.id ? 'border-primary bg-primary/10' : 'border-border bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground text-sm">{c.name}</span>
                        {selectedCrypto.id === c.id && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-xs text-muted-foreground">Network: {c.network}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">2. Destination Address</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder={`Enter ${selectedCrypto.network} address...`}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">3. Amount to Withdraw ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input 
                    type="number" 
                    min={selectedCrypto.min}
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder={`Minimum $${selectedCrypto.min}`}
                    className="w-full h-11 pl-8 pr-20 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button type="button" onClick={() => setAmount(balance.toString())} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-white/10 text-xs font-semibold hover:bg-white/20 transition-colors">MAX</button>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Transaction Fee</span>
                  <span className="text-sm text-destructive">${selectedCrypto.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-foreground">You Will Receive</span>
                  <span className="text-lg font-bold text-success">${receiveAmount.toFixed(2)}</span>
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting || numAmount < selectedCrypto.min || numAmount > balance}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" /> {submitting ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
        
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" /> Important Notice
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
              <li>Ensure your wallet address is absolutely correct.</li>
              <li>Select the correct Network. Sending to the wrong network may result in loss of funds.</li>
              <li>Withdrawal requests are typically processed within 24-48 hours.</li>
              <li>Transaction fees are deducted directly from your withdrawal amount.</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
