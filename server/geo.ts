import type { Request } from "express";

const COUNTRY_CODE_RE = /^[A-Z]{2}$/;

function normalizeCountryCode(value: unknown): string | null {
  const code = String(value ?? "").trim().toUpperCase();
  return COUNTRY_CODE_RE.test(code) ? code : null;
}

function clientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const candidate = String(raw || req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || "")
    .split(",")[0]
    .trim();
  if (!candidate || candidate === "::1" || candidate === "127.0.0.1") return null;
  return candidate;
}

/**
 * Resolve only the ISO country code for a signup. Prefer provider geo headers;
 * otherwise use a short, bounded lookup. The raw address is never persisted.
 */
export async function detectSignupCountry(req: Request): Promise<string | null> {
  const headerCode = normalizeCountryCode(
    req.headers["cf-ipcountry"] ||
    req.headers["x-vercel-ip-country"] ||
    req.headers["x-country-code"]
  );
  if (headerCode && headerCode !== "XX") return headerCode;

  const ip = clientIp(req);
  if (!ip) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      signal: controller.signal,
      headers: { Accept: "text/plain" },
    });
    if (!response.ok) return null;
    return normalizeCountryCode(await response.text());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
