-- Migration 0006: server-managed Postback credentials
CREATE TABLE `postback_credentials` (
  `id` int AUTO_INCREMENT NOT NULL,
  `provider` varchar(64) NOT NULL,
  `token` varchar(128) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `rotatedAt` timestamp NULL,
  CONSTRAINT `postback_credentials_id` PRIMARY KEY(`id`),
  CONSTRAINT `postback_credentials_provider_unique` UNIQUE(`provider`)
);
--> statement-breakpoint
CREATE INDEX `postback_credentials_provider_idx` ON `postback_credentials` (`provider`);
