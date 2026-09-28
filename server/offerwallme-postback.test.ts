import { describe, expect, it } from "vitest";
import { convertOfferwallMePointsToUsd, selectOfferwallMeReward } from "./_core/postback";

const liveCallback = {
  subId: "Yuki9168",
  transId: "TOROX-128546555",
  reward: "1593.8",
  reward_value: "500",
  reward_name: "Points",
  payout: "3.187500",
  offer_name: "Crumb - Free Pet Tag",
  status: "1",
};

describe("Offerwall.me reward parsing", () => {
  it("uses the actual reward value when both Offerwall.me fields are present", () => {
    expect(selectOfferwallMeReward(liveCallback)).toBe("1593.8");
    expect(Number(selectOfferwallMeReward(liveCallback))).toBe(1593.8);
    expect(convertOfferwallMePointsToUsd(Number(selectOfferwallMeReward(liveCallback)))).toBeCloseTo(1.5938, 4);
  });

  it("falls back to reward_value when reward is missing", () => {
    expect(selectOfferwallMeReward({ reward_value: "12.50", payout: "0.025" })).toBe("12.50");
  });

  it("ignores non-numeric reward and uses numeric reward_value fallback", () => {
    expect(selectOfferwallMeReward({ reward: "{reward}", reward_value: "25" })).toBe("25");
  });
});
