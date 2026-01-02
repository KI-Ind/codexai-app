import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, longtext, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documents du C-Vault : Stockage des métadonnées des documents privés
 * Les fichiers binaires sont stockés en S3, seules les métadonnées sont en DB
 */
export const vaultDocuments = mysqlTable(
  "vault_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileKey: varchar("fileKey", { length: 512 }).notNull(), // Clé S3
    fileSize: int("fileSize").notNull(),
    mimeType: varchar("mimeType", { length: 100 }).notNull(),
    s3Url: varchar("s3Url", { length: 512 }).notNull(),
    isEncrypted: boolean("isEncrypted").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("vault_documents_userId_idx").on(table.userId),
  })
);

export type VaultDocument = typeof vaultDocuments.$inferSelect;
export type InsertVaultDocument = typeof vaultDocuments.$inferInsert;

/**
 * Embeddings et chunks : Stockage des embeddings vectoriels pour le RAG
 * Utilise l'extension PgVector (ou équivalent MySQL)
 */
export const ragChunks = mysqlTable(
  "rag_chunks",
  {
    id: int("id").autoincrement().primaryKey(),
    documentId: int("documentId"), // Référence au document (Vault ou source publique)
    sourceType: mysqlEnum("sourceType", ["vault", "legifrance", "judilibre"]).notNull(),
    chunkText: longtext("chunkText").notNull(),
    embedding: longtext("embedding").notNull(), // Stocké en JSON (vecteur)
    metadata: longtext("metadata").notNull(), // JSON avec source, article, date, etc.
    tenantId: int("tenantId"), // Pour l'isolation multi-tenant (Vault)
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    sourceTypeIdx: index("rag_chunks_sourceType_idx").on(table.sourceType),
    tenantIdIdx: index("rag_chunks_tenantId_idx").on(table.tenantId),
  })
);

export type RagChunk = typeof ragChunks.$inferSelect;
export type InsertRagChunk = typeof ragChunks.$inferInsert;

/**
 * Conversations C-Assistant : Historique des conversations utilisateur
 */
export const assistantConversations = mysqlTable(
  "assistant_conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("assistant_conversations_userId_idx").on(table.userId),
  })
);

export type AssistantConversation = typeof assistantConversations.$inferSelect;
export type InsertAssistantConversation = typeof assistantConversations.$inferInsert;

/**
 * Messages de conversation : Messages individuels dans une conversation
 */
export const assistantMessages = mysqlTable(
  "assistant_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    role: mysqlEnum("role", ["user", "assistant"]).notNull(),
    content: longtext("content").notNull(),
    citations: longtext("citations"), // JSON avec les sources utilisées
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index("assistant_messages_conversationId_idx").on(table.conversationId),
  })
);

export type AssistantMessage = typeof assistantMessages.$inferSelect;
export type InsertAssistantMessage = typeof assistantMessages.$inferInsert;

/**
 * Sources publiques : Métadonnées des sources Légifrance et Judilibre
 */
export const publicSources = mysqlTable(
  "public_sources",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceType: mysqlEnum("sourceType", ["legifrance", "judilibre"]).notNull(),
    externalId: varchar("externalId", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 512 }).notNull(),
    url: varchar("url", { length: 512 }).notNull(),
    content: longtext("content"),
    lastSyncedAt: timestamp("lastSyncedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sourceTypeIdx: index("public_sources_sourceType_idx").on(table.sourceType),
    externalIdIdx: index("public_sources_externalId_idx").on(table.externalId),
  })
);

export type PublicSource = typeof publicSources.$inferSelect;
export type InsertPublicSource = typeof publicSources.$inferInsert;

/**
 * Audit logs : Traçabilité des accès aux documents sensibles (RGPD)
 */
export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    action: varchar("action", { length: 100 }).notNull(), // "document_accessed", "document_downloaded", etc.
    resourceId: int("resourceId"),
    resourceType: varchar("resourceType", { length: 50 }), // "vault_document", "conversation", etc.
    details: longtext("details"), // JSON avec contexte supplémentaire
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("audit_logs_userId_idx").on(table.userId),
    createdAtIdx: index("audit_logs_createdAt_idx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;