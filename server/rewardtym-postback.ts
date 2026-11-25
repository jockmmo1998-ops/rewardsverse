import { createHmac, timingSafeEqual } from "node:crypto";

export type RewardTymDisposition = "credit" | "reverse" | "ignore";

export type RewardTymPayloadFields = {
  userId: string;
  payoutAmount: string;
  conversionId: string;
  status: string;
  eventName: string;
  campaignId: string;
  campaignName: string;
};

function scalarText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return String(value);
  return "";
}

/** Parse only RewardTym's documented user payout field; never use publisher_payout_usd. */
export function parseRewardTymPayload(payload: Record<string, unknown>): RewardTymPayloadFields {
  return {
    userId: scalarText(payload.user_id),
    payoutAmount: scalarText(payload.payout_amount),
    conversionId: scalarText(payload.conversion_id),
    status: scalarText(payload.status).toLowerCase(),
    eventName: scalarText(payload.event_name),
    campaignId: scalarText(payload.lt_campaign_id),
    campaignName: scalarText(payload.campaign_name),
  };
}

export function getRewardTymDisposition(status: string): RewardTymDisposition {
  const normalized = status.trim().toLowerCase();
  if (normalized === "approved") return "credit";
  if (normalized === "reversed") return "reverse";
  return "ignore";
}

export function getRewardTymEventKey(conversionId: string, reversed: boolean): string {
  return reversed ? `${conversionId}:chargeback` : conversionId;
}

export function isValidRewardTymPayout(rawAmount: string): boolean {
  if (!rawAmount.trim()) return false;
  const amount = Number(rawAmount);
  return Number.isFinite(amount) && amount >= 0;
}

/** Verify the provider's sorted-key canonical JSON HMAC-SHA256 signature. */
export function verifyRewardTymSignature(secret: string, payload: unknown): boolean {
  if (!secret || !payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  const signature = typeof record.signature === "string" ? record.signature.trim() : "";
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;

  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).filter((key) => key !== "signature" && record[key] !== null && record[key] !== undefined).sort()) {
    sorted[key] = record[key];
  }
  const expected = createHmac("sha256", secret)
    .update(JSON.stringify(sorted), "utf8")
    .digest();
  const provided = Buffer.from(signature, "hex");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

/** A RewardTym reversal must match its prior approved ledger row exactly. */
export function isRewardTymReversalValid(
  original: { userId: number | string; amount: number | string; status: string } | null | undefined,
  userId: number,
  amount: number,
): boolean {
  if (!original || String(original.status).trim().toLowerCase() !== "completed") return false;
  if (Number(original.userId) !== userId) return false;
  const originalAmount = Number(original.amount);
  if (!Number.isFinite(originalAmount) || !Number.isFinite(amount)) return false;
  return Math.round((originalAmount + Number.EPSILON) * 100)
    === Math.round((Math.abs(amount) + Number.EPSILON) * 100);
}
