import { afterEach, describe, expect, it } from "vitest";
import { buildTimewallProfileUrl, OFFER_WALL_URLS } from "./offerwall-config";

const originalPlacementId = process.env.TIMEWALL_PLACEMENT_ID;

afterEach(() => {
  if (originalPlacementId === undefined) delete process.env.TIMEWALL_PLACEMENT_ID;
  else process.env.TIMEWALL_PLACEMENT_ID = originalPlacementId;
});

describe("TimeWall 2.0 reward-site profile URL", () => {
  it("opens the publisher profile with the mapped RewardsVerse username", () => {
    process.env.TIMEWALL_PLACEMENT_ID = "02d300a2e108c66f";

    const url = buildTimewallProfileUrl("Yones1978");
    expect(url).not.toBeNull();

    const parsed = new URL(url as string);
    expect(parsed.origin).toBe("https://timewall.io");
    expect(parsed.pathname).toBe("/users/login");
    expect(parsed.searchParams.get("oid")).toBe("02d300a2e108c66f");
    expect(parsed.searchParams.get("uid")).toBe("Yones1978");
    expect(OFFER_WALL_URLS.timewall("Yones1978")).toBe(url);
  });

  it("encodes the mapped username and rejects incomplete profile access", () => {
    process.env.TIMEWALL_PLACEMENT_ID = "02d300a2e108c66f";

    const url = buildTimewallProfileUrl("user name/42");
    expect(new URL(url as string).searchParams.get("uid")).toBe("user name/42");
    expect(buildTimewallProfileUrl("   ")).toBeNull();

    delete process.env.TIMEWALL_PLACEMENT_ID;
    expect(buildTimewallProfileUrl("Orgoods801")).toBeNull();
  });
});
