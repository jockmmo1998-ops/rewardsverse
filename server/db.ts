import { eq, desc, sql, and, gte } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { randomBytes } from "crypto";
import {
  InsertUser,
  InsertWithdrawal,
  InsertEarning,
  InsertLeaderboard,
  InsertPostback,
  InsertActivity,
  InsertWalletTransaction,
  InsertOfferHistory,
  InsertNotification,
  InsertPostbackLog,
  InsertAuditLog,
  postbackCredentials,
  users,
  withdrawals,
  earnings,
  leaderboard,
  postbacks,
  activities,
  walletTransactions,
  offerHistory,
  notifications,
  postbackLogs,
  auditLogs,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getRevtooFeaturedOffers } from "./revtoo-offers";
import { POSTBACK_SECRETS } from "./offerwall-config";

// Lazy-initialized DB instance — never imported at module load time so the
// server starts successfully even when DATABASE_URL is absent.
let _db: PostgresJsDatabase<Record<string, never>> | null = null;
let _pool: any = null;

// Parse the Supabase PostgreSQL URL without hard-coding credentials.
export function getDatabaseConnectionOptions(databaseUrl: string) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")) || "postgres",
    ssl: url.hostname.endsWith("supabase.com") ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 20,
  };
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Dynamic import keeps the PostgreSQL driver out of startup unless DATABASE_URL is configured.
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const postgres = (await import("postgres")).default;
    const sqlClient = postgres(process.env.DATABASE_URL, getDatabaseConnectionOptions(process.env.DATABASE_URL));
    _pool = sqlClient;
    _db = drizzle(sqlClient) as PostgresJsDatabase<Record<string, never>>;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("[DB] Database is not available; cannot create the account");
  }

  try {
    const values: InsertUser = { openId: user.openId, username: user.username ?? user.openId.slice(0, 64), password: user.password ?? "$2b$10$7EqJtq98hPqEX7fNZaFWoOeYfL1v1s8t6R1f5l7y2jM0Q0mYwQ0eG", refCode: user.refCode ?? `RV${user.openId.slice(-14)}` };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "username", "refCode", "referredBy", "password", "emailVerificationTokenHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Handle numeric and decimal fields
    const numericFields = ["balance", "xp", "streak", "offersCompleted", "totalEarned", "refEarnings"];

    numericFields.forEach((field) => {
      const value = (user as Record<string, any>)[field];
      if (value !== undefined) {
        (values as Record<string, any>)[field] = value;
        updateSet[field] = value;
      }
    });

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.emailVerificationExpiresAt !== undefined) {
      values.emailVerificationExpiresAt = user.emailVerificationExpiresAt;
      updateSet.emailVerificationExpiresAt = user.emailVerificationExpiresAt;
    }
    if (user.emailVerificationSentAt !== undefined) {
      values.emailVerificationSentAt = user.emailVerificationSentAt;
      updateSet.emailVerificationSentAt = user.emailVerificationSentAt;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Ensure username is always in values if it exists on user object
    if (user.username !== undefined && user.username !== null) {
      values.username = user.username;
      updateSet.username = user.username;
    }

    // Also ensure required fields that might not have DB defaults
    if (values.role === undefined) {
      values.role = "user";
    }
    if (values.balance === undefined) {
      values.balance = "0.00";
    }

    const safeLogValues = { ...values } as Record<string, unknown>;
    delete safeLogValues.password;
    console.log("[Database] upsertUser values:", JSON.stringify(safeLogValues));
    await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmailVerificationToken(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.emailVerificationTokenHash, tokenHash)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAdminUserDetail(userId: number) {
  const user = await getUserById(userId);
  if (!user) return undefined;
  const [userEarnings, userOffers, userWithdrawals, userTransactions, userActivities, userPostbacks] = await Promise.all([
    getEarningsByUserId(userId).catch(() => []), getOfferHistoryByUserId(userId).catch(() => []), getWithdrawalsByUserId(userId).catch(() => []),
    getWalletTransactionsByUserId(userId).catch(() => []), getActivitiesByUserId(userId).catch(() => []), getPostbackLogsByUser(userId).catch(() => []),
  ]);
  return { user, earnings: userEarnings, offers: userOffers, withdrawals: userWithdrawals, transactions: userTransactions, activities: userActivities, postbacks: userPostbacks };
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  // Case-insensitive: offer wall gửi username dạng lowercase nhưng DB lưu đúng case
  const result = await db
    .select()
    .from(users)
    .where(sql`LOWER(username) = LOWER(${username})`)
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(sql`LOWER(email) = LOWER(${email})`).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Resolve legacy virtual-auth rows when a provider sends the base username. */
export async function getUserByVirtualUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(sql`LOWER(username) LIKE LOWER(${`virtual_${username}_%`})`)
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreatePostbackTestUser() {
  const username = "postback_test_user";
  const existing = await getUserByUsername(username);
  if (existing) return existing;
  await upsertUser({
    openId: username,
    username,
    name: "Postback Test User",
    role: "user",
    balance: "0.00",
    totalEarned: "0.00",
  });
  return getUserByUsername(username);
}

export async function getUserByRefCode(refCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.refCode, refCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReferralsByRefCode(refCode: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    username: users.username,
    createdAt: users.createdAt,
    totalEarned: users.totalEarned,
    offersCompleted: users.offersCompleted,
  }).from(users).where(eq(users.referredBy, refCode)).orderBy(desc(users.createdAt));
}

export async function updateUserProfile(userId: number, update: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  const set: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(update)) {
    if (value !== undefined) set[key] = value;
  }
  if (Object.keys(set).length > 0) {
    await db.update(users).set(set).where(eq(users.id, userId));
  }
}

export async function addBalance(userId: number, amount: number) {
  const db = await getDb();
  // Throw rõ ràng nếu DB không kết nối được — không silent-return để caller biết lỗi
  if (!db) throw new Error("[DB] DATABASE_URL not configured or DB connection failed — cannot credit user balance");
  await db
    .update(users)
    .set({
      balance: sql`balance + ${amount}`,
      totalEarned: sql`"totalEarned" + ${amount}`,
    })
    .where(eq(users.id, userId));
}

export async function refundBalance(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("[DB] Database not available — cannot refund withdrawal balance");
  await db.update(users).set({ balance: sql`balance + ${amount}` }).where(eq(users.id, userId));
}

export async function deductBalance(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("[DB] DATABASE_URL not configured or DB connection failed — cannot deduct balance");
  await db
    .update(users)
    .set({ balance: sql`balance - ${amount}` })
    .where(eq(users.id, userId));
}

/** Atomically reserve funds only when the authenticated user has enough balance. */
export async function deductBalanceIfSufficient(userId: number, amount: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("[DB] DATABASE_URL not configured or DB connection failed — cannot deduct balance");
  const result = await db
    .update(users)
    .set({ balance: sql`balance - ${amount}` })
    .where(and(eq(users.id, userId), sql`balance >= ${amount}`));
  return Number((result as any).count ?? (result as any)[0]?.affectedRows ?? 0) === 1;
}

export async function addXP(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return; // XP là non-critical, không throw
  await db
    .update(users)
    .set({ xp: sql`xp + ${amount}` })
    .where(eq(users.id, userId));
}

export async function incrementOffers(userId: number) {
  const db = await getDb();
  if (!db) return; // non-critical
  await db
    .update(users)
    .set({ offersCompleted: sql`"offersCompleted" + 1` })
    .where(eq(users.id, userId));
}

export async function incrementStreak(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ streak: sql`streak + 1` })
    .where(eq(users.id, userId));
}

export async function addRefEarnings(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ refEarnings: sql`"refEarnings" + ${amount}` })
    .where(eq(users.id, userId));
}

export async function setLastDailyClaim(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastDailyClaim: new Date() }).where(eq(users.id, userId));
}

// ===== WITHDRAWALS =====

export async function createWithdrawal(data: InsertWithdrawal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.insert(withdrawals).values({
    userId: data.userId,
    amount: data.amount,
    cryptoType: data.cryptoType,
    walletAddress: data.walletAddress,
    status: data.status ?? "pending",
  }).returning({ id: withdrawals.id });
  const id = Number(rows[0]?.id || 0);
  if (!id) throw new Error("Withdrawal request was not created");
  return { insertId: id };
}

export async function getWithdrawalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWithdrawalsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(desc(withdrawals.createdAt));
}

export async function getPendingWithdrawalByDetails(userId: number, amount: string, cryptoType: string, walletAddress: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      // Only the id is needed for duplicate detection. Selecting the full row
      // made legacy databases fail before the request could be created when
      // optional approval timestamp columns were absent.
      .select({ id: withdrawals.id })
      .from(withdrawals)
      .where(and(
        eq(withdrawals.userId, userId),
        eq(withdrawals.amount, amount),
        eq(withdrawals.cryptoType, cryptoType as any),
        eq(withdrawals.walletAddress, walletAddress),
        eq(withdrawals.status, "pending"),
      ))
      .limit(1);
    return result[0];
  } catch (error) {
    // A legacy production table may reject this compatibility lookup even
    // after additive migrations. Do not block a legitimate withdrawal; the
    // insert below remains authoritative and its failure path refunds funds.
    console.warn("[Withdrawal] Duplicate lookup unavailable; continuing to create request:", error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

export async function getAllWithdrawals(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status && status !== "all") {
    return db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.status, status as any))
      .orderBy(desc(withdrawals.createdAt));
  }
  return db
    .select()
    .from(withdrawals)
    .orderBy(desc(withdrawals.createdAt));
}

export async function updateWithdrawalStatus(id: number, status: "approved" | "rejected", adminNote?: string) {
  const db = await getDb();
  if (!db) return false;
  const set: Record<string, unknown> = { status };
  if (adminNote) set.adminNote = adminNote;
  if (status === "approved") set.approvedAt = new Date();
  if (status === "rejected") set.rejectedAt = new Date();
  const result = await db.update(withdrawals).set(set).where(and(eq(withdrawals.id, id), eq(withdrawals.status, "pending")));
  return Number((result as any).count ?? (result as any)[0]?.affectedRows ?? 0) === 1;
}

/** Resolve a pending withdrawal once, refunding rejected requests in the same transaction. */
export async function resolveWithdrawalStatus(id: number, status: "approved" | "rejected", adminNote?: string) {
  const db = await getDb();
  if (!db) return null;
  return db.transaction(async (tx) => {
    const pending = await tx.select().from(withdrawals).where(and(eq(withdrawals.id, id), eq(withdrawals.status, "pending"))).limit(1);
    const withdrawal = pending[0];
    if (!withdrawal) return null;

    const set: Record<string, unknown> = { status };
    if (adminNote) set.adminNote = adminNote;
    if (status === "approved") set.approvedAt = new Date();
    if (status === "rejected") set.rejectedAt = new Date();

    if (status === "rejected") {
      await tx.update(users).set({ balance: sql`balance + ${Number(withdrawal.amount)}` }).where(eq(users.id, withdrawal.userId));
    }
    const result = await tx.update(withdrawals).set(set).where(and(eq(withdrawals.id, id), eq(withdrawals.status, "pending")));
    if (Number((result as any).count ?? (result as any)[0]?.affectedRows ?? 0) !== 1) return null;
    return withdrawal;
  });
}

// ===== EARNINGS =====

export async function addEarning(data: InsertEarning) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(earnings).values(data);
  return result[0];
}

export async function getEarningsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(earnings)
    .where(eq(earnings.userId, userId))
    .orderBy(desc(earnings.createdAt));
}

// ===== LEADERBOARD =====

export async function getLeaderboard() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(leaderboard)
    .orderBy(desc(leaderboard.totalEarned));
}

export async function updateLeaderboard(userId: number, username: string, totalEarned: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db
    .select()
    .from(leaderboard)
    .where(eq(leaderboard.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(leaderboard)
      .set({ totalEarned: String(totalEarned) })
      .where(eq(leaderboard.userId, userId));
  } else {
    await db.insert(leaderboard).values({ userId, username, totalEarned: String(totalEarned) });
  }
}

// ===== ACTIVITIES (TICKER) =====

export async function addActivity(data: InsertActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activities).values(data);
  return result[0];
}

export async function getActivitiesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt)).limit(100);
}

export async function getRecentActivities(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}

// ===== POSTBACK CREDENTIALS =====

export async function getPostbackCredential(provider: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(postbackCredentials).where(eq(postbackCredentials.provider, provider)).limit(1);
  return rows[0];
}

export async function getOrCreatePostbackToken(provider: string, rotate = false): Promise<string> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const existing = await getPostbackCredential(provider);
  if (existing && !rotate) return existing.token;
  // Preserve an already-configured provider secret during migration. New
  // providers without an env secret receive a cryptographically random token.
  if (!existing && !rotate && POSTBACK_SECRETS[provider]) {
    const legacyToken = POSTBACK_SECRETS[provider];
    await database.insert(postbackCredentials).values({ provider, token: legacyToken });
    return legacyToken;
  }
  const token = randomBytes(32).toString("base64url");
  if (existing) {
    await database.update(postbackCredentials)
      .set({ token, rotatedAt: new Date() })
      .where(eq(postbackCredentials.provider, provider));
  } else {
    await database.insert(postbackCredentials).values({ provider, token });
  }
  return token;
}

/**
 * Returns the active callback credential. Signed providers are different from
 * token-based providers: their callback signature is generated by the network
 * with the provider secret, so a random database-generated admin token must
 * never override the deployment secret used by the network.
 */
export async function getActivePostbackSecret(provider: string): Promise<string> {
  const signedProviders = new Set(["revtoo", "cointo", "adswedmedia", "gaintwall", "theoremreach", "timewall", "pocketsfull"]);
  if (signedProviders.has(provider) && POSTBACK_SECRETS[provider]) {
    return POSTBACK_SECRETS[provider];
  }
  const stored = await getPostbackCredential(provider);
  return stored?.token || POSTBACK_SECRETS[provider] || "";
}

// ===== POSTBACKS =====

export async function checkPostbackDuplicate(provider: string, externalId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(postbacks)
    .where(
      and(eq(postbacks.provider, provider), eq(postbacks.externalId, externalId))
    )
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function logPostback(data: InsertPostback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(postbacks).values(data);
  return result[0];
}

export async function getAllPostbacks() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(postbacks)
    .orderBy(desc(postbacks.createdAt));
}

export async function getUserByUsernamePassword(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== ADMIN =====

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    username: users.username,
    name: users.name,
    email: users.email,
    role: users.role,
    balance: users.balance,
    xp: users.xp,
    streak: users.streak,
    offersCompleted: users.offersCompleted,
    totalEarned: users.totalEarned,
    refEarnings: users.refEarnings,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.createdAt));
}

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return null;
  const activeSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [
    userCount,
    activeUserCount,
    totalBalanceResult,
    totalRewardsResult,
    totalWithdrawnResult,
    pendingWithdrawals,
    approvedWithdrawals,
    rejectedWithdrawals,
    totalOffersResult,
    offersCompletedTodayResult,
    offerAmountTodayResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.lastSignedIn, activeSince)),
    db.select({ total: sql<string>`SUM(balance)` }).from(users),
    db.select({ total: sql<string>`COALESCE(SUM("totalEarned"), 0)` }).from(users),
    db.select({ total: sql<string>`SUM(amount)` }).from(withdrawals).where(eq(withdrawals.status, "approved" as any)),
    db.select({ count: sql<number>`count(*)` }).from(withdrawals).where(eq(withdrawals.status, "pending" as any)),
    db.select({ count: sql<number>`count(*)` }).from(withdrawals).where(eq(withdrawals.status, "approved" as any)),
    db.select({ count: sql<number>`count(*)` }).from(withdrawals).where(eq(withdrawals.status, "rejected" as any)),
    db.select({ total: sql<string>`COALESCE(SUM("offersCompleted"), 0)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(activities).where(and(eq(activities.type, "offer_complete"), gte(activities.createdAt, startOfDay))),
    db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` }).from(activities).where(and(eq(activities.type, "offer_complete"), gte(activities.createdAt, startOfDay))),
  ]);

  return {
    userCount: Number(userCount[0]?.count || 0),
    activeUserCount: Number(activeUserCount[0]?.count || 0),
    totalBalance: parseFloat(totalBalanceResult[0]?.total || "0"),
    totalRewards: parseFloat(totalRewardsResult[0]?.total || "0"),
    totalWithdrawn: parseFloat(totalWithdrawnResult[0]?.total || "0"),
    pendingWithdrawals: Number(pendingWithdrawals[0]?.count || 0),
    approvedWithdrawals: Number(approvedWithdrawals[0]?.count || 0),
    rejectedWithdrawals: Number(rejectedWithdrawals[0]?.count || 0),
    totalOffersCompleted: parseInt(totalOffersResult[0]?.total || "0"),
    offersCompletedToday: Number(offersCompletedTodayResult[0]?.count || 0),
    offerAmountToday: parseFloat(offerAmountTodayResult[0]?.total || "0"),
  };
}
// ===== WALLET TRANSACTIONS =====

export async function addWalletTransaction(data: InsertWalletTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(walletTransactions).values(data);
  return result[0];
}

export async function getWalletTransactionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt));
}

export async function addAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// ===== OFFER HISTORY =====

export async function addOfferHistory(data: InsertOfferHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(offerHistory).values(data);
  return result[0];
}

export async function getOfferHistoryByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(offerHistory)
    .where(eq(offerHistory.userId, userId))
    .orderBy(desc(offerHistory.createdAt));
}

export async function getPendingOfferHistory(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: offerHistory.id,
      userId: offerHistory.userId,
      username: users.username,
      provider: offerHistory.provider,
      offerName: offerHistory.offerName,
      amount: offerHistory.amount,
      externalId: offerHistory.externalId,
      status: offerHistory.status,
      createdAt: offerHistory.createdAt,
    })
    .from(offerHistory)
    .leftJoin(users, eq(offerHistory.userId, users.id))
    .where(eq(offerHistory.status, "pending"))
    .orderBy(desc(offerHistory.createdAt))
    .limit(limit);
}

/** Approve one pending offer atomically and credit it exactly once. */
export async function resolvePendingOffer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(offerHistory)
      .where(and(eq(offerHistory.id, id), eq(offerHistory.status, "pending")))
      .limit(1);
    const offer = rows[0];
    if (!offer) return null;

    const amount = Number(offer.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Pending offer amount is invalid");
    const userRows = await tx.select({ username: users.username }).from(users).where(eq(users.id, offer.userId)).limit(1);
    const username = userRows[0]?.username || `User #${offer.userId}`;

    const updateResult = await tx
      .update(offerHistory)
      .set({ status: "completed" })
      .where(and(eq(offerHistory.id, id), eq(offerHistory.status, "pending")));
    if (Number((updateResult as any)[0]?.affectedRows ?? 0) !== 1) return null;

    await tx.update(users).set({
      balance: sql`balance + ${amount}`,
      totalEarned: sql`"totalEarned" + ${amount}`,
      offersCompleted: sql`"offersCompleted" + 1`,
    }).where(eq(users.id, offer.userId));
    await tx.insert(earnings).values({ userId: offer.userId, amount: amount.toFixed(2), type: "offer", source: `[${offer.provider}] ${offer.offerName || "Offer"}` });
    await tx.insert(walletTransactions).values({ userId: offer.userId, type: "credit", amount: amount.toFixed(2), description: `Earned $${amount.toFixed(2)} on ${offer.provider}${offer.offerName ? ` — ${offer.offerName}` : ""}`, source: offer.provider });
    await tx.insert(activities).values({ userId: offer.userId, username, type: "offer_complete", description: `earned $${amount.toFixed(2)} on ${offer.provider}${offer.offerName ? ` — ${offer.offerName}` : ""}`, amount: amount.toFixed(2) });
    await tx.insert(notifications).values({ userId: offer.userId, title: "Pending reward approved", message: `Your ${offer.provider} reward of $${amount.toFixed(2)} was approved and added to your balance.`, type: "reward", isRead: 0 });
    return { ...offer, amount: amount.toFixed(2) };
  });
}


export async function getFeaturedOffers(userId: string, limit = 24) {
  return getRevtooFeaturedOffers(userId, limit);
}
// ===== NOTIFICATIONS =====

export async function addNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0];
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id));
}

export async function markNotificationAsReadForUser(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
}

// ===== POSTBACK LOGS (detailed audit trail) =====

export async function logPostbackDetail(data: InsertPostbackLog) {
  const db = await getDb();
  if (!db) return; // non-critical — never crash if DB unavailable
  try {
    await db.insert(postbackLogs).values({
      ...data,
      // Truncate headers/body to 8 KB each to avoid row size issues
      headers:     data.headers?.substring(0, 8000),
      queryParams: data.queryParams?.substring(0, 4000),
      bodyParams:  data.bodyParams?.substring(0, 4000),
      result:      data.result?.substring(0, 4000),
      errorMessage: data.errorMessage?.substring(0, 1000),
    });
  } catch (err) {
    console.warn("[DB] logPostbackDetail insert failed (non-critical):", (err as any)?.message);
  }
}

export async function getPostbackLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(postbackLogs)
    .orderBy(desc(postbackLogs.createdAt))
    .limit(limit);
}

export async function getPostbackLogById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(postbackLogs)
    .where(eq(postbackLogs.id, id))
    .limit(1);
  return rows[0];
}

export async function getPostbackLogsByProvider(provider: string, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(postbackLogs)
    .where(eq(postbackLogs.provider, provider))
    .orderBy(desc(postbackLogs.createdAt))
    .limit(limit);
}

export async function getPostbackLogsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(postbackLogs)
    .where(eq(postbackLogs.userId, userId))
    .orderBy(desc(postbackLogs.createdAt))
    .limit(limit);
}
