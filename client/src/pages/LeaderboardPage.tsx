import { useEffect, useState } from 'react';
import { Award, Crown, Medal, Trophy } from 'lucide-react';
import { fetchLeaderboard } from '@/api';
import { UserAvatar } from '@/components/AvatarSystem';
import { EmptyState, LoadingRows, SectionHeading, Surface } from '@/components/shared/RewardUI';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    fetchLeaderboard()
      .then((items) => { if (active) setUsers(items); })
      .catch(() => { if (active) { setUsers([]); setLoadError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryKey]);

  const podium = users.slice(0, 3);
  const retryAction = <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="text-sm font-semibold text-primary">Try again</button>;

  return (
    <div className="unified-page leaderboard-page mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading eyebrow="Community momentum" title="Leaderboard" description="See who is turning consistency into the strongest reward totals." action={<span className="unified-page-chip"><span className="status-dot" /> Verified rewards</span>} />
      {loadError ? (
        <Surface className="unified-surface p-5 sm:p-7"><EmptyState title="Leaderboard could not be loaded" description="The rankings service is temporarily unavailable. No account data has been changed." icon={Trophy} action={retryAction} /></Surface>
      ) : (
        <>
          <Surface className="unified-surface overflow-hidden p-5 sm:p-7">
            <div className="flex items-center gap-2"><div className="unified-icon unified-icon-gold"><Crown className="h-4 w-4" /></div><div><p className="font-display text-lg font-semibold">Top earners</p><p className="text-xs text-muted-foreground">Rankings are based on lifetime earnings.</p></div></div>
            {loading ? <div className="mt-6"><LoadingRows count={3} /></div> : podium.length ? (
              <div className="mt-8 grid items-end gap-3 sm:grid-cols-3">
                {podium.map((member, index) => (
                  <div key={member.id} className={`unified-podium-card ${index === 0 ? 'is-first' : ''}`}>
                    <UserAvatar userId={member.id} avatarId={member.avatarId} src={member.avatar_url} alt={`${member.username || 'Member'} avatar`} className="mx-auto h-14 w-14 rounded-full border border-primary/30 object-cover" />
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground"><span>#{index + 1}</span>{index === 0 ? <Trophy className="h-3.5 w-3.5 text-amber-300" /> : index === 1 ? <Medal className="h-3.5 w-3.5 text-slate-300" /> : <Award className="h-3.5 w-3.5 text-orange-300" />}</div>
                    <p className="mt-2 truncate text-sm font-semibold text-foreground">{member.username || 'Member'}</p>
                    <p className="mt-2 font-display text-xl font-semibold text-primary">${Number(member.lifetime_earnings || 0).toFixed(2)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{member.completed_offers || 0} offers · Lv. {member.level || 1}</p>
                  </div>
                ))}
              </div>
            ) : <div className="mt-6"><EmptyState title="Leaderboard is warming up" description="Rankings will appear as members complete verified offers." icon={Trophy} /></div>}
          </Surface>

          <Surface className="unified-surface overflow-hidden p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between"><div><p className="rv-eyebrow">All rankings</p><h2 className="mt-1 font-display text-lg font-semibold">Community board</h2></div><span className="text-xs text-muted-foreground">{loading ? 'Loading' : `${users.length} members`}</span></div>
            {loading ? <LoadingRows count={5} /> : users.length ? (
              <div className="overflow-x-auto">
                <table className="unified-table w-full min-w-[620px] text-left text-sm">
                  <thead><tr><th>Rank</th><th>Member</th><th>Level</th><th>Offers</th><th className="text-right">Lifetime earnings</th></tr></thead>
                  <tbody>{users.map((member, index) => (
                    <tr key={member.id}><td className="font-display font-semibold text-muted-foreground">#{index + 1}</td><td><div className="flex items-center gap-3"><UserAvatar userId={member.id} avatarId={member.avatarId} src={member.avatar_url} alt={`${member.username || 'Member'} avatar`} className="h-8 w-8 rounded-full" /><span className="font-medium text-foreground">{member.username || 'Member'}<small>Verified member</small></span></div></td><td className="text-muted-foreground">Lv. {member.level || 1}</td><td className="text-muted-foreground">{member.completed_offers || 0}</td><td className="text-right font-semibold text-primary">${Number(member.lifetime_earnings || 0).toFixed(2)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <EmptyState title="No rankings yet" description="Complete an offer to join the community board." icon={Trophy} />}
          </Surface>
        </>
      )}
    </div>
  );
}
