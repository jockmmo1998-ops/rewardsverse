import { describe, expect, it } from "vitest";
import { getRewardPolicy, grossUsdFromProviderAmount, userRewardUsd } from "./reward-policy";
import { OFFER_WALL_URLS } from "./offerwall-config";

describe("MoOffers integration", () => {
  it("builds a user-bound H5 link with the created app", () => {
    const url = OFFER_WALL_URLS.mooffers?.("member_42");
    expect(url).toContain("https://wall.mooffers.com/offerwall/app_57767c1f84d80017");
    expect(url).toContain("uid=member_42");
    expect(url).toContain("platform=web");
  });

  it("credits 40% of MoOffers payout while keeping USD as the wallet unit", () => {
    const policy = getRewardPolicy("mooffers");
    expect(policy.unit).toBe("usd");
    expect(policy.userShare).toBe(0.4);
    expect(grossUsdFromProviderAmount("mooffers", 1.2)).toBe(1.2);
    expect(userRewardUsd("mooffers", 1.2)).toBeCloseTo(0.48, 8);
  });
});
