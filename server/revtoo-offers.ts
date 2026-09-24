const REVTOO_OFFERS_ENDPOINT = "https://revtoo.com/api/offers/";
const CACHE_TTL_MS = 60_000;

type RevtooOffer = {
  id?: number | string;
  featured?: boolean;
  title?: string;
  description?: string;
  payout?: number | string;
  reward?: number | string;
  url?: string;
  image?: string;
  category?: string;
};

type RevtooResponse = {
  success?: boolean;
  status?: number;
  message?: string;
  offers?: RevtooOffer[];
};

export type FeaturedOffer = {
  id: string;
  provider: "Revtoo";
  offerName: string;
  description?: string;
  reward?: number | string;
  payout?: number | string;
  imageUrl?: string;
  category?: string;
  clickUrl: string;
  featured?: boolean;
};

type CacheEntry = {
  expiresAt: number;
  offers: FeaturedOffer[];
};

const cache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<FeaturedOffer[]>>();

export class RevtooOffersError extends Error {
  readonly httpStatus?: number;
  readonly providerCode?: number | string;

  constructor(message: string, options: { httpStatus?: number; providerCode?: number | string } = {}) {
    super(message);
    this.name = "RevtooOffersError";
    this.httpStatus = options.httpStatus;
    this.providerCode = options.providerCode;
  }
}

function normalizeOffer(offer: RevtooOffer): FeaturedOffer | null {
  const id = offer.id === undefined || offer.id === null ? "" : String(offer.id);
  const offerName = typeof offer.title === "string" ? offer.title.trim() : "";
  const clickUrl = typeof offer.url === "string" ? offer.url.trim() : "";
  if (!id || !offerName || !clickUrl) return null;

  const description = typeof offer.description === "string" && offer.description.trim()
    ? offer.description.trim()
    : undefined;
  const imageUrl = typeof offer.image === "string" && offer.image.trim()
    ? offer.image.trim()
    : undefined;
  const category = typeof offer.category === "string" && offer.category.trim()
    ? offer.category.trim()
    : undefined;

  return {
    id,
    provider: "Revtoo",
    offerName,
    description,
    reward: offer.reward ?? offer.payout,
    payout: offer.payout,
    imageUrl,
    category,
    clickUrl,
    featured: offer.featured,
  };
}

function orderFeaturedOffers(offers: FeaturedOffer[]): FeaturedOffer[] {
  return offers
    .map((offer, index) => ({ offer, index }))
    .sort((left, right) => Number(Boolean(right.offer.featured)) - Number(Boolean(left.offer.featured)) || left.index - right.index)
    .map(({ offer }) => offer);
}

export async function getRevtooFeaturedOffers(userId: string, limit = 24): Promise<FeaturedOffer[]> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    throw new RevtooOffersError("Revtoo user_id is missing for the current user.");
  }

  const apiKey = process.env.REVTOO_API_KEY?.trim();
  if (!apiKey) {
    throw new RevtooOffersError("Revtoo Offers API is not configured: REVTOO_API_KEY is missing.");
  }

  const cached = cache.get(normalizedUserId);
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[FeaturedOffers] provider=Revtoo cache=hit offersReturned=${cached.offers.length}`);
    return cached.offers;
  }

  const inFlight = inFlightRequests.get(normalizedUserId);
  if (inFlight) {
    console.log("[FeaturedOffers] provider=Revtoo request=coalesced");
    return inFlight;
  }

  const request = fetchRevtooFeaturedOffers(normalizedUserId, limit, apiKey);
  inFlightRequests.set(normalizedUserId, request);
  try {
    return await request;
  } finally {
    if (inFlightRequests.get(normalizedUserId) === request) {
      inFlightRequests.delete(normalizedUserId);
    }
  }
}

async function fetchRevtooFeaturedOffers(userId: string, limit: number, apiKey: string): Promise<FeaturedOffer[]> {
  const startedAt = Date.now();
  const url = new URL(REVTOO_OFFERS_ENDPOINT);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("user_id", userId);
  url.searchParams.set("limit", String(Math.max(1, Math.min(limit, 100))));
  url.searchParams.set("page", "1");

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.warn(`[FeaturedOffers] provider=Revtoo request=failed durationMs=${Date.now() - startedAt}`);
    throw new RevtooOffersError(`Revtoo Offers API network error: ${error instanceof Error ? error.message : String(error)}`);
  }

  let payload: RevtooResponse;
  try {
    payload = await response.json() as RevtooResponse;
  } catch {
    console.warn(`[FeaturedOffers] provider=Revtoo request=invalid-json httpStatus=${response.status} durationMs=${Date.now() - startedAt}`);
    throw new RevtooOffersError(`Revtoo Offers API returned non-JSON content (HTTP ${response.status}).`, { httpStatus: response.status });
  }

  if (!response.ok || payload.success === false) {
    const providerCode = payload.status;
    const providerMessage = payload.message || response.statusText || "Unknown Revtoo API error";
    console.warn(`[FeaturedOffers] provider=Revtoo request=failed httpStatus=${response.status} providerCode=${providerCode ?? "unknown"} durationMs=${Date.now() - startedAt}`);
    throw new RevtooOffersError(`Revtoo Offers API error (HTTP ${response.status}, code ${providerCode ?? "unknown"}): ${providerMessage}`, {
      httpStatus: response.status,
      providerCode,
    });
  }

  const offers = orderFeaturedOffers((Array.isArray(payload.offers) ? payload.offers : [])
    .map(normalizeOffer)
    .filter((offer): offer is FeaturedOffer => Boolean(offer)));

  cache.set(userId, { expiresAt: Date.now() + CACHE_TTL_MS, offers });
  console.log(`[FeaturedOffers] provider=Revtoo request=successful durationMs=${Date.now() - startedAt} offersReturned=${offers.length}`);
  return offers;
}
