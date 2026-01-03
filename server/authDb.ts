/**
 * Authentication Database Helpers
 * Local authentication user management
 */

import { eq } from "drizzle-orm";
import { users, User, InsertUser } from "../drizzle/schema";
import { getDb } from "./db";
import { hashPassword, verifyPassword } from "./_core/auth";

export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
  role?: "user" | "admin";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register a new user with email and password
 */
export async function registerUser(input: RegisterUserInput): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(input.password);

  // Create user
  const userData: InsertUser = {
    email: input.email,
    password: hashedPassword,
    name: input.name || null,
    role: input.role || "user",
    loginMethod: "local",
    lastSignedIn: new Date(),
  };

  const result = await db.insert(users).values(userData);
  
  const inserted = await db
    .select()
    .from(users)
    .where(eq(users.id, result[0].insertId))
    .limit(1);

  return inserted[0]!;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  credentials: LoginCredentials
): Promise<User | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find user by email
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, credentials.email))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const user = result[0];

  // Verify password
  if (!user.password) {
    return null; // User registered via OAuth, no local password
  }

  const isValid = await verifyPassword(credentials.password, user.password);
  
  if (!isValid) {
    return null;
  }

  // Update last signed in
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Update user password
 */
export async function updateUserPassword(
  userId: number,
  newPassword: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));
}
