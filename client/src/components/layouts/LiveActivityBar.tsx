import { useEffect, useMemo, useState } from 'react';
import { Activity, CircleDollarSign, Radio, WalletCards, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { UserAvatar } from '@/components/AvatarSystem';

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
  const maxOfferNameLength = 30;
  const compactName = offerName.length > maxOfferNameLength
    ? `${offerName.slice(0, maxOfferNameLength - 1).trimEnd()}…`
    : offerName;
  return `${prefix}${compactName}`;
}

function userKey(item: any) {
  return String(item.userId ?? item.username ?? 'member');
}

export function LiveActivityBar() {
  const [selectedUserKey, setSelectedUserKey] = useState<string | null>(null);
  const activities = trpc.user.getActivities.useQuery(undefined, {
    staleTime: 10_000,
    refetchInterval: 30_000,
    retry: false,
  });
  const items = (activities.data ?? []).slice(0, 30) as any[];
  const groupedUsers = useMemo(() => {
    const groups = new Map<string, any[]>();
    items.forEach((item) => {
      const key = userKey(item);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });
    return groups;
  }, [items]);
  const selectedItems = selectedUserKey ? groupedUsers.get(selectedUserKey) ?? [] : [];
  const selectedUser = selectedItems[0];
  const earnedTotal = selectedItems
    .filter((item) => item.type !== 'withdrawal')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const withdrawnTotal = selectedItems
    .filter((item) => item.type === 'withdrawal')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  useEffect(() => {
    if (selectedUserKey && !groupedUsers.has(selectedUserKey)) setSelectedUserKey(null);
  }, [groupedUsers, selectedUserKey]);

  const renderItem = (item: any, duplicate = false) => (
    <button
      key={`${item.id}-${duplicate ? 'copy' : 'primary'}`}
      type="button"
      className="live-activity-item live-activity-button"
      onClick={() => setSelectedUserKey(userKey(item))}
      tabIndex={duplicate ? -1 : 0}
      aria-hidden={duplicate}
      aria-label={`View full activity for ${maskUsername(item.username)}`}
    >
      <UserAvatar userId={item.userId} avatarId={item.avatarId} alt="" className="h-6 w-6 shrink-0 rounded-full border border-primary/20" />
      <Activity className={`h-3.5 w-3.5 shrink-0 ${activityTone(item.type)}`} />
      <span className="live-activity-copy">
        <span className="live-activity-user">{maskUsername(item.username)}</span>
        <span className="live-activity-summary">
          {formatAmount(item.amount) || 'Verified'} <span>·</span> {item.type === 'withdrawal' ? 'withdrew' : 'completed offer'}
        </span>
      </span>
    </button>
  );

  return (
    <section className="live-activity-bar relative" aria-label="Live verified activity" aria-live="polite">
      <div className="live-activity-inner">
        <span className="live-activity-status"><Radio className="h-3.5 w-3.5" /> LIVE</span>
        {activities.isLoading ? (
          <span className="text-xs text-muted-foreground">Loading verified activity…</span>
        ) : items.length ? (
          <div className="live-activity-track">
            <div className="live-activity-items">
              <div className="live-activity-group">{items.map((item) => renderItem(item))}</div>
              <div className="live-activity-group" aria-hidden="true">{items.map((item) => renderItem(item, true))}</div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground"><CircleDollarSign className="mr-1.5 inline h-3.5 w-3.5" />No recent verified activity</span>
        )}
      </div>
      {selectedUser && (
        <div className="live-activity-detail" role="dialog" aria-label="User activity details">
          <div className="flex items-start gap-3">
            <div className="live-activity-detail-icon"><WalletCards className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-emerald-700">User activity summary</p>
              <div className="mt-1 flex items-center gap-2"><UserAvatar userId={selectedUser.userId} avatarId={selectedUser.avatarId} alt="" className="h-7 w-7 rounded-full border border-primary/20" /><p className="text-sm font-semibold text-foreground">{maskUsername(selectedUser.username)}</p></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-emerald-50 px-2.5 py-2"><span className="block text-[10px] text-muted-foreground">Offers completed</span><strong className="text-emerald-700">{selectedItems.filter((item) => item.type !== 'withdrawal').length}</strong></div>
                <div className="rounded-lg bg-amber-50 px-2.5 py-2"><span className="block text-[10px] text-muted-foreground">Withdrawals</span><strong className="text-amber-700">{selectedItems.filter((item) => item.type === 'withdrawal').length}</strong></div>
                <div className="rounded-lg bg-emerald-50 px-2.5 py-2"><span className="block text-[10px] text-muted-foreground">Earned</span><strong className="text-emerald-700">${earnedTotal.toFixed(2)}</strong></div>
                <div className="rounded-lg bg-amber-50 px-2.5 py-2"><span className="block text-[10px] text-muted-foreground">Withdrawn</span><strong className="text-amber-700">${withdrawnTotal.toFixed(2)}</strong></div>
              </div>
              <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
                {selectedItems.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-xs">
                    <Activity className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${activityTone(item.type)}`} />
                    <span className="min-w-0 break-words text-muted-foreground">{compactActivityDescription(item.description)}{formatAmount(item.amount) && <strong className="ml-1 text-foreground">{formatAmount(item.amount)}</strong>}</span>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => setSelectedUserKey(null)} className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close activity details"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
