import * as crypto from "crypto";

type ClickwallParams = Record<string, unknown>;

function pick(params: ClickwallParams, field: string): string {
  const value = params[field];
  const candidates = Array.isArray(value) ? [...value].reverse() : [value];
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    const normalized = String(candidate).trim();
    if (normalized === "" || /^[\[{].*[\]}]$/.test(normalized)) continue;
    return normalized;
  }
  return "";
}

function pickSignedNumeric(params: ClickwallParams, field: string): string {
  const value = params[field];
  const candidates = Array.isArray(value) ? [...value].reverse() : [value];
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    const normalized = String(candidate).trim();
    if (normalized === "" || /^[\[{]/.test(normalized)) continue;
    if (Number.isFinite(Number(normalized))) return normalized;
  }
  return "";
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

/** Clickwall's signed payload uses the documented fields in a strict order. */
export function verifyClickwallSignature(secret: string, params: ClickwallParams): boolean {
  const userId = pick(params, "user_id");
  const offerId = pick(params, "offer_id");
  const amount = pick(params, "amount");
  const transactionId = pick(params, "txid");
  const provided = pick(params, "sig").toLowerCase();
  if (!secret || !userId || !offerId || amount === "" || !transactionId || !provided) return false;

  const payload = `user_id=${userId}&oid=${offerId}&amount=${amount}&tx_id=${transactionId}`;
  const expected = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  return constantTimeEqual(expected, provided);
}

/** RewardsVerse wallets are in USD, so Clickwall's virtual-currency amount is not credited as dollars. */
export function selectClickwallPayout(params: ClickwallParams): string {
  return pickSignedNumeric(params, "payout");
}
