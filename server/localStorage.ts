/**
 * Local Storage Module
 * Handles file storage on local filesystem as alternative to S3
 */

import fs from "fs/promises";
import path from "path";
import { ENV } from "./_core/env";
import crypto from "crypto";

const STORAGE_DIR = ENV.localStoragePath || "./storage";

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error("[LocalStorage] Failed to create storage directory:", error);
    throw error;
  }
}

/**
 * Generate a unique file key
 */
function generateFileKey(userId: number, originalFilename: string): string {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  return `vault/${userId}/${timestamp}-${randomSuffix}-${basename}${ext}`;
}

/**
 * Store a file locally
 */
export async function storeFile(
  userId: number,
  filename: string,
  data: Buffer
): Promise<{ key: string; url: string; size: number }> {
  await ensureStorageDir();
  
  const fileKey = generateFileKey(userId, filename);
  const filePath = path.join(STORAGE_DIR, fileKey);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  // Write file
  await fs.writeFile(filePath, data);
  
  // Generate URL (relative path for local access)
  const url = `/api/storage/${fileKey}`;
  
  return {
    key: fileKey,
    url,
    size: data.length,
  };
}

/**
 * Retrieve a file from local storage
 */
export async function getFile(fileKey: string): Promise<Buffer> {
  const filePath = path.join(STORAGE_DIR, fileKey);
  
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    console.error("[LocalStorage] Failed to read file:", error);
    throw new Error("File not found");
  }
}

/**
 * Delete a file from local storage
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const filePath = path.join(STORAGE_DIR, fileKey);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("[LocalStorage] Failed to delete file:", error);
    throw new Error("Failed to delete file");
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(fileKey: string): Promise<boolean> {
  const filePath = path.join(STORAGE_DIR, fileKey);
  
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypt file data (simple XOR encryption for demo)
 * In production, use proper encryption like AES-256
 */
export function encryptData(data: Buffer, key: string): Buffer {
  const keyBuffer = Buffer.from(key, "utf-8");
  const encrypted = Buffer.alloc(data.length);
  
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ keyBuffer[i % keyBuffer.length];
  }
  
  return encrypted;
}

/**
 * Decrypt file data (simple XOR decryption for demo)
 */
export function decryptData(data: Buffer, key: string): Buffer {
  // XOR encryption is symmetric
  return encryptData(data, key);
}
