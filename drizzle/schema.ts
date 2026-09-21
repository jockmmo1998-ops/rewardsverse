import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  index,
} from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable(
  "users",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    avatar: text("avatar"),
    email: varchar("email", { length: 320 }),
    emailVerifiedAt: timestamp("emailVerifiedAt"),
    emailVerificationTokenHash: varchar("emailVerificationTokenHash", { length: 64 }),
    emailVerificationExpiresAt: timestamp("emailVerificationExpiresAt"),
    emailVerificationSentAt: timestamp("emailVerificationSentAt"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: text("role").default("user").notNull(),
    accountStatus: text("accountStatus").default("active").notNull(),
    suspensionReason: text("suspensionReason"),
    username: varchar("username", { length: 64 }).unique(),
    password: varchar("password", { length: 256 }),
    refCode: varchar("refCode", { length: 16 }),
    referredBy: varchar("referredBy", { length: 16 }),
    balance: numeric("balance", { precision: 10, scale: 2 }).default("0.00"),
    xp: integer("xp").default(0),
    streak: integer("streak").default(0),
    offersCompleted: integer("offersCompleted").default(0),
    totalEarned: numeric("totalEarned", { precision: 10, scale: 2 }).default("0.00"),
    refEarnings: numeric("refEarnings", { precision: 10, scale: 2 }).default("0.00"),
    lastDailyClaim: timestamp("lastDailyClaim"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: index("users_username_idx").on(table.username),
    refCodeIdx: index("users_refcode_idx").on(table.refCode),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Immutable server-side record of sensitive administrator actions. */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    adminUserId: integer("adminUserId").notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("targetType", { length: 32 }),
    targetId: varchar("targetId", { length: 128 }),
    details: text("details"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    adminIdx: index("audit_logs_admin_idx").on(table.adminUserId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    createdIdx: index("audit_logs_created_idx").on(table.createdAt),
  }),
);
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/** Server-managed Postback credentials. The raw token is only returned to an
 * authenticated admin when generating/copying a URL; it is never committed. */
export const postbackCredentials = pgTable(
  "postback_credentials",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    provider: varchar("provider", { length: 64 }).notNull().unique(),
    token: varchar("token", { length: 128 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    rotatedAt: timestamp("rotatedAt"),
  },
  (table) => ({ providerIdx: index("postback_credentials_provider_idx").on(table.provider) }),
);
export type PostbackCredential = typeof postbackCredentials.$inferSelect;
export type InsertPostbackCredential = typeof postbackCredentials.$inferInsert;

/**
 * Withdrawal requests table.
 */
export const withdrawals = pgTable(
  "withdrawals",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: integer("userId").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    cryptoType: text("cryptoType").notNull(),
    walletAddress: text("walletAddress").notNull(),
    status: text("status").default("pending").notNull(),
    adminNote: text("adminNote"),
    approvedAt: timestamp("approvedAt"),
    rejectedAt: timestamp("rejectedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
export const earnings = pgTable(
  "earnings",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: integer("userId").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    type: text("type").notNull(),
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
export const leaderboard = pgTable(
  "leaderboard",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: integer("userId").notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    totalEarned: numeric("totalEarned", { precision: 10, scale: 2 }).default("0.00"),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
export const postbacks = pgTable(
  "postbacks",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    externalId: varchar("externalId", { length: 128 }).notNull(),
    userId: integer("userId").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    offerName: text("offerName"),
    status: text("status").default("processed").notNull(),
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
export const activities = pgTable(
  "activities",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: integer("userId").notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    type: text("type").notNull(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }),
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
export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: integer("userId").notNull(),
    type: text("type").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
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
export const offerHistory = pgTable(
  "offer_history",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: integer("userId").notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    offerName: text("offerName"),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    externalId: varchar("externalId", { length: 128 }),
    status: text("status").default("completed").notNull(),
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
export const notifications = pgTable(
  "notifications",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: integer("userId").notNull(),
    title: varchar("title", { length: 128 }).notNull(),
    message: text("message").notNull(),
    type: text("type").default("system").notNull(),
    isRead: integer("isRead").default(0),
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
export const postbackLogs = pgTable(
  "postback_logs",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    provider: varchar("provider", { length: 64 }).notNull(),
    ip: varchar("ip", { length: 64 }),
    method: varchar("method", { length: 8 }).notNull().default("GET"),
    headers: text("headers"),
    queryParams: text("queryParams"),
    bodyParams: text("bodyParams"),
    userId: integer("userId").notNull().default(0),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    transactionId: varchar("transactionId", { length: 256 }),
    offerName: text("offerName"),
    status: text("status").default("processed").notNull(),
    result: text("result"),
    errorMessage: text("errorMessage"),
    processingMs: integer("processingMs"),
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
