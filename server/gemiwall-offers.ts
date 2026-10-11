const GEMIWALL_OFFERS_ENDPOINT = "https://api.gemiwall.com/api/offers/static";
const CACHE_TTL_MS = 60_000;

import type { FeaturedOffer } from "./revtoo-offers";

type GemiWallEvent = {
  action?: Record<string, string>;
  payout?: number | string;
};

type GemiWallOffer = {
  id?: string | number;
  name?: string;
  description?: Record<string, string>;
  payout?: number | string;
  events?: GemiWallEvent[];
  icon?: string | null;
  banner?: string | null;
  category?: string;
  url?: string;
};

type GemiWallResponse = {
  success?: boolean;
  offers?: GemiWallOffer[];
  message?: string;
};

const cache = new Map<string, { expiresAt: number; offers: FeaturedOffer[] }>();
const inFlightRequests = new Map<string, Promise<FeaturedOffer[]>>();

function localizedText(value: Record<string, string> | undefined): string | undefined {
  if (!value) return undefined;
  const text = value.en || Object.values(value).find(Boolean);
  return typeof text === "string" && text.trim() ? text.trim() : undefined;
}

function normalizeOffer(offer: GemiWallOffer, userId: string): FeaturedOffer | null {
  const id = offer.id === undefined || offer.id === null ? "" : String(offer.id).trim();
  const offerName = typeof offer.name === "string" ? offer.name.trim() : "";
  const rawUrl = typeof offer.url === "string" ? offer.url.trim() : "";
  if (!id || !offerName || !rawUrl) return null;

  const clickUrl = rawUrl.replaceAll("[USER_ID]", encodeURIComponent(userId));
  if (!/^https?:\/\//i.test(clickUrl)) return null;

  return {
    id,
    provider: "GemiWall",
    offerName,
    description: localizedText(offer.description),
    reward: offer.payout,
    payout: offer.payout,
    imageUrl: (offer.icon || offer.banner || undefined) || undefined,
    category: typeof offer.category === "string" && offer.category.trim() ? offer.category.trim() : undefined,
    clickUrl,
    featured: true,
  };
}

export async function getGemiWallFeaturedOffers(userId: string, limit: number): Promise<FeaturedOffer[]> {
  const normalizedUserId = userId.trim();
  const placementId = process.env.GEMIWALL_PLACEMENT_ID?.trim();
  // The current GemiAd publisher UI exposes one Account Information > Secret
  // Key and does not show a separate API key. Allow an explicit API key when
  // available, otherwise use that same secret key for the documented apiKey
  // query parameter.
  const apiKey = process.env.GEMIWALL_API_KEY?.trim() || process.env.GEMIWALL_POSTBACK_SECRET?.trim();
  if (!normalizedUserId || !placementId || !apiKey) {
    console.warn("[FeaturedOffers] provider=GemiWall skipped: GEMIWALL_PLACEMENT_ID or GEMIWALL_API_KEY is missing");
    return [];
  }

  const cacheKey = `${placementId}:${normalizedUserId}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.offers.slice(0, limit);

  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) return (await inFlight).slice(0, limit);

  const request = fetchGemiWallOffers(normalizedUserId, placementId, apiKey, limit);
  inFlightRequests.set(cacheKey, request);
  try {
    return (await request).slice(0, limit);
  } finally {
    if (inFlightRequests.get(cacheKey) === request) inFlightRequests.delete(cacheKey);
  }
}

async function fetchGemiWallOffers(userId: string, placementId: string, apiKey: string, limit: number): Promise<FeaturedOffer[]> {
  const url = new URL(GEMIWALL_OFFERS_ENDPOINT);
  url.searchParams.set("placementId", placementId);
  url.searchParams.set("apiKey", apiKey);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.warn(`[FeaturedOffers] provider=GemiWall request=failed: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }

  let payload: GemiWallResponse;
  try {
    payload = await response.json() as GemiWallResponse;
  } catch {
    console.warn(`[FeaturedOffers] provider=GemiWall request=invalid-json httpStatus=${response.status}`);
    return [];
  }

  if (!response.ok || payload.success === false) {
    console.warn(`[FeaturedOffers] provider=GemiWall request=failed httpStatus=${response.status} message=${payload.message || response.statusText}`);
    return [];
  }

  const offers = (Array.isArray(payload.offers) ? payload.offers : [])
    .map((offer) => normalizeOffer(offer, userId))
    .filter((offer): offer is FeaturedOffer => Boolean(offer))
    .slice(0, Math.max(1, Math.min(limit, 100)));

  cache.set(`${placementId}:${userId}`, { expiresAt: Date.now() + CACHE_TTL_MS, offers });
  console.log(`[FeaturedOffers] provider=GemiWall request=successful offersReturned=${offers.length}`);
  return offers;
}
