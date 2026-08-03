import { Express, Request, Response } from "express";
import * as crypto from "crypto";
import * as db from "../db";
import { POSTBACK_SECRETS } from "../routers";
import { sseManager } from "./sse";

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL PARAMETER MAPS
// Every field name any offerwall has ever used, normalised to one key.
// ─────────────────────────────────────────────────────────────────────────────

/** All parameter names that carry a user identifier */
const USER_FIELDS = [
  // camelCase variants (Klink GET/POST)
  "subId", "userId",
  // snake_case variants
  "user_id", "sub_id",
  // lowercase no-separator
  "userid", "subid",
  // single-char shorthand (AdswedMedia)
  "sub",
  // numeric uid
  "uid",
  // plain "user" or "username"
  "user", "username",
  // member-style
  "member_id", "memberid",
  // sub-parameters sub1/sub2
  "sub1", "sub2",
  // sid / sid variants
  "sid",
  // click tracking
  "click_user",
  // OAuth
  "openId", "open_id",
  // GemiAds specific
  "publisher_sub_id", "pub_sub_id",
];

/** All parameter names that carry a reward amount.
 * Thứ tự ưu tiên: payout (số tiền net 50% mà provider gửi cho user)
 * đặt TRƯỚC reward/amount (gross) để tránh credit gấp đôi khi provider
 * gửi cả hai trường trong cùng một postback.
 */
const REWARD_FIELDS = [
  "payout",           // net amount (50% of gross) — ưu tiên cao nhất
  "reward", "amount", "value",
  "reward_amount", "reward_value", "round_reward",
  "coins", "points", "credit", "earnings",
  "user_amount",
  // GemiAds specific
  "sale_amount", "commission",
];

/** All parameter names that carry a transaction / conversion ID */
const TXID_FIELDS = [
  // camelCase (Klink)
  "transId", "conversionId", "transactionId",
  // snake_case
  "transaction_id", "conversion_id",
  // short forms
  "transid", "tid", "tx", "txid",
  // UUID style (Gemiwall / GemiAds)
  "uuid",
  // click / lead / event IDs
  "click_id", "clickid", "lead_id", "event_id",
  // generic
  "id", "externalId", "external_id",
  // Taskwall quirk: password field carries txid
  "password",
];

/** All parameter names that carry an offer / campaign name */
const OFFER_NAME_FIELDS = [
  "offer_name", "offerName", "offer",
  "campaign", "campaign_name",
  "task", "title", "app_name",
];

/**
 * Status values that mean "completed / approved".
 * All comparisons are done after .trim().toLowerCase() so casing never matters.
 * "conversion" is included because KlinkLabs sends eventType=conversion as a
 * status signal.  "ok" and "confirm*" variants cover additional providers.
 */
const COMPLETED_STATUSES = new Set([
  "approved", "approve",
  "complete", "completed",
  "success", "succeeded",
  "confirmed", "confirm",
  "conversion",            // KlinkLabs eventType value used as status
  "1", "true", "ok",
]);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Pick the first non-empty value from a list of param-map fields */
function pick(params: Record<string, any>, fields: string[]): string {
  for (const f of fields) {
    const v = params[f];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
}

/**
 * Pick the first value that parses as a non-negative finite number.
 * Returns the string as-is (e.g. "0", "0.50") so the caller can decide
 * how to handle zero-value test postbacks.
 * Skips template placeholders like "{REWARD}" or "[AMOUNT]".
 */
function pickNumeric(params: Record<string, any>, fields: string[]): string {
  for (const f of fields) {
    const v = params[f];
    // Allow explicit "0" — only skip undefined/null/empty
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s === "") continue;
    // Reject template placeholders e.g. {AMOUNT}, [AMOUNT]
    if (/^[\[{]/.test(s)) continue;
    const n = Number(s);
    if (!isNaN(n) && isFinite(n) && n >= 0) return s;
  }
  return "";
}

/** Accept any of several common auth-token field names */
const TOKEN_FIELDS = ["token", "secret", "apikey", "api_key", "hash", "key"];

function extractToken(params: Record<string, any>): string {
  return pick(params, TOKEN_FIELDS);
}

function extractSignature(params: Record<string, any>): string {
  return pick(params, ["signature", "sig", "hash"]);
}

/** Verify HMAC-SHA256 over sorted key=value pairs (future use) */
function verifyHmacSignature(
  secret: string,
  params: Record<string, any>,
  signature: string
): boolean {
  if (!signature) return false;
  const msg = Object.keys(params)
    .filter((k) => !["signature", "sig"].includes(k))
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const expected = crypto.createHmac("sha256", secret).update(msg).digest("hex");
  return expected === signature;
}

/**
 * Register postback endpoints for offer wall providers
 *
 * Supported routes:
 * - GET  /api/postback                    → Health/info endpoint
 * - POST /api/postback/:provider          → Primary postback handler
 * - GET  /api/postback/:provider          → Fallback for GET callbacks
 *
 * Xác thực theo từng provider:
 * - cointo / revtoo / gemiwall / taskwall / adswedmedia / clickwall / klink / moustache:
 *     ?token= query param plain-match với POSTBACK_SECRETS
 *
 * Chi tiết param từng provider:
 * - revtoo:      user_id=USERNAME  reward=AMOUNT    transaction_id=TXID
 * - cointo:      user_id=USERNAME  reward=AMOUNT    transaction_id=TXID
 * - gemiwall:    sub_id=USERNAME   reward=AMOUNT    uuid=TXID
 * - taskwall:    userid=USERNAME   reward=AMOUNT    password=TXID
 * - clickwall:   user_id=USERNAME  payout=AMOUNT    transaction_id=TXID
 * - adswedmedia: sub=USERNAME      reward=AMOUNT    transid=TXID
 * - klink (GET): subId=USERNAME    payout=AMOUNT    transId=TXID    (GET query params)
 * - klink (POST JSON): userId=USERNAME  payout=AMOUNT  conversionId=TXID
 * - moustache:   user_id=USERNAME  payout=AMOUNT    transaction_id=TXID
 *
 * Idempotency: duplicate externalId + provider combos silently ignored
 */

// HMAC providers (future expansion — currently none require it)
const HMAC_PROVIDERS = new Set<string>([]);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

export function registerPostbackRoutes(app: Express) {
  // Health / info
  app.get("/api/postback", (_req, res) => {
    const configured = Object.keys(POSTBACK_SECRETS).map((p) => ({
      provider: p,
      authMethod: HMAC_PROVIDERS.has(p) ? "hmac-sha256" : "token",
      configured: true,
    }));
    return res.json({
      success: true,
      message: "RewardsVerse Universal Postback API",
      version: "2.0",
      supportedMethods: ["GET", "POST", "application/json", "application/x-www-form-urlencoded", "multipart/form-data"],
      configuredProviders: configured,
      universalMode: "Any unknown provider is accepted when ?token= matches POSTBACK_SECRETS entry",
      postbackUrl: "https://YOUR_DOMAIN/api/postback/{provider}?token={YOUR_SECRET}&{user_param}={USERNAME}&{reward_param}={AMOUNT}&{txid_param}={TXID}",
      userFields: USER_FIELDS,
      rewardFields: REWARD_FIELDS,
      txidFields: TXID_FIELDS,
    });
  });

  // Universal handler — both GET and POST, any provider name
  app.post("/api/postback/:provider", handlePostback);
  app.get("/api/postback/:provider", handlePostback);
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL POSTBACK HANDLER
// ─────────────────────────────────────────────────────────────────────────────

async function handlePostback(req: Request, res: Response) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const remoteIp = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const provider = (req.params.provider || "").toLowerCase().trim();

  // Capture full raw request for logging
  const rawHeaders = JSON.stringify(req.headers);
  const rawQuery   = JSON.stringify(req.query);
  const rawBody    = JSON.stringify(req.body);

  // Merge query + body.
  // Body wins for payload fields (status, reward, userId) so that POST JSON /
  // form-encoded providers like KlinkLabs are not overridden by query-string
  // token params. Query wins only for fields not present in the body.
  const params: Record<string, any> = { ...req.query, ...req.body };

  console.log(`[Postback] ──────────────────────────────────────────────`);
  console.log(`[Postback] RECEIVED  ${req.method} /api/postback/${provider}`);
  console.log(`[Postback] IP: ${remoteIp}  Time: ${timestamp}`);
  console.log(`[Postback] Query  : ${rawQuery}`);
  console.log(`[Postback] Body   : ${rawBody}`);
  console.log(`[Postback] Headers: content-type=${req.headers["content-type"] || "none"}`);

  // ── Helper: write detailed log row and return res ──────────────────────────
  async function respond(
    httpStatus: number,
    payload: Record<string, any>,
    logStatus: "processed" | "duplicate" | "failed",
    resolvedUserId: number,
    resolvedAmount: string,
    resolvedTxid: string,
    resolvedOfferName: string,
    errorMsg?: string
  ): Promise<Response> {
    const ms = Date.now() - startTime;
    // Log to detailed postback_logs table (non-critical — never crash on failure)
    db.logPostbackDetail({
      provider,
      ip: remoteIp,
      method: req.method,
      headers: rawHeaders,
      queryParams: rawQuery,
      bodyParams: rawBody,
      userId: resolvedUserId,
      amount: resolvedAmount || "0",
      transactionId: resolvedTxid,
      offerName: resolvedOfferName,
      status: logStatus,
      result: JSON.stringify(payload),
      errorMessage: errorMsg,
      processingMs: ms,
    }).catch((e) => console.warn("[Postback] logPostbackDetail failed:", e?.message));

    // Keep legacy postbacks table in sync
    if (resolvedUserId && logStatus !== "duplicate") {
      db.logPostback({
        provider,
        externalId: resolvedTxid || `${provider}:noid:${Date.now()}`,
        userId: resolvedUserId,
        amount: resolvedAmount || "0",
        offerName: resolvedOfferName,
        status: logStatus,
      }).catch(() => {});
    }

    console.log(`[Postback] RESPOND ${httpStatus} — ${logStatus} (${ms}ms):`, JSON.stringify(payload));
    return res.status(httpStatus).json(payload);
  }

  try {
    // ── 1. Validate provider ────────────────────────────────────────────────
    if (!provider) {
      return respond(400, { success: false, message: "Provider required in URL: /api/postback/{provider}" },
        "failed", 0, "", "", "");
    }

    // ── 2. Authentication ───────────────────────────────────────────────────
    const expectedSecret = POSTBACK_SECRETS[provider];
    if (expectedSecret) {
      if (HMAC_PROVIDERS.has(provider)) {
        const sig = extractSignature(params);
        if (!verifyHmacSignature(expectedSecret, params, sig)) {
          console.error(`[Postback][${provider}] HMAC signature mismatch`);
          return respond(401, { success: false, message: "Invalid HMAC signature" },
            "failed", 0, "", "", "", "hmac_mismatch");
        }
      } else {
        // Token / secret match — accept any of several field names
        const token = extractToken(params);
        if (!token) {
          console.error(`[Postback][${provider}] Missing auth token`);
          return respond(401, { success: false, message: "Authentication token required (?token=YOUR_SECRET)" },
            "failed", 0, "", "", "", "missing_token");
        }
        if (token !== expectedSecret) {
          console.error(`[Postback][${provider}] Token mismatch. Got: ${token.substring(0, 4)}***`);
          return respond(401, { success: false, message: "Invalid authentication token" },
            "failed", 0, "", "", "", "invalid_token");
        }
      }
      console.log(`[Postback][${provider}] Auth OK`);
    } else {
      // Unknown provider — still process but log warning
      console.warn(`[Postback][${provider}] No secret configured — processing without auth`);
    }

    // ── 3. Extract status ──────────────────────────────────────────────────
    // Read from any common status field name. Note: "eventType" is included
    // because KlinkLabs uses eventType=conversion as its completion signal.
    // Field names "completed" and "approved" are intentionally NOT in this
    // list as they are values, not field names — using them as keys caused
    // false-positive skips when the field was absent (picked as undefined).
    const statusRaw = pick(params, ["status", "state", "event_type", "eventType", "event", "type"]);
    const statusNorm = statusRaw.toLowerCase().trim();

    console.log(`[Postback][${provider}] Raw status field="${statusRaw}" normalised="${statusNorm}"`);

    // If a status field IS present but is not a known completed value → skip.
    // If NO status field is present (empty string) → assume completed (many
    // providers only POST on completion and omit the status field entirely).
    if (statusNorm !== "" && !COMPLETED_STATUSES.has(statusNorm)) {
      console.log(`[Postback][${provider}] Status "${statusRaw}" is not a completed value — skipping`);
      return respond(200, {
        success: true,
        message: `Postback received but status "${statusRaw}" is not a completed state — skipped`,
        receivedStatus: statusRaw,
        acceptedValues: Array.from(COMPLETED_STATUSES),
      }, "failed", 0, "", "", "");
    }

    // ── 4. Extract user identifier ─────────────────────────────────────────
    const rawUserId = pick(params, USER_FIELDS);
    if (!rawUserId) {
      console.error(`[Postback][${provider}] No user identifier found. Query: ${rawQuery}  Body: ${rawBody}`);
      return respond(400, {
        success: false,
        message: "Missing user identifier",
        hint: `Provide one of: ${USER_FIELDS.slice(0, 10).join(", ")}, ...`,
        receivedParams: Object.keys(params),
      }, "failed", 0, "", "", "", "missing_user_id");
    }

    // ── 5. Extract reward amount ───────────────────────────────────────────
    const rawAmount = pickNumeric(params, REWARD_FIELDS);

    // Log every parsed field before any validation so debugging is easy
    console.log(`[Postback][${provider}] Detected → status="${statusNorm}" user="${rawUserId}" reward="${rawAmount}" params=${JSON.stringify(Object.keys(params))}`);

    if (rawAmount === "") {
      console.error(`[Postback][${provider}] No numeric reward field found. Query: ${rawQuery}  Body: ${rawBody}`);
      return respond(400, {
        success: false,
        message: "Missing or invalid reward amount",
        hint: `Provide one of: ${REWARD_FIELDS.join(", ")}`,
        receivedParams: Object.keys(params),
      }, "failed", 0, "", "", "", "missing_amount");
    }

    const reward = parseFloat(rawAmount);

    // payout=0 is valid for test postbacks — log it clearly but continue
    if (reward === 0) {
      console.warn(`[Postback][${provider}] ⚠ Test reward = 0 (payout=0 received). Logging but NOT crediting balance.`);
      return respond(200, {
        success: true,
        message: "Test postback received (reward=0) — balance not updated",
        testPostback: true,
        detectedUser: rawUserId,
        detectedReward: "0",
      }, "processed", 0, "0", "", "");
    }

    // ── 6. Extract transaction ID ──────────────────────────────────────────
    let rawTxid = pick(params, TXID_FIELDS);
    // Skip "password" field if it looks like an actual password (no digits / too short)
    if (rawTxid && rawTxid === params.password && rawTxid.length < 6) rawTxid = "";
    // Auto-generate if missing or placeholder
    if (!rawTxid || rawTxid === "0" || rawTxid === "auto-id" || /^[\[{]/.test(rawTxid)) {
      rawTxid = `${provider}:${rawUserId}:${Date.now()}`;
    }
    const txid = rawTxid;

    // ── 7. Extract offer name ──────────────────────────────────────────────
    const offerName = pick(params, OFFER_NAME_FIELDS);

    // ── 8. Offer / campaign ID ─────────────────────────────────────────────
    const offerId = pick(params, ["offerId", "offer_id", "company_id", "campaign_id", "app_id"]);

    console.log(`[Postback][${provider}] Parsed → user="${rawUserId}" amount=${reward} txid="${txid}" offer="${offerName}"`);

    // ── 9. Duplicate check ────────────────────────────────────────────────
    const existing = await db.checkPostbackDuplicate(provider, txid);
    if (existing) {
      console.log(`[Postback][${provider}] DUPLICATE txid=${txid} — processed at ${existing.createdAt}`);
      return respond(409, {
        success: true,
        message: "Duplicate transaction — already processed",
        duplicate: true,
        originalTimestamp: existing.createdAt,
      }, "duplicate", 0, rawAmount, txid, offerName);
    }

    // ── 10. Resolve user ──────────────────────────────────────────────────
    let user: Awaited<ReturnType<typeof db.getUserByUsername>> | null = null;

    // 10a. Try as username (case-insensitive) — most common: offerwalls put username in user_id
    user = await db.getUserByUsername(rawUserId);
    if (user) console.log(`[Postback][${provider}] User found by username: "${rawUserId}" → id=${user.id}`);

    // 10b. Try as openId
    if (!user) {
      user = await db.getUserByOpenId(rawUserId) ?? null;
      if (user) console.log(`[Postback][${provider}] User found by openId: "${rawUserId}" → id=${user.id}`);
    }

    // 10c. If rawUserId looks like "virtual_NAME_timestamp", extract NAME and retry
    if (!user && rawUserId.startsWith("virtual_")) {
      const parts = rawUserId.split("_");
      if (parts.length >= 2) {
        const extracted = parts[1];
        user = await db.getUserByUsername(extracted) ?? null;
        if (user) console.log(`[Postback][${provider}] User found by extracting from openId prefix: "${extracted}" → id=${user.id}`);
      }
    }

    if (!user) {
      console.error(`[Postback][${provider}] User NOT FOUND for identifier: "${rawUserId}"`);
      await respond(400, {
        success: false,
        message: "User not found",
        identifier: rawUserId,
        hint: "The value passed in the user field must match a registered username (case-insensitive).",
      }, "failed", 0, rawAmount, txid, offerName, "user_not_found");
      return res; // already responded
    }

    // ── 11. Credit user (wrapped — critical path) ─────────────────────────
    console.log(`[Postback][${provider}] Crediting $${reward.toFixed(2)} to ${user.username} (id=${user.id})`);

    try {
      await db.addBalance(user.id, reward);
      console.log(`[Postback][${provider}] Balance updated OK`);
    } catch (err: any) {
      console.error(`[Postback][${provider}] CRITICAL: addBalance FAILED:`, err?.message);
      console.error(`[Postback] DATABASE_URL present:`, !!process.env.DATABASE_URL);
      await respond(500, {
        success: false,
        message: "Failed to credit user — database error",
        error: err?.message,
        hint: "Check DATABASE_URL env var and run migrations (0002_add_wallet_offer_notifications.sql)",
      }, "failed", user.id, rawAmount, txid, offerName, err?.message);
      return res;
    }

    // ── 12. Non-critical side-effects (fire and log, never crash) ─────────
    const creditLabel = offerName ? `[${provider}] ${offerName}` : `[${provider}] Offer`;

    await Promise.allSettled([
      db.addXP(user.id, 15),
      db.incrementOffers(user.id),
      db.addEarning({ userId: user.id, amount: reward.toFixed(2), type: "offer", source: creditLabel }),
      db.addActivity({
        userId: user.id,
        username: user.username || "User",
        type: "offer_complete",
        description: `earned $${reward.toFixed(2)} on ${provider}${offerName ? ` — ${offerName}` : ""}`,
        amount: reward.toFixed(2),
      }),
      db.addWalletTransaction({
        userId: user.id,
        type: "credit",
        amount: reward.toFixed(2),
        description: `Earned $${reward.toFixed(2)} on ${provider}${offerName ? ` — ${offerName}` : ""}`,
        source: provider,
      }),
      db.addOfferHistory({
        userId: user.id,
        provider,
        offerName: offerName || undefined,
        amount: reward.toFixed(2),
        externalId: txid,
        status: "completed",
      }),
      db.addNotification({
        userId: user.id,
        title: `Reward Received: $${reward.toFixed(2)}`,
        message: `You earned $${reward.toFixed(2)} from ${provider}${offerName ? ` — ${offerName}` : ""}. Balance updated.`,
        type: "reward",
        isRead: 0,
      }),
      // Update leaderboard after a short re-fetch to get updated totalEarned
      db.getUserById(user.id).then((u) => {
        if (u?.username) db.updateLeaderboard(u.id, u.username, parseFloat(u.totalEarned || "0")).catch(() => {});
      }),
    ]);

    // ── 13. SSE real-time push ────────────────────────────────────────────
    try {
      sseManager.sendPostbackEvent(user.id, {
        type: "postback",
        provider,
        amount: reward,
        offerName: offerName || "Offer",
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn(`[Postback][${provider}] SSE send failed (non-critical):`, e);
    }

    // ── 14. Success ────────────────────────────────────────────────────────
    console.log(`[Postback][${provider}] ✅ SUCCESS — $${reward.toFixed(2)} credited to ${user.username}`);
    return respond(200, {
      success: true,
      message: `Credited $${reward.toFixed(2)} to ${user.username}`,
      data: {
        userId: user.id,
        username: user.username,
        amount: reward.toFixed(2),
        provider,
        offerName,
        txid,
        offerId,
      },
    }, "processed", user.id, rawAmount, txid, offerName);

  } catch (error: any) {
    console.error(`[Postback][${provider}] FATAL:`, error?.message, error?.stack);
    return respond(500, {
      success: false,
      message: "Internal server error",
      error: error?.message || "Unknown error",
    }, "failed", 0, "", "", "", error?.message);
  }
}

