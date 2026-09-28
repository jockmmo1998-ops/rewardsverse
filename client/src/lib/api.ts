import type { LeaderboardEntry, LiveActivity } from '@/types/types';
import { apiUrl } from '@/lib/apiBase';

type TrpcEnvelope<T> = { result?: { data?: { json?: T; [key: string]: unknown } } };

async function query<T>(path: string, input?: unknown): Promise<T> {
  const encoded = encodeURIComponent(JSON.stringify({ json: input ?? null }));
  const response = await fetch(apiUrl(`/api/trpc/${path}?input=${encoded}`), { credentials: 'include' });
  const payload = (await response.json()) as TrpcEnvelope<T> & { error?: { json?: { message?: string } } };
  if (!response.ok || payload.error) throw new Error(payload.error?.json?.message || 'Request failed');
  const data = payload.result?.data;
  if (data && typeof data === 'object' && 'json' in data) return data.json as T;
  return data as T;
}

export async function getLiveActivity(limit = 40): Promise<LiveActivity[]> {
  const rows = await query<Array<{ id: number; username: string; type: string; description: string; amount?: string | number | null }>>('user.getActivities');
  return rows.slice(0, limit).map(row => ({
    id: row.id,
    username: row.username,
    type: row.type === 'withdrawal' ? 'withdrawal' : 'completion',
    amount: Number(row.amount || 0),
    label: row.description,
  }));
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const rows = await query<Array<{ id: number; username: string; totalEarned?: string | number | null }>>('user.getLeaderboard');
  return rows.map(row => ({ id: row.id, username: row.username, total_earned: Number(row.totalEarned || 0) }));
}
