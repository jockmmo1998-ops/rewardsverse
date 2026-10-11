import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import { Activity, ArrowDownToLine, CalendarDays, CircleDollarSign, Trophy, WalletCards, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { UserAvatar } from '@/components/AvatarSystem';
import { useAuth } from '@/contexts/AuthContext';

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
  if (!offerName) return 'Reward activity';
  const maxLength = 20;
  return offerName.length > maxLength
    ? `${offerName.slice(0, maxLength - 1).trimEnd()}…`
    : offerName;
}

function providerName(item: any) {
  const description = String(item.description || '');
  const match = description.match(/\bon\s+(.+?)(?:\s+—|$)/i);
  return match?.[1]?.trim() || 'Verified provider';
}

function withdrawalMethod(item: any) {
  const description = String(item.description || '');
  const match = description.match(/\bvia\s+(.+)$/i);
  return match?.[1]?.trim() || 'Payout method';
}

function userKey(item: any) {
  return String(item.userId ?? item.username ?? 'member');
}

export function LiveActivityBar() {
  const [selectedUserKey, setSelectedUserKey] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const activityTriggerRef = useRef<HTMLElement | null>(null);
  const { user } = useAuth();
  const visualPreview = import.meta.env.DEV && import.meta.env.VITE_VISUAL_PREVIEW === 'true';
  const activities = trpc.user.getActivities.useQuery(undefined, {
    staleTime: 15_000,
    refetchInterval: 15_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const currentUserId = String(user?.id ?? user?.userId ?? '');
  const currentUsername = String(user?.username ?? '').toLowerCase();
  const items = (activities.data ?? [])
    .filter((item: any) => {
      const itemUserId = String(item.userId ?? '');
      const itemUsername = String(item.username ?? '').toLowerCase();
      return (!currentUserId || itemUserId !== currentUserId) && (!currentUsername || itemUsername !== currentUsername);
    })
    .slice(0, 30) as any[];
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
    if (!selectedUserKey) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setSelectedUserKey(null);
      setSelectedActivity(null);
      if (activityTriggerRef.current?.isConnected) activityTriggerRef.current.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [selectedUserKey]);

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
    const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-live-user-key]');
    if (trigger) activityTriggerRef.current = trigger;
    setSelectedUserKey(userKey(item));
    setSelectedActivity(item);
  };

  const closeActivityDetails = () => {
    setSelectedUserKey(null);
    setSelectedActivity(null);
    if (activityTriggerRef.current?.isConnected) activityTriggerRef.current.focus();
  };

  const inspectFromLiveBar = (event: SyntheticEvent) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLElement>('[data-live-user-key]');
    const key = button?.dataset.liveUserKey;
    if (!key) return;
    const item = items.find((candidate) => userKey(candidate) === key);
    if (item) inspectItem(event, item);
  };

  const renderItem = (item: any, duplicate = false) => {
    const withdrawal = item.type === 'withdrawal';
    return (
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
      aria-expanded={selectedUserKey === userKey(item)}
      aria-controls={selectedUserKey === userKey(item) ? 'live-activity-detail' : undefined}
      aria-label={`View full activity for ${maskUsername(item.username)}`}
    >
      <span className="live-activity-copy">
        <span className="live-activity-user-row"><UserAvatar userId={item.userId} avatarId={item.avatarId} alt="" className="live-activity-user-avatar" /><span className="live-activity-user">{maskUsername(item.username)}</span></span>
        <span className="live-activity-summary">
          {withdrawal && <em className="live-activity-type">WITHDRAWAL</em>}
          <span className={withdrawal ? 'live-activity-withdrawal-label' : 'live-activity-offer-name'}>{withdrawal ? withdrawalMethod(item) : shortOfferName(item)}</span>
          <b className="live-activity-amount">{formatAmount(item.amount) || '—'}</b>
        </span>
      </span>
    </button>
    );
  };

  const renderTrack = (feed: any[]) => (
    <div className="live-activity-track">
      <div className="live-activity-items">
        <div className="live-activity-group">{feed.map((item) => renderItem(item))}</div>
        <div className="live-activity-group" aria-hidden="true">{feed.map((item) => renderItem(item, true))}</div>
      </div>
    </div>
  );

  return (
    <section className="live-activity-bar rv-live-ticker relative" onPointerDownCapture={inspectFromLiveBar} onClickCapture={inspectFromLiveBar} aria-label="Live verified activity" aria-live="polite">
      <div className="rv-live-ticker-inner">
        <div className="live-activity-row-label rv-live-ticker-label"><span className="live-activity-status-dot" aria-hidden="true" /><span>Recent credits</span></div>
        <div className="rv-live-ticker-feed">
          {activities.isError
            ? <span className="live-activity-empty">{visualPreview ? 'Live activity is not connected in this visual preview' : 'Public activity is temporarily unavailable'}</span>
            : activities.isLoading
            ? <span className="live-activity-empty">Loading verified activity…</span>
            : items.length
              ? renderTrack(items)
              : <span className="live-activity-empty"><CircleDollarSign className="h-3.5 w-3.5" />No public activity yet</span>}
        </div>
      </div>
      {selectedUser && createPortal(
        <div id="live-activity-detail" className="live-activity-detail live-activity-detail-portal" role="region" aria-label="User activity details">
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
                {selectedItems.filter((item) => item.type === 'offer_complete' || item.type === 'reward').slice(0, 6).map((item) => (
                  <div key={item.id} className="live-detail-card">
                    <div className="flex min-w-0 items-start gap-2"><Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-emerald-300">Offer completed</p><p className="mt-1 break-words text-xs font-semibold text-foreground">{shortOfferName(item)}</p><p className="mt-1 text-[10px] text-muted-foreground">Offer wall: <strong className="text-foreground">{providerName(item)}</strong> · {timeLabel(item.createdAt)}</p></div></div><strong className="shrink-0 text-xs text-emerald-300">+{formatAmount(item.amount) || '—'}</strong>
                  </div>
                ))}
                {selectedItems.filter((item) => item.type === 'withdrawal').slice(0, 6).map((item) => (
                  <div key={item.id} className="live-detail-card live-detail-card-withdrawal">
                    <div className="flex min-w-0 items-start gap-2"><ArrowDownToLine className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" /><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-amber-300">Withdrawal</p><p className="mt-1 text-xs font-semibold text-foreground">{withdrawalMethod(item)}</p><p className="mt-1 text-[10px] text-muted-foreground">{timeLabel(item.createdAt)}</p></div></div><strong className="shrink-0 text-xs text-amber-300">-{formatAmount(item.amount) || '—'}</strong>
                  </div>
                ))}
                {!selectedItems.some((item) => item.type === 'offer_complete' || item.type === 'reward' || item.type === 'withdrawal') && <p className="text-xs text-muted-foreground">No completed offer or withdrawal activity recorded.</p>}
              </div>
            </div>
            <button type="button" onClick={closeActivityDetails} className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close activity details"><X className="h-4 w-4" /></button>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
