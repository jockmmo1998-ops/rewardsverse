import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import AppLayout from '@/components/layouts/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowDownToLine, CheckCircle2, Clock, XCircle, AlertCircle, DollarSign, Zap, Shield } from 'lucide-react';
import { submitWithdrawal, getUserWithdrawals } from '@/lib/api';
import type { Withdrawal } from '@/types/types';
import { WITHDRAWAL_METHODS } from '@/types/types';

const MIN_WITHDRAW = 5.00;

const schema = z.object({
  amount: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= MIN_WITHDRAW, {
    message: `Minimum withdrawal is $${MIN_WITHDRAW.toFixed(2)}`,
  }),
  method: z.string().min(1, 'Select a payment method'),
  account_info: z.string().min(3, 'Enter your account information'),
});
type FormValues = z.infer<typeof schema>;

const W_STATUS: Record<Withdrawal['status'], { icon: React.ElementType; label: string; color: string; bg: string }> = {
  pending:    { icon: Clock,        label: 'Pending',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  processing: { icon: AlertCircle,  label: 'Processing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  approved:   { icon: CheckCircle2, label: 'Approved',   color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   },
  rejected:   { icon: XCircle,      label: 'Rejected',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
};

export default function WithdrawPage() {
  const { profile, refreshProfile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', method: '', account_info: '' },
  });

  const loadWithdrawals = useCallback(async () => {
    if (!profile) return;
    const result = await getUserWithdrawals(profile.id, page, 10);
    setWithdrawals(result.data);
    setTotal(result.count);
    setLoading(false);
  }, [profile, page]);

  useEffect(() => { loadWithdrawals(); }, [loadWithdrawals]);

  const onSubmit = async (values: FormValues) => {
    if (!profile) return;
    const amount = parseFloat(values.amount);
    if (amount > profile.balance) { toast.error('Insufficient balance.'); return; }
    const { error } = await submitWithdrawal({ user_id: profile.id, amount, method: values.method, account_info: values.account_info });
    if (error) { toast.error(error); return; }
    toast.success("Withdrawal submitted! We'll process it within 24h.");
    form.reset();
    await refreshProfile();
    loadWithdrawals();
  };

  const canWithdraw = profile && profile.balance >= MIN_WITHDRAW;

  return (
    <>
      <PageMeta title="Withdraw — RewardsVerse" description="Withdraw your RewardsVerse earnings" />
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-bold font-heading" style={{ color: '#F4F4F5' }}>Withdraw</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
              Transfer your earnings to your preferred payment method.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {/* Form panel */}
            <div className="md:col-span-3">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                className="rounded-2xl p-6"
                style={{ background: 'rgba(16,20,31,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Balance display */}
                <div className="rounded-xl p-4 mb-6"
                  style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.1),rgba(59,130,246,0.06))', border: '1px solid rgba(34,197,94,0.18)' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(244,244,245,0.4)' }}>Available Balance</p>
                  <p className="text-3xl font-bold font-heading" style={{ color: '#22C55E' }}>
                    ${profile?.balance.toFixed(2) ?? '0.00'}
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,244,245,0.4)' }}>
                          Amount (USD)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(244,244,245,0.3)' }} />
                            <input type="number" step="0.01" min={MIN_WITHDRAW} max={profile?.balance}
                              placeholder={MIN_WITHDRAW.toFixed(2)} {...field}
                              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F4F4F5' }} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="method" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,244,245,0.4)' }}>
                          Payment Method
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F4F4F5' }}>
                              <SelectValue placeholder="Select method…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WITHDRAWAL_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="account_info" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,244,245,0.4)' }}>
                          Account / Address
                        </FormLabel>
                        <FormControl>
                          <input placeholder="e.g. your@email.com or wallet address" {...field}
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F4F4F5' }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <button type="submit" disabled={form.formState.isSubmitting || !canWithdraw}
                      className="btn-primary w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      {form.formState.isSubmitting
                        ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        : <><ArrowDownToLine size={14} /> Submit Withdrawal</>}
                    </button>

                    {profile && !canWithdraw && (
                      <p className="text-xs text-center" style={{ color: 'rgba(244,244,245,0.35)' }}>
                        Minimum withdrawal is ${MIN_WITHDRAW.toFixed(2)}. Keep earning!
                      </p>
                    )}
                  </form>
                </Form>
              </motion.div>
            </div>

            {/* Info sidebar */}
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-sm font-semibold font-heading mb-3" style={{ color: '#F4F4F5' }}>Payout Info</h3>
                {[
                  { label: 'Minimum', value: `$${MIN_WITHDRAW.toFixed(2)}` },
                  { label: 'Processing time', value: 'Within 24h' },
                  { label: 'Fees', value: 'None' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-1.5 text-xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'rgba(244,244,245,0.4)' }}>{row.label}</span>
                    <span className="font-semibold" style={{ color: '#F4F4F5' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-sm font-semibold font-heading mb-3" style={{ color: '#F4F4F5' }}>Supported Methods</h3>
                <div className="space-y-2">
                  {WITHDRAWAL_METHODS.map(m => (
                    <div key={m.value} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                      <span className="text-xs" style={{ color: 'rgba(244,244,245,0.5)' }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Shield size={14} className="mt-0.5 shrink-0" style={{ color: '#22C55E' }} />
                <p className="text-xs" style={{ color: 'rgba(244,244,245,0.5)' }}>
                  All withdrawals are manually reviewed for security. Your payout is guaranteed.
                </p>
              </div>
            </div>
          </div>

          {/* Withdrawal history */}
          <div>
            <h2 className="text-sm font-semibold font-heading mb-3" style={{ color: '#F4F4F5' }}>Withdrawal History</h2>
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)
              ) : withdrawals.length === 0 ? (
                <div className="rounded-2xl py-10 text-center"
                  style={{ background: 'rgba(16,20,31,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Zap size={22} className="mx-auto mb-2" style={{ color: 'rgba(244,244,245,0.2)' }} />
                  <p className="text-sm" style={{ color: 'rgba(244,244,245,0.35)' }}>No withdrawals yet.</p>
                </div>
              ) : withdrawals.map((w, i) => {
                const cfg = W_STATUS[w.status];
                const Icon = cfg.icon;
                return (
                  <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(16,20,31,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <ArrowDownToLine size={13} style={{ color: '#3B82F6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium" style={{ color: '#F4F4F5' }}>
                          {WITHDRAWAL_METHODS.find(m => m.value === w.method)?.label ?? w.method}
                        </p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          <Icon size={9} /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(244,244,245,0.35)' }}>
                        {new Date(w.created_at).toLocaleDateString()} · {w.account_info}
                      </p>
                      {w.admin_note && <p className="text-xs italic mt-0.5" style={{ color: 'rgba(244,244,245,0.3)' }}>Note: {w.admin_note}</p>}
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: '#F4F4F5' }}>${w.amount.toFixed(2)}</span>
                  </motion.div>
                );
              })}
            </div>
            {!loading && total > 10 && (
              <div className="flex items-center justify-between mt-3">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="text-xs px-4 py-2 rounded-xl disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}>
                  ← Previous
                </button>
                <span className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>Page {page + 1} of {Math.ceil(total / 10)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * 10 >= total}
                  className="text-xs px-4 py-2 rounded-xl disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F4F4F5' }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}

