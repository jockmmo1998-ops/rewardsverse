CREATE TABLE IF NOT EXISTS "activities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "activities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"username" varchar(64) NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"adminUserId" integer NOT NULL,
	"action" varchar(64) NOT NULL,
	"targetType" varchar(32),
	"targetId" varchar(128),
	"details" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "earnings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "earnings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"type" text NOT NULL,
	"source" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leaderboard" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "leaderboard_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"username" varchar(64) NOT NULL,
	"totalEarned" numeric(10, 2) DEFAULT '0.00',
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"title" varchar(128) NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'system' NOT NULL,
	"isRead" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "offer_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "offer_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"provider" varchar(32) NOT NULL,
	"offerName" text,
	"amount" numeric(10, 2) NOT NULL,
	"externalId" varchar(128),
	"status" text DEFAULT 'completed' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "postback_credentials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "postback_credentials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider" varchar(64) NOT NULL,
	"token" varchar(128) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"rotatedAt" timestamp,
	CONSTRAINT "postback_credentials_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "postback_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "postback_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider" varchar(64) NOT NULL,
	"ip" varchar(64),
	"method" varchar(8) DEFAULT 'GET' NOT NULL,
	"headers" text,
	"queryParams" text,
	"bodyParams" text,
	"userId" integer DEFAULT 0 NOT NULL,
	"amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"transactionId" varchar(256),
	"offerName" text,
	"status" text DEFAULT 'processed' NOT NULL,
	"result" text,
	"errorMessage" text,
	"processingMs" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "postbacks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "postbacks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider" varchar(32) NOT NULL,
	"externalId" varchar(128) NOT NULL,
	"userId" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"offerName" text,
	"status" text DEFAULT 'processed' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"accountStatus" text DEFAULT 'active' NOT NULL,
	"suspensionReason" text,
	"username" varchar(64),
	"password" varchar(256),
	"refCode" varchar(16),
	"referredBy" varchar(16),
	"balance" numeric(10, 2) DEFAULT '0.00',
	"xp" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"offersCompleted" integer DEFAULT 0,
	"totalEarned" numeric(10, 2) DEFAULT '0.00',
	"refEarnings" numeric(10, 2) DEFAULT '0.00',
	"lastDailyClaim" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallet_transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wallet_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"source" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "withdrawals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "withdrawals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"cryptoType" text NOT NULL,
	"walletAddress" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"adminNote" text,
	"approvedAt" timestamp,
	"rejectedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activities_userId_idx" ON "activities" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activities_type_idx" ON "activities" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activities_created_idx" ON "activities" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_admin_idx" ON "audit_logs" USING btree ("adminUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_idx" ON "audit_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "earnings_userId_idx" ON "earnings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "earnings_type_idx" ON "earnings" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leaderboard_userId_idx" ON "leaderboard" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offer_history_userId_idx" ON "offer_history" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offer_history_provider_idx" ON "offer_history" USING btree ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postback_credentials_provider_idx" ON "postback_credentials" USING btree ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postback_logs_provider_idx" ON "postback_logs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postback_logs_userId_idx" ON "postback_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postback_logs_status_idx" ON "postback_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postback_logs_created_idx" ON "postback_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postback_logs_txid_idx" ON "postback_logs" USING btree ("transactionId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postbacks_provider_idx" ON "postbacks" USING btree ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postbacks_externalId_idx" ON "postbacks" USING btree ("externalId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "postbacks_provider_external_idx" ON "postbacks" USING btree ("provider","externalId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_refcode_idx" ON "users" USING btree ("refCode");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wallet_transactions_userId_idx" ON "wallet_transactions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wallet_transactions_type_idx" ON "wallet_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "withdrawals_userId_idx" ON "withdrawals" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "withdrawals_status_idx" ON "withdrawals" USING btree ("status");