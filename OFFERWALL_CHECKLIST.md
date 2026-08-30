# RewardsVerse Offerwall Checklist

Use this checklist only for offerwalls that are actually enabled in a publisher account. Do not invent values.

## Platform

- [ ] `DATABASE_URL` is configured in Render.
- [ ] `JWT_SECRET` is configured in Render.
- [ ] `ADMIN_SECRET` is configured in Render.
- [ ] `PUBLIC_APP_URL=https://rewardsverse.online`.
- [ ] Deployment is Live after environment changes.

## Provider configuration

- [ ] Gemiwall: placement ID.
- [ ] Gemiwall: postback secret/token.
- [ ] Gemiwall: postback test.

- [ ] Revtoo: API key or placement key.
- [ ] Revtoo: postback secret.
- [ ] Revtoo: postback test.

- [ ] Clickwall: placement ID.
- [ ] Clickwall: postback secret/token.
- [ ] Clickwall: postback test.

- [ ] Moustache Leads: placement ID.
- [ ] Moustache Leads: API key if required.
- [ ] Moustache Leads: postback secret.
- [ ] Moustache Leads: postback test.

- [ ] Taskwall: app ID.
- [ ] Taskwall: postback token/secret.
- [ ] Taskwall: postback test with an existing RewardsVerse username and a positive amount.

- [ ] CoinToMedia: public/site key.
- [ ] CoinToMedia: postback secret.
- [ ] CoinToMedia: postback test.

- [ ] Klink Finance: publisher ID.
- [ ] Klink Finance: postback secret.
- [ ] Klink Finance: postback test.

- [ ] AdsWedMedia: public/site key.
- [ ] AdsWedMedia: postback secret.
- [ ] AdsWedMedia: postback test.

- [ ] AdMaxFlow: placement ID.
- [ ] AdMaxFlow: postback secret.
- [ ] AdMaxFlow: postback test.

- [ ] Gaintwall: API/placement key.
- [ ] Gaintwall: postback secret if separate.
- [ ] Gaintwall: postback test.

- [ ] BucksWall: offerwall URL/placement URL.
- [ ] BucksWall: postback secret.
- [ ] BucksWall: postback test.

## Final verification

- [ ] Admin Panel → Postbacks shows the provider as Configured.
- [ ] The generated URL uses `https://rewardsverse.online/api/postback/{provider}`.
- [ ] The test uses a real existing username, not an email or display name.
- [ ] The amount field is numeric and greater than zero.
- [ ] A new offer/conversion ID is used for each test.
- [ ] The user balance increases once.
- [ ] Wallet transaction and earning history contain the credit.
- [ ] Repeating the same callback does not add a second credit.
- [ ] Render logs show authentication, user resolution, amount parsing and processing success.
- [ ] No secret appears in GitHub, screenshots or chat.
