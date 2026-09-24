import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const payload = {
  success: true,
  offers: [
    {
      id: "offer-1",
      title: "A real provider offer",
      description: "Test provider data",
      payout: "2.50",
      url: "https://revtoo.example/offer-1",
      image: "https://revtoo.example/logo.svg",
      category: "survey",
    },
  ],
};

function response() {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("Revtoo featured-offer loading", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("REVTOO_API_KEY", "test-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("shares one provider request between overlapping calls for the same user", async () => {
    const fetchMock = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return response();
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getRevtooFeaturedOffers } = await import("./revtoo-offers");
    const [first, second] = await Promise.all([
      getRevtooFeaturedOffers("member-1"),
      getRevtooFeaturedOffers("member-1"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(first).toMatchObject([
      {
        id: "offer-1",
        provider: "Revtoo",
        offerName: "A real provider offer",
        reward: "2.50",
        payout: "2.50",
        featured: undefined,
      },
    ]);
  });

  it("serves a fresh real-offer response from the existing one-minute cache", async () => {
    const fetchMock = vi.fn(async () => response());
    vi.stubGlobal("fetch", fetchMock);

    const { getRevtooFeaturedOffers } = await import("./revtoo-offers");
    const first = await getRevtooFeaturedOffers("member-2");
    const second = await getRevtooFeaturedOffers("member-2");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
    expect(second[0]?.clickUrl).toBe("https://revtoo.example/offer-1");
  });
});
