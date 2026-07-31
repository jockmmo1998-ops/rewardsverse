import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  index,
  tinyint,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    username: varchar("username", { length: 64 }).unique(),
    password: varchar("password", { length: 256 }),
    refCode: varchar("refCode", { length: 16 }),
    referredBy: varchar("referredBy", { length: 16 }),
    balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
    xp: int("xp").default(0),
    streak: int("streak").default(0),
    offersCompleted: int("offersCompleted").default(0),
    totalEarned: decimal("totalEarned", { precision: 10, scale: 2 }).default("0.00"),
    refEarnings: decimal("refEarnings", { precision: 10, scale: 2 }).default("0.00"),
    lastDailyClaim: timestamp("lastDailyClaim"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: index("users_username_idx").on(table.username),
    refCodeIdx: index("users_refcode_idx").on(table.refCode),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Withdrawal requests table.
 */
export const withdrawals = mysqlTable(
  "withdrawals",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    cryptoType: mysqlEnum("cryptoType", [
      "bitcoin",
      "ethereum",
      "usdt_trc20",
      "usdt_erc20",
      "solana",
      "litecoin",
      "dogecoin",
    ]).notNull(),
    walletAddress: text("walletAddress").notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    adminNote: text("adminNote"),
    approvedAt: timestamp("approvedAt"),
    rejectedAt: timestamp("rejectedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("withdrawals_userId_idx").on(table.userId),
    statusIdx: index("withdrawals_status_idx").on(table.status),
  })
);

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

/**
 * Earnings history table.
 */
export const earnings = mysqlTable(
  "earnings",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    type: mysqlEnum("type", [
      "offer",
      "daily_bonus",
      "spin",
      "ai_task",
      "social_task",
      "referral",
    ]).notNull(),
    source: text("source"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("earnings_userId_idx").on(table.userId),
    typeIdx: index("earnings_type_idx").on(table.type),
  })
);

export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = typeof earnings.$inferInsert;

/**
 * Leaderboard cache for fast ranking.
 */
export const leaderboard = mysqlTable(
  "leaderboard",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    totalEarned: decimal("totalEarned", { precision: 10, scale: 2 }).default("0.00"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("leaderboard_userId_idx").on(table.userId),
  })
);

export type Leaderboard = typeof leaderboard.$inferSelect;
export type InsertLeaderboard = typeof leaderboard.$inferInsert;

/**
 * Postback log for tracking offer wall callbacks (idempotency).
 */
export const postbacks = mysqlTable(
  "postbacks",
  {
    id: int("id").autoincrement().primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    externalId: varchar("externalId", { length: 128 }).notNull(),
    userId: int("userId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    offerName: text("offerName"),
    status: mysqlEnum("status", ["processed", "duplicate", "failed"]).default("processed").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    providerIdx: index("postbacks_provider_idx").on(table.provider),
    externalIdIdx: index("postbacks_externalId_idx").on(table.externalId),
    providerExternalIdx: index("postbacks_provider_external_idx").on(table.provider, table.externalId),
  })
);

export type Postback = typeof postbacks.$inferSelect;
export type InsertPostback = typeof postbacks.$inferInsert;

/**
 * Activity log for real-time ticker.
 */
export const activities = mysqlTable(
  "activities",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    type: mysqlEnum("type", ["offer_complete", "withdrawal", "daily_claim", "referral"]).notNull(),
    description: text("description").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("activities_userId_idx").on(table.userId),
    typeIdx: index("activities_type_idx").on(table.type),
    createdIdx: index("activities_created_idx").on(table.createdAt),
  })
);

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * Wallet transactions table for tracking balance changes.
 */
export const walletTransactions = mysqlTable(
  "wallet_transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["credit", "debit"]).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    description: text("description").notNull(),
    source: varchar("source", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("wallet_transactions_userId_idx").on(table.userId),
    typeIdx: index("wallet_transactions_type_idx").on(table.type),
  })
);

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

/**
 * Offer history table for tracking completed offers.
 */
export const offerHistory = mysqlTable(
  "offer_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    offerName: text("offerName"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    externalId: varchar("externalId", { length: 128 }),
    status: mysqlEnum("status", ["completed", "pending", "failed"]).default("completed").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("offer_history_userId_idx").on(table.userId),
    providerIdx: index("offer_history_provider_idx").on(table.provider),
  })
);

export type OfferHistory = typeof offerHistory.$inferSelect;
export type InsertOfferHistory = typeof offerHistory.$inferInsert;

/**
 * Notifications table for user-facing notifications.
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 128 }).notNull(),
    message: text("message").notNull(),
    type: mysqlEnum("type", ["reward", "withdrawal", "system", "offer"]).default("system").notNull(),
    isRead: tinyint("isRead").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notifications_userId_idx").on(table.userId),
    typeIdx: index("notifications_type_idx").on(table.type),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Detailed postback audit log — every request in full, for debugging.
 */
export const postbackLogs = mysqlTable(
  "postback_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    provider: varchar("provider", { length: 64 }).notNull(),
    ip: varchar("ip", { length: 64 }),
    method: varchar("method", { length: 8 }).notNull().default("GET"),
    headers: text("headers"),
    queryParams: text("queryParams"),
    bodyParams: text("bodyParams"),
    userId: int("userId").notNull().default(0),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    transactionId: varchar("transactionId", { length: 256 }),
    offerName: text("offerName"),
    status: mysqlEnum("status", ["processed", "duplicate", "failed"]).default("processed").notNull(),
    result: text("result"),
    errorMessage: text("errorMessage"),
    processingMs: int("processingMs"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    providerIdx:  index("postback_logs_provider_idx").on(table.provider),
    userIdIdx:    index("postback_logs_userId_idx").on(table.userId),
    statusIdx:    index("postback_logs_status_idx").on(table.status),
    createdIdx:   index("postback_logs_created_idx").on(table.createdAt),
    txidIdx:      index("postback_logs_txid_idx").on(table.transactionId),
  })
);

export type PostbackLog = typeof postbackLogs.$inferSelect;
export type InsertPostbackLog = typeof postbackLogs.$inferInsert;
