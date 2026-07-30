CREATE TABLE `wallet_transactions` (
    `id` int AUTO_INCREMENT NOT NULL,
    `userId` int NOT NULL,
    `type` enum('credit','debit') NOT NULL,
    `amount` decimal(10,2) NOT NULL,
    `description` text NOT NULL,
    `source` varchar(64),
    `createdAt` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT `wallet_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offer_history` (
    `id` int AUTO_INCREMENT NOT NULL,
    `userId` int NOT NULL,
    `provider` varchar(32) NOT NULL,
    `offerName` text,
    `amount` decimal(10,2) NOT NULL,
    `externalId` varchar(128),
    `status` enum('completed','pending','failed') NOT NULL DEFAULT 'completed',
    `createdAt` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT `offer_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
    `id` int AUTO_INCREMENT NOT NULL,
    `userId` int NOT NULL,
    `title` varchar(128) NOT NULL,
    `message` text NOT NULL,
    `type` enum('reward','withdrawal','system','offer') NOT NULL DEFAULT 'system',
    `isRead` tinyint DEFAULT 0,
    `createdAt` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `wallet_transactions_userId_idx` ON `wallet_transactions` (`userId`);--> statement-breakpoint
CREATE INDEX `wallet_transactions_type_idx` ON `wallet_transactions` (`type`);--> statement-breakpoint
CREATE INDEX `offer_history_userId_idx` ON `offer_history` (`userId`);--> statement-breakpoint
CREATE INDEX `offer_history_provider_idx` ON `offer_history` (`provider`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);
