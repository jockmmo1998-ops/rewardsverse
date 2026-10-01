# Cloudflare Pages deployment

RewardsVerse remains a full-stack application. **Cloudflare Pages serves only the Vite frontend; Render continues to run the Node/tRPC API, database access, authentication, offerwalls, postbacks, admin, and withdrawals.**

## Build settings

- Framework preset: Vite
- Build command: `npm run build:pages`
- Build output directory: `client/dist`
- Root directory: repository root
- SPA fallback: `client/public/_redirects` is copied into the output

## Pages environment variables

Set these as production variables in Cloudflare Pages. Values beginning with `VITE_` are public and must never contain secrets.

```text
VITE_API_BASE_URL=https://api.rewardsverse.online
VITE_APP_ID=rewardsverse
VITE_OAUTH_PORTAL_URL=<existing OAuth portal URL>
```

For a preview, set `VITE_API_BASE_URL` to an already available Render API URL. Do not invent a hostname or change DNS as part of this migration.

## Render environment changes

Set `PUBLIC_APP_URL` to the exact browser origin that Cloudflare serves, normally `https://rewardsverse.online`. The backend now allows that origin for credentialed API requests. Keep all existing secrets and provider variables only on Render.

No database, schema, reward, ledger, withdrawal, provider ID, postback URL, or postback logic changes are required.

## DNS and API hostname

Configure `api.rewardsverse.online` as a Render custom domain only after the Render API is verified. Until DNS is active, use the existing Render API URL in `VITE_API_BASE_URL` for preview testing.
