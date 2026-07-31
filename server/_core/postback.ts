import { Express, Request, Response } from "express";
import * as crypto from "crypto";
import * as db from "../db";
import { POSTBACK_SECRETS } from "../routers";
import { sseManager } from "./sse";

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

// Tất cả provider dùng ?token= plain-match
const TOKEN_AUTH_PROVIDERS = new Set([
  "cointo", "revtoo", "gemiwall", "taskwall",
  "adswedmedia", "clickwall", "klink", "moustache",
]);

// Không provider nào hiện tại dùng HMAC (để trống, giữ lại cho tương lai)
const HMAC_PROVIDERS = new Set<string>([]);

/**
 * Xác minh HMAC signature (dự phòng tương lai)
 */
function verifyHmacSignature(
  provider: string,
  secret: string,
  params: Record<string, any>,
  signature: string
): boolean {
  if (!signature) return false;
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "signature")
    .sort();
  const message = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
  const expected = crypto.createHmac("sha256", secret).update(message).digest("hex");
  console.log(`[Postback][${provider}] HMAC message: ${message}`);
  console.log(`[Postback][${provider}] HMAC expected: ${expected}, got: ${signature}`);
  return expected === signature;
}

export function registerPostbackRoutes(app: Express) {
  // Health/info endpoint - GET /api/postback returns JSON instead of SPA HTML
  app.get("/api/postback", (req, res) => {
    const providers = Object.keys(POSTBACK_SECRETS).map(p => ({
      name: p,
      authMethod: HMAC_PROVIDERS.has(p) ? "hmac-sha256" : "token-query-param",
      hasSecret: !!POSTBACK_SECRETS[p],
    }));
    return res.json({
      success: true,
      message: "RewardsVerse Postback API",
      endpoints: {
        "GET  /api/postback": "This health endpoint",
        "POST /api/postback/:provider": "Primary postback handler",
        "GET  /api/postback/:provider": "Fallback for GET callbacks",
      },
      supportedProviders: providers,
      docs: "Auth: moustache uses HMAC-SHA256 ?signature=; all others use plain ?token= match. Klink uses POST JSON.",
    });
  });

  // POST endpoint - primary method for providers
  app.post("/api/postback/:provider", handlePostback);

  // GET endpoint - fallback for providers that use GET callbacks
  app.get("/api/postback/:provider", handlePostback);
}

/**
 * Main postback handler - works for both GET and POST
 * Logs everything: request, query, body, provider, user ID, amount, token, errors
 */
async function handlePostback(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  const remoteIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  try {
    const provider = req.params.provider?.toLowerCase();
    // Merge query + body into a single lookup object for parameter resolution
    const params = { ...req.query, ...req.body };

    const token = params.token as string || "";

    // ===== Helper: chỉ lấy giá trị nếu parse được thành số dương =====
    function pickNumeric(...candidates: (string | undefined)[]): string {
      for (const v of candidates) {
        if (!v) continue;
        const n = Number(v);
        if (!isNaN(n) && n > 0) return v;
      }
      return "";
    }

    // User identification: accept all common parameter names per provider
    // - klink (GET query):  subId=  (camelCase, từ URL template Klink)
    // - klink (POST JSON):  userId= (camelCase trong body)
    // - revtoo / clickwall / moustache: user_id=
    // - gemiwall:    sub_id=
    // - taskwall:    userid=  (lowercase)
    // - adswedmedia: sub=    (1 chữ)
    const userId = (
      params.subId as string ||        // klink GET query (subId camelCase)
      params.userId as string ||       // klink POST JSON body
      params.user_id as string ||      // revtoo, clickwall, moustache
      params.userid as string ||       // taskwall (lowercase)
      params.sub_id as string ||       // gemiwall
      params.sub as string ||          // adswedmedia (1 chữ)
      params.subid as string ||        // generic lowercase
      params.username as string ||     // generic fallback
      params.openId as string ||
      params.open_id as string || ""
    );

    // Offer ID
    const offerId = (
      params.offerId as string || params.offer_id as string ||
      params.company_id as string || params.campaign_id as string || ""
    );

    // Transaction ID: accept all common parameter names per provider
    // - klink (GET query): transId= (camelCase, từ URL template Klink)
    // - klink (POST JSON): conversionId=
    // - revtoo / clickwall / moustache: transaction_id=
    // - gemiwall: uuid=
    // - taskwall: password=
    // - adswedmedia: transid=
    const rawTransId = (
      params.transId as string ||         // klink GET query (camelCase)
      params.conversionId as string ||    // klink POST JSON
      params.transaction_id as string ||  // revtoo, clickwall, moustache
      params.transactionId as string ||   // camelCase fallback
      params.transid as string ||         // adswedmedia
      params.uuid as string ||            // gemiwall
      params.password as string ||        // taskwall
      params.externalId as string ||
      params.external_id as string ||
      params.txid as string || ""
    );

    // Adswed transid auto-generated = "auto-id" hoặc trống → fallback unique
    const isAutoTransId = !rawTransId || rawTransId === "auto-id" || rawTransId === "0";
    const externalId = isAutoTransId
      ? `${provider}:${userId || "u"}:${offerId || "o"}:${Date.now()}`
      : rawTransId;

    const effectiveExternalId = externalId || (offerId ? `${provider}:${offerId}` : "");

    // Reward amount: ưu tiên theo provider để tránh nhận sai field
    // Klink gửi cả reward= VÀ payout= trong cùng 1 request
    // → Klink dùng payout= (reward= là tên offer wall nội bộ, không phải số tiền)
    // → Các provider khác dùng reward= trước payout=
    // Dùng pickNumeric() để bỏ qua các giá trị không parse được thành số (VD: template chưa fill)
    let amount: string;
    if (provider === "klink" || provider === "clickwall" || provider === "moustache") {
      // provider dùng payout= là field chính
      amount = pickNumeric(
        params.payout as string,
        params.reward as string,
        params.reward_value as string,
        params.amount as string,
        params.user_amount as string,
      );
    } else {
      // revtoo, gemiwall, taskwall, adswedmedia, cointo dùng reward= là field chính
      amount = pickNumeric(
        params.reward as string,
        params.payout as string,
        params.reward_value as string,
        params.round_reward as string,
        params.amount as string,
        params.user_amount as string,
      );
    }

    // Offer name
    const offerName = params.offerName as string || params.offer_name as string || "";

    // Additional provider-specific fields
    // QUAN TRỌNG: openId chỉ dùng khi param thực sự là openId (Manus OAuth user)
    // Không nhầm với userId đã được extract ở trên
    const openId = params.openId as string || params.open_id as string || "";
    const payout = params.payout as string || "";
    const username = params.username as string || "";
    const status = params.status as string || "";
    const signature = params.signature as string || "";
    const debug = params.debug as string || "";
    const offerType = params.offer_type as string || params.offerType as string || "";
    const userIp = params.userIp as string || params.user_ip as string || params.ip_address as string || "";
    const country = params.country as string || "";
    const appId = params.app_id as string || params.app_name as string || "";
    const currencyName = params.currency_name as string || "";
    const companyId = params.company_id as string || params.campaign_id as string || "";
    const uuid = params.uuid as string || "";
    const eventId = params.event_id as string || "";
    const eventName = params.event_name as string || "";
    const date = params.date as string || "";

    // ===== DETAILED LOG: Request received =====
    console.log(`[Postback] ===== POSTBACK REQUEST RECEIVED =====`);
    console.log(`[Postback] Time:       ${timestamp}`);
    console.log(`[Postback] IP:         ${remoteIp}`);
    console.log(`[Postback] Method:     ${req.method}`);
    console.log(`[Postback] URL:        ${req.originalUrl}`);
    console.log(`[Postback] Provider:   ${provider}`);
    console.log(`[Postback] Token:      ${token ? "***MASKED***" : "EMPTY"}`);
    console.log(`[Postback] Signature:  ${signature ? signature.substring(0, 8) + "***" : "EMPTY"}`);
    console.log(`[Postback] Query:      ${JSON.stringify(req.query)}`);
    console.log(`[Postback] Body:       ${JSON.stringify(req.body)}`);
    console.log(`[Postback] Parsed:     userId=${userId}, amount=${amount}, externalId=${effectiveExternalId}, offerName=${offerName}, openId=${openId}, payout=${payout}, username=${username}, status=${status}, offerId=${offerId}, offerType=${offerType}, debug=${debug}, companyId=${companyId}, userIp=${userIp}, country=${country}`);

    // ===== Validate provider =====
    if (!provider) {
      console.error(`[Postback] ERROR: Missing provider in URL path`);
      return res.status(400).json({ success: false, message: "Provider is required in URL path (e.g., /api/postback/gemiwall)" });
    }

    // ===== Validate & authenticate by provider auth method =====
    const expectedSecret = POSTBACK_SECRETS[provider];
    if (!expectedSecret) {
      console.error(`[Postback] ERROR: Unknown provider "${provider}". Known providers: ${Object.keys(POSTBACK_SECRETS).join(", ")}`);
      return res.status(400).json({ success: false, message: `Unknown provider: ${provider}` });
    }

    if (HMAC_PROVIDERS.has(provider)) {
      // moustache / klink: xác thực bằng HMAC-SHA256 signature
      if (!verifyHmacSignature(provider, expectedSecret, params, signature)) {
        console.error(`[Postback] ERROR: Invalid HMAC signature for provider "${provider}"`);
        return res.status(401).json({ success: false, message: "Invalid HMAC signature" });
      }
      console.log(`[Postback] HMAC signature verified OK for provider: ${provider}`);
    } else {
      // cointo / revtoo / gemiwall / taskwall / adswedmedia / clickwall / klink:
      // Xác thực bằng ?token= plain-match
      // Klink gửi POST JSON — token có thể nằm trong body hoặc query string
      if (!token) {
        console.error(`[Postback] ERROR: Missing token for provider "${provider}"`);
        return res.status(401).json({ success: false, message: "Authentication token is required (use ?token=YOUR_SECRET)" });
      }
      if (token !== expectedSecret) {
        console.error(`[Postback] ERROR: Invalid token for provider "${provider}". Expected: ${expectedSecret.substring(0, 4)}***, Got: ${token.substring(0, 4)}***`);
        return res.status(401).json({ success: false, message: "Invalid authentication token" });
      }
      console.log(`[Postback] Token verified OK for provider: ${provider}`);
    }

    // ===== Validate required fields =====
    if (!amount) {
      console.error(`[Postback] ERROR: Missing amount for provider "${provider}". All params: ${JSON.stringify(params)}`);
      return res.status(400).json({ success: false, message: "Amount is required" });
    }
    if (!effectiveExternalId) {
      console.error(`[Postback] ERROR: Missing externalId/transactionId for provider "${provider}". All params: ${JSON.stringify(params)}`);
      return res.status(400).json({ success: false, message: "externalId or transaction_id is required" });
    }

    // Must have either userId, username, or openId
    if (!userId && !openId && !username) {
      console.error(`[Postback] ERROR: Neither userId, username, nor openId provided for provider "${provider}". All params: ${JSON.stringify(params)}`);
      return res.status(400).json({ success: false, message: "userId, username, or openId is required" });
    }

    // ===== Validate amount =====
    const reward = Number(amount) || 0;
    if (isNaN(reward) || reward <= 0) {
      console.error(`[Postback] ERROR: Invalid amount: "${amount}" (payout="${payout}") for provider "${provider}"`);
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    console.log(`[Postback] Amount validated: $${reward.toFixed(2)}`);

    // ===== Check for duplicate (idempotency) =====
    const existing = await db.checkPostbackDuplicate(provider, String(effectiveExternalId));
    if (existing) {
      console.log(`[Postback] DUPLICATE: provider=${provider}, externalId=${effectiveExternalId} - already processed at ${existing.createdAt?.toISOString() || "unknown"}`);
      return res.json({ success: true, message: "Duplicate postback ignored", duplicate: true });
    }
    console.log(`[Postback] No duplicate found for ${provider}/${effectiveExternalId}`);

    // ===== Find user =====
    // Thứ tự tìm kiếm:
    // 1. openId (chỉ dùng khi provider gửi openId thực — Manus OAuth user)
    // 2. userId → tìm theo username (vì offer wall URL đặt username vào sub/user_id field)
    // 3. username field riêng biệt
    // 4. Thử cả userId như openId (phòng trường hợp provider gửi openId trong user_id field)
    let user = null;

    // 1. Thử openId (chỉ khi param openId / open_id tồn tại riêng)
    if (openId && openId !== userId) {
      user = await db.getUserByOpenId(String(openId));
      if (user) {
        console.log(`[Postback] User FOUND by openId: ${openId} → userId=${user.id}, username=${user.username}`);
      }
    }

    // 2. Thử userId as username (offer wall truyền username vào các field sub/user_id/userid/sub_id)
    if (!user && userId) {
      user = await db.getUserByUsername(String(userId));
      if (user) {
        console.log(`[Postback] User FOUND by username lookup (userId field): ${userId} → dbId=${user.id}`);
      }
    }

    // 3. Thử username field rõ ràng
    if (!user && username && username !== userId) {
      user = await db.getUserByUsername(String(username));
      if (user) {
        console.log(`[Postback] User FOUND by username field: ${username} → dbId=${user.id}`);
      }
    }

    // 4. Thử userId như openId (phòng trường hợp provider gửi openId trong user_id)
    if (!user && userId) {
      user = await db.getUserByOpenId(String(userId));
      if (user) {
        console.log(`[Postback] User FOUND by openId fallback (userId field): ${userId} → dbId=${user.id}`);
      }
    }

    if (!user) {
      console.error(`[Postback] ERROR: User NOT FOUND for provider "${provider}"`);
      console.error(`[Postback]   Searched: openId="${openId}", userId="${userId}", username="${username}"`);
      await db.logPostback({
        provider,
        externalId: String(effectiveExternalId),
        userId: 0,
        amount: reward.toFixed(2),
        offerName: offerName || "",
        status: "failed",
      });
      return res.status(404).json({ success: false, message: "User not found", details: { openId, userId, username } });
    }

    console.log(`[Postback] User resolved: id=${user.id}, username=${user.username}, currentBalance=${user.balance}`);

    // ===== Credit the user =====
    // QUAN TRỌNG: addBalance là critical — nếu fail thì trả 500, KHÔNG cộng tiền rồi bỏ qua
    console.log(`[Postback] Crediting $${reward.toFixed(2)} + 15 XP to user ${user.username} (id=${user.id})`);

    try {
      await db.addBalance(user.id, reward);
      console.log(`[Postback] Balance updated OK`);
    } catch (err: any) {
      console.error(`[Postback] CRITICAL: addBalance FAILED for user ${user.id}:`, err?.message || err);
      console.error(`[Postback] DATABASE_URL set?`, !!process.env.DATABASE_URL);
      // Ghi log postback với status=failed để dễ debug
      await db.logPostback({
        provider,
        externalId: String(effectiveExternalId),
        userId: user.id,
        amount: reward.toFixed(2),
        offerName: offerName || "",
        status: "failed",
      }).catch(() => {});
      return res.status(500).json({
        success: false,
        message: "Failed to credit user balance — DB error",
        error: err?.message || String(err),
        hint: "Check server logs. Possible causes: DATABASE_URL not set, DB connection failed, or missing migration.",
      });
    }

    try {
      await db.addXP(user.id, 15);
      console.log(`[Postback] XP updated OK`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to update XP:`, err);
    }

    try {
      await db.incrementOffers(user.id);
      console.log(`[Postback] Offers count incremented OK`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to increment offers:`, err);
    }

    // ===== Add earning record =====
    const source = offerName ? `[${provider}] ${offerName}` : `[${provider}] Offer`;
    try {
      await db.addEarning({
        userId: user.id,
        amount: reward.toFixed(2),
        type: "offer",
        source,
      });
      console.log(`[Postback] Earning record added: ${source} = $${reward.toFixed(2)}`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to add earning record:`, err);
    }

    // ===== Add activity record =====
    try {
      await db.addActivity({
        userId: user.id,
        username: user.username || "User",
        type: "offer_complete",
        description: `earned $${reward.toFixed(2)} on ${provider} - ${offerName || "Offer"}`,
        amount: reward.toFixed(2),
      });
      console.log(`[Postback] Activity record added`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to add activity record:`, err);
    }

    // ===== Add wallet transaction =====
    try {
      await db.addWalletTransaction({
        userId: user.id,
        type: "credit",
        amount: reward.toFixed(2),
        description: `Earned $${reward.toFixed(2)} on ${provider} - ${offerName || "Offer"}`,
        source: provider,
      });
      console.log(`[Postback] Wallet transaction added`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to add wallet transaction:`, err);
    }

    // ===== Add offer history =====
    try {
      await db.addOfferHistory({
        userId: user.id,
        provider,
        offerName: offerName || undefined,
        amount: reward.toFixed(2),
        externalId: String(effectiveExternalId),
        status: "completed",
      });
      console.log(`[Postback] Offer history added`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to add offer history:`, err);
    }

    // ===== Add notification =====
    try {
      await db.addNotification({
        userId: user.id,
        title: `Reward Received: $${reward.toFixed(2)}`,
        message: `You earned $${reward.toFixed(2)} on ${provider}${offerName ? ` for "${offerName}"` : ""}. Your balance has been updated.`,
        type: "reward",
        isRead: 0,
      });
      console.log(`[Postback] Notification added`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to add notification:`, err);
    }

    // ===== Update leaderboard =====
    try {
      const updatedUser = await db.getUserById(user.id);
      if (updatedUser && updatedUser.username) {
        await db.updateLeaderboard(user.id, updatedUser.username, parseFloat(updatedUser.totalEarned || "0"));
        console.log(`[Postback] Leaderboard updated`);
      }
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to update leaderboard:`, err);
    }

    // ===== Log the postback =====
    try {
      await db.logPostback({
        provider,
        externalId: String(effectiveExternalId),
        userId: user.id,
        amount: reward.toFixed(2),
        offerName: offerName || "",
        status: "processed",
      });
      console.log(`[Postback] Postback log saved`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to save postback log:`, err);
    }

    // ===== Send real-time SSE event =====
    try {
      sseManager.sendPostbackEvent(user.id, {
        type: "postback",
        provider,
        amount: reward,
        offerName: offerName || "Offer",
        timestamp: new Date().toISOString(),
      });
      console.log(`[Postback] SSE event sent to user ${user.id}`);
    } catch (err) {
      console.error(`[Postback] ERROR: Failed to send SSE event:`, err);
    }

    // ===== SUCCESS =====
    console.log(`[Postback] ===== SUCCESS =====`);
    console.log(`[Postback] User: ${user.username} (id=${user.id})`);
    console.log(`[Postback] Earned: $${reward.toFixed(2)}`);
    console.log(`[Postback] Provider: ${provider}`);
    console.log(`[Postback] Offer: ${offerName || "N/A"}`);
    console.log(`[Postback] ExternalId: ${effectiveExternalId}`);
    console.log(`[Postback] =========================`);

    return res.json({
      success: true,
      message: `Credited $${reward.toFixed(2)} to ${user.username}`,
      data: {
        userId: user.id,
        username: user.username,
        amount: reward.toFixed(2),
        provider,
        offerName,
        offerId,
        offerType,
        externalId: effectiveExternalId,
        status,
        debug,
      },
    });
  } catch (error: any) {
    console.error(`[Postback] ===== FATAL ERROR =====`);
    console.error(`[Postback] Time: ${timestamp}`);
    console.error(`[Postback] IP: ${remoteIp}`);
    console.error(`[Postback] URL: ${req.originalUrl}`);
    console.error(`[Postback] Error: ${error?.message || error}`);
    console.error(`[Postback] Stack: ${error?.stack || "N/A"}`);
    console.error(`[Postback] =========================`);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || "Unknown error",
    });
  }
}
