CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(64) NOT NULL,
	`type` enum('offer_complete','withdrawal','daily_claim','referral') NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`type` enum('offer','daily_bonus','spin','ai_task','social_task','referral') NOT NULL,
	`source` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(64) NOT NULL,
	`totalEarned` decimal(10,2) DEFAULT '0.00',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(32) NOT NULL,
	`externalId` varchar(128) NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`offerName` text,
	`status` enum('processed','duplicate','failed') NOT NULL DEFAULT 'processed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`cryptoType` enum('bitcoin','ethereum','usdt_trc20','usdt_erc20','solana','litecoin','dogecoin') NOT NULL,
	`walletAddress` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`approvedAt` timestamp,
	`rejectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `refCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `balance` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `users` ADD `xp` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `streak` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `offersCompleted` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `totalEarned` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `users` ADD `refEarnings` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `users` ADD `lastDailyClaim` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
CREATE INDEX `activities_userId_idx` ON `activities` (`userId`);--> statement-breakpoint
CREATE INDEX `activities_type_idx` ON `activities` (`type`);--> statement-breakpoint
CREATE INDEX `activities_created_idx` ON `activities` (`createdAt`);--> statement-breakpoint
CREATE INDEX `earnings_userId_idx` ON `earnings` (`userId`);--> statement-breakpoint
CREATE INDEX `earnings_type_idx` ON `earnings` (`type`);--> statement-breakpoint
CREATE INDEX `leaderboard_userId_idx` ON `leaderboard` (`userId`);--> statement-breakpoint
CREATE INDEX `postbacks_provider_idx` ON `postbacks` (`provider`);--> statement-breakpoint
CREATE INDEX `postbacks_externalId_idx` ON `postbacks` (`externalId`);--> statement-breakpoint
CREATE INDEX `postbacks_provider_external_idx` ON `postbacks` (`provider`,`externalId`);--> statement-breakpoint
CREATE INDEX `withdrawals_userId_idx` ON `withdrawals` (`userId`);--> statement-breakpoint
CREATE INDEX `withdrawals_status_idx` ON `withdrawals` (`status`);--> statement-breakpoint
CREATE INDEX `users_username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_refcode_idx` ON `users` (`refCode`);