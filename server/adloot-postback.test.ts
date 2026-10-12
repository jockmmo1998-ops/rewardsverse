import { describe, expect, it } from "vitest";
import {
  adlootAllowedIps,
  isAdlootChargebackStatus,
  isAdlootCompletedStatus,
  isAdlootIpAllowed,
  parseAdlootAmount,
  trustedCloudflareClientIp,
} from "./adloot-postback";

describe("AdLoot postback semantics", () => {
  it("accepts the documented IP and the operator-approved observed callback IP", () => {
    expect(isAdlootIpAllowed("3.22.177.178", undefined)).toBe(true);
    expect(isAdlootIpAllowed("162.0.225.34", undefined)).toBe(true);
    expect(isAdlootIpAllowed("::ffff:3.22.177.178", undefined)).toBe(true);
  });

  it("requires explicit configuration for an additional IP", () => {
    expect(adlootAllowedIps("3.22.177.178, 162.0.225.34")).toEqual(
      new Set(["3.22.177.178", "162.0.225.34"]),
    );
    expect(isAdlootIpAllowed("162.0.225.34", "3.22.177.178,162.0.225.34")).toBe(true);
  });

  it("does not treat arbitrary forwarded values as an authenticated IP", () => {
    expect(isAdlootIpAllowed("172.71.81.153", undefined)).toBe(false);
    expect(isAdlootIpAllowed("127.0.0.1", undefined)).toBe(false);
  });

  it("accepts Cloudflare client IP only when the identity headers agree", () => {
    const headers = {
      "cf-ray": "a49772ba8fc047a7-SIN",
      "cdn-loop": "cloudflare; loops=1",
      "cf-connecting-ip": "162.0.225.34",
      "true-client-ip": "162.0.225.34",
      "x-forwarded-for": "162.0.225.34, 172.71.124.68, 10.31.197.151",
    };
    expect(trustedCloudflareClientIp(headers)).toBe("162.0.225.34");
    expect(trustedCloudflareClientIp({ ...headers, "x-forwarded-for": "203.0.113.10, 172.71.124.68" })).toBe(null);
    expect(trustedCloudflareClientIp({ ...headers, "true-client-ip": "203.0.113.10" })).toBe(null);
    expect(trustedCloudflareClientIp({ ...headers, "cdn-loop": "other-cdn" })).toBe(null);
  });

  it("uses payout USD before the virtual reward fallback", () => {
    expect(parseAdlootAmount({ payout: "3.8", reward: "1216" })).toBe(3.8);
    expect(parseAdlootAmount({ reward: "1216" })).toBe(1216);
    expect(parseAdlootAmount({ payout: "not-a-number", reward: "1216" })).toBe(1216);
    expect(parseAdlootAmount({ payout: "" })).toBe(null);
  });

  it("recognizes documented credited and rejected states", () => {
    expect(isAdlootCompletedStatus("credited")).toBe(true);
    expect(isAdlootChargebackStatus("rejected")).toBe(true);
    expect(isAdlootCompletedStatus("completed")).toBe(true);
    expect(isAdlootChargebackStatus("pending")).toBe(false);
  });
});
