export const ADLOOT_OFFICIAL_IP = "3.22.177.178";

export function adlootAllowedIps(configured: string | undefined): Set<string> {
  return new Set((configured || ADLOOT_OFFICIAL_IP).split(",").map((value) => value.trim()).filter(Boolean));
}

export function isAdlootIpAllowed(remoteIp: string, configured: string | undefined = process.env.ADLOOT_POSTBACK_ALLOWED_IPS): boolean {
  const normalized = remoteIp.replace(/^::ffff:/i, "").trim();
  return adlootAllowedIps(configured).has(normalized);
}

export function parseAdlootAmount(params: Record<string, string>): number | null {
  for (const field of ["payout", "reward"]) {
    const value = Number(params[field]);
    if (params[field] !== undefined && params[field] !== "" && Number.isFinite(value) && value >= 0) return value;
  }
  return null;
}

export function isAdlootCompletedStatus(status: string): boolean {
  return ["credited", "approved", "approve", "complete", "completed", "success", "succeeded", "confirmed", "confirm", "1", "true", "ok"].includes(status.trim().toLowerCase());
}

export function isAdlootChargebackStatus(status: string): boolean {
  return ["rejected", "cancelled", "canceled", "reversed", "reverse", "chargeback", "refund", "refunded", "debit"].includes(status.trim().toLowerCase());
}
