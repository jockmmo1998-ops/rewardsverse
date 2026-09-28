import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { Activity, ArrowDownToLine, CalendarDays, CircleDollarSign, Radio, Trophy, WalletCards, X } from 'lucide-react';
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

function dateLabel(value: unknown) {
  if (!value) return '—';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeLabel(value: unknown) {
  if (!value) return 'Recently';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function levelForXp(value: unknown) {
  const xp = Number(value || 0);
  if (xp >= 1000) return { level: 10, name: 'Legend' };
  if (xp >= 500) return { level: 8, name: 'Elite' };
  if (xp >= 300) return { level: 6, name: 'Pro' };
  if (xp >= 150) return { level: 4, name: 'Skilled' };
  if (xp >= 50) return { level: 2, name: 'Starter' };
  return { level: 1, name: 'Newbie' };
}

function activityLabel(type: unknown) {
  if (type === 'withdrawal') return 'Withdrew funds';
  if (type === 'offer_complete' || type === 'reward') return 'Offer';
  if (type === 'daily_claim') return 'Daily bonus';
  if (type === 'referral') return 'Referral reward';
  return 'Account activity';
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

function shortOfferName(item: any) {
  if (item.type === 'withdrawal') return 'WITHDRAW';
  const description = String(item.description || '').trim();
  const separatorIndex = description.indexOf(' — ');
  const rawOfferName = separatorIndex >= 0
    ? description.slice(separatorIndex + 3).trim()
    : description.replace(/^earned\s+\$?[\d.,]+\s+on\s+/i, '').trim();
  const offerName = rawOfferName
    .replace(/^order\s+your\s+/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!offerName) return 'New offer';
  const maxLength = 20;
  return offerName.length > maxLength
    ? `${offerName.slice(0, maxLength - 1).trimEnd()}…`
    : offerName;
}

function userKey(item: any) {
  return String(item.userId ?? item.username ?? 'member');
}

export function LiveActivityBar() {
  const [selectedUserKey, setSelectedUserKey] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const activities = trpc.user.getActivities.useQuery(undefined, {
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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
  const selectedUser = selectedActivity ?? selectedItems[0];
  const selectedLevel = levelForXp(selectedUser?.xp);
  useEffect(() => {
    if (selectedUserKey && !groupedUsers.has(selectedUserKey)) {
      setSelectedUserKey(null);
      setSelectedActivity(null);
    }
  }, [groupedUsers, selectedUserKey]);

  useEffect(() => {
    const handleNativeClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLElement>('[data-live-user-key]');
      const key = button?.dataset.liveUserKey;
      if (!key) return;
      const item = items.find((candidate) => userKey(candidate) === key);
      if (!item) return;
      setSelectedUserKey(key);
      setSelectedActivity(item);
    };
    document.addEventListener('click', handleNativeClick, true);
    return () => document.removeEventListener('click', handleNativeClick, true);
  }, [items]);

  const inspectItem = (event: SyntheticEvent, item: any) => {
    event.stopPropagation();
    setSelectedUserKey(userKey(item));
    setSelectedActivity(item);
  };

  const inspectFromLiveBar = (event: SyntheticEvent) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLElement>('[data-live-user-key]');
    const key = button?.dataset.liveUserKey;
    if (!key) return;
    const item = items.find((candidate) => userKey(candidate) === key);
    if (item) inspectItem(event, item);
  };

  const renderItem = (item: any, duplicate = false) => (
    <button
      key={`${item.id}-${duplicate ? 'copy' : 'primary'}`}
      type="button"
      className={`live-activity-item live-activity-button ${item.type === 'withdrawal' ? 'live-activity-withdrawal' : ''}`}
      onPointerDown={(event) => inspectItem(event, item)}
      onMouseDown={(event) => inspectItem(event, item)}
      onClick={(event) => inspectItem(event, item)}
      tabIndex={duplicate ? -1 : 0}
      aria-hidden={duplicate}
      data-live-user-key={userKey(item)}
      aria-label={`View full activity for ${maskUsername(item.username)}`}
    >
      <UserAvatar userId={item.userId} avatarId={item.avatarId} alt="" className="h-6 w-6 shrink-0 rounded-full border border-primary/20" />
      {item.type === 'withdrawal' ? <ArrowDownToLine className="h-3.5 w-3.5 shrink-0 text-amber-300" /> : <Activity className={`h-3.5 w-3.5 shrink-0 ${activityTone(item.type)}`} />}
      <span className="live-activity-copy">
        <span className="live-activity-user">{maskUsername(item.username)}</span>
        <span className="live-activity-summary">
          <span className="live-activity-amount">{formatAmount(item.amount) || 'Verified'}</span> <span>·</span> <span className={item.type === 'withdrawal' ? 'live-activity-withdrawal-label' : 'live-activity-offer-name'}>{shortOfferName(item)}</span>
        </span>
      </span>
    </button>
  );

  return (
    <section className="live-activity-bar relative" onPointerDownCapture={inspectFromLiveBar} onClickCapture={inspectFromLiveBar} aria-label="Live verified activity" aria-live="polite">
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
            <div className={`live-activity-detail-icon ${selectedUser.type === 'withdrawal' ? 'withdrawal' : ''}`}>{selectedUser.type === 'withdrawal' ? <ArrowDownToLine className="h-4 w-4" /> : <WalletCards className="h-4 w-4" />}</div>
            <div className="min-w-0 flex-1">
              <p className={`text-[11px] font-bold uppercase tracking-[.14em] ${selectedUser.type === 'withdrawal' ? 'text-amber-300' : 'text-primary'}`}>{selectedUser.type === 'withdrawal' ? 'Withdrawal activity' : 'User activity summary'}</p>
              <div className="mt-1 flex items-center gap-2"><UserAvatar userId={selectedUser.userId} avatarId={selectedUser.avatarId} alt="" className="h-7 w-7 rounded-full border border-primary/20" /><p className="text-sm font-semibold text-foreground">{maskUsername(selectedUser.username)}</p></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="live-detail-stat"><span><CalendarDays className="inline h-3 w-3" /> Registered</span><strong>{dateLabel(selectedUser.registeredAt)}</strong></div>
                <div className="live-detail-stat"><span><Trophy className="inline h-3 w-3" /> Level</span><strong>{selectedLevel.level} · {selectedLevel.name}</strong></div>
                <div className="live-detail-stat"><span>Offers completed</span><strong>{selectedUser.offersCompleted ?? selectedItems.filter((item) => item.type !== 'withdrawal').length}</strong></div>
                <div className="live-detail-stat"><span>Latest action</span><strong>{timeLabel(selectedUser.createdAt)}</strong></div>
              </div>
              <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
                {selectedItems.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-xs">
                    {item.type === 'withdrawal' ? <ArrowDownToLine className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" /> : <Activity className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${activityTone(item.type)}`} />}
                    <span className={`min-w-0 break-words ${item.type === 'withdrawal' ? 'text-amber-100' : 'text-muted-foreground'}`}><strong className="mr-1 text-foreground">{activityLabel(item.type)}</strong>{item.type === 'offer_complete' || item.type === 'reward' ? shortOfferName(item) : compactActivityDescription(item.description)}{formatAmount(item.amount) && <strong className="ml-1 text-foreground">{formatAmount(item.amount)}</strong>}<span className="ml-1 text-[10px] text-muted-foreground/70">· {timeLabel(item.createdAt)}</span></span>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => { setSelectedUserKey(null); setSelectedActivity(null); }} className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close activity details"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
