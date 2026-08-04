import { useEffect, useState } from 'react';
import { Users, CreditCard, Activity, Search, Target } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { fetchPlatformStats } from '@/api';

export default function AdminPage() {
  const [stats, setStats] = useState({ totalPaidOut: 0, activeUsers: 0, offersAvailable: 0, avgDailyEarn: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and management." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.activeUsers.toString()} icon={<Users className="w-5 h-5" />} delay={0} />
        <StatCard title="Total Payouts" value={`$${stats.totalPaidOut.toFixed(2)}`} icon={<CreditCard className="w-5 h-5" />} gradient delay={0.1} />
        <StatCard title="Active Offers" value={stats.offersAvailable.toString()} icon={<Target className="w-5 h-5" />} delay={0.2} />
        <StatCard title="System Status" value="Healthy" icon={<Activity className="w-5 h-5 text-success" />} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-lg">Recent Users</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search users..." className="w-full sm:w-64 h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div className="text-center py-10 text-muted-foreground text-sm">
            {loading ? "Loading users..." : "User management list will be displayed here."}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-lg">Pending Withdrawals</h3>
          </div>
          <div className="text-center py-10 text-muted-foreground text-sm">
            No pending withdrawals.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
