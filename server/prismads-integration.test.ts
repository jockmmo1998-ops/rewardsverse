import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { getPostbackUrl, OFFER_WALL_URLS, POSTBACK_PARAM_SPECS } from "./offerwall-config";
import { grossUsdFromProviderAmount, getRewardPolicy, userRewardUsd } from "./reward-policy";
import { normalizePrismadsValue, verifyPrismadsSignature } from "./prismads-postback";

const ENV_KEYS = ["PRISMADS_PLACEMENT_ID", "PRISMADS_IFRAME_API_KEY", "PRISMADS_POSTBACK_SECRET"] as const;
const previousEnv = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    const previous = previousEnv.get(key);
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
});

function sign(secret: string, userId: string, value: string, txid: string) {
  return createHmac("sha256", secret).update(`${userId}.${value}.${txid}`).digest("hex");
}

describe("PrismAds integration", () => {
  it("builds the documented iframe URL with a URL-encoded RewardsVerse username", () => {
    process.env.PRISMADS_PLACEMENT_ID = "placement-42";
    process.env.PRISMADS_IFRAME_API_KEY = "iframe-public-key";
    process.env.PRISMADS_POSTBACK_SECRET = "postback-private-secret";

    const result = OFFER_WALL_URLS.prismads?.("member 42");
    expect(result).not.toBeNull();
    const url = new URL(result!);
    expect(url.origin).toBe("https://prismads.co");
    expect(url.pathname).toBe("/wall/placement-42");
    expect(url.searchParams.get("api_key")).toBe("iframe-public-key");
    expect(url.searchParams.get("user_id")).toBe("member 42");
  });

  it("keeps the wall unavailable until all placement and callback credentials exist", () => {
    process.env.PRISMADS_PLACEMENT_ID = "placement-42";
    process.env.PRISMADS_IFRAME_API_KEY = "iframe-public-key";
    delete process.env.PRISMADS_POSTBACK_SECRET;
    expect(OFFER_WALL_URLS.prismads?.("member42")).toBeNull();
  });

  it("uses 1,000 PrismAds Coins as $1 without an extra provider revenue haircut", () => {
    const policy = getRewardPolicy("prismads");
    expect(policy).toEqual({ unit: "points", pointsPerUsd: 1000, userShare: 1, pendingThresholdUsd: 10 });
    expect(grossUsdFromProviderAmount("prismads", 1000)).toBe(1);
    expect(userRewardUsd("prismads", 1000)).toBe(1);
    expect(userRewardUsd("prismads", 250)).toBe(0.25);
  });

  it("verifies HMAC-SHA256 over user_id.truncated_value.txid", () => {
    const secret = "prismads-test-secret";
    const signature = sign(secret, "member42", "500", "txn-123");
    expect(normalizePrismadsValue("500.9")).toBe("500");
    expect(verifyPrismadsSignature(secret, {
      user_id: "member42",
      value: "500.9",
      txid: "txn-123",
      signature,
    })).toBe(true);
    expect(verifyPrismadsSignature(secret, {
      user_id: "member42",
      value: "500",
      token: "txn-123",
      signature,
    })).toBe(true);
  });

  it("rejects a mismatched secret, altered payload, or malformed signature", () => {
    const secret = "prismads-test-secret";
    const signature = sign(secret, "member42", "500", "txn-123");
    const payload = { user_id: "member42", value: "500", txid: "txn-123", signature };
    expect(verifyPrismadsSignature("wrong-secret", payload)).toBe(false);
    expect(verifyPrismadsSignature(secret, { ...payload, value: "501" })).toBe(false);
    expect(verifyPrismadsSignature(secret, { ...payload, signature: "not-a-signature" })).toBe(false);
  });

  it("creates a callback URL with the required signed fields and signature macro", () => {
    expect(POSTBACK_PARAM_SPECS.prismads).toMatchObject({
      user: "user_id",
      reward: "value",
      transaction: "txid",
      auth: "hmac_sha256",
    });
    const callback = getPostbackUrl("prismads", "https://rewardsverse.online", "test-secret");
    expect(callback).not.toBeNull();
    const url = new URL(callback!);
    expect(url.pathname).toBe("/api/postback/prismads");
    expect(url.searchParams.get("user_id")).toBe("{user_id}");
    expect(url.searchParams.get("value")).toBe("{value}");
    expect(url.searchParams.get("txid")).toBe("{txid}");
    expect(url.searchParams.get("signature")).toBe("{signature}");
  });
});
