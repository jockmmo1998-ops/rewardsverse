-- Additive admin controls: account suspension and immutable audit records.
ALTER TABLE `users`
  ADD COLUMN `accountStatus` enum('active','suspended') NOT NULL DEFAULT 'active',
  ADD COLUMN `suspensionReason` text;

CREATE TABLE `audit_logs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `adminUserId` int NOT NULL,
  `action` varchar(64) NOT NULL,
  `targetType` varchar(32),
  `targetId` varchar(128),
  `details` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `audit_logs_admin_idx` ON `audit_logs` (`adminUserId`);
--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);
--> statement-breakpoint
CREATE INDEX `audit_logs_created_idx` ON `audit_logs` (`createdAt`);
