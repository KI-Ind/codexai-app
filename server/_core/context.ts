import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { verifyToken } from "./auth";
import { getUserById } from "../authDb";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Extract JWT token from cookie
 */
function extractToken(req: CreateExpressContextOptions["req"]): string | null {
  const cookies = req.cookies || {};
  return cookies[COOKIE_NAME] || null;
}

/**
 * Create tRPC context with local JWT authentication
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Extract token from cookie
    const token = extractToken(opts.req);
    
    if (token) {
      // Verify JWT token
      const payload = verifyToken(token);
      
      if (payload) {
        // Load user from database
        user = await getUserById(payload.userId);
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures
    console.debug("[Context] Authentication failed:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
