/**
 * Local Authentication Module
 * Handles password hashing, JWT generation, and user authentication
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "./env";

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  if (!ENV.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  
  return jwt.sign(payload, ENV.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!ENV.jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }
    
    const decoded = jwt.verify(token, ENV.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 8 characters, at least one letter and one number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasLetter && hasNumber;
}
