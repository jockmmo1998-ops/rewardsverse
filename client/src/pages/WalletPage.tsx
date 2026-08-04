import { useEffect, useState } from 'react';
import { Wallet, ArrowDownToLine, History } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserTransactions } from '@/api';

export default function WalletPage() {
  const { profile, user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserTransactions(user.id).then(data => {
        setTransactions(data.filter(t => t.type === 'withdrawal' || t.type === 'deposit' || t.type === 'bonus'));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const balance = profile?.balance || 0;
  const pending = profile?.pending_balance || 0;
  const totalWithdrawn = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="My Wallet" subtitle="Manage your balance and track cash flows." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Available Balance" value={`$${balance.toFixed(2)}`} icon={<Wallet className="w-5 h-5" />} gradient delay={0} />
        <StatCard title="Pending" value={`$${pending.toFixed(2)}`} icon={<History className="w-5 h-5" />} delay={0.1} />
        <StatCard title="Total Withdrawn" value={`$${totalWithdrawn.toFixed(2)}`} icon={<ArrowDownToLine className="w-5 h-5" />} delay={0.2} />
      </div>

      <GlassCard className="mt-6">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg">Wallet Transactions</h3>
        </div>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-black/20 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 capitalize text-foreground">{tx.type}</td>
                    <td className="px-6 py-4 text-foreground">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        tx.status === 'completed' ? 'bg-success/10 text-success border border-success/20' :
                        tx.status === 'pending' ? 'bg-warning/10 text-warning border border-warning/20' :
                        'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${tx.type === 'withdrawal' ? 'text-foreground' : 'text-success'}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No wallet transactions yet.
          </div>
        )}
      </GlassCard>
    </div>
  );
}
