import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, History as HistoryIcon, WalletCards } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserTransactions } from '@/api';
import { EmptyState, LoadingRows, SectionHeading, StatTile, StatusBadge, Surface } from '@/components/shared/RewardUI';

export default function WalletPage() {
  const { profile, user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchUserTransactions(user.id)
      .then((items) => setTransactions(items.filter((item) => ['withdrawal', 'deposit', 'bonus'].includes(item.type))))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const withdrawn = useMemo(
    () => transactions.filter((tx) => tx.type === 'withdrawal' && tx.status === 'completed').reduce((total, tx) => total + Number(tx.amount || 0), 0),
    [transactions],
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading
        eyebrow="Your money"
        title="Wallet"
        description="See your available balance, pending rewards and wallet movement."
        action={<a href="/withdraw" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Withdraw <ArrowUpRight className="h-4 w-4" /></a>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile label="Available balance" value={`$${Number(profile?.balance || 0).toFixed(2)}`} helper="Ready to withdraw" icon={WalletCards} accent="mint" />
        <StatTile label="Pending balance" value={`$${Number(profile?.pending_balance || 0).toFixed(2)}`} helper="Being verified" icon={HistoryIcon} accent="amber" />
        <StatTile label="Total withdrawn" value={`$${withdrawn.toFixed(2)}`} helper="Completed payouts" icon={ArrowDownLeft} accent="violet" />
      </div>
      <Surface className="overflow-hidden p-5 sm:p-6">
        <SectionHeading eyebrow="Wallet ledger" title="Recent movement" />
        <div className="mt-5">
          {loading ? <LoadingRows count={4} /> : transactions.length ? (
            <div className="space-y-2">
              {transactions.map((tx: any) => {
                const withdrawal = tx.type === 'withdrawal';
                return (
                  <div key={tx.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/7 bg-white/[.025] p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${withdrawal ? 'bg-amber-300/10 text-amber-200' : 'bg-primary/10 text-primary'}`}>
                        {withdrawal ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{tx.description}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><HistoryIcon className="h-3 w-3" />{new Date(tx.created_at).toLocaleString()}</p></div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3"><StatusBadge status={tx.status} /><span className={`font-display text-sm font-semibold ${withdrawal ? 'text-foreground' : 'text-primary'}`}>{withdrawal ? '-' : '+'}${Number(tx.amount).toFixed(2)}</span></div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState title="No wallet movement yet" description="Your earnings and payouts will show here after your first activity." icon={WalletCards} />}
        </div>
      </Surface>
    </div>
  );
}
