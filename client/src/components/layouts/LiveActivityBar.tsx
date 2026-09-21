import { useEffect, useState } from 'react';
import { Activity, CircleDollarSign, Radio, WalletCards, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';

function maskUsername(value: unknown) {
  const username = String(value || 'member').trim();
  if (username.length <= 3) return `${username.slice(0, 1)}***`;
  if (username.length <= 6) return `${username.slice(0, 2)}***`;
  return `${username.slice(0, 3)}***${username.slice(-2)}`;
}

function formatAmount(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) && amount > 0 ? `$${amount.toFixed(2)}` : null;
}

function activityTone(type: unknown) {
  if (type === 'withdrawal') return 'text-amber-500';
  if (type === 'offer_complete' || type === 'reward') return 'text-emerald-600';
  return 'text-slate-500';
}

function compactActivityDescription(value: unknown) {
  const description = String(value || 'completed a verified reward');
  const separator = ' — ';
  const separatorIndex = description.indexOf(separator);
  if (separatorIndex === -1) return description;
  const prefix = description.slice(0, separatorIndex + separator.length);
  const offerName = description.slice(separatorIndex + separator.length).trim();
  const maxOfferNameLength = 28;
  const compactName = offerName.length > maxOfferNameLength
    ? `${offerName.slice(0, maxOfferNameLength - 1).trimEnd()}…`
    : offerName;
  return `${prefix}${compactName}`;
}

export function LiveActivityBar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const activities = trpc.user.getActivities.useQuery(undefined, {
    staleTime: 10_000,
    refetchInterval: 30_000,
    retry: false,
  });
  const items = (activities.data ?? []).slice(0, 12);
  const currentItem = items[activeIndex % Math.max(items.length, 1)];

  useEffect(() => {
    if (!items.length) return;
    setActiveIndex((index) => index % items.length);
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, 7_000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    if (selected && !items.some((item: any) => item.id === selected.id)) setSelected(null);
  }, [items, selected]);

  return (
    <section className="live-activity-bar relative" aria-label="Live verified activity" aria-live="polite">
      <div className="live-activity-inner">
        <span className="live-activity-status"><Radio className="h-3.5 w-3.5" /> LIVE</span>
        {activities.isLoading ? (
          <span className="text-xs text-muted-foreground">Loading verified activity…</span>
        ) : items.length ? (
          <div className="live-activity-current">
            <button
              type="button"
              className="live-activity-item live-activity-button"
              onClick={() => setSelected(currentItem)}
              aria-label={`View activity from ${maskUsername(currentItem.username)}`}
            >
              <Activity className={`h-3.5 w-3.5 shrink-0 ${activityTone(currentItem.type)}`} />
              <span className="live-activity-copy">
                <span className="live-activity-user">{maskUsername(currentItem.username)}</span>
                <span className="live-activity-summary">
                  {formatAmount(currentItem.amount) || 'Verified'} <span>·</span> {currentItem.type === 'withdrawal' ? 'withdrew' : 'completed an offer'}
                </span>
              </span>
              <span className="live-activity-hint">View details</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground"><CircleDollarSign className="mr-1.5 inline h-3.5 w-3.5" />No recent verified activity</span>
        )}
      </div>
      {selected && (
        <div className="live-activity-detail" role="dialog" aria-label="Activity details">
          <div className="flex items-start gap-3">
            <div className="live-activity-detail-icon"><WalletCards className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-emerald-700">Verified activity</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{maskUsername(selected.username)} {selected.type === 'withdrawal' ? 'withdrew funds' : 'completed an offer'}</p>
              <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{compactActivityDescription(selected.description)}</p>
              {formatAmount(selected.amount) && <p className="mt-2 text-sm font-bold text-emerald-700">{formatAmount(selected.amount)}</p>}
            </div>
            <button type="button" onClick={() => setSelected(null)} className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close activity details">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
