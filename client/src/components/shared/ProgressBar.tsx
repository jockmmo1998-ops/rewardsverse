import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  animated?: boolean;
}

export function ProgressBar({ value, max = 100, className, showLabel, label = 'Progress', color = 'primary', animated }: ProgressBarProps) {
  const pct = Number.isFinite(value) && Number.isFinite(max) && max > 0
    ? Math.min(Math.max((value / max) * 100, 0), 100)
    : 0;
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium text-foreground">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-valuetext={`${Math.round(pct)}%`}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            color === 'primary' && 'bg-gradient-primary',
            color === 'secondary' && 'bg-secondary',
            color === 'success' && 'bg-success',
            color === 'warning' && 'bg-warning',
            animated && 'animate-glow-pulse',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
