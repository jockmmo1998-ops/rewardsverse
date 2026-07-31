-- Migration 0003: Detailed postback_logs table for full request auditing
CREATE TABLE `postback_logs` (
    `id` int AUTO_INCREMENT NOT NULL,
    `provider` varchar(64) NOT NULL,
    `ip` varchar(64),
    `method` varchar(8) NOT NULL DEFAULT 'GET',
    `headers` text,
    `queryParams` text,
    `bodyParams` text,
    `userId` int NOT NULL DEFAULT 0,
    `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
    `transactionId` varchar(256),
    `offerName` text,
    `status` enum('processed','duplicate','failed') NOT NULL DEFAULT 'processed',
    `result` text,
    `errorMessage` text,
    `processingMs` int,
    `createdAt` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT `postback_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `postback_logs_provider_idx` ON `postback_logs` (`provider`);
--> statement-breakpoint
CREATE INDEX `postback_logs_userId_idx` ON `postback_logs` (`userId`);
--> statement-breakpoint
CREATE INDEX `postback_logs_status_idx` ON `postback_logs` (`status`);
--> statement-breakpoint
CREATE INDEX `postback_logs_created_idx` ON `postback_logs` (`createdAt`);
--> statement-breakpoint
CREATE INDEX `postback_logs_txid_idx` ON `postback_logs` (`transactionId`);
