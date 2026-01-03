/**
 * Document Processing Module
 * Extracts text from various document formats for semantic search
 */

import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export interface DocumentText {
  content: string;
  pageCount?: number;
  wordCount: number;
  metadata?: Record<string, unknown>;
}

/**
 * Extract text from PDF document
 */
async function extractTextFromPDF(filePath: string): Promise<DocumentText> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    return {
      content: data.text,
      pageCount: data.numpages,
      wordCount: data.text.split(/\s+/).length,
      metadata: data.info,
    };
  } catch (error) {
    console.error("[DocumentProcessor] Failed to extract PDF text:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract text from Word document (.docx)
 */
async function extractTextFromWord(filePath: string): Promise<DocumentText> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const content = result.value;
    
    return {
      content,
      wordCount: content.split(/\s+/).length,
    };
  } catch (error) {
    console.error("[DocumentProcessor] Failed to extract Word text:", error);
    throw new Error("Failed to extract text from Word document");
  }
}

/**
 * Extract text from plain text file
 */
async function extractTextFromPlainText(filePath: string): Promise<DocumentText> {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    
    return {
      content,
      wordCount: content.split(/\s+/).length,
    };
  } catch (error) {
    console.error("[DocumentProcessor] Failed to read text file:", error);
    throw new Error("Failed to read text file");
  }
}

/**
 * Extract text from any supported document format
 */
export async function extractDocumentText(filePath: string): Promise<DocumentText> {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case ".pdf":
      return await extractTextFromPDF(filePath);
    
    case ".docx":
      return await extractTextFromWord(filePath);
    
    case ".txt":
    case ".md":
      return await extractTextFromPlainText(filePath);
    
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
}

/**
 * Split document text into chunks for embedding
 * Uses sliding window approach with overlap
 */
export function chunkDocumentText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

/**
 * Clean and normalize document text
 */
export function normalizeDocumentText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
    .trim();
}

/**
 * Extract metadata from document
 */
export function extractMetadata(filePath: string): Record<string, unknown> {
  const stats = fs.statSync(filePath);
  
  return {
    fileName: path.basename(filePath),
    fileSize: stats.size,
    fileType: path.extname(filePath),
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
  };
}
