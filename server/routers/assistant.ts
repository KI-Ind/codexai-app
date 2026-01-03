/**
 * Routeur tRPC pour le Module C-Assistant
 * Gère les conversations juridiques conversationnelles
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createAssistantConversation,
  createAssistantMessage,
  getAssistantConversationsByUserId,
  getAssistantMessagesByConversationId,
  logAuditEvent,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";

const SYSTEM_PROMPT_FR = `Tu es CodexAI, un assistant juridique professionnel spécialisé dans le droit français.

Tes responsabilités :
1. Répondre à des questions complexes sur le droit civil, pénal et administratif français.
2. Fournir des analyses juridiques précises et fondées sur la jurisprudence.
3. Toujours citer tes sources (articles de loi, numéros de pourvoi, etc.).
4. Utiliser un langage juridique professionnel et précis.
5. Reconnaître les limites de tes connaissances et recommander une consultation avec un avocat si nécessaire.

Important : Tu ne dois jamais inventer de sources ou de citations. Si tu n'es pas certain, dis-le clairement.`;

/**
 * Extract legal citations from assistant response
 * Looks for patterns like "Article 1134", "Cass. civ. 1, 10 juillet 2007", etc.
 */
function extractCitations(text: string): string[] {
  const citations: string[] = [];
  
  // Pattern for Code articles (e.g., "Article 1134 du Code Civil")
  const articlePattern = /Article\s+\d+[\w\-]*(?:\s+(?:du|de la|des)\s+Code\s+[\w\s]+)?/gi;
  const articles = text.match(articlePattern) || [];
  citations.push(...articles);
  
  // Pattern for case law (e.g., "Cass. civ. 1, 10 juillet 2007, n° 06-14.768")
  const casePattern = /(?:Cass\.|Cour de cassation)[^,]+,\s*\d{1,2}\s+\w+\s+\d{4}(?:,\s*n°\s*[\d\-\.]+)?/gi;
  const cases = text.match(casePattern) || [];
  citations.push(...cases);
  
  // Pattern for law references (e.g., "Loi n° 2016-1547")
  const lawPattern = /Loi\s+n°\s*[\d\-]+/gi;
  const laws = text.match(lawPattern) || [];
  citations.push(...laws);
  
  return Array.from(new Set(citations)); // Remove duplicates
}

export const assistantRouter = router({
  /**
   * Créer une nouvelle conversation
   */
  createConversation: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const conversation = await createAssistantConversation({
          userId: ctx.user.id,
          title: input.title || `Conversation du ${new Date().toLocaleDateString("fr-FR")}`,
        });
        
        // Log audit
        await logAuditEvent({
          userId: ctx.user.id,
          action: "conversation_created",
          resourceId: conversation.id,
          resourceType: "assistant_conversation",
        });
        
        return conversation;
      } catch (error) {
        console.error("[Assistant] Failed to create conversation:", error);
        throw error;
      }
    }),

  /**
   * Récupérer les conversations de l'utilisateur
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getAssistantConversationsByUserId(ctx.user.id);
    } catch (error) {
      console.error("[Assistant] Failed to list conversations:", error);
      throw error;
    }
  }),

  /**
   * Récupérer les messages d'une conversation
   */
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // Vérifier que l'utilisateur a accès à cette conversation
        const messages = await getAssistantMessagesByConversationId(input.conversationId);
        
        // Note: Ajouter une vérification d'accès en production
        return messages;
      } catch (error) {
        console.error("[Assistant] Failed to get messages:", error);
        throw error;
      }
    }),

  /**
   * Envoyer un message et obtenir une réponse IA
   */
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      message: z.string().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Créer le message utilisateur
        const userMessage = await createAssistantMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
        });
        
        // Récupérer l'historique de la conversation
        const messages = await getAssistantMessagesByConversationId(input.conversationId);
        
        // Préparer le contexte pour le LLM
        const conversationHistory = messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
        
        // Appeler le LLM
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: SYSTEM_PROMPT_FR },
            ...conversationHistory,
          ],
        });
        
        const messageContent = llmResponse.choices[0]?.message.content;
        const assistantContent = typeof messageContent === "string" 
          ? messageContent 
          : "Erreur lors de la génération de la réponse.";
        
        // Extract citations from the response
        const citations = extractCitations(assistantContent);
        
        // Créer le message assistant
        const assistantMessage = await createAssistantMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: assistantContent || "Erreur lors de la génération de la réponse.",
          citations: JSON.stringify(citations),
        });
        
        // Log audit
        await logAuditEvent({
          userId: ctx.user.id,
          action: "assistant_query",
          resourceId: input.conversationId,
          resourceType: "assistant_conversation",
          details: JSON.stringify({
            messageLength: input.message.length,
            responseLength: (assistantContent || "").length,
          }),
        });
        
        return {
          userMessage,
          assistantMessage: assistantMessage || { id: 0, conversationId: input.conversationId, role: "assistant" as const, content: "Erreur", citations: null, createdAt: new Date() },
        };
      } catch (error) {
        console.error("[Assistant] Failed to send message:", error);
        
        // Notifier le propriétaire en cas d'erreur
        await notifyOwner({
          title: "Erreur C-Assistant",
          content: `Erreur lors du traitement d'une requête utilisateur: ${error instanceof Error ? error.message : String(error)}`,
        });
        
        throw error;
      }
    }),
});
