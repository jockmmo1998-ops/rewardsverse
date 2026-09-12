import { Activity, CircleDollarSign, Radio } from 'lucide-react';
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
  if (type === 'withdrawal') return 'text-amber-300';
  if (type === 'offer_complete' || type === 'reward') return 'text-emerald-300';
  return 'text-slate-300';
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
  const activities = trpc.user.getActivities.useQuery(undefined, {
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: false,
  });
  const items = (activities.data ?? []).slice(0, 12);

  return (
    <section className="live-activity-bar" aria-label="Live verified activity" aria-live="polite">
      <div className="live-activity-inner">
        <span className="live-activity-status"><Radio className="h-3.5 w-3.5" /> LIVE</span>
        {activities.isLoading ? (
          <span className="text-xs text-muted-foreground">Loading verified activity…</span>
        ) : items.length ? (
          <div className="live-activity-track">
            <div className="live-activity-items">
              {[0, 1].map(group => (
                <div key={group} className="live-activity-group" aria-hidden={group === 1}>
                  {items.map((item: any, index) => (
                    <span key={`${item.id}-${group}-${index}`} className="live-activity-item">
                      <Activity className={`h-3.5 w-3.5 shrink-0 ${activityTone(item.type)}`} />
                      <span className="font-semibold text-foreground">{maskUsername(item.username)}</span>
                      <span className="text-muted-foreground">{compactActivityDescription(item.description)}</span>
                      {formatAmount(item.amount) && <span className="font-semibold text-emerald-300">{formatAmount(item.amount)}</span>}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground"><CircleDollarSign className="mr-1.5 inline h-3.5 w-3.5" />No recent verified activity</span>
        )}
      </div>
    </section>
  );
}
