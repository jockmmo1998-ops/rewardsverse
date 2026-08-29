import { Award, Lock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';

type Achievement = { title: string; description: string; req: number; current: number; format?: (value: number) => string };

export default function AchievementsPage() {
  const { profile, activities } = useAuth();
  const offers = Number(profile?.offersCompleted ?? profile?.completed_offers ?? 0);
  const earned = Number(profile?.totalEarned ?? profile?.lifetime_earnings ?? 0);
  const referrals = activities.filter(activity => activity.type === 'referral').length;
  const streak = Number(profile?.streak ?? 0);
  const achievements: Achievement[] = [
    { title: 'First Offer', description: 'Complete your first verified offer', req: 1, current: offers },
    { title: 'Getting Started', description: 'Earn your first $10 from recorded activity', req: 10, current: earned, format: value => `$${value.toFixed(2)}` },
    { title: 'Task Master', description: 'Complete 50 verified offers', req: 50, current: offers },
    { title: 'Community Builder', description: 'Generate 5 recorded referral events', req: 5, current: referrals },
    { title: 'Centurion', description: 'Earn $100 in the platform ledger', req: 100, current: earned, format: value => `$${value.toFixed(2)}` },
    { title: 'Streak Builder', description: 'Maintain a 7-day activity streak', req: 7, current: streak },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Achievements" subtitle="Progress is calculated from your verified account activity." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {achievements.map(achievement => {
          const progress = Math.min(100, (achievement.current / achievement.req) * 100);
          const unlocked = achievement.current >= achievement.req;
          return (
            <GlassCard key={achievement.title} className={`p-6 flex flex-col ${!unlocked ? 'opacity-80' : ''}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${unlocked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {unlocked ? <Award className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>
                {unlocked && <div className="px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">Unlocked</div>}
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1">{achievement.description}</p>
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between text-xs font-medium"><span className="text-muted-foreground">Progress</span><span className={unlocked ? 'text-success' : 'text-foreground'}>{unlocked ? 'Complete' : `${achievement.format ? achievement.format(achievement.current) : achievement.current} / ${achievement.format ? achievement.format(achievement.req) : achievement.req}`}</span></div>
                <ProgressBar value={progress} color={unlocked ? 'success' : 'primary'} className="h-1.5" />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
