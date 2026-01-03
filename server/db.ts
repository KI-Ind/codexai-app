import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  vaultDocuments,
  VaultDocument,
  InsertVaultDocument,
  ragChunks,
  RagChunk,
  InsertRagChunk,
  assistantConversations,
  AssistantConversation,
  InsertAssistantConversation,
  assistantMessages,
  AssistantMessage,
  InsertAssistantMessage,
  auditLogs,
  InsertAuditLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * RAG Helpers
 */
export async function createRagChunk(chunk: InsertRagChunk): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(ragChunks).values(chunk);
}

export async function searchRagChunksByEmbedding(
  embedding: number[],
  limit: number = 5,
  tenantId?: number
): Promise<RagChunk[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Note: MySQL ne supporte pas nativement la recherche vectorielle.
  // En production, utiliser pgvector (PostgreSQL) ou une solution tierce.
  // Pour le MVP, on retourne un placeholder.
  console.warn("[RAG] Vector search not fully implemented for MySQL. Use PostgreSQL with pgvector.");
  return [];
}

export async function getRagChunksBySourceType(
  sourceType?: "legifrance" | "judilibre"
): Promise<RagChunk[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (sourceType) {
    return await db.select().from(ragChunks).where(eq(ragChunks.sourceType, sourceType));
  }
  
  // Return all public chunks (not vault)
  return await db.select().from(ragChunks).where(
    eq(ragChunks.sourceType, "legifrance")
  );
}

/**
 * Vault Helpers
 */
export async function createVaultDocument(doc: InsertVaultDocument): Promise<VaultDocument> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vaultDocuments).values(doc);
  const inserted = await db.select().from(vaultDocuments).where(eq(vaultDocuments.id, result[0].insertId)).limit(1);
  return inserted[0]!;
}

export async function getVaultDocumentsByUserId(userId: number): Promise<VaultDocument[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(vaultDocuments).where(eq(vaultDocuments.userId, userId));
}

export async function deleteVaultDocument(documentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(vaultDocuments).where(eq(vaultDocuments.id, documentId));
}

/**
 * Assistant Helpers
 */
export async function createAssistantConversation(
  conv: InsertAssistantConversation
): Promise<AssistantConversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(assistantConversations).values(conv);
  const inserted = await db
    .select()
    .from(assistantConversations)
    .where(eq(assistantConversations.id, result[0].insertId))
    .limit(1);
  return inserted[0]!;
}

export async function getAssistantConversationsByUserId(userId: number): Promise<AssistantConversation[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(assistantConversations)
    .where(eq(assistantConversations.userId, userId));
}

export async function createAssistantMessage(msg: InsertAssistantMessage): Promise<AssistantMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(assistantMessages).values(msg);
  const inserted = await db
    .select()
    .from(assistantMessages)
    .where(eq(assistantMessages.id, result[0].insertId))
    .limit(1);
  return inserted[0]!;
}

export async function getAssistantMessagesByConversationId(
  conversationId: number
): Promise<AssistantMessage[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(assistantMessages)
    .where(eq(assistantMessages.conversationId, conversationId))
    .orderBy(assistantMessages.createdAt);
}

/**
 * Audit Helpers
 */
export async function logAuditEvent(log: InsertAuditLog): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available, skipping audit log");
    return;
  }
  
  try {
    await db.insert(auditLogs).values(log);
  } catch (error) {
    console.error("[Audit] Failed to log event:", error);
  }
}

// Export types for use in other modules
export type {
  VaultDocument,
  InsertVaultDocument,
  RagChunk,
  InsertRagChunk,
  AssistantConversation,
  InsertAssistantConversation,
  AssistantMessage,
  InsertAssistantMessage,
  InsertAuditLog,
};
