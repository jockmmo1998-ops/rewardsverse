import { useEffect, useState } from 'react';
import { Clock, Download, Filter } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserTransactions } from '@/api';

export default function HistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserTransactions(user.id).then(data => {
        setTransactions(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Transaction History" subtitle="View all your earning and withdrawal activities.">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </PageHeader>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading history...</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(tx.created_at).toLocaleString()}
                      </div>
                    </td>
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
                      <span className={`font-bold ${
                        tx.type === 'withdrawal' ? 'text-foreground' : 'text-success'
                      }`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border-t border-dashed border-border">
            No transactions found.
          </div>
        )}
      </GlassCard>
    </div>
  );
}
