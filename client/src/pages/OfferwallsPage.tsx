import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Target, Star, ChevronRight, Zap } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { fetchOfferwalls } from '@/api';

export default function OfferwallsPage() {
  const [offerwalls, setOfferwalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfferwalls().then(data => {
      setOfferwalls(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Offerwalls" subtitle="Choose a provider below to start earning with surveys and tasks.">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Zap className="w-4 h-4" /> +50% Bonus Today!
        </div>
      </PageHeader>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading providers...</div>
      ) : offerwalls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {offerwalls.map((wall, i) => (
            <motion.div
              key={wall.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2, boxShadow: 'var(--shadow-hover)' }}
              className="relative overflow-hidden flex flex-col rounded-2xl border border-border bg-card p-5 md:p-6 group transition-all cursor-pointer"
            >
              {wall.badge && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    {wall.badge}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className={cn('w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform overflow-hidden bg-gradient-to-br', wall.color_gradient || 'from-white/10 to-white/5')}>
                  {wall.logo_url ? <img src={wall.logo_url} alt={wall.name} className="w-full h-full object-cover" /> : wall.logo_emoji}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">{wall.name}</h3>
                  <p className="text-sm text-muted-foreground">{wall.category}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Max Reward</span>
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" /> Up to $50.00
                  </span>
                </div>
                <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
          No offerwalls available at the moment.
        </div>
      )}
    </div>
  );
}
