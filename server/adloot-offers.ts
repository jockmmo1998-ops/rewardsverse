import type { FeaturedOffer } from "./revtoo-offers";

const ADLOOT_OFFERS_ENDPOINT = "https://api.adloot.com/api/v2/offers/get";
const CACHE_TTL_MS = 60_000;

type AdLootOffer = {
  id?: string | number;
  offer_id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  payout?: number | string;
  reward?: number | string;
  image?: string;
  icon?: string;
  url?: string;
  click_url?: string;
  category?: string;
};

type AdLootResponse = {
  success?: boolean;
  offers?: AdLootOffer[];
  data?: { offers?: AdLootOffer[] } | AdLootOffer[];
  message?: string;
};

const cache = new Map<string, { expiresAt: number; offers: FeaturedOffer[] }>();
const inFlightRequests = new Map<string, Promise<FeaturedOffer[]>>();

function normalizeOffer(offer: AdLootOffer, userId: string, placementId: string): FeaturedOffer | null {
  const rawId = offer.id ?? offer.offer_id;
  const id = rawId === undefined || rawId === null ? "" : String(rawId).trim();
  const offerName = String(offer.name ?? offer.title ?? "").trim();
  if (!id || !offerName) return null;

  const rawClickUrl = String(offer.click_url ?? offer.url ?? "").trim();
  const clickUrl = /^https?:\/\//i.test(rawClickUrl)
    ? rawClickUrl
    : `https://adloot.io/wall/${encodeURIComponent(id)}?placementId=${encodeURIComponent(placementId)}&user=${encodeURIComponent(userId)}`;
  const reward = offer.reward ?? offer.payout;

  return {
    id,
    provider: "AdLoot",
    offerName,
    description: typeof offer.description === "string" ? offer.description.trim() || undefined : undefined,
    reward,
    payout: offer.payout,
    imageUrl: String(offer.image ?? offer.icon ?? "").trim() || undefined,
    category: typeof offer.category === "string" ? offer.category.trim() || undefined : undefined,
    clickUrl,
    featured: true,
  };
}

export async function getAdLootFeaturedOffers(userId: string, limit: number): Promise<FeaturedOffer[]> {
  const normalizedUserId = userId.trim();
  const apiKey = process.env.ADLOOT_API_KEY?.trim() || process.env.ADLOOT_PLACEMENT_ID?.trim();
  if (!normalizedUserId || !apiKey) return [];

  const cacheKey = `${apiKey}:${normalizedUserId}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.offers.slice(0, limit);

  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) return (await inFlight).slice(0, limit);

  const request = fetchAdLootOffers(normalizedUserId, apiKey, limit);
  inFlightRequests.set(cacheKey, request);
  try {
    return (await request).slice(0, limit);
  } finally {
    if (inFlightRequests.get(cacheKey) === request) inFlightRequests.delete(cacheKey);
  }
}

async function fetchAdLootOffers(userId: string, apiKey: string, limit: number): Promise<FeaturedOffer[]> {
  try {
    const response = await fetch(ADLOOT_OFFERS_ENDPOINT, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, user_id: userId, device: "desktop" }),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = await response.json() as AdLootResponse;
    if (!response.ok || payload.success === false) {
      console.warn(`[FeaturedOffers] provider=AdLoot request=failed httpStatus=${response.status} message=${payload.message || response.statusText}`);
      return [];
    }
    const nestedOffers = Array.isArray(payload.data) ? payload.data : payload.data?.offers;
    const sourceOffers = Array.isArray(payload.offers) ? payload.offers : nestedOffers || [];
    const offers = sourceOffers
      .map((offer) => normalizeOffer(offer, userId, apiKey))
      .filter((offer): offer is FeaturedOffer => Boolean(offer))
      .slice(0, Math.max(1, Math.min(limit, 100)));
    cache.set(`${apiKey}:${userId}`, { expiresAt: Date.now() + CACHE_TTL_MS, offers });
    console.log(`[FeaturedOffers] provider=AdLoot request=successful offersReturned=${offers.length}`);
    return offers;
  } catch (error) {
    console.warn(`[FeaturedOffers] provider=AdLoot request=failed: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
