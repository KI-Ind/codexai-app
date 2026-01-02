CREATE TABLE `assistant_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assistant_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assistant_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` longtext NOT NULL,
	`citations` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assistant_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`resourceId` int,
	`resourceType` varchar(50),
	`details` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `public_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('legifrance','judilibre') NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`title` varchar(512) NOT NULL,
	`url` varchar(512) NOT NULL,
	`content` longtext,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `public_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `public_sources_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `rag_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int,
	`sourceType` enum('vault','legifrance','judilibre') NOT NULL,
	`chunkText` longtext NOT NULL,
	`embedding` longtext NOT NULL,
	`metadata` longtext NOT NULL,
	`tenantId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rag_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vault_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`s3Url` varchar(512) NOT NULL,
	`isEncrypted` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vault_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `assistant_conversations_userId_idx` ON `assistant_conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `assistant_messages_conversationId_idx` ON `assistant_messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `audit_logs_userId_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_logs_createdAt_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `public_sources_sourceType_idx` ON `public_sources` (`sourceType`);--> statement-breakpoint
CREATE INDEX `public_sources_externalId_idx` ON `public_sources` (`externalId`);--> statement-breakpoint
CREATE INDEX `rag_chunks_sourceType_idx` ON `rag_chunks` (`sourceType`);--> statement-breakpoint
CREATE INDEX `rag_chunks_tenantId_idx` ON `rag_chunks` (`tenantId`);--> statement-breakpoint
CREATE INDEX `vault_documents_userId_idx` ON `vault_documents` (`userId`);