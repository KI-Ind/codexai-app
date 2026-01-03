/**
 * Local Authentication Routes
 * Handles registration, login, and logout for local users
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { registerUser, authenticateUser, getUserByEmail } from "../authDb";
import { generateToken, isValidEmail, isValidPassword } from "./auth";
import { getSessionCookieOptions } from "./cookies";

export function registerLocalAuthRoutes(app: Express) {
  /**
   * POST /api/auth/register
   * Register a new user with email and password
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      if (!isValidEmail(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      if (!isValidPassword(password)) {
        res.status(400).json({ 
          error: "Password must be at least 8 characters with letters and numbers" 
        });
        return;
      }

      // Check if user exists
      const existing = await getUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: "User with this email already exists" });
        return;
      }

      // Register user
      const user = await registerUser({
        email,
        password,
        name: name || null,
        role: "user",
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email!,
        role: user.role,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[LocalAuth] Registration failed:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Registration failed" 
      });
    }
  });

  /**
   * POST /api/auth/login
   * Authenticate user with email and password
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Authenticate
      const user = await authenticateUser({ email, password });

      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email!,
        role: user.role,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[LocalAuth] Login failed:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Login failed" 
      });
    }
  });

  /**
   * POST /api/auth/logout
   * Clear authentication cookie
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.status(200).json({ success: true });
  });

  /**
   * GET /api/auth/me
   * Get current user from JWT token
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      // User is already attached by context middleware
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error("[LocalAuth] Get user failed:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });
}
