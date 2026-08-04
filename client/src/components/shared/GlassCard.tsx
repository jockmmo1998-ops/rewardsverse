import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  gradient?: boolean;
  noPadding?: boolean;
}

export function GlassCard({ children, className, glow, gradient, noPadding, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border bg-card shadow-card overflow-hidden',
        !noPadding && 'p-5',
        glow && 'glow-primary',
        gradient && 'bg-gradient-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
