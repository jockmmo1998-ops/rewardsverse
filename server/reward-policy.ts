export type RewardUnit = "usd" | "points";

export type ProviderRewardPolicy = {
  unit: RewardUnit;
  pointsPerUsd: number;
  userShare: number;
  pendingThresholdUsd: number;
};

const DEFAULT_POLICY: ProviderRewardPolicy = {
  unit: "usd",
  pointsPerUsd: 1,
  userShare: 0.5,
  pendingThresholdUsd: 4000,
};

const POLICIES: Record<string, ProviderRewardPolicy> = {
  adloot: { ...DEFAULT_POLICY, userShare: 0.4 },
  admaxflow: { unit: "points", pointsPerUsd: 400, userShare: 0.4, pendingThresholdUsd: 10 },
  gaintwall: { ...DEFAULT_POLICY, userShare: 0.4 },
  gleamads: { unit: "points", pointsPerUsd: 1000, userShare: 0.5, pendingThresholdUsd: 4 },
  // Clickwall payout is already USD; the configured 500 coins/$1 is not the wallet unit.
  clickwall: { ...DEFAULT_POLICY, userShare: 0.5 },
  offerwallme: { unit: "points", pointsPerUsd: 1000, userShare: 1, pendingThresholdUsd: 4 },
  radientwall: { unit: "points", pointsPerUsd: 400, userShare: 1, pendingThresholdUsd: 10 },
  mooffers: { unit: "usd", pointsPerUsd: 1000, userShare: 0.4, pendingThresholdUsd: 10 },
  wannads: { unit: "usd", pointsPerUsd: 1000, userShare: 0.4, pendingThresholdUsd: 10 },
};

export function getRewardPolicy(provider: string): ProviderRewardPolicy {
  return POLICIES[provider] ?? DEFAULT_POLICY;
}

export function grossUsdFromProviderAmount(provider: string, amount: number): number {
  const policy = getRewardPolicy(provider);
  return policy.unit === "points" ? amount / policy.pointsPerUsd : amount;
}

export function userRewardUsd(provider: string, amount: number): number {
  return grossUsdFromProviderAmount(provider, amount) * getRewardPolicy(provider).userShare;
}

export function requiresManualReview(provider: string, amount: number): boolean {
  return grossUsdFromProviderAmount(provider, amount) > getRewardPolicy(provider).pendingThresholdUsd;
}
