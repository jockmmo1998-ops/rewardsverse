import { Award, Lock, Star } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { ProgressBar } from '@/components/shared/ProgressBar';

const achievements = [
  { id: 1, title: 'First Blood', description: 'Complete your first offer', icon: '🩸', req: 1, current: 1, unlocked: true },
  { id: 2, title: 'Getting Started', description: 'Earn your first $10.00', icon: '💰', req: 10, current: 10, unlocked: true },
  { id: 3, title: 'Task Master', description: 'Complete 50 offers', icon: '🎯', req: 50, current: 12, unlocked: false },
  { id: 4, title: 'Social Butterfly', description: 'Refer 5 active friends', icon: '🦋', req: 5, current: 1, unlocked: false },
  { id: 5, title: 'Centurion', description: 'Earn $100.00 total', icon: '💯', req: 100, current: 45.5, unlocked: false },
  { id: 6, title: 'Streak King', description: 'Log in for 7 consecutive days', icon: '🔥', req: 7, current: 3, unlocked: false },
];

export default function AchievementsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Achievements" subtitle="Unlock badges and earn bonus XP by completing milestones." />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {achievements.map(ach => {
          const progress = Math.min(100, (ach.current / ach.req) * 100);
          return (
            <GlassCard key={ach.id} className={`p-6 flex flex-col ${!ach.unlocked ? 'opacity-70 grayscale-[0.3]' : ''}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${ach.unlocked ? 'bg-primary/20' : 'bg-white/5'}`}>
                  {ach.unlocked ? ach.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                </div>
                {ach.unlocked && (
                  <div className="px-2 py-1 rounded-md bg-success/20 text-success text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3" /> Unlocked
                  </div>
                )}
              </div>
              
              <h3 className="font-heading font-bold text-lg mb-1">{ach.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1">{ach.description}</p>
              
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={ach.unlocked ? 'text-success' : 'text-foreground'}>
                    {ach.unlocked ? 'Complete' : `${ach.current} / ${ach.req}`}
                  </span>
                </div>
                <ProgressBar value={progress} color={ach.unlocked ? 'success' : 'primary'} className="h-1.5" />
                {!ach.unlocked && (
                  <p className="text-[10px] text-muted-foreground text-right mt-1">+500 XP on completion</p>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
