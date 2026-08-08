import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Target, Star, ChevronRight, Zap, Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { fetchOfferwalls } from '@/api';

/* ── Tường Ưu Đãi Adexium (Popunder Ad Wall) ── */
function AdexiumAdWall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Tải script Adexium nếu chưa có
    const existing = document.querySelector('script[src="https://cdn.mangattec.online/assets/js/pp.min.js"]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://cdn.mangattec.online/assets/js/pp.min.js';
      s.type = 'text/javascript';
      s.async = true;
      s.onload = () => initWidget();
      document.head.appendChild(s);
    } else {
      initWidget();
    }

    function initWidget() {
      try {
        // @ts-ignore
        if (typeof AdexiumWidget !== 'undefined') {
          // @ts-ignore
          const widget = new AdexiumWidget({
            wid: 'cb68bc8c-4adc-4225-b98d-7342eff70d28',
            firstAdImpressionIntervalInSeconds: 1,
          });
          widget.autoMode();
        }
      } catch (e) {
        console.error('[Adexium] Khởi tạo widget thất bại:', e);
      }
      setLoaded(true);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 md:p-6"
    >
      {/* Tiêu đề */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-foreground">Tường Ưu Đãi</h3>
          <p className="text-xs text-muted-foreground">Quảng cáo đối tác • Kiếm thêm phần thưởng</p>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25 uppercase tracking-wider">
          Đang Hoạt Động
        </span>
      </div>

      <div className="border-t border-border/50 pt-4">
        {/* Vùng chứa quảng cáo — Adexium render vào đây qua autoMode() */}
        <div
          ref={containerRef}
          id="adexium-adwall-container"
          className="min-h-[120px] flex items-center justify-center rounded-xl bg-black/10"
        >
          {!loaded && (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs">Đang tải ưu đãi...</span>
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground/50 mt-3 text-center">
          Ưu đãi được cung cấp bởi đối tác Adexium. Chỉ dành cho lưu lượng thực từ người dùng.
        </p>
      </div>
    </motion.div>
  );
}

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

      {/* Tường Ưu Đãi Adexium */}
      <AdexiumAdWall />

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Đang tải nhà cung cấp...</div>
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
