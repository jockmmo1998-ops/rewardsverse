import * as crypto from "crypto";

export const TIMEWALL_ALLOWED_IPS = new Set([
  "18.156.132.55",
  "51.81.120.73",
  "142.111.248.18",
]);

export type TimewallPlacement = {
  placementId: string;
  pointsPerUsd: number;
};

export function verifyTimewallHash(
  userId: string,
  revenue: string,
  providedHash: string,
  secret: string,
): boolean {
  if (!userId || revenue === "" || !providedHash || !secret) return false;
  const expected = crypto
    .createHash("sha256")
    .update(`${userId}${revenue}${secret}`, "utf8")
    .digest("hex");
  const actual = providedHash.trim().toLowerCase();
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected.toLowerCase(), "utf8"),
    Buffer.from(actual, "utf8"),
  );
}

export function resolveTimewallPlacement(env: NodeJS.ProcessEnv = process.env): TimewallPlacement | null {
  const placementId = env.TIMEWALL_PLACEMENT_ID?.trim() || "";
  const rawRate = env.TIMEWALL_POINTS_PER_USD?.trim() || "";
  const pointsPerUsd = Number(rawRate);
  if (!placementId || !rawRate || !Number.isFinite(pointsPerUsd) || pointsPerUsd <= 0) return null;
  return { placementId, pointsPerUsd };
}

export function isTimewallIpAllowed(ip: string): boolean {
  return TIMEWALL_ALLOWED_IPS.has(ip.trim());
}

export function calculateTimewallCredit(revenue: string, placement: TimewallPlacement): {
  revenueUsd: number;
  pointsEarned: number;
  creditUsd: number;
} | null {
  if (!/^\d+(?:\.\d+)?$/.test(revenue)) return null;
  const revenueUsd = Number(revenue);
  if (!Number.isFinite(revenueUsd) || revenueUsd <= 0) return null;
  const pointsEarned = revenueUsd * placement.pointsPerUsd;
  // RewardsVerse balances are USD-denominated. Converting the placement points
  // back by the same active rate credits the exact provider payout in USD.
  return { revenueUsd, pointsEarned, creditUsd: pointsEarned / placement.pointsPerUsd };
}

export function isTimewallChargeback(type: string): boolean {
  return new Set(["chargeback", "debit", "reversal", "reverse", "refund", "refunded"]).has(type.trim().toLowerCase());
}

export function isTimewallCredit(type: string): boolean {
  return type.trim() === "" || new Set(["credit", "approved", "complete", "completed", "1", "success"]).has(type.trim().toLowerCase());
}

export function validateTimewallCallback(input: {
  userId: string;
  transactionId: string;
  revenue: string;
  hash: string;
  type?: string;
  sourceIp: string;
  secret: string;
  placement: TimewallPlacement | null;
  knownUserIds: Set<string>;
  seenTransactionIds?: Set<string>;
}): { ok: true; creditUsd: number; pointsEarned: number } | { ok: false; reason: string } {
  if (!input.userId) return { ok: false, reason: "missing_user" };
  if (!input.knownUserIds.has(input.userId)) return { ok: false, reason: "unknown_user" };
  if (!input.transactionId) return { ok: false, reason: "missing_transaction" };
  if (input.seenTransactionIds?.has(input.transactionId)) return { ok: false, reason: "duplicate" };
  if (!input.placement) return { ok: false, reason: "missing_placement" };
  if (!isTimewallIpAllowed(input.sourceIp)) return { ok: false, reason: "ip_not_allowed" };
  if (!verifyTimewallHash(input.userId, input.revenue, input.hash, input.secret)) return { ok: false, reason: "invalid_hash" };
  if (!isTimewallCredit(input.type || "") && !isTimewallChargeback(input.type || "")) return { ok: false, reason: "invalid_type" };
  const conversion = calculateTimewallCredit(input.revenue, input.placement);
  if (!conversion) return { ok: false, reason: "invalid_revenue" };
  return { ok: true, creditUsd: conversion.creditUsd, pointsEarned: conversion.pointsEarned };
}
