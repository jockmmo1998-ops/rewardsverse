import { Express, Request, Response } from "express";
import * as crypto from "crypto";
import * as db from "../db";
import {
  OFFER_WALL_IDS,
  POSTBACK_PARAM_SPECS,
  POSTBACK_SECRETS,
  OFFER_WALL_LABELS,
  type PostbackParamSpec,
} from "../offerwall-config";
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

/** Status values used by offerwall networks for a reversal/chargeback. */
const CHARGEBACK_STATUSES = new Set([
  "2", "reversed", "reverse", "chargeback", "refund", "refunded",
  "cancelled", "canceled", "debit",
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

function extractToken(params: Record<string, any>, spec?: PostbackParamSpec): string {
  return pick(params, [...(spec?.authFields || []), ...TOKEN_FIELDS]);
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * Revtoo, Cointo and AdswedMedia document the same MD5 formula:
 * md5(user + transaction + reward + secret).
 */
function verifyProviderMd5Signature(
  secret: string,
  params: Record<string, any>,
  spec: PostbackParamSpec,
): boolean {
  if (!spec.transaction) return false;
  const user = pick(params, [spec.user]);
  const transaction = pick(params, [spec.transaction]);
  const reward = pick(params, [spec.reward]);
  const signature = extractSignature(params);
  if (!user || !transaction || !reward || !signature) return false;
  const expected = crypto
    .createHash("md5")
    .update(`${user}${transaction}${reward}${secret}`)
    .digest("hex");
  return constantTimeEqual(expected, signature.toLowerCase());
}

/** Gaintwall documents SHA256(user_id + offer_id + transaction_id + secretKey). */
function verifyProviderSha256Signature(
  secret: string,
  params: Record<string, any>,
  spec: PostbackParamSpec,
): boolean {
  if (!spec.transaction) return false;
  const user = pick(params, [spec.user, "user_id"]);
  const offerId = pick(params, ["offerId", "offer_id"]);
  const transaction = pick(params, [spec.transaction, "transaction_id"]);
  const signature = extractSignature(params);
  if (!user || !offerId || !transaction || !signature) return false;
  const expected = crypto
    .createHash("sha256")
    .update(`${user}${offerId}${transaction}${secret}`)
    .digest("hex");
  return constantTimeEqual(expected, signature.toLowerCase());
}

/**
 * Some networks (notably TaskWall) do not provide a stable transaction ID.
 * Hashing the canonical, non-auth payload makes retries idempotent while still
 * allowing different offers/dates to create different events.
 */
function buildDeterministicEventId(provider: string, params: Record<string, any>): string {
  const authFields = new Set([
    ...TOKEN_FIELDS,
    "password",
    "signature",
    "sig",
    "hash",
    "key",
  ]);
  const canonical = Object.entries(params)
    .filter(([key, value]) => !authFields.has(key) && value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&");
  const digest = crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 48);
  return `${provider}:${digest}`;
}

function extractSignature(params: Record<string, any>): string {
  return pick(params, ["signature", "sig", "hash"]);
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
 * - gemiwall / taskwall / clickwall / moustache / klink / admaxflow / buckswall:
 *     token/password query field plain-matches the provider secret
 * - revtoo / cointo / adswedmedia:
 *     signature=md5(user + transaction + reward + secret)
 * - gaintwall:
 *     hash=sha256(user_id + offer_id + transaction_id + secret)
 *
 * Chi tiết param từng provider:
 * - revtoo:      subId=USERNAME    reward=AMOUNT    transId=TXID    signature=MD5
 * - cointo:      subId=USERNAME    reward=AMOUNT    transId=TXID    signature=MD5
 * - gemiwall:    sub_id=USERNAME   reward=AMOUNT    uuid=TXID
 * - taskwall:    userid=USERNAME   user_amount=AMOUNT password=AUTH_PASSWORD
 * - clickwall:   user_id=USERNAME  amount=AMOUNT    txid=TXID
 * - adswedmedia: subId=USERNAME    reward=AMOUNT    transId=TXID    signature=MD5
 * - klink (GET): subId=USERNAME    payout=AMOUNT    transId=TXID    (GET query params)
 * - klink (POST JSON): userId=USERNAME  payout=AMOUNT  conversionId=TXID
 * - moustache:   user_id=USERNAME  payout=AMOUNT    transaction_id=TXID
 *
 * Idempotency: duplicate externalId + provider combos silently ignored
 */

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

export function registerPostbackRoutes(app: Express) {
  // Health / info
  app.get("/api/postback", (_req, res) => {
    const configured = OFFER_WALL_IDS.map((provider) => {
      const spec = POSTBACK_PARAM_SPECS[provider];
      return {
        provider,
        label: OFFER_WALL_LABELS[provider] || provider,
        authMethod: spec.auth,
        configured: Boolean(POSTBACK_SECRETS[provider]),
        response: spec.response,
      };
    });
    return res.json({
      success: true,
      message: "RewardsVerse Universal Postback API",
      version: "2.0",
      supportedMethods: ["GET", "POST", "application/json", "application/x-www-form-urlencoded", "multipart/form-data"],
      configuredProviders: configured,
      universalMode: "Only the 11 supported providers are accepted; every callback must be authenticated",
      postbackUrl: "Use the provider-specific callback URL from the admin panel",
      supportedProviders: OFFER_WALL_IDS,
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
    errorMsg?: string,
    dedupeKey?: string,
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
        externalId: dedupeKey || resolvedTxid || `${provider}:noid:${Date.now()}`,
        userId: resolvedUserId,
        amount: resolvedAmount || "0",
        offerName: resolvedOfferName,
        status: logStatus,
      }).catch(() => {});
    }

    console.log(`[Postback] RESPOND ${httpStatus} — ${logStatus} (${ms}ms):`, JSON.stringify(payload));
    // Several networks require a short plain-text acknowledgement instead of
    // JSON. Keep JSON for internal/test providers and error responses.
    const providerSpec = POSTBACK_PARAM_SPECS[provider];
    if (providerSpec?.response === "ok" && httpStatus < 300) {
      const body = logStatus === "duplicate" && provider === "adswedmedia" ? "DUP" : "OK";
      return res.status(httpStatus).type("text/plain").send(body);
    }
    return res.status(httpStatus).json(payload);
  }

  try {
    // ── 1. Validate provider ────────────────────────────────────────────────
    if (!provider) {
      return respond(400, { success: false, message: "Provider required in URL: /api/postback/{provider}" },
        "failed", 0, "", "", "");
    }

    // ── 2. Authentication ───────────────────────────────────────────────────
    const spec = POSTBACK_PARAM_SPECS[provider];
    const expectedSecret = POSTBACK_SECRETS[provider];
    if (!spec || !(OFFER_WALL_IDS as readonly string[]).includes(provider)) {
      return respond(404, {
        success: false,
        message: "Unknown offerwall provider",
        supportedProviders: OFFER_WALL_IDS,
      }, "failed", 0, "", "", "", "unknown_provider");
    }
    if (!expectedSecret) {
      console.error(`[Postback][${provider}] Provider secret is not configured`);
      return respond(503, {
        success: false,
        message: "Offerwall provider is not configured",
      }, "failed", 0, "", "", "", "provider_not_configured");
    }

    if (spec.auth === "md5") {
      if (!verifyProviderMd5Signature(expectedSecret, params, spec)) {
        console.error(`[Postback][${provider}] MD5 signature mismatch`);
        return respond(401, { success: false, message: "Invalid postback signature" },
          "failed", 0, "", "", "", "signature_mismatch");
      }
    } else if (spec.auth === "sha256") {
      if (!verifyProviderSha256Signature(expectedSecret, params, spec)) {
        console.error(`[Postback][${provider}] SHA-256 signature mismatch`);
        return respond(401, { success: false, message: "Invalid postback signature" },
          "failed", 0, "", "", "", "signature_mismatch");
      }
    } else {
      const token = extractToken(params, spec);
      if (!token) {
        console.error(`[Postback][${provider}] Missing auth token/password`);
        return respond(401, { success: false, message: "Authentication token/password required" },
          "failed", 0, "", "", "", "missing_token");
      }
      if (!constantTimeEqual(token, expectedSecret)) {
        console.error(`[Postback][${provider}] Token mismatch. Got: ${token.substring(0, 4)}***`);
        return respond(401, { success: false, message: "Invalid authentication token/password" },
          "failed", 0, "", "", "", "invalid_token");
      }
    }
    console.log(`[Postback][${provider}] Auth OK (${spec.auth})`);

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
    const isChargeback = CHARGEBACK_STATUSES.has(statusNorm);
    if (statusNorm !== "" && !COMPLETED_STATUSES.has(statusNorm) && !isChargeback) {
      console.log(`[Postback][${provider}] Status "${statusRaw}" is not a completed or chargeback value — skipping`);
      return respond(200, {
        success: true,
        message: `Postback received but status "${statusRaw}" is not a completed state — skipped`,
        receivedStatus: statusRaw,
        acceptedValues: [...Array.from(COMPLETED_STATUSES), ...Array.from(CHARGEBACK_STATUSES)],
      }, "failed", 0, "", "", "");
    }

    // ── 4. Extract user identifier ─────────────────────────────────────────
    const rawUserId = pick(params, [spec.user, ...USER_FIELDS]);
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
    // Taskwall distinguishes virtual currency (user_amount) from the USD
    // payout. Credit the virtual amount only; never silently substitute USD.
    const rawAmount = provider === "taskwall"
      ? pickNumeric(params, ["user_amount"])
      : pickNumeric(params, [spec.reward, ...REWARD_FIELDS]);

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
    // Use only the documented transaction field for providers that have one.
    // TaskWall has no transaction ID, so derive a stable id from the payload;
    // never use its callback password as an idempotency key.
    let rawTxid = spec.transaction ? pick(params, [spec.transaction]) : "";
    if (!rawTxid && spec.transaction) rawTxid = pick(params, TXID_FIELDS);
    if (!rawTxid || rawTxid === "0" || rawTxid === "auto-id" || /^[\[{]/.test(rawTxid)) {
      rawTxid = buildDeterministicEventId(provider, params);
    }
    const txid = rawTxid;
    const eventKey = isChargeback ? `${txid}:chargeback` : txid;

    // ── 7. Extract offer name ──────────────────────────────────────────────
    const offerName = pick(params, OFFER_NAME_FIELDS);

    // ── 8. Offer / campaign ID ─────────────────────────────────────────────
    const offerId = pick(params, ["offerId", "offer_id", "company_id", "campaign_id", "app_id"]);

    console.log(`[Postback][${provider}] Parsed → user="${rawUserId}" amount=${reward} txid="${txid}" offer="${offerName}"`);

    // ── 9. Duplicate check ────────────────────────────────────────────────
    const existing = await db.checkPostbackDuplicate(provider, eventKey);
    if (existing) {
      console.log(`[Postback][${provider}] DUPLICATE txid=${txid} — processed at ${existing.createdAt}`);
      return respond(200, {
        success: true,
        message: "Duplicate transaction — already processed",
        duplicate: true,
        originalTimestamp: existing.createdAt,
      }, "duplicate", 0, rawAmount, txid, offerName, undefined, eventKey);
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
      if (provider === "taskwall") {
        console.error(`[Postback][taskwall] TASKWALL_USER_NOT_FOUND userid="${rawUserId}"`);
      } else {
        console.error(`[Postback][${provider}] User NOT FOUND for identifier: "${rawUserId}"`);
      }
      await respond(400, {
        success: false,
        message: "User not found",
        identifier: rawUserId,
        hint: "The value passed in the user field must match a registered username (case-insensitive).",
      }, "failed", 0, rawAmount, txid, offerName, "user_not_found");
      return res; // already responded
    }

    // ── 11. Credit user (wrapped — critical path) ─────────────────────────
    const balanceDelta = isChargeback ? -reward : reward;
    console.log(`[Postback][${provider}] ${isChargeback ? "Reversing" : "Crediting"} $${reward.toFixed(2)} ${isChargeback ? "from" : "to"} ${user.username} (id=${user.id})`);

    try {
      await db.addBalance(user.id, balanceDelta);
      console.log(`[Postback][${provider}] Balance updated OK`);
    } catch (err: any) {
      console.error(`[Postback][${provider}] CRITICAL: addBalance FAILED:`, err?.message);
      console.error(`[Postback] DATABASE_URL present:`, !!process.env.DATABASE_URL);
      await respond(500, {
        success: false,
        message: isChargeback ? "Failed to reverse reward — database error" : "Failed to credit user — database error",
        error: err?.message,
        hint: "Check DATABASE_URL env var and run migrations (0002_add_wallet_offer_notifications.sql)",
      }, "failed", user.id, rawAmount, txid, offerName, err?.message);
      return res;
    }

    // ── 12. Non-critical side-effects (fire and log, never crash) ─────────
    const creditLabel = offerName ? `[${provider}] ${offerName}` : `[${provider}] Offer`;

    if (isChargeback) {
      await Promise.allSettled([
        db.addWalletTransaction({
          userId: user.id,
          type: "debit",
          amount: reward.toFixed(2),
          description: `Reward reversed $${reward.toFixed(2)} on ${provider}${offerName ? ` — ${offerName}` : ""}`,
          source: provider,
        }),
        db.addOfferHistory({
          userId: user.id,
          provider,
          offerName: offerName || undefined,
          amount: reward.toFixed(2),
          externalId: eventKey,
          status: "failed",
        }),
        db.addNotification({
          userId: user.id,
          title: `Reward Reversed: $${reward.toFixed(2)}`,
          message: `A ${provider} reward${offerName ? ` — ${offerName}` : ""} was reversed. Your balance was adjusted.`,
          type: "reward",
          isRead: 0,
        }),
      ]);
    } else {
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
          externalId: eventKey,
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
    }

    // ── 13. SSE real-time push ────────────────────────────────────────────
    try {
      sseManager.sendPostbackEvent(user.id, {
        type: "postback",
        provider,
        amount: balanceDelta,
        offerName: isChargeback ? (offerName ? `Chargeback — ${offerName}` : "Chargeback") : (offerName || "Offer"),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn(`[Postback][${provider}] SSE send failed (non-critical):`, e);
    }

    // ── 14. Success ────────────────────────────────────────────────────────
    console.log(`[Postback][${provider}] ✅ SUCCESS — $${reward.toFixed(2)} credited to ${user.username}`);
    return respond(200, {
      success: true,
      message: isChargeback
        ? `Reversed $${reward.toFixed(2)} from ${user.username}`
        : `Credited $${reward.toFixed(2)} to ${user.username}`,
      data: {
        userId: user.id,
        username: user.username,
        amount: balanceDelta.toFixed(2),
        provider,
        offerName,
        txid,
        offerId,
        eventType: isChargeback ? "chargeback" : "credit",
      },
    }, "processed", user.id, rawAmount, txid, offerName, undefined, eventKey);

  } catch (error: any) {
    console.error(`[Postback][${provider}] FATAL:`, error?.message, error?.stack);
    return respond(500, {
      success: false,
      message: "Internal server error",
      error: error?.message || "Unknown error",
    }, "failed", 0, "", "", "", error?.message);
  }
}
