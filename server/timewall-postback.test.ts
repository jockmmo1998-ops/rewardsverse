import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  calculateTimewallCredit,
  resolveTimewallPlacement,
  validateTimewallCallback,
} from "./_core/timewall";

const secret = "timewall-test-secret";
const placement = { placementId: "02d300a2e108c66f", pointsPerUsd: 400 };
const userId = "mccarthy198101021";
const txid = "tw-tx-1001";
const revenue = "0.5";
const hash = createHash("sha256").update(`${userId}${revenue}${secret}`).digest("hex");

function validInput(overrides: Partial<Parameters<typeof validateTimewallCallback>[0]> = {}) {
  return {
    userId,
    transactionId: txid,
    revenue,
    hash,
    type: "credit",
    sourceIp: "18.156.132.55",
    secret,
    placement,
    knownUserIds: new Set([userId]),
    ...overrides,
  };
}

describe("TimeWall postback", () => {
  it("accepts a valid callback and credits the user payout for provider points", () => {
    expect(validateTimewallCallback(validInput())).toEqual({
      ok: true,
      creditUsd: 0.2,
      pointsEarned: 200,
    });
  });

  it("rejects an invalid hash", () => {
    expect(validateTimewallCallback(validInput({ hash: "bad" }))).toEqual({ ok: false, reason: "invalid_hash" });
  });

  it("rejects an unknown user", () => {
    expect(validateTimewallCallback(validInput({ userId: "unknown-user", knownUserIds: new Set([userId]) }))).toEqual({ ok: false, reason: "unknown_user" });
  });

  it("rejects a missing Placement/rate", () => {
    expect(validateTimewallCallback(validInput({ placement: null }))).toEqual({ ok: false, reason: "missing_placement" });
    expect(resolveTimewallPlacement({ TIMEWALL_POSTBACK_SECRET: secret })).toBeNull();
  });

  it("rejects a duplicate transaction", () => {
    expect(validateTimewallCallback(validInput({ seenTransactionIds: new Set([txid]) }))).toEqual({ ok: false, reason: "duplicate" });
  });

  it("calculates successful credit using the active Placement rate", () => {
    expect(calculateTimewallCredit("1.25", placement)).toEqual({
      revenueUsd: 1.25,
      pointsEarned: 500,
      creditUsd: 0.5,
    });
  });
});
