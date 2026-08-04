import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Trophy, TrendingUp, Users, ArrowRight, Activity, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/components/shared/GlassCard';
import { fetchPlatformStats, fetchOfferwalls, fetchFeaturedOffers, fetchLatestWithdrawals, fetchLiveActivity } from '@/api';

export default function HomePage() {
  const [stats, setStats] = useState({ totalPaidOut: 0, activeUsers: 0, offersAvailable: 0, avgDailyEarn: 0 });
  const [offerwalls, setOfferwalls] = useState<any[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<any[]>([]);
  const [latestWithdrawals, setLatestWithdrawals] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, ows, offers, wds, acts] = await Promise.all([
          fetchPlatformStats(),
          fetchOfferwalls(),
          fetchFeaturedOffers(),
          fetchLatestWithdrawals(),
          fetchLiveActivity()
        ]);
        setStats(s);
        setOfferwalls(ows);
        setFeaturedOffers(offers);
        setLatestWithdrawals(wds);
        setLiveActivity(acts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 md:pt-24 pb-8 md:pb-16 max-w-4xl mx-auto text-center">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50 blur-3xl -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-sm text-primary font-medium">
            <Star className="w-4 h-4" /> Start earning crypto today!
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            The Ultimate Platform to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-primary">Earn Crypto</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
            Complete surveys, play games, and watch videos to earn rewards. Join thousands of users and start your crypto journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-95 transition-all duration-150 shadow-[0_0_20px_rgba(0,245,160,0.3)]"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/offerwalls"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 active:scale-95 transition-all duration-150"
            >
              Explore Offers
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Paid Out', value: `$${(stats.totalPaidOut/1000000).toFixed(1)}M+`, icon: Trophy, color: 'text-yellow-400' },
            { label: 'Active Users', value: `${(stats.activeUsers/1000).toFixed(1)}k+`, icon: Users, color: 'text-primary' },
            { label: 'Available Offers', value: stats.offersAvailable.toString(), icon: Zap, color: 'text-cyan-400' },
            { label: 'Avg Daily Earn', value: `$${stats.avgDailyEarn}`, icon: TrendingUp, color: 'text-purple-400' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6 text-center h-full flex flex-col items-center justify-center gap-2">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
                <h3 className="text-3xl font-heading font-bold text-foreground">{loading ? '-' : stat.value}</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 max-w-7xl mx-auto w-full">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Popular Offerwalls */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Popular Offerwalls
              </h2>
              <Link to="/offerwalls" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? <div className="text-center py-10">Loading...</div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {offerwalls.slice(0, 6).map((wall, i) => (
                  <Link key={wall.id} to="/offerwalls">
                    <div className="group relative overflow-hidden rounded-xl bg-black/40 border border-white/5 p-4 hover:border-primary/50 transition-colors h-full flex flex-col items-center text-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${wall.color_gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform overflow-hidden`}>
                        {wall.logo_url ? <img src={wall.logo_url} alt={wall.name} className="w-full h-full object-cover" /> : wall.logo_emoji}
                      </div>
                      <h3 className="font-semibold text-foreground">{wall.name}</h3>
                      {wall.badge && (
                        <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">
                          {wall.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Featured Offers */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" /> Featured Offers
              </h2>
            </div>
            {loading ? <div className="text-center py-10">Loading...</div> : (
              <div className="space-y-3">
                {featuredOffers.map((offer, i) => (
                  <div key={offer.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center text-xl overflow-hidden">
                        {offer.offerwall?.logo_url ? <img src={offer.offerwall.logo_url} alt="logo" className="w-full h-full object-cover" /> : (offer.offerwall?.logo_emoji || '🎁')}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{offer.title}</p>
                        <p className="text-xs text-muted-foreground">{offer.offerwall?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${offer.reward.toFixed(2)}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">{offer.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Live Activity
            </h2>
            {loading ? <div className="text-center py-10">Loading...</div> : (
              <div className="space-y-4">
                <AnimatePresence>
                  {liveActivity.length > 0 ? liveActivity.map((act) => (
                    <motion.div key={act.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                      <img src={act.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="Avatar" className="w-8 h-8 rounded-full bg-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          <span className="font-medium text-foreground">{act.user?.username || 'User'}</span>{' '}
                          <span className="text-muted-foreground">
                            {act.type === 'withdrawal' ? 'withdrew' : 'completed a task'}
                          </span>
                        </p>
                        <p className="text-xs text-primary font-medium">+{act.amount ? `$${act.amount.toFixed(2)}` : '...'}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center">No recent activity</p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>

          {/* Referral Banner */}
          <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-br from-primary/20 to-transparent border-primary/30">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/30 blur-2xl rounded-full" />
            <h3 className="text-lg font-bold text-foreground mb-2">Referral Program</h3>
            <p className="text-sm text-muted-foreground mb-4">Earn <span className="text-primary font-bold">15% lifetime commission</span> from your friends.</p>
            <Link to="/referrals" className="inline-flex items-center justify-center w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
              Get referral link
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
