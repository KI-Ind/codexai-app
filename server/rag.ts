/**
 * Module RAG (Retrieval-Augmented Generation) pour CodexAI
 * Gère l'ingestion, l'embedding et la récupération de documents juridiques
 */

import { invokeLLM } from "./_core/llm";
import { createRagChunk, RagChunk } from "./db";

/**
 * Génère un embedding pour un texte donné
 * Utilise l'API LLM pour créer des embeddings vectoriels
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Note: Les embeddings via LLM API ne sont pas directement supportés.
    // En production, utiliser un service d'embedding dédié (ex: OpenAI Embeddings, Mistral Embed)
    // Pour le MVP, on simule un embedding simple basé sur le hash du texte
    
    console.warn("[RAG] Using simulated embeddings. In production, use a dedicated embedding service.");
    
    // Simulation : créer un vecteur de 1536 dimensions (taille standard)
    const hash = hashString(text);
    const embedding: number[] = [];
    for (let i = 0; i < 1536; i++) {
      embedding.push(Math.sin(hash + i) * Math.cos(hash * i) * 0.5 + 0.5);
    }
    return embedding;
  } catch (error) {
    console.error("[RAG] Failed to generate embedding:", error);
    throw error;
  }
}

/**
 * Ingère un document juridique en le divisant en chunks et en générant des embeddings
 */
export async function ingestDocument(
  documentId: number,
  content: string,
  sourceType: "vault" | "legifrance" | "judilibre",
  metadata: Record<string, unknown>,
  tenantId?: number
): Promise<void> {
  try {
    // Diviser le document en chunks (environ 500 caractères par chunk avec chevauchement)
    const chunks = chunkText(content, 500, 100);
    
    console.log(`[RAG] Ingesting document ${documentId} with ${chunks.length} chunks`);
    
    // Générer les embeddings et créer les chunks RAG
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      
      await createRagChunk({
        documentId,
        sourceType,
        chunkText: chunk,
        embedding: JSON.stringify(embedding),
        metadata: JSON.stringify(metadata),
        tenantId,
      });
    }
    
    console.log(`[RAG] Successfully ingested document ${documentId}`);
  } catch (error) {
    console.error(`[RAG] Failed to ingest document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Divise un texte en chunks avec chevauchement (overlap)
 */
function chunkText(text: string, chunkSize: number = 500, overlap: number = 100): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start += chunkSize - overlap;
  }
  
  return chunks;
}

/**
 * Fonction de hash simple pour la simulation d'embeddings
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32-bit
  }
  return Math.abs(hash);
}

/**
 * Calcule la similarité cosinus entre deux vecteurs
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * Interface pour les résultats de recherche RAG
 */
export interface RagSearchResult {
  chunk: RagChunk;
  similarity: number;
  citation: string; // Citation formatée (ex: "Article 1234 du Code Civil")
}

/**
 * Recherche des chunks pertinents basée sur la similarité (implémentation simulée)
 * En production, utiliser pgvector ou une base de données vectorielle dédiée
 */
export async function searchRagChunks(
  query: string,
  chunks: RagChunk[],
  limit: number = 5,
  threshold: number = 0.5
): Promise<RagSearchResult[]> {
  try {
    // Générer l'embedding de la requête
    const queryEmbedding = await generateEmbedding(query);
    
    // Calculer la similarité avec tous les chunks
    const results: RagSearchResult[] = chunks
      .map((chunk) => {
        const chunkEmbedding = JSON.parse(chunk.embedding) as number[];
        const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
        
        // Formater la citation
        const metadata = JSON.parse(chunk.metadata) as Record<string, unknown>;
        const citation = formatCitation(chunk.sourceType, metadata);
        
        return {
          chunk,
          similarity,
          citation,
        };
      })
      .filter((result) => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return results;
  } catch (error) {
    console.error("[RAG] Failed to search chunks:", error);
    throw error;
  }
}

/**
 * Formate une citation juridique basée sur le type de source et les métadonnées
 */
function formatCitation(
  sourceType: "vault" | "legifrance" | "judilibre",
  metadata: Record<string, unknown>
): string {
  switch (sourceType) {
    case "legifrance":
      const code = metadata.code || "Code";
      const article = metadata.article || "Article";
      return `${article} du ${code}`;
    
    case "judilibre":
      const jurisdiction = metadata.jurisdiction || "Cour";
      const date = metadata.date || "Date inconnue";
      const pourvoi = metadata.pourvoi || "N° pourvoi";
      return `${jurisdiction}, ${date}, ${pourvoi}`;
    
    case "vault":
      const fileName = metadata.fileName || "Document";
      return `${fileName} (Document privé)`;
    
    default:
      return "Source inconnue";
  }
}

/**
 * Génère un contexte RAG pour une requête utilisateur
 * Retourne les chunks pertinents formatés pour être utilisés dans le prompt LLM
 */
export async function generateRagContext(
  query: string,
  chunks: RagChunk[],
  limit: number = 5
): Promise<{ context: string; citations: RagSearchResult[] }> {
  try {
    const results = await searchRagChunks(query, chunks, limit);
    
    // Formater le contexte pour le LLM
    const contextParts = results.map((result) => {
      return `[${result.citation}]\n${result.chunk.chunkText}`;
    });
    
    const context = contextParts.join("\n\n---\n\n");
    
    return {
      context,
      citations: results,
    };
  } catch (error) {
    console.error("[RAG] Failed to generate context:", error);
    throw error;
  }
}
