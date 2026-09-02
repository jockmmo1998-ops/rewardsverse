import type { ReactNode } from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, Coins, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn('h-5 w-5', className)} aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" opacity="0.28" />
      <path d="M8.5 20.5c2.15 2.2 4.65 3.3 7.5 3.3 4.55 0 7.15-2.55 7.8-7.65" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M9.5 11.75c1.9-2.2 4.08-3.3 6.55-3.3 3.35 0 5.65 1.2 6.9 3.6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20.25 8.8 23.2 12l-4.25.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3.15" fill="currentColor" />
      <path d="M14.6 16h2.8M16 14.6v2.8" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark" aria-hidden="true">
        <BrandGlyph className="h-4 w-4" />
      </div>
      <span className={cn('font-display font-bold tracking-[0.08em] text-foreground', compact ? 'text-[0.72rem]' : 'text-[1.08rem]')}>
        REWARDSVERSE
      </span>
    </div>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rv-surface', className)}>{children}</section>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="rv-eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-foreground sm:text-[1.8rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  helper,
  icon: Icon,
  accent = 'mint',
}: {
  label: string;
  value: string;
  helper?: string;
  icon: typeof Coins;
  accent?: 'mint' | 'violet' | 'amber' | 'sky';
}) {
  return (
    <Surface className="group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30">
      <div className={cn('stat-icon', `stat-icon-${accent}`)}><Icon className="h-[18px] w-[18px]" /></div>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-[1.65rem] font-bold tracking-[-0.04em] text-foreground">{value}</p>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
      <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-muted-foreground/40 transition group-hover:text-primary" />
    </Surface>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized === 'completed' || normalized === 'success' ? 'success' : normalized === 'pending' ? 'pending' : 'failed';
  return <span className={cn('status-badge', `status-${tone}`)}>{status}</span>;
}

export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2"><div className="h-3 w-1/3 animate-pulse rounded bg-muted" /><div className="h-2.5 w-1/4 animate-pulse rounded bg-muted" /></div>
          <div className="h-3 w-14 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description: string; icon?: typeof Inbox; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-12 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Icon className="h-5 w-5" /></div>
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return <>{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing</> : <><CheckCircle2 className="h-4 w-4" /> {children}</>}</>;
}
