import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, Trophy, Clock, ChevronRight, Activity, Flame, Target } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserTransactions } from '@/api';

export default function DashboardPage() {
  const { user, profile } = useAuth();
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

  // Calculate stats from DB
  const balance = profile?.balance || 0;
  const pending = profile?.pending_balance || 0;
  const lifetime = profile?.lifetime_earnings || 0;
  const completed = profile?.completed_offers || 0;
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const nextLevelXp = level * 1000;
  const xpPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader 
        title={`Welcome back, ${profile?.username || 'User'}!`}
        subtitle="Here's an overview of your earnings and progress."
      />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current Balance" value={`$${balance.toFixed(2)}`} icon={<Wallet className="w-5 h-5" />} gradient delay={0} />
        <StatCard title="Pending" value={`$${pending.toFixed(2)}`} icon={<Clock className="w-5 h-5" />} delay={0.1} />
        <StatCard title="Lifetime Earnings" value={`$${lifetime.toFixed(2)}`} icon={<TrendingUp className="w-5 h-5 text-success" />} delay={0.2} />
        <StatCard title="Offers Completed" value={completed.toString()} icon={<Target className="w-5 h-5 text-cyan-400" />} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="font-heading font-semibold text-lg">Level {level}</h3>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{xp} / {nextLevelXp} XP</span>
            </div>
            <ProgressBar value={xpPercent} color="primary" className="h-2 mb-4" />
            <p className="text-xs text-muted-foreground">You need <span className="text-foreground font-medium">{nextLevelXp - xp} XP</span> more to reach the next level. Complete tasks to earn XP!</p>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Recent Activity
              </h3>
              <Link to="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>
              ) : transactions.length > 0 ? (
                transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'offer' ? 'bg-success/20 text-success' :
                        tx.type === 'withdrawal' ? 'bg-destructive/20 text-destructive' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {tx.type === 'offer' ? <Target className="w-5 h-5" /> : 
                         tx.type === 'withdrawal' ? <Wallet className="w-5 h-5" /> : 
                         <TrendingUp className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        tx.type === 'withdrawal' ? 'text-foreground' : 'text-success'
                      }`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toFixed(2)}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                        tx.status === 'completed' ? 'bg-success/20 text-success' :
                        tx.status === 'pending' ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No recent activity.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Quick Actions & Streak */}
        <div className="space-y-6">
          {/* Daily Streak */}
          <GlassCard className="p-6 text-center border-orange-500/20 bg-gradient-to-b from-orange-500/10 to-transparent">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 text-orange-500 mb-4">
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-2xl mb-1">{profile?.daily_streak || 0} Days</h3>
            <p className="text-sm text-muted-foreground mb-4">Consecutive login streak</p>
            <ProgressBar value={((profile?.daily_streak || 0) % 7) / 7 * 100} color="warning" className="h-1.5 mb-2" />
            <p className="text-xs text-muted-foreground">Log in every day to get bonuses!</p>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="p-6">
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/offerwalls" className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                <span className="font-medium flex items-center gap-2"><Target className="w-4 h-4" /> Do Tasks</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/withdraw" className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <span className="font-medium flex items-center gap-2"><Wallet className="w-4 h-4" /> Withdraw</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/referrals" className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <span className="font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Refer Friends</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
