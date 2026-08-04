import { supabase } from '@/db/supabase';

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

export async function fetchUserTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}
