/**
 * Runtime configuration for every RewardsVerse offerwall.
 *
 * Provider keys, placement values and callback secrets deliberately come from
 * deployment environment variables. Never put real values in client code or
 * commits.
 */

type OfferWallUrlBuilder = (userId: string) => string | null;

export type PostbackAuth = "token" | "md5";
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
  "clickwall",
  "moustache",
  "taskwall",
  "cointo",
  "klink",
  "adswedmedia",
  "admaxflow",
  "gaintwall",
  "buckswall",
] as const;

export const OFFER_WALL_LABELS: Record<string, string> = {
  gemiwall: "Gemiwall",
  revtoo: "Revtoo",
  clickwall: "Clickwall",
  moustache: "MoustacheLeads",
  taskwall: "Taskwall",
  cointo: "CoinToMedia",
  klink: "Klink Finance",
  adswedmedia: "AdsWedMedia",
  admaxflow: "AdMaxFlow",
  gaintwall: "Gaintwall",
  buckswall: "BucksWall",
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
  clickwall: (userId) => {
    const legacyPlacement = env("CLICKWALL_PLACEMENT_ID");
    const base = env("CLICKWALL_OFFERWALL_URL") || (legacyPlacement ? `https://clickwall.net/app/iframe/${encodeURIComponent(legacyPlacement)}` : "https://clickwall.net/app/iframe/10621");
    return `${base.replace(/\/$/, "")}/${encodedUserId(userId)}`;
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
    const placement = env("GAINTWALL_PLACEMENT_KEY");
    if (!placement) return null;
    const url = new URL("https://gaintwall.com/offerwall");
    url.searchParams.set("placement_key", placement);
    url.searchParams.set("user_id", userId);
    return url.toString();
  },
  buckswall: (userId) => appendUserId(env("BUCKSWALL_OFFERWALL_URL") || "https://buckswall.com/offerwall.php?placement_id=78", userId),
};

const secretEntries: Array<[string, string]> = [
  ["gemiwall", env("GEMIWALL_POSTBACK_SECRET")],
  ["revtoo", env("REVTOO_POSTBACK_SECRET")],
  ["clickwall", env("CLICKWALL_POSTBACK_SECRET")],
  ["moustache", env("MOUSTACHE_POSTBACK_SECRET")],
  ["taskwall", env("TASKWALL_POSTBACK_SECRET")],
  ["cointo", env("COINTO_POSTBACK_SECRET")],
  ["klink", env("KLINK_POSTBACK_SECRET")],
  ["adswedmedia", env("ADSWEDMEDIA_POSTBACK_SECRET")],
  ["admaxflow", env("ADMAXFLOW_POSTBACK_SECRET")],
  ["gaintwall", env("GAINTWALL_POSTBACK_SECRET")],
  ["buckswall", env("BUCKSWALL_POSTBACK_SECRET")],
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
  clickwall: {
    user: "user_id",
    reward: "amount",
    transaction: "txid",
    auth: "token",
    response: "ok",
    macros: ["user_id", "amount", "payout", "offer_name", "user_ip", "txid", "offer_id"],
  },
  moustache: {
    user: "user_id",
    reward: "payout",
    transaction: "transaction_id",
    auth: "token",
    response: "json",
    macros: ["user_id", "payout", "transaction_id", "offer_name", "status"],
  },
  taskwall: {
    user: "userid",
    reward: "user_amount",
    transaction: null,
    auth: "token",
    response: "json",
    authFields: ["password", "token", "secret", "apikey", "api_key", "key"],
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
    macros: ["subId", "transId", "reward", "round_reward", "payout", "signature", "status", "userIp", "offer_id", "offer_name", "country", "uuid", "event_id", "event_name"],
  },
  admaxflow: {
    user: "subid",
    reward: "reward",
    transaction: "transaction_id",
    auth: "token",
    response: "json",
    macros: ["subid", "reward", "transaction_id", "offer_name", "offer_id", "status"],
  },
  gaintwall: {
    user: "user_id",
    reward: "reward",
    transaction: "transaction_id",
    auth: "token",
    response: "json",
    macros: ["user_id", "reward", "transaction_id", "offer_name", "offer_id", "status"],
  },
  buckswall: {
    user: "user_id",
    reward: "reward",
    transaction: "transaction_id",
    auth: "token",
    response: "json",
    macros: ["user_id", "reward", "transaction_id", "offer_name", "offer_id", "status"],
  },
};

export const getPostbackUrl = (provider: string, baseUrl: string): string | null => {
  const spec = POSTBACK_PARAM_SPECS[provider];
  const secret = POSTBACK_SECRETS[provider];
  if (!spec || !secret || !baseUrl) return null;

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/api/postback/${provider}`);
  if (spec.auth === "md5") {
    url.searchParams.set("signature", `{signature}`);
  } else {
    const authField = spec.authFields?.[0] || "token";
    url.searchParams.set(authField, secret);
  }

  for (const field of spec.macros) {
    if (field === "signature" || field === (spec.authFields?.[0] || "token")) continue;
    if (field === spec.transaction && !spec.transaction) continue;
    url.searchParams.set(field, `{${field}}`);
  }
  return url.toString();
};
