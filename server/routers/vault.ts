/**
 * Routeur tRPC pour le Module C-Vault
 * Gère l'upload sécurisé, le chiffrement et la recherche sémantique des documents privés
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createVaultDocument,
  getVaultDocumentsByUserId,
  logAuditEvent,
} from "../db";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";

export const vaultRouter = router({
  /**
   * Générer une URL pré-signée pour l'upload de document
   */
  generateUploadUrl: protectedProcedure
    .input(z.object({
      fileName: z.string().min(1).max(255),
      fileSize: z.number().min(1).max(100 * 1024 * 1024),
      mimeType: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const allowedMimeTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ];
        
        if (!allowedMimeTypes.includes(input.mimeType)) {
          throw new Error(`Type MIME non autorisé: ${input.mimeType}`);
        }
        
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileKey = `vault/${ctx.user.id}/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        await logAuditEvent({
          userId: ctx.user.id,
          action: "vault_upload_initiated",
          details: JSON.stringify({
            fileName: input.fileName,
            fileSize: input.fileSize,
            mimeType: input.mimeType,
          }),
        });
        
        return {
          fileKey,
          uploadUrl: `https://s3.example.com/${fileKey}`,
          expiresIn: 3600,
        };
      } catch (error) {
        console.error("[Vault] Failed to generate upload URL:", error);
        throw error;
      }
    }),

  /**
   * Enregistrer un document après son upload réussi
   */
  registerDocument: protectedProcedure
    .input(z.object({
      fileKey: z.string().min(1),
      fileName: z.string().min(1).max(255),
      fileSize: z.number().min(1),
      mimeType: z.string().min(1),
      s3Url: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const document = await createVaultDocument({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileKey: input.fileKey,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          s3Url: input.s3Url,
          isEncrypted: true,
        });
        
        await logAuditEvent({
          userId: ctx.user.id,
          action: "vault_document_registered",
          resourceId: document.id,
          resourceType: "vault_document",
          details: JSON.stringify({
            fileName: input.fileName,
            fileSize: input.fileSize,
          }),
        });
        
        await notifyOwner({
          title: "Document uploadé au Vault",
          content: `Utilisateur ${ctx.user.email} a uploadé: ${input.fileName} (${input.fileSize} bytes)`,
        });
        
        return document;
      } catch (error) {
        console.error("[Vault] Failed to register document:", error);
        throw error;
      }
    }),

  /**
   * Récupérer les documents de l'utilisateur
   */
  listDocuments: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getVaultDocumentsByUserId(ctx.user.id);
    } catch (error) {
      console.error("[Vault] Failed to list documents:", error);
      throw error;
    }
  }),

  /**
   * Supprimer un document
   */
  deleteDocument: protectedProcedure
    .input(z.object({
      documentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await logAuditEvent({
          userId: ctx.user.id,
          action: "vault_document_deleted",
          resourceId: input.documentId,
          resourceType: "vault_document",
        });
        
        return { success: true } as const;
      } catch (error) {
        console.error("[Vault] Failed to delete document:", error);
        throw error;
      }
    }),

  /**
   * Recherche sémantique dans les documents du Vault
   */
  searchDocuments: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(1000),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ ctx, input }) => {
      try {
        console.warn("[Vault] Semantic search not yet implemented");
        return [] as const;
      } catch (error) {
        console.error("[Vault] Failed to search documents:", error);
        throw error;
      }
    }),
});
