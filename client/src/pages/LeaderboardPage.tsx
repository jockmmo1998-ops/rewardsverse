import { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { fetchLeaderboard } from '@/api';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then(data => {
      setUsers(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Leaderboard" subtitle="Top earners on Rewardsverse" />

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-black/20 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium rounded-tl-xl">Rank</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Level</th>
                  <th className="px-6 py-4 font-medium">Offers Completed</th>
                  <th className="px-6 py-4 font-medium text-right rounded-tr-xl">Lifetime Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      {idx === 0 ? <Trophy className="w-5 h-5 text-yellow-400" /> :
                       idx === 1 ? <Medal className="w-5 h-5 text-gray-300" /> :
                       idx === 2 ? <Award className="w-5 h-5 text-orange-400" /> :
                       <span className="text-muted-foreground font-medium w-5 inline-block text-center">{idx + 1}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt={user.username} className="w-8 h-8 rounded-full bg-muted" />
                        <span className="font-medium text-foreground">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">Lv. {user.level}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.completed_offers}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-primary">${(user.lifetime_earnings || 0).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
