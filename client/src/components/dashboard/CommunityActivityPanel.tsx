import { Activity, ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { UserAvatar } from '@/components/AvatarSystem';

function maskUsername(value: unknown) {
  const username = String(value || 'member').trim();
  if (username.length <= 3) return `${username.slice(0, 1)}***`;
  if (username.length <= 6) return `${username.slice(0, 2)}***`;
  return `${username.slice(0, 3)}***${username.slice(-2)}`;
}

function amountLabel(value: unknown, type: unknown) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  return `${type === 'withdrawal' ? '−' : '+'}$${amount.toFixed(2)}`;
}

function activityLabel(item: any) {
  if (item.type === 'withdrawal') return 'Withdrawal';
  if (item.type === 'daily_claim') return 'Daily bonus';
  if (item.type === 'referral') return 'Referral reward';
  if (item.type === 'offer_complete' || item.type === 'reward') return 'Offer reward';
  return 'Account activity';
}

function timeLabel(value: unknown) {
  if (!value) return 'Recently';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? 'Recently'
    : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function CommunityActivityPanel() {
  const { user } = useAuth();
  const visualPreview = import.meta.env.DEV && import.meta.env.VITE_VISUAL_PREVIEW === 'true';
  const query = trpc.user.getActivities.useQuery(undefined, {
    staleTime: 15_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const currentUserId = String(user?.id ?? user?.userId ?? '');
  const currentUsername = String(user?.username ?? '').toLowerCase();
  const items = (query.data ?? []).filter((item: any) => {
    const itemUserId = String(item.userId ?? '');
    const itemUsername = String(item.username ?? '').toLowerCase();
    return (!currentUserId || itemUserId !== currentUserId) && (!currentUsername || itemUsername !== currentUsername);
  }).slice(0, 5) as any[];

  return (
    <section className="rv-community-activity" aria-label="Recent public activity">
      <header className="rv-community-heading">
        <div>
          <p className="rv-eyebrow"><span className="section-dot" /> COMMUNITY FEED</p>
          <h2>Recent activity</h2>
          <p>Public rewards activity, with member names masked.</p>
        </div>
        <Link to="/history" className="rv-community-link">All activity <ArrowUpRight aria-hidden="true" /></Link>
      </header>

      {query.isLoading && !query.data ? (
        <div className="rv-community-list" aria-label="Loading public activity">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="rv-community-skeleton" aria-hidden="true"><i /><span /><b /></div>)}
        </div>
      ) : query.isError && !query.data ? (
        <div className="rv-community-empty" role="status">
          <Activity aria-hidden="true" />
          <strong>{visualPreview ? 'Live activity is not connected in this preview.' : 'Public activity is temporarily unavailable.'}</strong>
          <span>No activity rows are shown until the public feed responds.</span>
        </div>
      ) : items.length ? (
        <div className="rv-community-list">
          {items.map((item: any, index: number) => {
            const isWithdrawal = item.type === 'withdrawal';
            return (
              <article className="rv-community-row" key={`${item.id || index}`}>
                <span className={`rv-community-avatar ${isWithdrawal ? 'is-withdrawal' : ''}`} aria-hidden="true"><UserAvatar userId={item.userId} avatarId={item.avatarId} /></span>
                <span className="rv-community-copy">
                  <strong>{maskUsername(item.username)} <i>{activityLabel(item)}</i></strong>
                  <small>Public feed <span>·</span> {timeLabel(item.createdAt)}</small>
                </span>
                <span className={`rv-community-amount ${isWithdrawal ? 'is-withdrawal' : ''}`}>
                  {isWithdrawal ? <ArrowDownToLine aria-hidden="true" /> : <Activity aria-hidden="true" />}
                  {amountLabel(item.amount, item.type)}
                </span>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rv-community-empty" role="status">
          <Activity aria-hidden="true" />
          <strong>No public activity records are available.</strong>
          <span>The panel will populate from verified activity when records are present.</span>
        </div>
      )}
      <p className="rv-community-source"><span aria-hidden="true" /> Public activity only · member names are masked</p>
    </section>
  );
}
