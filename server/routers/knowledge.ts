/**
 * Routeur tRPC pour le Module C-Knowledge
 * Gère la recherche RAG sur les données publiques (Légifrance, Judilibre)
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { logAuditEvent, getRagChunksBySourceType } from "../db";
import { searchRagChunks, generateRagContext } from "../rag";

export const knowledgeRouter = router({
  /**
   * Recherche RAG sur les données publiques françaises
   * Interroge Légifrance et Judilibre avec citations automatiques
   */
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(500),
      sourceType: z.enum(["all", "legifrance", "judilibre"]).default("all"),
      limit: z.number().min(1).max(20).default(5),
      // Additional filters
      jurisdiction: z.string().optional(), // e.g., "civil", "penal", "administratif"
      dateFrom: z.string().optional(), // ISO date string
      dateTo: z.string().optional(), // ISO date string
      subject: z.string().optional(), // Legal subject/matter
    }))
    .query(async ({ ctx, input }) => {
      try {
        // Log la requête pour l'audit
        if (ctx.user) {
          await logAuditEvent({
            userId: ctx.user.id,
            action: "knowledge_search",
            details: JSON.stringify({
              query: input.query,
              sourceType: input.sourceType,
            }),
          });
        }
        
        // Get RAG chunks based on source type
        const chunks = await getRagChunksBySourceType(
          input.sourceType === "all" ? undefined : input.sourceType
        );
        
        if (chunks.length === 0) {
          return {
            results: [],
            totalCount: 0,
            query: input.query,
            message: "No documents indexed yet. Please ingest legal documents first.",
          };
        }
        
        // Search using RAG
        const searchResults = await searchRagChunks(
          input.query,
          chunks,
          input.limit,
          0.3 // Lower threshold for more results
        );
        
        // Format results
        const results = searchResults.map(result => ({
          id: result.chunk.id,
          text: result.chunk.chunkText,
          citation: result.citation,
          similarity: result.similarity,
          sourceType: result.chunk.sourceType,
          metadata: JSON.parse(result.chunk.metadata),
        }));
        
        return {
          results,
          totalCount: results.length,
          query: input.query,
        };
      } catch (error) {
        console.error("[Knowledge] Failed to search:", error);
        throw error;
      }
    }),

  /**
   * Récupérer les détails d'une source publique
   */
  getSource: publicProcedure
    .input(z.object({
      sourceId: z.number(),
      sourceType: z.enum(["legifrance", "judilibre"]),
    }))
    .query(async ({ input }) => {
      try {
        // TODO: Implémenter la récupération des détails de source
        console.warn("[Knowledge] Get source not yet implemented");
        
        return {
          id: input.sourceId,
          sourceType: input.sourceType,
          title: "Source",
          content: "",
          url: "",
        };
      } catch (error) {
        console.error("[Knowledge] Failed to get source:", error);
        throw error;
      }
    }),

  /**
   * Récupérer les alertes de veille législative
   */
  getAlerts: publicProcedure.query(async ({ ctx }) => {
    try {
      // TODO: Implémenter la veille législative
      // 1. Récupérer les articles suivis par l'utilisateur
      // 2. Vérifier les modifications récentes
      // 3. Retourner les alertes
      
      console.warn("[Knowledge] Legislative alerts not yet implemented");
      
      return [];
    } catch (error) {
      console.error("[Knowledge] Failed to get alerts:", error);
      throw error;
    }
  }),

  /**
   * Rechercher par article de loi
   */
  searchByArticle: publicProcedure
    .input(z.object({
      code: z.string().min(1), // Ex: "Code Civil"
      article: z.string().min(1), // Ex: "1234"
    }))
    .query(async ({ input }) => {
      try {
        // TODO: Implémenter la recherche par article
        console.warn("[Knowledge] Search by article not yet implemented");
        
        return {
          code: input.code,
          article: input.article,
          content: "",
          citations: [],
        };
      } catch (error) {
        console.error("[Knowledge] Failed to search by article:", error);
        throw error;
      }
    }),

  /**
   * Rechercher par jurisprudence
   */
  searchJurisprudence: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(1000),
      jurisdiction: z.string().optional(), // Ex: "Cour de Cassation"
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ input }) => {
      try {
        // TODO: Implémenter la recherche de jurisprudence
        console.warn("[Knowledge] Jurisprudence search not yet implemented");
        
        return {
          results: [],
          totalCount: 0,
          query: input.query,
        };
      } catch (error) {
        console.error("[Knowledge] Failed to search jurisprudence:", error);
        throw error;
      }
    }),
});
