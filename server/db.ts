import { eq, desc, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
  users,
  withdrawals,
  earnings,
  leaderboard,
  postbacks,
  activities,
  walletTransactions,
  offerHistory,
  notifications,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "username", "refCode", "referredBy", "password"] as const;
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

    console.log("[Database] upsertUser values:", JSON.stringify(values));
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
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

export async function getUserByRefCode(refCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.refCode, refCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
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
  if (!db) return;
  await db
    .update(users)
    .set({
      balance: sql`balance + ${amount}`,
      totalEarned: sql`totalEarned + ${amount}`,
    })
    .where(eq(users.id, userId));
}

export async function deductBalance(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ balance: sql`balance - ${amount}` })
    .where(eq(users.id, userId));
}

export async function addXP(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ xp: sql`xp + ${amount}` })
    .where(eq(users.id, userId));
}

export async function incrementOffers(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ offersCompleted: sql`offersCompleted + 1` })
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
    .set({ refEarnings: sql`refEarnings + ${amount}` })
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
  const result = await db.insert(withdrawals).values(data);
  return result[0];
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
  if (!db) return;
  const set: Record<string, unknown> = { status };
  if (adminNote) set.adminNote = adminNote;
  if (status === "approved") set.approvedAt = new Date();
  if (status === "rejected") set.rejectedAt = new Date();
  await db.update(withdrawals).set(set).where(eq(withdrawals.id, id));
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

export async function getRecentActivities(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(limit);
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
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return null;
  const [
    userCount,
    totalBalanceResult,
    totalWithdrawnResult,
    pendingWithdrawals,
    totalOffersResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ total: sql<string>`SUM(balance)` }).from(users),
    db.select({ total: sql<string>`SUM(amount)` }).from(withdrawals).where(eq(withdrawals.status, "approved" as any)),
    db.select({ count: sql<number>`count(*)` }).from(withdrawals).where(eq(withdrawals.status, "pending" as any)),
    db.select({ total: sql<string>`SUM(offersCompleted)` }).from(users),
  ]);

  return {
    userCount: userCount[0]?.count || 0,
    totalBalance: parseFloat(totalBalanceResult[0]?.total || "0"),
    totalWithdrawn: parseFloat(totalWithdrawnResult[0]?.total || "0"),
    pendingWithdrawals: pendingWithdrawals[0]?.count || 0,
    totalOffersCompleted: parseInt(totalOffersResult[0]?.total || "0"),
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

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
}
