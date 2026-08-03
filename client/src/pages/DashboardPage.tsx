import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowDownToLine, ListChecks, TrendingUp, Users, ArrowRight,
  CheckCircle2, DollarSign, Zap, Star, Flame, Trophy,
} from 'lucide-react';
import { getLiveActivity, getAnnouncements, getUserCompletions } from '@/lib/api';
import type { LiveActivity, Announcement, Completion } from '@/types/types';

// ── Premium Live Ticker (Dashboard) ────────────────────────────────────────

function DashTicker({ items }: { items: LiveActivity[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="relative w-full overflow-hidden rounded-xl"
      style={{ background: 'rgba(16,20,31,0.8)', border: '1px solid rgba(34,197,94,0.18)', boxShadow: '0 0 20px rgba(34,197,94,0.05)' }}
      onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused'; }}
      onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running'; }}>
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right,#09090B,transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left,#09090B,transparent)' }} />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 px-2 py-0.5 rounded"
        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <span className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: '#22C55E' }} />
        <span className="text-xs font-bold" style={{ color: '#22C55E' }}>LIVE</span>
      </div>
      <div ref={trackRef} className="ticker-track flex items-center py-2.5 pl-24">
        {doubled.map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex items-center gap-2 shrink-0 px-4">
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: item.type === 'completion' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)' }}>
              {item.type === 'completion'
                ? <CheckCircle2 size={10} style={{ color: '#22C55E' }} />
                : <DollarSign size={10} style={{ color: '#3B82F6' }} />}
            </div>
            <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(244,244,245,0.6)' }}>
              <span className="font-semibold" style={{ color: '#F4F4F5' }}>{item.username}</span>
              {' '}{item.type === 'completion' ? 'earned' : 'withdrew'}{' '}
              <span className="font-bold" style={{ color: item.type === 'completion' ? '#22C55E' : '#3B82F6' }}>
                ${item.amount.toFixed(2)}
              </span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.1)', marginLeft: 4 }}>·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Premium Stat Card ────────────────────────────────────────────────────────

interface StatCardProps {
  label: string; value: string; icon: React.ElementType;
  sub?: string; loading?: boolean; color?: string; bg?: string; border?: string;
}

function StatCard({ label, value, icon: Icon, sub, loading, color = '#22C55E', bg = 'rgba(34,197,94,0.08)', border = 'rgba(34,197,94,0.2)' }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-5 cursor-default"
      style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(244,244,245,0.4)' }}>{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg, border: `1px solid ${border}` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      {loading ? <div className="h-7 w-24 shimmer rounded-lg" /> : (
        <p className="text-2xl font-bold font-heading" style={{ color }}>{value}</p>
      )}
      {sub && <p className="text-xs mt-1" style={{ color: 'rgba(244,244,245,0.35)' }}>{sub}</p>}
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentCompletions, setRecentCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    const [activityData, announcementsData, completionsData] = await Promise.all([
      getLiveActivity(30),
      getAnnouncements(),
      getUserCompletions(profile.id, 0, 5),
    ]);
    setLiveActivity(activityData);
    setAnnouncements(announcementsData);
    setRecentCompletions(completionsData.data);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    if (profile) { refreshProfile(); load(); }
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => { getLiveActivity(30).then(setLiveActivity); }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: 'Balance', value: profile ? `$${profile.balance.toFixed(2)}` : '$0.00',
      icon: DollarSign, sub: 'Available to withdraw',
      color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)',
    },
    {
      label: 'Total Earned', value: profile ? `$${profile.total_earned.toFixed(2)}` : '$0.00',
      icon: TrendingUp, sub: 'All-time earnings',
      color: '#A855F7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)',
    },
    {
      label: 'Completions', value: String(recentCompletions.length || '—'),
      icon: ListChecks, sub: 'Recent 5 offers',
      color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)',
    },
    {
      label: 'Referral Code', value: profile?.referral_code ?? '—',
      icon: Users, sub: 'Share & earn bonus',
      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
    },
  ];

  return (
    <>
      <PageMeta title="Dashboard — RewardsVerse" description="Your RewardsVerse earnings dashboard" />
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 0 16px rgba(34,197,94,0.3)' }}>
                <Zap size={15} className="text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-heading" style={{ color: '#F4F4F5' }}>
                  Welcome back{profile ? `, ${profile.username}` : ''}
                </h1>
                <p className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>Here's your earnings overview</p>
              </div>
            </div>
          </motion.div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Zap size={13} className="mt-0.5 shrink-0" style={{ color: '#22C55E' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#F4F4F5' }}>{announcements[0].title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(244,244,245,0.5)' }}>{announcements[0].content}</p>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <StatCard {...s} loading={loading && !profile} />
              </motion.div>
            ))}
          </div>

          {/* Live ticker */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-semibold font-heading" style={{ color: '#F4F4F5' }}>Live Activity</h2>
            </div>
            {loading ? (
              <div className="h-10 rounded-xl shimmer" />
            ) : liveActivity.length > 0 ? (
              <DashTicker items={liveActivity} />
            ) : (
              <div className="rounded-xl py-5 text-center text-xs"
                style={{ background: 'rgba(16,20,31,0.6)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(244,244,245,0.35)' }}>
                No activity yet — complete your first offer to appear here!
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { to: '/offers', icon: Flame, color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', title: 'Start Earning', desc: 'Browse 500+ offers', btnLabel: 'View Offers', btnStyle: 'btn-primary' },
              { to: '/withdraw', icon: ArrowDownToLine, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', title: 'Withdraw', desc: 'Cash out instantly', btnLabel: 'Withdraw Now', btnStyle: 'glass-sm' },
              { to: '/leaderboard', icon: Trophy, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', title: 'Leaderboard', desc: 'Climb the ranks', btnLabel: 'View Ranks', btnStyle: 'glass-sm' },
            ].map(q => {
              const Icon = q.icon;
              return (
                <motion.div key={q.to} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
                  className="rounded-2xl p-5"
                  style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: q.bg, border: `1px solid ${q.border}` }}>
                      <Icon size={15} style={{ color: q.color }} />
                    </div>
                  </div>
                  <h3 className="font-bold font-heading text-sm mb-1" style={{ color: '#F4F4F5' }}>{q.title}</h3>
                  <p className="text-xs mb-3" style={{ color: 'rgba(244,244,245,0.4)' }}>{q.desc}</p>
                  <Link to={q.to}>
                    <button className={`${q.btnStyle} text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all`}
                      style={q.btnStyle === 'glass-sm' ? { color: q.color } : undefined}>
                      {q.btnLabel} <ArrowRight size={11} />
                    </button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Recent completions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold font-heading" style={{ color: '#F4F4F5' }}>Recent Completions</h2>
              <Link to="/history">
                <button className="text-xs flex items-center gap-1 transition-colors hover:text-white"
                  style={{ color: 'rgba(244,244,245,0.4)' }}>
                  View all <ArrowRight size={10} />
                </button>
              </Link>
            </div>
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl shimmer" />
                ))
              ) : recentCompletions.length > 0 ? (
                recentCompletions.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(16,20,31,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <CheckCircle2 size={12} style={{ color: '#22C55E' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#F4F4F5' }}>{c.offer_name}</p>
                        <p className="text-xs" style={{ color: 'rgba(244,244,245,0.35)' }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold shrink-0 ml-3" style={{ color: '#22C55E' }}>
                      +${c.amount.toFixed(2)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl py-10 text-center"
                  style={{ background: 'rgba(16,20,31,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Star size={22} className="mx-auto mb-3" style={{ color: 'rgba(244,244,245,0.2)' }} />
                  <p className="text-sm font-medium" style={{ color: 'rgba(244,244,245,0.4)' }}>No completions yet</p>
                  <Link to="/offers">
                    <button className="btn-primary mt-3 text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5">
                      Browse Offers <ArrowRight size={11} />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
