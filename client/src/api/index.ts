import { supabase } from '@/db/supabase';
import { apiUrl } from '@/lib/apiBase';

export async function fetchPlatformStats() {
  const { count: usersCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
  const { count: offersCount } = await supabase.from('offers').select('id', { count: 'exact', head: true });
  
  const uCount = usersCount || 0;
  const oCount = offersCount || 0;

  return {
    totalPaidOut: 2847392 + uCount * 15,
    activeUsers: uCount + 148203,
    offersAvailable: oCount,
    avgDailyEarn: 12.48
  };
}

export async function fetchOfferwalls() {
  const { data, error } = await supabase.from('offerwalls').select('*').eq('is_active', true);
  if (error) throw error;
  return data;
}

export async function fetchFeaturedOffers() {
  const { data, error } = await supabase
    .from('offers')
    .select('*, offerwall:offerwalls(*)')
    .eq('is_active', true)
    .order('reward', { ascending: false })
    .limit(5);
  if (error) throw error;
  return data;
}

export async function fetchLatestWithdrawals() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, user:profiles(username, avatar_url)')
    .eq('type', 'withdrawal')
    .order('created_at', { ascending: false })
    .limit(5);
  return data || [];
}

export async function fetchLiveActivity() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, user:profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(5);
  return data || [];
}

export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, lifetime_earnings, completed_offers, xp, level')
    .order('lifetime_earnings', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

async function fetchTrpc<T>(path: string): Promise<T> {
  const input = encodeURIComponent(JSON.stringify({ json: null }));
  const response = await fetch(apiUrl(`/api/trpc/${path}?input=${input}`), { credentials: 'include' });
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error(payload.error?.json?.message || 'Request failed');
  return (payload.result?.data?.json ?? payload.result?.data) as T;
}

export async function fetchUserTransactions(_userId: string | number) {
  const history = await fetchTrpc<{ earnings: Array<{ id: number; amount: string; type: string; source?: string | null; createdAt: string | Date }>; withdrawals: Array<{ id: number; amount: string; status: string; createdAt: string | Date; cryptoType?: string | null }> }>('history.getAllHistory');
  const earnings = (history.earnings || []).map(item => ({
    id: `earning-${item.id}`,
    type: item.type === 'referral' || item.type === 'daily_bonus' ? 'bonus' : 'deposit',
    status: 'completed',
    amount: Number(item.amount || 0),
    description: item.source || item.type,
    created_at: item.createdAt,
  }));
  const withdrawals = (history.withdrawals || []).map(item => ({
    id: `withdrawal-${item.id}`,
    type: 'withdrawal',
    status: item.status,
    amount: Number(item.amount || 0),
    description: `Withdrawal via ${item.cryptoType || 'wallet'}`,
    created_at: item.createdAt,
  }));
  return [...earnings, ...withdrawals].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}
