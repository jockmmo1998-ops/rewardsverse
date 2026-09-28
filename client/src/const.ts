import { encodeOAuthState } from "@shared/const";
import { apiUrl } from "@/lib/apiBase";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
//
// It requests a one-time nonce from the API (where the __Host- cookie is set)
// and then navigates immediately. Do not call it during render: each call
// creates a fresh OAuth state and overwrites any in-flight login.
export const startLogin = async () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = apiUrl("/api/oauth/callback");
  const stateResponse = await fetch(apiUrl("/api/oauth/state"), { credentials: "include" });
  if (!stateResponse.ok) throw new Error("Unable to start login");
  const { nonce } = (await stateResponse.json()) as { nonce?: string };
  if (!nonce) throw new Error("Unable to start login");
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  window.location.href = url.toString();
};
