export type LiveActivity = {
  id: number;
  username: string;
  type: 'completion' | 'withdrawal';
  amount: number;
  label: string;
};

export type LeaderboardEntry = {
  id: number;
  username: string;
  total_earned: number;
};
