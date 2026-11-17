import { createHmac, timingSafeEqual } from "node:crypto";

function getParam(params: Record<string, unknown>, fields: string[]): string {
  for (const field of fields) {
    const raw = params[field];
    const candidates = Array.isArray(raw) ? [...raw].reverse() : [raw];
    for (const candidate of candidates) {
      if (candidate === undefined || candidate === null) continue;
      const value = String(candidate).trim();
      if (value !== "" && !/^[\[{].*[\]}]$/.test(value)) return value;
    }
  }
  return "";
}

/**
 * PrismAds signs the integer/truncated `value`, even if a callback happens to
 * serialize it with a fractional suffix. Use the same canonical form both for
 * signature verification and for USD conversion.
 */
export function normalizePrismadsValue(rawValue: unknown): string {
  if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") return "";
  const parsed = Number(String(rawValue).trim());
  return Number.isFinite(parsed) ? String(Math.trunc(parsed)) : "";
}

/** Verify HMAC-SHA256(secret, `${user_id}.${truncated value}.${txid}`). */
export function verifyPrismadsSignature(secret: string, params: Record<string, unknown>): boolean {
  const userId = getParam(params, ["user_id"]);
  const value = normalizePrismadsValue(params.value);
  const transactionId = getParam(params, ["txid", "token"]);
  const signature = getParam(params, ["signature"]).toLowerCase();
  if (!secret || !userId || value === "" || !transactionId || !/^[a-f0-9]{64}$/.test(signature)) return false;

  const expected = createHmac("sha256", secret)
    .update(`${userId}.${value}.${transactionId}`, "utf8")
    .digest();
  const provided = Buffer.from(signature, "hex");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
