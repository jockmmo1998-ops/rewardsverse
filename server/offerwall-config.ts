import { createHash } from "crypto";

/**
 * Runtime configuration for every RewardsVerse offerwall.
 *
 * Provider keys, placement values and callback secrets deliberately come from
 * deployment environment variables. Never put real values in client code or
 * commits.
 */

type OfferWallUrlBuilder = (userId: string) => string | null;

export type PostbackAuth = "none" | "token" | "md5" | "sha256" | "hmac_sha1";
export type PostbackResponse = "json" | "ok" | "dup";

export type PostbackParamSpec = {
  /** The provider field used for the user's identifier. */
  user: string;
  /** The provider field that represents the amount credited to the user. */
  reward: string;
  /** A stable provider transaction field, or null when the provider has none. */
  transaction: string | null;
  /** How the callback is authenticated. */
  auth: PostbackAuth;
  /** Provider response contract for successful and duplicate callbacks. */
  response: PostbackResponse;
  /** Provider fields to include in the generated GET callback template. */
  macros: string[];
  /** Token/password field names when auth is token based. */
  authFields?: string[];
};

const env = (...names: string[]): string => {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
};

const encodedUserId = (userId: string): string => encodeURIComponent(userId);

/**
 * TimeWall's publisher portal provides a direct-link handler for reward-site
 * profile entry. It is not a username/password login flow: TimeWall maps the
 * reward-site user from `uid` and the publisher placement from `oid`.
 */
export function buildTimewallProfileUrl(userId: string): string | null {
  const placementId = env("TIMEWALL_PLACEMENT_ID");
  const normalizedUserId = userId.trim();
  if (!placementId || !normalizedUserId) return null;

  const url = new URL("https://timewall.io/users/login");
  url.searchParams.set("oid", placementId);
  url.searchParams.set("uid", normalizedUserId);
  return url.toString();
}

function appendUserId(baseUrl: string, userId: string): string | null {
  if (!baseUrl) return null;
  try {
    const url = new URL(baseUrl);
    // Keep the configured URL flexible while making the user mapping explicit.
    url.searchParams.set("user_id", userId);
    return url.toString();
  } catch {
    return null;
  }
}

export const OFFER_WALL_IDS = [
  "gemiwall",
  "revtoo",
  "gleamads",
  "moustache",
  "taskwall",
  "cointo",
  "klink",
  "adswedmedia",
  "admaxflow",
  "gaintwall",
  "buckswall",
  "offermintx",
  "cpxresearch",
  "theoremreach",
  "timewall",
  "pocketsfull",
] as const;

export const OFFER_WALL_LABELS: Record<string, string> = {
  gemiwall: "Gemiwall",
  revtoo: "Revtoo",
  gleamads: "GleamAds",
  moustache: "MoustacheLeads",
  taskwall: "Taskwall",
  cointo: "CoinToMedia",
  klink: "Klink Finance",
  adswedmedia: "AdsWedMedia",
  admaxflow: "AdMaxFlow",
  gaintwall: "Gaintwall",
  buckswall: "BucksWall",
  offermintx: "OfferMintX",
  cpxresearch: "CPX Research",
  theoremreach: "TheoremReach",
  timewall: "TimeWall",
  pocketsfull: "PocketFull",
};

export const OFFER_WALL_URLS: Record<string, OfferWallUrlBuilder> = {
  gemiwall: (userId) => {
    const legacyPlacement = env("GEMIWALL_PLACEMENT_ID");
    const base = env("GEMIWALL_OFFERWALL_URL") || (legacyPlacement ? `https://gemiwall.com/${encodeURIComponent(legacyPlacement)}` : "https://gemiwall.com/6987046ad95123da06330801");
    return `${base.replace(/\/$/, "")}/${encodedUserId(userId)}/`;
  },
  // Revtoo calls this value an API key in its current web integration docs.
  // REVTOO_PLACEMENT_ID is kept for backwards compatibility with Render.
  revtoo: (userId) => {
    const legacyKey = env("REVTOO_API_KEY", "REVTOO_PLACEMENT_ID");
    const base = env("REVTOO_OFFERWALL_URL") || (legacyKey ? `https://revtoo.com/offerwall/${encodeURIComponent(legacyKey)}` : "https://revtoo.com/offerwall/7y9n22mjsz0c3ujyncuomz95k6p31p");
    return `${base.replace(/\/$/, "")}/${encodedUserId(userId)}`;
  },
  gleamads: (userId) => {
    const apiKey = env("GLEAMADS_API_KEY");
    if (!apiKey) return null;
    // GleamAds requires API key and user ID as path segments. The old query
    // form (/offerwall?apiKey=...&userId=...) returns its 404 page.
    const base = env("GLEAMADS_OFFERWALL_URL") || "https://gleamads.com/offerwall";
    return `${base.replace(/\/$/, "")}/${encodeURIComponent(apiKey)}/${encodedUserId(userId)}`;
  },
  moustache: (userId) => {
    const placement = env("MOUSTACHE_PLACEMENT_ID") || "ZVtFVRbd5DyrjELq";
    const apiKey = env("MOUSTACHE_API_KEY");
    const url = new URL(env("MOUSTACHE_OFFERWALL_URL") || "https://offerwall.moustacheleads.com/offerwall");
    url.searchParams.set("placement_id", placement);
    url.searchParams.set("user_id", userId);
    if (apiKey) url.searchParams.set("api_key", apiKey);
    return url.toString();
  },
  taskwall: (userId) => {
    const appId = env("TASKWALL_APP_ID") || "0640f51b6a17749572b508423c387b00";
    return `https://wall.taskwall.io/?app_id=${encodeURIComponent(appId)}&userid=${encodedUserId(userId)}`;
  },
  // Cointo calls the path segment a Public Key/site key in its current docs.
  cointo: (userId) => {
    const legacyKey = env("COINTO_PUBLIC_KEY", "COINTO_PLACEMENT_ID");
    const base = env("COINTO_OFFERWALL_URL") || (legacyKey ? `https://cointomedia.com/offer/${encodeURIComponent(legacyKey)}` : "https://cointomedia.com/offer/Po5Qt6");
    return `${base.replace(/\/$/, "")}/${encodedUserId(userId)}`;
  },
  klink: (userId) => {
    const publisherId = env("KLINK_PUBLISHER_ID") || "b4f89770-d4da-42c1-8fee-03303dd14401";
    return `https://offerwall.klinkfinance.com/wall?pub_id=${encodeURIComponent(publisherId)}&user_id=${encodedUserId(userId)}`;
  },
  // AdswedMedia calls the path segment a Public Key/site key.
  adswedmedia: (userId) => {
    const legacyKey = env("ADSWEDMEDIA_PUBLIC_KEY", "ADSWEDMEDIA_PLACEMENT_ID");
    const base = env("ADSWEDMEDIA_OFFERWALL_URL") || (legacyKey ? `https://adswedmedia.com/offer/${encodeURIComponent(legacyKey)}` : "https://adswedmedia.com/offer/Ao6Po6");
    return `${base.replace(/\/$/, "")}/${encodedUserId(userId)}`;
  },
  admaxflow: (userId) => {
    const placement = env("ADMAXFLOW_PLACEMENT_ID") || "143";
    const url = new URL(env("ADMAXFLOW_OFFERWALL_URL") || "https://admaxflow.com/offerwall.php");
    url.searchParams.set("placement_id", placement);
    url.searchParams.set("user_id", userId);
    return url.toString();
  },
  gaintwall: (userId) => {
    const apiKey = env("GAINTWALL_API_KEY", "GAINTWALL_PLACEMENT_KEY");
    if (!apiKey) return null;
    const url = new URL("https://gaintwall.com/offerwall");
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("userId", userId);
    return url.toString();
  },
  buckswall: (userId) => appendUserId(env("BUCKSWALL_OFFERWALL_URL") || "https://buckswall.com/offerwall.php?placement_id=78", userId),
  offermintx: (userId) => {
    const placementId = env("OFFERMINTX_PLACEMENT_ID") || "42";
    const url = new URL(env("OFFERMINTX_OFFERWALL_URL") || "https://offermintx.com/offerwall.php");
    url.searchParams.set("placement_id", placementId);
    url.searchParams.set("user_id", userId);
    return url.toString();
  },
  cpxresearch: (userId) => {
    const appId = env("CPX_APP_ID") || "35865";
    const url = new URL(env("CPX_OFFERWALL_URL") || "https://offers.cpx-research.com/index.php");
    url.searchParams.set("app_id", appId);
    url.searchParams.set("ext_user_id", userId);
    const secureHash = env("CPX_APP_SECURE_HASH");
    if (secureHash) url.searchParams.set("secure_hash", createHash("md5").update(`${userId}-${secureHash}`).digest("hex"));
    return url.toString();
  },
  theoremreach: (userId) => {
    const apiKey = env("THEOREMREACH_API_KEY");
    if (!apiKey) return null;
    const url = new URL(env("THEOREMREACH_OFFERWALL_URL") || "https://theoremreach.com/respondent_entry/direct");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("user_id", userId);
    url.searchParams.set("transaction_id", `${userId}-${Date.now()}`);
    return url.toString();
  },
  timewall: (userId) => buildTimewallProfileUrl(userId),
  pocketsfull: (userId) => {
    const appId = env("POCKETSFULL_APP_ID") || "723";
    const appKey = env("POCKETSFULL_APP_KEY") || "eadf1b09-02b0-4e05-a10b-b2751982e9e6";
    const url = new URL("https://uf.pocketsfull.ai/earn");
    url.searchParams.set("appId", appId);
    url.searchParams.set("key", appKey);
    url.searchParams.set("uid", userId);
    return url.toString();
  },
};

const secretEntries: Array<[string, string]> = [
  ["gemiwall", env("GEMIWALL_POSTBACK_SECRET")],
  ["revtoo", env("REVTOO_POSTBACK_SECRET")],
  // GleamAds has no postback token field; its placement uses source-IP validation.
  ["gleamads", ""],
  ["moustache", env("MOUSTACHE_POSTBACK_SECRET")],
  ["taskwall", env("TASKWALL_POSTBACK_SECRET")],
  ["cointo", env("COINTO_POSTBACK_SECRET")],
  ["klink", env("KLINK_POSTBACK_SECRET")],
  ["adswedmedia", env("ADSWEDMEDIA_POSTBACK_SECRET")],
  ["admaxflow", env("ADMAXFLOW_POSTBACK_SECRET")],
  ["gaintwall", env("GAINTWALL_POSTBACK_SECRET", "GAINTWALL_API_KEY", "GAINTWALL_PLACEMENT_KEY")],
  ["buckswall", env("BUCKSWALL_POSTBACK_SECRET")],
  ["offermintx", env("OFFERMINTX_POSTBACK_SECRET")],
  ["cpxresearch", env("CPX_APP_SECURE_HASH")],
  ["theoremreach", env("THEOREMREACH_SECRET_KEY")],
  ["timewall", env("TIMEWALL_POSTBACK_SECRET")],
  ["pocketsfull", env("POCKETSFULL_SECURITY_HASH")],
];

/** Only configured secrets are exposed to the postback handler. */
export const POSTBACK_SECRETS: Record<string, string> = Object.fromEntries(
  secretEntries.filter(([, secret]) => secret.length > 0),
);

/**
 * Provider-specific field names and GET macros.
 *
 * The three documented MD5 networks (Revtoo, Cointo and AdswedMedia) sign
 * `user + transaction + reward + secret`, so their callbacks use `subId`,
 * `transId`, `reward` and `signature` rather than the generic token query.
 */
export const POSTBACK_PARAM_SPECS: Record<string, PostbackParamSpec> = {
  gemiwall: {
    user: "sub_id",
    reward: "reward",
    transaction: "uuid",
    auth: "token",
    response: "json",
    macros: ["sub_id", "reward", "uuid", "offer_name", "offer_id", "status"],
  },
  revtoo: {
    user: "subId",
    reward: "reward",
    transaction: "transId",
    auth: "md5",
    response: "ok",
    macros: ["subId", "transId", "reward", "payout", "status", "offer_id", "offer_name", "userIp", "debug", "signature"],
  },
  gleamads: {
    // GleamAds uses the identifiers and macros documented by its placement:
    // subId, transId, reward, payout, userIp, country and status.
    user: "subId",
    reward: "reward",
    transaction: "transId",
    // GleamAds authenticates callbacks by source IP, not a query token.
    auth: "none",
    response: "json",
    macros: ["subId", "transId", "reward", "payout", "offer_name", "userIp", "country", "status"],
  },
  moustache: {
    user: "user_id",
    reward: "payout",
    transaction: "transaction_id",
    // MoustacheLeads' placement postback builder sends signed-free callbacks;
    // its API key is only used to authorize the iframe integration.
    auth: "none",
    response: "json",
    macros: ["user_id", "payout", "transaction_id", "offer_name", "status"],
  },
  taskwall: {
    user: "userid",
    reward: "user_amount",
    transaction: null,
    auth: "token",
    response: "json",
    // Taskwall sends both a fixed token and a password macro. The fixed
    // token is the endpoint credential and must be checked first.
    authFields: ["token", "password", "secret", "apikey", "api_key", "key"],
    macros: ["app_name", "userid", "password", "user_amount", "offer_name", "offer_id", "payout", "ip_address", "currency_name", "date"],
  },
  cointo: {
    user: "subId",
    reward: "reward",
    transaction: "transId",
    auth: "md5",
    response: "ok",
    macros: ["subId", "transId", "reward", "payout", "signature", "status", "company_id", "offer_name", "round_reward", "userIp", "country", "uuid", "event_id", "event_name"],
  },
  klink: {
    user: "userId",
    reward: "payout",
    transaction: "conversionId",
    auth: "token",
    response: "json",
    macros: ["userId", "payout", "conversionId", "offerName", "status", "eventType"],
  },
  adswedmedia: {
    user: "subId",
    reward: "reward",
    transaction: "transId",
    auth: "md5",
    response: "ok",
    // Canonical AdsWedMedia macros. The handler also accepts legacy sub/
    // transid and payout aliases when verifying the provider signature.
    macros: ["subId", "transId", "reward", "round_reward", "payout", "signature", "status", "userIp", "offer_id", "offer_name", "country", "uuid", "event_id", "event_name"],
  },
  admaxflow: {
    user: "subid1",
    reward: "payout",
    transaction: null,
    auth: "none",
    response: "json",
    macros: ["subid1", "payout", "currency_amount", "currency_name", "offer_name", "ip_address", "status", "subid2", "placement_id"],
  },
  gaintwall: {
    user: "userId",
    // RewardsVerse balances are denominated in USD. Gaintwall sends both
    // reward (virtual currency) and payout (USD); credit payout to avoid
    // turning a $2.80 conversion into 280.00 balance units.
    reward: "payout",
    transaction: "transactionId",
    auth: "sha256",
    response: "json",
    macros: ["user_id", "offer_id", "offer_name", "payout", "reward", "transaction_id", "status", "ip", "sub1", "sub2", "hash"],
  },
  buckswall: {
    user: "subid1",
    reward: "payout",
    transaction: null,
    auth: "none",
    response: "json",
    macros: ["subid1", "payout", "currency_amount", "currency_name", "offer_name", "ip_address", "status", "subid2", "event_id", "event_name"],
  },
  cpxresearch: {
    user: "user_id",
    reward: "amount_usd",
    transaction: "trans_id",
    auth: "md5",
    response: "json",
    macros: ["status", "trans_id", "user_id", "subid_1", "subid_2", "amount_local", "amount_usd", "offer_id", "hash", "ip_click", "type"],
  },
  theoremreach: {
    user: "user_id",
    reward: "currency",
    transaction: "tx_id",
    auth: "hmac_sha1",
    response: "json",
    macros: ["user_id", "reward", "currency", "tx_id", "hash", "reversal", "debug", "screenout", "profiler", "offer", "offer_name", "ip", "offer_id", "placement_id"],
  },
  timewall: {
    user: "userid",
    reward: "revenue",
    transaction: "txid",
    auth: "sha256",
    response: "json",
    macros: ["userid", "txid", "revenue", "currency", "hash", "ip", "type", "withdrawid", "reason", "offername", "offerdetail"],
  },
  pocketsfull: {
    // PocketFull app 723: hash is md5(trans_id-security_hash).
    user: "user_id",
    reward: "amount_usd",
    transaction: "trans_id",
    auth: "md5",
    response: "json",
    macros: ["status", "trans_id", "user_id", "amount_local", "amount_usd", "hash", "ip_click", "survey_id", "offer_id", "type", "subId1", "subId2"],
  },
  offermintx: {
    user: "subid1",
    reward: "payout",
    transaction: "conversion_id",
    auth: "token",
    response: "json",
    // OfferMintX documents both conversion_id and transactionId spellings.
    // Keep both in the generated callback for dashboard-version compatibility.
    macros: ["subid1", "payout", "reward", "currency_amount", "currency_name", "offer_name", "offer_id", "event_id", "click_id", "conversion_id", "transactionId", "status", "ip_address"],
  },
};

export const getPostbackUrl = (provider: string, baseUrl: string, secretOverride?: string): string | null => {
  const spec = POSTBACK_PARAM_SPECS[provider];
  const secret = secretOverride || POSTBACK_SECRETS[provider];
  if (!spec || !baseUrl || (spec.auth !== "none" && !secret)) return null;
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/api/postback/${provider}`);
  if (provider === "gaintwall") {
    url.searchParams.set("userId", "{user_id}");
    url.searchParams.set("offerId", "{offer_id}");
    url.searchParams.set("offerName", "{offer_name}");
    url.searchParams.set("payout", "{payout}");
    url.searchParams.set("reward", "{reward}");
    url.searchParams.set("transactionId", "{transaction_id}");
    url.searchParams.set("status", "{status}");
    url.searchParams.set("ip", "{ip}");
    url.searchParams.set("sub1", "{aff_sub}");
    url.searchParams.set("sub2", "{aff_sub2}");
    url.searchParams.set("hash", "{hash}");
    // Gaintwall's test and live callback engines require literal macro
    // delimiters and do not substitute %7Bmacro%7D/%7D.
    return url.toString().replace(/%7B/gi, "{").replace(/%7D/gi, "}");
  }
  if (provider === "cpxresearch") {
    url.searchParams.set("status", "{status}");
    url.searchParams.set("trans_id", "{trans_id}");
    url.searchParams.set("user_id", "{user_id}");
    url.searchParams.set("sub_id", "{subid_1}");
    url.searchParams.set("sub_id_2", "{subid_2}");
    url.searchParams.set("amount_local", "{amount_local}");
    url.searchParams.set("amount_usd", "{amount_usd}");
    url.searchParams.set("offer_id", "{offer_ID}");
    url.searchParams.set("hash", "{secure_hash}");
    url.searchParams.set("ip_click", "{ip_click}");
    url.searchParams.set("type", "{type}");
    return url.toString().replace(/%7B/gi, "{").replace(/%7D/gi, "}");
  }
  if (provider === "theoremreach") {
    url.searchParams.set("user_id", "{user_id}");
    url.searchParams.set("reward", "{reward}");
    url.searchParams.set("currency", "{currency}");
    url.searchParams.set("tx_id", "{tx_id}");
    url.searchParams.set("hash", "{hash}");
    url.searchParams.set("reversal", "{reversal}");
    url.searchParams.set("debug", "{debug}");
    url.searchParams.set("screenout", "{screenout}");
    url.searchParams.set("profiler", "{profiler}");
    url.searchParams.set("offer", "{offer}");
    url.searchParams.set("offer_name", "{offer_name}");
    url.searchParams.set("ip", "{ip}");
    url.searchParams.set("offer_id", "{offer_id}");
    url.searchParams.set("placement_id", "{placement_id}");
    return url.toString().replace(/%7B/gi, "{").replace(/%7D/gi, "}");
  }
  if (provider === "gleamads") {
    url.searchParams.set("subId", "{subId}");
    url.searchParams.set("user_id", "{user_id}");
    url.searchParams.set("subid1", "{subid1}");
    url.searchParams.set("reward", "{reward}");
    url.searchParams.set("points", "{points}");
    url.searchParams.set("currency_amount", "{currency_amount}");
    url.searchParams.set("payout", "{payout}");
    url.searchParams.set("transId", "{transId}");
    url.searchParams.set("transaction_id", "{transaction_id}");
    url.searchParams.set("offer_name", "{offer_name}");
    url.searchParams.set("status", "{status}");
    return url.toString().replace(/%7B/gi, "{").replace(/%7D/gi, "}");
  }
  if (provider === "pocketsfull") {
    for (const field of ["status", "trans_id", "user_id", "amount_local", "amount_usd", "hash", "ip_click", "survey_id", "offer_id", "type", "subId1", "subId2"]) {
      url.searchParams.set(field, `{${field}}`);
    }
    return url.toString().replace(/%7B/gi, "{").replace(/%7D/gi, "}");
  }
  if (provider === "taskwall") {
    // Taskwall uses a fixed token for endpoint authentication and sends its
    // own password macro separately. Keep both parameters in the callback.
    url.searchParams.set("token", secret);
  }
  if (spec.auth === "md5") {
    url.searchParams.set("signature", `{signature}`);
  } else {
    const authField = provider === "taskwall" ? "token" : (spec.authFields?.[0] || "token");
    if (provider !== "taskwall") url.searchParams.set(authField, secret);
  }

  for (const field of spec.macros) {
    if (field === "signature" || field === (spec.authFields?.[0] || "token")) continue;
    if (field === spec.transaction && !spec.transaction) continue;
    url.searchParams.set(field, `{${field}}`);
  }
  // Revtoo's placement test tool expects literal {macro} tokens and does not
  // substitute their percent-encoded form (%7Bmacro%7D). URLSearchParams
  // encodes braces by default, so restore only the macro delimiters while
  // leaving all other URL escaping intact.
  return url.toString().replace(/%7B/gi, "{").replace(/%7D/gi, "}");
};
