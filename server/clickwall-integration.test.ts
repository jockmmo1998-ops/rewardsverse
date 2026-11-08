import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { selectClickwallPayout, verifyClickwallSignature } from "./clickwall-postback";
import { getPostbackUrl, OFFER_WALL_URLS } from "./offerwall-config";
import { getRewardPolicy, userRewardUsd } from "./reward-policy";

describe("Clickwall integration", () => {
  it("builds a user-bound official iframe URL and callback template", () => {
    const wallUrl = OFFER_WALL_URLS.clickwall?.("member 42");
    expect(wallUrl).toBe("https://clickwall.net/app/iframe/10621/member%2042");

    const callback = getPostbackUrl("clickwall", "https://rewardsverse.online");
    expect(callback).toBeTruthy();
    const parsed = new URL(callback!);
    expect(parsed.pathname).toBe("/api/postback/clickwall");
    for (const field of ["user_id", "offer_id", "amount", "payout", "offer_name", "user_ip", "txid", "status", "sig"]) {
      expect(parsed.searchParams.get(field)).toBe(`{${field}}`);
    }
    expect(parsed.searchParams.has("token")).toBe(false);
  });

  it("verifies the documented HMAC field order and rejects tampering", () => {
    const secret = "clickwall-test-secret";
    const params = {
      user_id: "member_42",
      offer_id: "offer-7",
      amount: "500",
      txid: "tx-001",
      sig: createHmac("sha256", secret)
        .update("user_id=member_42&oid=offer-7&amount=500&tx_id=tx-001", "utf8")
        .digest("hex"),
    };

    expect(verifyClickwallSignature(secret, params)).toBe(true);
    expect(verifyClickwallSignature(secret, { ...params, amount: "500.0" })).toBe(false);
    expect(verifyClickwallSignature(secret, { ...params, offer_id: "offer-8" })).toBe(false);
  });

  it("uses the USD payout, not Clickwall's virtual coin amount", () => {
    expect(selectClickwallPayout({ amount: "500", payout: "1.20" })).toBe("1.20");
    expect(selectClickwallPayout({ amount: "500" })).toBe("");
    expect(selectClickwallPayout({ amount: "500", payout: "-1.20" })).toBe("-1.20");
  });

  it("keeps Clickwall on the existing USD wallet and 50% user share", () => {
    const policy = getRewardPolicy("clickwall");
    expect(policy.unit).toBe("usd");
    expect(policy.userShare).toBe(0.5);
    expect(userRewardUsd("clickwall", 2.4)).toBeCloseTo(1.2, 8);
  });
});
