import { describe, expect, it } from "vitest";
import { selectOfferwallMeReward } from "./_core/postback";

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
  it("uses the configured user-facing reward_value instead of provider gross reward", () => {
    expect(selectOfferwallMeReward(liveCallback)).toBe("500");
  });

  it("falls back to reward for legacy callbacks without reward_value", () => {
    expect(selectOfferwallMeReward({ reward: "12.50", payout: "0.025" })).toBe("12.50");
  });

  it("ignores non-numeric reward_value and uses numeric reward fallback", () => {
    expect(selectOfferwallMeReward({ reward_value: "{reward_value}", reward: "25" })).toBe("25");
  });
});
