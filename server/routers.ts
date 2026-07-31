import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { ENV } from "./_core/env";
import { notifyOwner } from "./_core/notification";
import { sdk } from "./_core/sdk";
import bcrypt from "bcryptjs";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ===== PASSWORD HASHING =====
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===== OFFER WALL URL CONFIG =====
const OFFER_WALL_URLS: Record<string, (userId: string) => string> = {
  // Gemiwall: postback trả về sub_id=USERNAME → truyền username qua path (Gemiwall tự lấy)
  gemiwall: (u) =>
    `https://gemiwall.com/6987046ad95123da06330801/${encodeURIComponent(u)}/`,
  // Revtoo: postback trả về user_id=USERNAME → OK (đã hoạt động)
  revtoo: (u) =>
    `https://revtoo.com/offerwall/7y9n22mjsz0c3ujyncuomz95k6p31p/${encodeURIComponent(u)}`,
  // Clickwall: postback trả về user_id=USERNAME → OK
  clickwall: (u) => `https://clickwall.net/app/iframe/10621/${encodeURIComponent(u)}`,
  // Moustache: postback trả về user_id=USERNAME → OK (token auth, không HMAC)
  moustache: (u) =>
    `https://offerwall.moustacheleads.com/offerwall?placement_id=ZVtFVRbd5DyrjELq&user_id=${encodeURIComponent(u)}&api_key=B6GScgjbtwvjAJRH4P5Fzhx4iXBk7I7L`,
  // Taskwall: postback trả về userid=USERNAME (lowercase) → OK
  taskwall: (u) =>
    `https://wall.taskwall.io/?app_id=0640f51b6a17749572b508423c387b00&userid=${encodeURIComponent(u)}`,
  // CoinToMedia: postback trả về user_id=USERNAME → OK (đã hoạt động)
  cointo: (u) => `https://cointomedia.com/offer/Po5Qt6/${encodeURIComponent(u)}`,
  // Klink: POST JSON body với userId=USERNAME → OK
  klink: (u) =>
    `https://offerwall.klinkfinance.com/wall?pub_id=b4f89770-d4da-42c1-8fee-03303dd14401&user_id=${encodeURIComponent(u)}`,
  // Adswedmedia: postback trả về sub=USERNAME (1 chữ) → đã fix trong postback.ts
  adswedmedia: (u) =>
    `https://adswedmedia.com/offer/Ao6Po6/${encodeURIComponent(u)}`,
};

// ===== POSTBACK PROVIDER SECRETS =====
// Đây là các token xác thực mà offer wall gửi kèm trong postback request
// dưới dạng ?token=SECRET. Cấu hình trong dashboard của từng provider.
//
// ─────────────────────────────────────────────────────────────────────────────
// POSTBACK SECRETS
// Key   = provider name used in the URL path: /api/postback/{provider}
// Value = secret token the offerwall sends as ?token= (or ?secret=, ?apikey=, etc.)
//
// Universal postback URL:
//   https://YOUR_DOMAIN/api/postback/{provider}?token={SECRET}&{user_param}={USERNAME}&{reward_param}={AMOUNT}&{txid_param}={TXID}
//
// The backend auto-detects user/reward/txid parameter names — no per-provider code needed.
// Supported user fields:    user_id, userid, userId, uid, user, username, member_id,
//                           sub, subid, sub_id, sub1, sub2, sid, click_user, openId …
// Supported reward fields:  reward, payout, amount, value, reward_amount, coins, points …
// Supported txid fields:    transaction_id, transactionId, transid, tid, uuid, click_id,
//                           conversion_id, lead_id, event_id, tx …
//
// Provider         | Example postback URL
// -----------------|-----------------------------------------------------------------
// revtoo           | …/api/postback/revtoo?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// cointo           | …/api/postback/cointo?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// gemiwall         | …/api/postback/gemiwall?token=SECRET&sub_id=USERNAME&reward=AMOUNT&uuid=TXID
// taskwall         | …/api/postback/taskwall?token=SECRET&userid=USERNAME&reward=AMOUNT&password=TXID
// clickwall        | …/api/postback/clickwall?token=SECRET&user_id=USERNAME&payout=AMOUNT&transaction_id=TXID
// adswedmedia      | …/api/postback/adswedmedia?token=SECRET&sub=USERNAME&reward=AMOUNT&transid=TXID
// klink (GET)      | …/api/postback/klink?token=SECRET&subId=USERNAME&payout=AMOUNT&transId=TXID
// klink (POST JSON)| body: {token, userId, payout, conversionId}
// moustache        | …/api/postback/moustache?token=SECRET&user_id=USERNAME&payout=AMOUNT&transaction_id=TXID
// lootably         | …/api/postback/lootably?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// adgem            | …/api/postback/adgem?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// adgate           | …/api/postback/adgate?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// offertoro        | …/api/postback/offertoro?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// cpx              | …/api/postback/cpx?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// timewall         | …/api/postback/timewall?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// bitlabs          | …/api/postback/bitlabs?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// monlix           | …/api/postback/monlix?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// ayet             | …/api/postback/ayet?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// kiwiwall         | …/api/postback/kiwiwall?token=SECRET&user_id=USERNAME&reward=AMOUNT&transaction_id=TXID
// ─────────────────────────────────────────────────────────────────────────────
export const POSTBACK_SECRETS: Record<string, string> = {
  // ── Currently configured ──────────────────────────────────────────────────
  gemiwall:    "6987046ad95123da06330801",
  revtoo:      "7y9n22mjsz0c3ujyncuomz95k6p31p",
  clickwall:   "10621",
  moustache:   "B6GScgjbtwvjAJRH4P5Fzhx4iXBk7I7L",
  taskwall:    "0640f51b6a17749572b508423c387b00",
  cointo:      "Fp2Lr9Gx2Ay2Ri8",
  klink:       "b4f89770-d4da-42c1-8fee-03303dd14401",
  adswedmedia: "Au6Ue9Lg5Fh4Jr2",

  // ── Add your secret for each new provider below ───────────────────────────
  // Replace "YOUR_SECRET_HERE" with the actual token from each offerwall dashboard.
  lootably:    process.env.POSTBACK_SECRET_LOOTABLY    || "",
  adgem:       process.env.POSTBACK_SECRET_ADGEM       || "",
  adgate:      process.env.POSTBACK_SECRET_ADGATE      || "",
  offertoro:   process.env.POSTBACK_SECRET_OFFERTORO   || "",
  cpx:         process.env.POSTBACK_SECRET_CPX         || "",
  timewall:    process.env.POSTBACK_SECRET_TIMEWALL     || "",
  bitlabs:     process.env.POSTBACK_SECRET_BITLABS     || "",
  monlix:      process.env.POSTBACK_SECRET_MONLIX      || "",
  ayet:        process.env.POSTBACK_SECRET_AYET        || "",
  kiwiwall:    process.env.POSTBACK_SECRET_KIWIWALL    || "",
};

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== VIRTUAL AUTH (with password) =====
  virtual: router({
    register: publicProcedure
      .input(
        z.object({
          username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
          password: z.string().min(6).max(128),
          refCode: z.string().max(16).optional().default(""),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { username, password, refCode } = input;
        const openId = `virtual_${username}_${Date.now()}`;

        const existing = await db.getUserByUsername(username);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
        }

        let referredBy: string | null = null;
        if (refCode && refCode.length > 0) {
          const referrer = await db.getUserByRefCode(refCode);
          if (referrer) {
            referredBy = refCode;
          }
        }

        const userRefCode =
          username.substring(0, 4).toUpperCase() +
          Math.floor(Math.random() * 9999).toString().padStart(4, "0");

        const hashedPassword = await hashPassword(password);
        await db.upsertUser({
          openId,
          username,
          password: hashedPassword,
          refCode: userRefCode,
          referredBy: referredBy || undefined,
          role: "user",
          name: username,
          loginMethod: "virtual",
          balance: "0.00",
          xp: 0,
          streak: 0,
          offersCompleted: 0,
          totalEarned: "0.00",
          refEarnings: "0.00",
          lastSignedIn: new Date(),
        });

        // Create session token
        const sessionToken = await sdk.createSessionToken(openId, {
          name: username,
          expiresInMs: 30 * 24 * 60 * 60 * 1000,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60,
        });

        // Referral bonus
        if (referredBy) {
          const referrer = await db.getUserByRefCode(referredBy);
          if (referrer) {
            await db.addRefEarnings(referrer.id, 0.10);
            await db.addEarning({
              userId: referrer.id,
              amount: "0.10",
              type: "referral",
              source: `Referral: ${username}`,
            });
            await db.addActivity({
              userId: referrer.id,
              username: referrer.username || "User",
              type: "referral",
              description: `earned $0.10 from referral ${username}`,
              amount: "0.10",
            });
          }
        }

        // Log activity
        const newUser = await db.getUserByOpenId(openId);
        if (newUser) {
          // Activity logging removed for signup bonus
          await db.updateLeaderboard(newUser.id, newUser.username || username, 0.00);
        }

        return {
          success: true,
          username,
          refCode: userRefCode,
          message: `Welcome to RewardsVerse, ${username}!`,
        };
      }),

    login: publicProcedure
      .input(
        z.object({
          username: z.string().min(3).max(30),
          password: z.string().min(6).max(128),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        // Verify password
        const valid = await verifyPassword(input.password, user.password || "");
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });
        }

        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.username || user.name || "",
          expiresInMs: 30 * 24 * 60 * 60 * 1000,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60,
        });

        await db.updateUserProfile(user.id, { lastSignedIn: new Date() });

        return { success: true, username: user.username };
      }),
  }),

  // ===== USER DASHBOARD =====
  user: router({
    getProfile: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      let user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) return null;

      // Auto-promote owner to admin
      if (ctx.user.openId === ENV.ownerOpenId && user.role !== "admin") {
        await db.updateUserProfile(user.id, { role: "admin" });
        user = await db.getUserByOpenId(ctx.user.openId);
      }

      return user as any;
    }),

    getLeaderboard: publicProcedure.query(async () => {
      return db.getLeaderboard();
    }),

    getActivities: publicProcedure.query(async () => {
      return db.getRecentActivities(30);
    }),

    claimDaily: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      if (user.lastDailyClaim) {
        const lastClaim = new Date(user.lastDailyClaim);
        const today = new Date();
        const lastDate = lastClaim.toISOString().split("T")[0];
        const todayDate = today.toISOString().split("T")[0];
        if (lastDate === todayDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You already claimed your daily bonus today",
          });
        }
      }

      const streakBonus = (user.streak || 0) * 0.05;
      const bonus = 0.10 + streakBonus;

      await db.addBalance(user.id, bonus);
      await db.addXP(user.id, 10);
      await db.incrementStreak(user.id);
      await db.setLastDailyClaim(user.id);
      await db.addEarning({
        userId: user.id,
        amount: bonus.toFixed(2),
        type: "daily_bonus",
        source: `Daily streak day ${(user.streak || 0) + 1}`,
      });
      await db.addActivity({
        userId: user.id,
        username: user.username || "User",
        type: "daily_claim",
        description: `claimed daily bonus $${bonus.toFixed(2)}`,
        amount: bonus.toFixed(2),
      });

      const updatedUser = await db.getUserById(user.id);
      if (updatedUser && updatedUser.username) {
        await db.updateLeaderboard(user.id, updatedUser.username, parseFloat(updatedUser.totalEarned || "0"));
      }
      return { success: true, bonus: bonus.toFixed(2) };
    }),

    recordOfferComplete: protectedProcedure
      .input(z.object({ wallName: z.string(), reward: z.number().min(0.01).max(100) }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        const reward = Number(input.reward);
        await db.addBalance(user.id, reward);
        await db.addXP(user.id, 15);
        await db.incrementOffers(user.id);
        await db.addEarning({
          userId: user.id,
          amount: reward.toFixed(2),
          type: "offer",
          source: `${input.wallName} offer`,
        });
        await db.addActivity({
          userId: user.id,
          username: user.username || "User",
          type: "offer_complete",
          description: `earned $${reward.toFixed(2)} on ${input.wallName}`,
          amount: reward.toFixed(2),
        });
        // Ghi walletTransaction để đồng bộ với luồng postback
        await db.addWalletTransaction({
          userId: user.id,
          type: "credit",
          amount: reward.toFixed(2),
          description: `Earned $${reward.toFixed(2)} on ${input.wallName}`,
        });

        const updatedUser = await db.getUserById(user.id);
        if (updatedUser && updatedUser.username) {
          await db.updateLeaderboard(user.id, updatedUser.username, parseFloat(updatedUser.totalEarned || "0"));
        }
        return { success: true, reward: reward.toFixed(2) };
      }),

    completeAITask: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const rewards = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      await db.addBalance(user.id, Number(reward));
      await db.addXP(user.id, 20);
      await db.incrementOffers(user.id);
      await db.addEarning({ userId: user.id, amount: reward.toFixed(2), type: "ai_task", source: "AI Task completed" });
      await db.addActivity({ userId: user.id, username: user.username || "User", type: "offer_complete", description: `completed AI Task earning $${reward.toFixed(2)}`, amount: reward.toFixed(2) });

      const updatedUser = await db.getUserById(user.id);
      if (updatedUser && updatedUser.username) {
        await db.updateLeaderboard(user.id, updatedUser.username, parseFloat(updatedUser.totalEarned || "0"));
      }
      return { success: true, reward: reward.toFixed(2) };
    }),

    completeSocialTask: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const rewards = [0.1, 0.2, 0.3, 0.5, 0.75, 1.0];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      await db.addBalance(user.id, Number(reward));
      await db.addXP(user.id, 5);
      await db.addEarning({ userId: user.id, amount: reward.toFixed(2), type: "social_task", source: "Social task completed" });
      await db.addActivity({ userId: user.id, username: user.username || "User", type: "offer_complete", description: `completed social task earning $${reward.toFixed(2)}`, amount: reward.toFixed(2) });

      return { success: true, reward: reward.toFixed(2) };
    }),

    spinWheel: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const rewards = [0.1, 0.25, 0.5, 1.0, 2.0, 0.15, 0.75, 3.0];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      await db.addBalance(user.id, Number(reward));
      await db.addXP(user.id, 5);
      await db.addEarning({ userId: user.id, amount: reward.toFixed(2), type: "spin", source: "Lucky wheel spin" });
      await db.addActivity({ userId: user.id, username: user.username || "User", type: "offer_complete", description: `won $${reward.toFixed(2)} on Lucky Wheel`, amount: reward.toFixed(2) });

      return { success: true, reward: reward.toFixed(2) };
    }),

    getOfferWallUrl: protectedProcedure
      .input(z.object({ wall: z.string() }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const urlFn = OFFER_WALL_URLS[input.wall];
        if (!urlFn) throw new TRPCError({ code: "NOT_FOUND", message: "Unknown offer wall" });
        const userId = user.username || user.name || `user_${user.id}`;
        // Return both URL and openId for postback verification
        return { url: urlFn(userId), openId: user.openId, userId: userId };
      }),
  }),

  // ===== POSTBACK ENDPOINT =====
  // DEPRECATED: Use Express endpoint at /api/postback/:provider instead
  // This tRPC endpoint is kept for backward compatibility only
  postback: router({
    receive: publicProcedure
      .input(
        z.object({
          provider: z.string(),
          token: z.string(),
          userId: z.string(),
          amount: z.number().min(0.01),
          externalId: z.string().min(1),
          offerName: z.string().optional().default(""),
        })
      )
      .mutation(async ({ input }) => {
        console.warn("[Postback] tRPC endpoint is deprecated, use Express endpoint instead");
        return { success: false, message: "Use Express endpoint /api/postback/:provider instead" };
      }),
  }),

  // ===== WITHDRAWALS =====
  withdraw: router({
    create: protectedProcedure
      .input(
        z.object({
          amount: z.number().min(0.5),
          cryptoType: z.enum(["bitcoin", "ethereum", "usdt_trc20", "usdt_erc20", "solana", "litecoin", "dogecoin"]),
          walletAddress: z.string().min(10),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        if (parseFloat(user.balance || "0") < input.amount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        await db.deductBalance(user.id, Number(input.amount));
        const withdrawal = await db.createWithdrawal({
          userId: user.id,
          amount: input.amount.toFixed(2),
          cryptoType: input.cryptoType,
          walletAddress: input.walletAddress,
          status: "pending",
        });

        await db.addActivity({
          userId: user.id,
          username: user.username || "User",
          type: "withdrawal",
          description: `withdrew $${input.amount.toFixed(2)} via ${input.cryptoType}`,
          amount: input.amount.toFixed(2),
        });

        try {
          await notifyOwner({
            title: "New Withdrawal Request",
            content: `User ${user.username} requests $${input.amount.toFixed(2)} via ${input.cryptoType} to ${input.walletAddress.substring(0, 20)}...`,
          });
        } catch (e) {
          console.warn("Failed to send notification:", e);
        }

        return { success: true, id: withdrawal.insertId };
      }),

    getMyWithdrawals: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getWithdrawalsByUserId(user.id);
    }),
  }),

  // ===== HISTORY =====
  history: router({
    getEarnings: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getEarningsByUserId(user.id);
    }),

    getAllHistory: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const [earningsList, withdrawalList] = await Promise.all([
        db.getEarningsByUserId(user.id),
        db.getWithdrawalsByUserId(user.id),
      ]);
      return { earnings: earningsList, withdrawals: withdrawalList };
    }),

    // Refresh history endpoint for client polling
    refreshHistory: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const [earningsList, withdrawalList] = await Promise.all([
        db.getEarningsByUserId(user.id),
        db.getWithdrawalsByUserId(user.id),
      ]);
      return { earnings: earningsList, withdrawals: withdrawalList, timestamp: new Date().toISOString() };
    }),

    // Offer history (postback completions per provider)
    getOfferHistory: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getOfferHistoryByUserId(user.id);
    }),

    // Wallet transactions (credit/debit ledger)
    getWalletTransactions: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getWalletTransactionsByUserId(user.id);
    }),
  }),

  // ===== NOTIFICATIONS =====
  notifications: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getNotificationsByUserId(user.id);
    }),

    getUnread: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getUnreadNotificationsByUserId(user.id);
    }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      await db.markAllNotificationsAsRead(user.id);
      return { success: true };
    }),
  }),

  // ===== ADMIN =====
  admin: router({
    getUsers: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),

    getWithdrawals: adminProcedure.query(async () => {
      return db.getAllWithdrawals();
    }),

    getStats: adminProcedure.query(async () => {
      return db.getPlatformStats();
    }),

    getPostbacks: adminProcedure.query(async () => {
      return db.getAllPostbacks();
    }),

    approveWithdrawal: adminProcedure
      .input(z.object({ id: z.number(), note: z.string().optional() }))
      .mutation(async ({ input }) => {
        const withdrawal = await db.getWithdrawalById(input.id);
        if (!withdrawal) throw new TRPCError({ code: "NOT_FOUND", message: "Withdrawal not found" });
        await db.updateWithdrawalStatus(input.id, "approved", input.note || undefined);
        return { success: true };
      }),

    rejectWithdrawal: adminProcedure
      .input(z.object({ id: z.number(), note: z.string().optional() }))
      .mutation(async ({ input }) => {
        const withdrawal = await db.getWithdrawalById(input.id);
        if (!withdrawal) throw new TRPCError({ code: "NOT_FOUND", message: "Withdrawal not found" });
        await db.addBalance(withdrawal.userId, parseFloat(withdrawal.amount));
        await db.updateWithdrawalStatus(input.id, "rejected", input.note || undefined);
        return { success: true };
      }),

    getPendingWithdrawals: adminProcedure.query(async () => {
      return db.getAllWithdrawals("pending");
    }),

    // Tra cứu user theo username để lấy userId cho việc test postback
    getUserInfo: adminProcedure
      .input(z.object({ username: z.string().min(1) }))
      .query(async ({ input }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: `User "${input.username}" không tồn tại` });
        return {
          id: user.id,
          username: user.username,
          openId: user.openId,
          balance: user.balance,
          xp: user.xp,
          offersCompleted: user.offersCompleted,
        };
      }),

    // Promote tài khoản đang đăng nhập thành admin bằng ADMIN_SECRET
    promoteByPassword: protectedProcedure
      .input(z.object({ secret: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const adminSecret = ENV.adminSecret;
        if (!adminSecret || adminSecret.length < 8) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "ADMIN_SECRET chưa được cấu hình trên server" });
        }
        if (input.secret !== adminSecret) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Mật khẩu admin không đúng" });
        }
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        await db.updateUserProfile(user.id, { role: "admin" });
        return { success: true, message: "Tài khoản đã được cấp quyền Admin!" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
