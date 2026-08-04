import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  gradient?: boolean;
  className?: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, gradient, className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-hover)' }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 border border-border bg-card shadow-card card-hover',
        gradient && 'bg-gradient-card',
        className,
      )}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-primary opacity-5 pointer-events-none" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground mb-1 truncate">{title}</p>
          <p className="font-heading font-bold text-2xl text-foreground truncate">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.positive ? 'text-success' : 'text-destructive',
            )}>
              <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground font-normal">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn(
          'shrink-0 w-11 h-11 rounded-xl flex items-center justify-center',
          gradient ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground',
        )}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
