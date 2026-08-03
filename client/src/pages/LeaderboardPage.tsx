import { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { getLeaderboard } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { LeaderboardEntry } from '@/types/types';
import { motion } from 'motion/react';

const PODIUM = [
  { rank: 1, icon: Crown,  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  size: 52 },
  { rank: 2, icon: Trophy, color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)',  border: 'rgba(156,163,175,0.2)',  size: 44 },
  { rank: 3, icon: Medal,  color: '#CD7C3E', bg: 'rgba(205,124,62,0.1)',   border: 'rgba(205,124,62,0.2)',   size: 44 },
];

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => { setEntries(data); setLoading(false); });
  }, []);

  const myEntry = entries.find(e => e.id === profile?.id);

  // Arrange podium: 2nd left, 1st center, 3rd right
  const podiumOrder = entries.length >= 3
    ? [entries[1], entries[0], entries[2]]
    : [];
  const podiumCfg = [PODIUM[1], PODIUM[0], PODIUM[2]]; // 2nd, 1st, 3rd visual config

  return (
    <>
      <PageMeta title="Leaderboard — RewardsVerse" description="Top earners on RewardsVerse" />
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-5">
          <div>
            <h1 className="text-xl font-bold font-heading" style={{ color: '#F4F4F5' }}>Leaderboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
              Top earners of all time. Keep completing offers to climb the ranks!
            </p>
          </div>

          {/* Podium */}
          {!loading && podiumOrder.length === 3 && (
            <div className="grid grid-cols-3 gap-3 items-end">
              {podiumOrder.map((entry, idx) => {
                const cfg = podiumCfg[idx];
                const Icon = cfg.icon;
                const isFirst = cfg.rank === 1;
                return (
                  <motion.div key={entry.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-2xl p-4 flex flex-col items-center text-center"
                    style={{
                      background: isFirst
                        ? 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04))'
                        : 'rgba(16,20,31,0.9)',
                      border: `1px solid ${cfg.border}`,
                      boxShadow: isFirst ? `0 0 24px rgba(245,158,11,0.15)` : undefined,
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      <Icon size={isFirst ? 18 : 15} style={{ color: cfg.color }} />
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-1.5"
                      style={{ background: `linear-gradient(135deg,${cfg.color}33,${cfg.color}11)`, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-semibold truncate max-w-full" style={{ color: '#F4F4F5' }}>{entry.username}</p>
                    <p className="text-sm font-bold mt-0.5 font-heading" style={{ color: cfg.color }}>${entry.total_earned.toFixed(2)}</p>
                    <span className="text-xs mt-1 font-bold px-2 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}>#{cfg.rank}</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* My rank */}
          {myEntry && myEntry.rank > 3 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="text-sm font-bold w-8 shrink-0" style={{ color: '#22C55E' }}>#{myEntry.rank}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}>
                {myEntry.username.charAt(0).toUpperCase()}
              </div>
              <p className="flex-1 text-sm font-semibold" style={{ color: '#F4F4F5' }}>
                {myEntry.username} <span className="text-xs font-normal" style={{ color: '#22C55E' }}>(you)</span>
              </p>
              <p className="text-sm font-bold" style={{ color: '#22C55E' }}>${myEntry.total_earned.toFixed(2)}</p>
            </div>
          )}

          {/* Full list */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider w-12" style={{ color: 'rgba(244,244,245,0.35)' }}>#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,244,245,0.35)' }}>User</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,244,245,0.35)' }}>Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td className="px-4 py-3"><div className="h-4 w-6 shimmer rounded" /></td>
                          <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full shimmer" /><div className="h-4 w-24 shimmer rounded" /></div></td>
                          <td className="px-4 py-3 text-right"><div className="h-4 w-16 shimmer rounded ml-auto" /></td>
                        </tr>
                      ))
                    : entries.slice(0, 50).map((entry, idx) => {
                        const isMe = entry.id === profile?.id;
                        const rankColors: Record<number, string> = { 1: '#F59E0B', 2: '#9CA3AF', 3: '#CD7C3E' };
                        const rankColor = rankColors[entry.rank];
                        const rankIcon = entry.rank === 1 ? <Crown size={13} style={{ color: rankColor }} />
                          : entry.rank === 2 ? <Trophy size={12} style={{ color: rankColor }} />
                          : entry.rank === 3 ? <Award size={12} style={{ color: rankColor }} />
                          : null;
                        return (
                          <motion.tr key={entry.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                              background: isMe ? 'rgba(34,197,94,0.05)' : undefined,
                            }}>
                            <td className="px-4 py-3 w-12">
                              {rankIcon ?? <span className="text-xs font-medium" style={{ color: 'rgba(244,244,245,0.35)' }}>{entry.rank}</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(244,244,245,0.7)' }}>
                                  {entry.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium" style={{ color: '#F4F4F5' }}>
                                  {entry.username}
                                  {isMe && <span className="text-xs ml-1" style={{ color: '#22C55E' }}>(you)</span>}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-bold" style={{ color: rankColor ?? '#F4F4F5' }}>
                                ${entry.total_earned.toFixed(2)}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                  {!loading && entries.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-sm" style={{ color: 'rgba(244,244,245,0.35)' }}>
                        No entries yet. Be the first to earn!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

