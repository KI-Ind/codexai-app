/**
 * Document Encryption Module
 * Provides AES-256-GCM encryption for secure document storage
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Generate a secure encryption key from a password/secret
 */
export function deriveKey(secret: string, salt: string): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, "sha256");
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Encrypt data using AES-256-GCM
 * Returns: IV + Auth Tag + Encrypted Data (all concatenated)
 */
export function encryptAES256(data: Buffer, key: Buffer): Buffer {
  try {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final(),
    ]);
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Concatenate: IV + Tag + Encrypted Data
    return Buffer.concat([iv, tag, encrypted]);
  } catch (error) {
    console.error("[Encryption] Failed to encrypt data:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Decrypt data using AES-256-GCM
 * Expects: IV + Auth Tag + Encrypted Data (concatenated)
 */
export function decryptAES256(encryptedData: Buffer, key: Buffer): Buffer {
  try {
    // Extract IV (first 16 bytes)
    const iv = encryptedData.subarray(0, IV_LENGTH);
    
    // Extract auth tag (next 16 bytes)
    const tag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    
    // Extract encrypted data (remaining bytes)
    const encrypted = encryptedData.subarray(IV_LENGTH + TAG_LENGTH);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    return decrypted;
  } catch (error) {
    console.error("[Encryption] Failed to decrypt data:", error);
    throw new Error("Decryption failed - data may be corrupted or key is incorrect");
  }
}

/**
 * Encrypt a file and save to destination
 */
export async function encryptFile(
  sourcePath: string,
  destPath: string,
  key: Buffer
): Promise<void> {
  const fs = await import("fs/promises");
  
  try {
    // Read source file
    const data = await fs.readFile(sourcePath);
    
    // Encrypt
    const encrypted = encryptAES256(data, key);
    
    // Write encrypted data
    await fs.writeFile(destPath, encrypted);
  } catch (error) {
    console.error("[Encryption] Failed to encrypt file:", error);
    throw new Error("File encryption failed");
  }
}

/**
 * Decrypt a file and save to destination
 */
export async function decryptFile(
  sourcePath: string,
  destPath: string,
  key: Buffer
): Promise<void> {
  const fs = await import("fs/promises");
  
  try {
    // Read encrypted file
    const encryptedData = await fs.readFile(sourcePath);
    
    // Decrypt
    const decrypted = decryptAES256(encryptedData, key);
    
    // Write decrypted data
    await fs.writeFile(destPath, decrypted);
  } catch (error) {
    console.error("[Encryption] Failed to decrypt file:", error);
    throw new Error("File decryption failed");
  }
}

/**
 * Generate a master encryption key for the application
 * Should be stored securely in environment variables
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString("hex");
}

/**
 * Hash a string using SHA-256 (for document IDs, checksums, etc.)
 */
export function hashSHA256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Verify data integrity using HMAC
 */
export function createHMAC(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Export encryption utilities
export const Encryption = {
  deriveKey,
  generateSalt,
  encryptAES256,
  decryptAES256,
  encryptFile,
  decryptFile,
  generateMasterKey,
  hashSHA256,
  createHMAC,
  verifyHMAC,
};

export default Encryption;
