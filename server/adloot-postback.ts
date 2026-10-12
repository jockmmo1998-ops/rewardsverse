// 3.22.177.178 is the documented AdLoot callback IP. 162.0.225.34 was
// observed in the user's verified AdLoot test and is enabled only because
// the operator explicitly approved it for this deployment.
export const ADLOOT_DEFAULT_IPS = "3.22.177.178,162.0.225.34";

export function adlootAllowedIps(configured: string | undefined): Set<string> {
  return new Set((configured || ADLOOT_DEFAULT_IPS).split(",").map((value) => value.trim()).filter(Boolean));
}

export function isAdlootIpAllowed(remoteIp: string, configured: string | undefined = process.env.ADLOOT_POSTBACK_ALLOWED_IPS): boolean {
  const normalized = remoteIp.replace(/^::ffff:/i, "").trim();
  return adlootAllowedIps(configured).has(normalized);
}

/**
 * Cloudflare headers are accepted only when they mutually agree. The request
 * still must have arrived through the expected proxy path (cf-ray + cdn-loop).
 * The query-string `ip` parameter is never used here.
 */
export function trustedCloudflareClientIp(headers: Record<string, string | undefined>): string | null {
  const cfRay = (headers["cf-ray"] || "").trim();
  const cdnLoop = (headers["cdn-loop"] || "").toLowerCase();
  const connectingIp = (headers["cf-connecting-ip"] || "").trim();
  const trueClientIp = (headers["true-client-ip"] || "").trim();
  const firstForwardedIp = (headers["x-forwarded-for"] || "").split(",")[0]?.trim() || "";
  const hasCloudflareLoop = cdnLoop.split(",").some((value) => value.trim().startsWith("cloudflare"));
  if (!cfRay || !hasCloudflareLoop) return null;
  if (!connectingIp || connectingIp !== trueClientIp || connectingIp !== firstForwardedIp) return null;
  return connectingIp;
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
