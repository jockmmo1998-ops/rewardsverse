/**
 * Runtime configuration for every RewardsVerse offerwall.
 *
 * Provider placement values and postback secrets deliberately come from the
 * deployment environment. Never put those values in client code or commits.
 */

type OfferWallUrlBuilder = (userId: string) => string | null;

const env = (name: string): string => process.env[name]?.trim() ?? "";
const encodedUserId = (userId: string): string => encodeURIComponent(userId);

function appendUserId(baseUrl: string, userId: string): string | null {
  if (!baseUrl) return null;
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("user_id", userId);
    return url.toString();
  } catch {
    return null;
  }
}

export const OFFER_WALL_URLS: Record<string, OfferWallUrlBuilder> = {
  gemiwall: (userId) => {
    const placement = env("GEMIWALL_PLACEMENT_ID");
    return placement ? `https://gemiwall.com/${encodeURIComponent(placement)}/${encodedUserId(userId)}/` : null;
  },
  revtoo: (userId) => {
    const placement = env("REVTOO_PLACEMENT_ID");
    return placement ? `https://revtoo.com/offerwall/${encodeURIComponent(placement)}/${encodedUserId(userId)}` : null;
  },
  clickwall: (userId) => {
    const placement = env("CLICKWALL_PLACEMENT_ID");
    return placement ? `https://clickwall.net/app/iframe/${encodeURIComponent(placement)}/${encodedUserId(userId)}` : null;
  },
  moustache: (userId) => {
    const placement = env("MOUSTACHE_PLACEMENT_ID");
    const apiKey = env("MOUSTACHE_API_KEY");
    if (!placement || !apiKey) return null;
    const url = new URL("https://offerwall.moustacheleads.com/offerwall");
    url.searchParams.set("placement_id", placement);
    url.searchParams.set("user_id", userId);
    url.searchParams.set("api_key", apiKey);
    return url.toString();
  },
  taskwall: (userId) => {
    const appId = env("TASKWALL_APP_ID");
    return appId ? `https://wall.taskwall.io/?app_id=${encodeURIComponent(appId)}&userid=${encodedUserId(userId)}` : null;
  },
  cointo: (userId) => {
    const placement = env("COINTO_PLACEMENT_ID");
    return placement ? `https://cointomedia.com/offer/${encodeURIComponent(placement)}/${encodedUserId(userId)}` : null;
  },
  klink: (userId) => {
    const publisherId = env("KLINK_PUBLISHER_ID");
    return publisherId
      ? `https://offerwall.klinkfinance.com/wall?pub_id=${encodeURIComponent(publisherId)}&user_id=${encodedUserId(userId)}`
      : null;
  },
  adswedmedia: (userId) => {
    const placement = env("ADSWEDMEDIA_PLACEMENT_ID");
    return placement ? `https://adswedmedia.com/offer/${encodeURIComponent(placement)}/${encodedUserId(userId)}` : null;
  },
  admaxflow: (userId) => {
    const placement = env("ADMAXFLOW_PLACEMENT_ID");
    if (!placement) return null;
    const url = new URL("https://admaxflow.com/offerwall.php");
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
  buckswall: (userId) => appendUserId(env("BUCKSWALL_OFFERWALL_URL"), userId),
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

export const OFFER_WALL_IDS = Object.keys(OFFER_WALL_URLS);

export type PostbackParamSpec = {
  user: string;
  reward: string;
  transaction: string;
};

export const POSTBACK_PARAM_SPECS: Record<string, PostbackParamSpec> = {
  gemiwall: { user: "sub_id", reward: "reward", transaction: "uuid" },
  revtoo: { user: "user_id", reward: "reward", transaction: "transaction_id" },
  clickwall: { user: "user_id", reward: "payout", transaction: "transaction_id" },
  moustache: { user: "user_id", reward: "payout", transaction: "transaction_id" },
  taskwall: { user: "userid", reward: "reward", transaction: "password" },
  cointo: { user: "user_id", reward: "reward", transaction: "transaction_id" },
  klink: { user: "userId", reward: "payout", transaction: "conversionId" },
  adswedmedia: { user: "sub", reward: "reward", transaction: "transid" },
  admaxflow: { user: "subid", reward: "reward", transaction: "transaction_id" },
  gaintwall: { user: "user_id", reward: "reward", transaction: "transaction_id" },
  buckswall: { user: "user_id", reward: "reward", transaction: "transaction_id" },
};

export const getPostbackUrl = (provider: string, baseUrl: string): string | null => {
  const spec = POSTBACK_PARAM_SPECS[provider];
  const secret = POSTBACK_SECRETS[provider];
  if (!spec || !secret || !baseUrl) return null;
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/api/postback/${provider}`);
  url.searchParams.set("token", secret);
  url.searchParams.set(spec.user, `{${spec.user}}`);
  url.searchParams.set(spec.reward, `{${spec.reward}}`);
  url.searchParams.set(spec.transaction, `{${spec.transaction}}`);
  url.searchParams.set("status", "{status}");
  return url.toString();
};
