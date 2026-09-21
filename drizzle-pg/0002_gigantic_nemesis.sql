ALTER TABLE "users" ADD COLUMN "emailVerificationTokenHash" varchar(64);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emailVerificationExpiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emailVerificationSentAt" timestamp;