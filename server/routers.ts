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
import {
  OFFER_WALL_URLS,
  OFFER_WALL_IDS,
  getPostbackUrl,
} from "./offerwall-config";
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

// Offerwall URLs and postback secrets are loaded from the deployment environment.
// Keeping provider credentials out of source prevents accidental exposure.

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
          // Express cookie maxAge is milliseconds; keep it aligned with the
          // 30-day JWT lifetime so users stay signed in while opening offers.
          maxAge: 30 * 24 * 60 * 60 * 1000,
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
          // Express cookie maxAge is milliseconds; keep it aligned with the
          // 30-day JWT lifetime so users stay signed in while opening offers.
          maxAge: 30 * 24 * 60 * 60 * 1000,
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

    // Return provider readiness for the signed-in user. The client uses this
    // to avoid opening an unconfigured wall and to keep the provider list
    // aligned with the server-side URL builders.
    getOfferWallStatuses: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = user.username || user.name || `user_${user.id}`;
      return OFFER_WALL_IDS.map((provider) => {
        const builder = OFFER_WALL_URLS[provider];
        let configured = false;
        try {
          configured = Boolean(builder?.(userId));
        } catch {
          configured = false;
        }
        return { provider, label: provider, configured };
      });
    }),

    getLeaderboard: publicProcedure.query(async () => {
      return db.getLeaderboard();
    }),

    getActivities: publicProcedure.query(async () => {
      return db.getRecentActivities(30);
    }),

    getFeaturedOffers: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) return [];
      const userId = user.username || user.name || `user_${user.id}`;
      return db.getFeaturedOffers(userId, 24);
    }),

    getDashboardSummary: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const [earnings, offerHistory] = await Promise.all([
        db.getEarningsByUserId(user.id),
        db.getOfferHistoryByUserId(user.id),
      ]);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayEarnings = earnings.reduce((sum, earning: any) => {
        const createdAt = earning.createdAt ? new Date(earning.createdAt) : null;
        return createdAt && createdAt >= startOfDay ? sum + Number(earning.amount || 0) : sum;
      }, 0);
      const pendingRewards = offerHistory
        .filter((offer: any) => offer.status === "pending")
        .reduce((sum, offer: any) => sum + Number(offer.amount || 0), 0);
      return {
        todayEarnings: Number(todayEarnings.toFixed(2)),
        pendingRewards: Number(pendingRewards.toFixed(2)),
        totalEarned: Number(user.totalEarned || 0),
      };
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
      .input(z.object({ wallName: z.string().min(1), reward: z.number().min(0.01).max(100) }))
      .mutation(async () => {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Rewards are credited only after a verified offerwall postback.",
        });
      }),

    completeAITask: protectedProcedure.mutation(async () => {
      throw new TRPCError({ code: "FORBIDDEN", message: "This reward source is not enabled." });
    }),

    completeSocialTask: protectedProcedure.mutation(async () => {
      throw new TRPCError({ code: "FORBIDDEN", message: "This reward source is not enabled." });
    }),

    spinWheel: protectedProcedure.mutation(async () => {
      throw new TRPCError({ code: "FORBIDDEN", message: "This reward source is not enabled." });
    }),

    getOfferWallUrl: protectedProcedure
      .input(z.object({ wall: z.string() }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const urlFn = OFFER_WALL_URLS[input.wall];
        if (!urlFn) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Unknown offer wall" });
        }
        const userId = user.username || user.name || `user_${user.id}`;
        const url = urlFn(userId);
        if (!url) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "This offer wall is not configured yet. Please contact support.",
          });
        }
        // Return both URL and user identifier used by provider postbacks.
        return { url, openId: user.openId, userId };

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
          amount: z.number().min(0.3).max(100000),
          cryptoType: z.enum(["litecoin", "binance"]),
          walletAddress: z.string().trim().min(10).max(256),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        const amount = Number(input.amount.toFixed(2));
        const walletAddress = input.walletAddress.trim();
        const existing = await db.getPendingWithdrawalByDetails(user.id, amount.toFixed(2), input.cryptoType, walletAddress);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "An identical withdrawal request is already pending." });
        }

        const reserved = await db.deductBalanceIfSufficient(user.id, amount);
        if (!reserved) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        let withdrawal;
        try {
          withdrawal = await db.createWithdrawal({
            userId: user.id,
            amount: amount.toFixed(2),
            cryptoType: input.cryptoType,
            walletAddress,
            status: "pending",
          });
        } catch (error) {
          await db.addBalance(user.id, amount);
          throw error;
        }

        await db.addActivity({
          userId: user.id,
          username: user.username || "User",
          type: "withdrawal",
          description: `withdrew $${amount.toFixed(2)} via ${input.cryptoType}`,
          amount: amount.toFixed(2),
        });
        try {
          await db.addNotification({
            userId: user.id,
            title: "Withdrawal submitted",
            message: `Your ${input.cryptoType} withdrawal request for $${amount.toFixed(2)} is pending review.`,
            type: "withdrawal",
            isRead: 0,
          });
        } catch (error) {
          console.warn("Failed to create withdrawal notification:", error);
        }

        try {
          await notifyOwner({
            title: "New Withdrawal Request",
            content: `User ${user.username} requests $${amount.toFixed(2)} via ${input.cryptoType} to ${walletAddress.substring(0, 20)}...`,
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

  // ===== REFERRALS =====
  referrals: router({
    getMine: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const [referrals, earningsList] = await Promise.all([
        db.getReferralsByRefCode(user.refCode || ""),
        db.getEarningsByUserId(user.id),
      ]);
      const totalCommission = earningsList
        .filter((earning) => earning.type === "referral")
        .reduce((sum, earning) => sum + Number(earning.amount || 0), 0);
      return { referrals, totalCommission: totalCommission.toFixed(2) };
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
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        await db.markNotificationAsReadForUser(input.id, user.id);
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
        const withdrawal = await db.resolveWithdrawalStatus(input.id, "approved", input.note?.trim() || undefined);
        if (!withdrawal) throw new TRPCError({ code: "CONFLICT", message: "This withdrawal is no longer pending." });
        try {
          await db.addNotification({
            userId: withdrawal.userId,
            title: "Withdrawal approved",
            message: `Your withdrawal of $${Number(withdrawal.amount).toFixed(2)} was approved.`,
            type: "withdrawal",
            isRead: 0,
          });
        } catch (error) {
          console.warn("Failed to create approval notification:", error);
        }
        return { success: true };
      }),

    rejectWithdrawal: adminProcedure
      .input(z.object({ id: z.number(), note: z.string().optional() }))
      .mutation(async ({ input }) => {
        if (!input.note?.trim()) throw new TRPCError({ code: "BAD_REQUEST", message: "A rejection reason is required." });
        const withdrawal = await db.resolveWithdrawalStatus(input.id, "rejected", input.note.trim());
        if (!withdrawal) throw new TRPCError({ code: "CONFLICT", message: "This withdrawal is no longer pending." });
        try {
          await db.addNotification({
            userId: withdrawal.userId,
            title: "Withdrawal rejected",
            message: `Your withdrawal of $${Number(withdrawal.amount).toFixed(2)} was rejected. Reason: ${input.note.trim()}`,
            type: "withdrawal",
            isRead: 0,
          });
        } catch (error) {
          console.warn("Failed to create rejection notification:", error);
        }
        return { success: true };
      }),

    getPendingWithdrawals: adminProcedure.query(async () => {
      return db.getAllWithdrawals("pending");
    }),

    getPostbackUrls: adminProcedure.query(async () => {
      const baseUrl = process.env.PUBLIC_APP_URL || "https://rewardsverse.online";
      return OFFER_WALL_IDS.map((provider) => ({
        provider,
        label: provider === "cointo" ? "CoinToMedia" : provider,
        authMethod: "token" as const,
        configured: Boolean(getPostbackUrl(provider, baseUrl)),
        url: getPostbackUrl(provider, baseUrl),
      }));
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
