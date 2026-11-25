import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { getPostbackUrl, OFFER_WALL_URLS, POSTBACK_PARAM_SPECS } from "./offerwall-config";
import { grossUsdFromProviderAmount, getRewardPolicy, userRewardUsd } from "./reward-policy";
import {
  getRewardTymDisposition,
  getRewardTymEventKey,
  isRewardTymReversalValid,
  isValidRewardTymPayout,
  parseRewardTymPayload,
  verifyRewardTymSignature,
} from "./rewardtym-postback";

const ENV_KEYS = ["REWARDTYM_PARTNER_ID", "REWARDTYM_POSTBACK_SECRET"] as const;
const previousEnv = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    const previous = previousEnv.get(key);
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
});

function sign(secret: string, payload: Record<string, unknown>): string {
  const sorted = Object.fromEntries(
    Object.keys(payload)
      .filter((key) => key !== "signature" && payload[key] !== null && payload[key] !== undefined)
      .sort()
      .map((key) => [key, payload[key]]),
  );
  return createHmac("sha256", secret).update(JSON.stringify(sorted), "utf8").digest("hex");
}

describe("RewardTym integration", () => {
  it("builds its hosted offerwall URL with the signed-in user's stable identifier", () => {
    process.env.REWARDTYM_PARTNER_ID = "lt_partner_test";
    process.env.REWARDTYM_POSTBACK_SECRET = "server-side-secret";
    const result = OFFER_WALL_URLS.rewardtym?.("member /42");
    expect(result).not.toBeNull();
    const url = new URL(result!);
    expect(url.origin).toBe("https://rewardtym.online");
    expect(url.pathname).toBe("/offerwall");
    expect(url.searchParams.get("partnerid")).toBe("lt_partner_test");
    expect(url.searchParams.get("userid")).toBe("member /42");
    expect(url.toString()).not.toContain("server-side-secret");
  });

  it("keeps the wall unavailable until partner ID and the callback signing secret are configured", () => {
    process.env.REWARDTYM_PARTNER_ID = "lt_partner_test";
    delete process.env.REWARDTYM_POSTBACK_SECRET;
    expect(OFFER_WALL_URLS.rewardtym?.("member42")).toBeNull();
    process.env.REWARDTYM_POSTBACK_SECRET = "server-side-secret";
    delete process.env.REWARDTYM_PARTNER_ID;
    expect(OFFER_WALL_URLS.rewardtym?.("member42")).toBeNull();
  });

  it("uses POST JSON with the plain endpoint and documented signed payload fields", () => {
    expect(POSTBACK_PARAM_SPECS.rewardtym).toMatchObject({
      user: "user_id",
      reward: "payout_amount",
      transaction: "conversion_id",
      auth: "hmac_sha256",
      macros: [],
    });
    expect(getPostbackUrl("rewardtym", "https://rewardsverse.online", "test-secret"))
      .toBe("https://rewardsverse.online/api/postback/rewardtym");
  });

  it("verifies sorted-key canonical JSON HMAC and omits null fields", () => {
    const secret = "rewardtym-test-secret";
    const payload: Record<string, unknown> = {
      status: "approved",
      user_id: "member42",
      payout_amount: 0.8,
      conversion_id: "conv-123",
      campaign_name: null,
    };
    payload.signature = sign(secret, payload);
    expect(verifyRewardTymSignature(secret, payload)).toBe(true);
    expect(verifyRewardTymSignature("wrong-secret", payload)).toBe(false);
    expect(verifyRewardTymSignature(secret, { ...payload, payout_amount: 0.9 })).toBe(false);
    expect(verifyRewardTymSignature(secret, { ...payload, signature: "malformed" })).toBe(false);
  });

  it("parses only payout_amount as the user's credit and retains conversion/campaign fields", () => {
    expect(parseRewardTymPayload({
      user_id: "member42",
      payout_amount: 0.8,
      publisher_payout_usd: 1,
      conversion_id: "conv-123",
      status: "APPROVED",
      event_name: "offer_completed",
      lt_campaign_id: "campaign-7",
      campaign_name: "Example campaign",
    })).toEqual({
      userId: "member42",
      payoutAmount: "0.8",
      conversionId: "conv-123",
      status: "approved",
      eventName: "offer_completed",
      campaignId: "campaign-7",
      campaignName: "Example campaign",
    });
    expect(parseRewardTymPayload({ publisher_payout_usd: 1 }).payoutAmount).toBe("");
    expect(isValidRewardTymPayout("0.8")).toBe(true);
    expect(isValidRewardTymPayout("0")).toBe(true);
    expect(isValidRewardTymPayout("-0.01")).toBe(false);
    expect(isValidRewardTymPayout("not-a-number")).toBe(false);
  });

  it("credits only approved events and reverses only reversed events", () => {
    expect(getRewardTymDisposition("approved")).toBe("credit");
    expect(getRewardTymDisposition(" APPROVED ")).toBe("credit");
    expect(getRewardTymDisposition("reversed")).toBe("reverse");
    expect(getRewardTymDisposition("pending")).toBe("ignore");
    expect(getRewardTymDisposition("rejected")).toBe("ignore");
    expect(getRewardTymDisposition("")).toBe("ignore");
  });

  it("uses conversion_id for idempotency and a distinct key for its reversal", () => {
    expect(getRewardTymEventKey("conv-123", false)).toBe("conv-123");
    expect(getRewardTymEventKey("conv-123", false)).toBe("conv-123");
    expect(getRewardTymEventKey("conv-123", true)).toBe("conv-123:chargeback");
  });

  it("accepts a reversal only for the exact completed credit, same user, and amount", () => {
    const original = { userId: 42, amount: "0.80", status: "completed" };
    expect(isRewardTymReversalValid(original, 42, 0.8)).toBe(true);
    expect(isRewardTymReversalValid(original, 7, 0.8)).toBe(false);
    expect(isRewardTymReversalValid(original, 42, 0.7)).toBe(false);
    expect(isRewardTymReversalValid({ ...original, status: "failed" }, 42, 0.8)).toBe(false);
    expect(isRewardTymReversalValid(undefined, 42, 0.8)).toBe(false);
  });

  it("credits RewardTym's final USD payout without applying its 80% share again", () => {
    expect(getRewardPolicy("rewardtym")).toEqual({
      unit: "usd",
      pointsPerUsd: 1,
      userShare: 1,
      pendingThresholdUsd: 4000,
    });
    expect(grossUsdFromProviderAmount("rewardtym", 0.8)).toBe(0.8);
    expect(userRewardUsd("rewardtym", 0.8)).toBe(0.8);
  });
});
