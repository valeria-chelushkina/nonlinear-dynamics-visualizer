/**
 * @file auth.controller.ts
 * @description Class-based controller processing registration, session validation, and profiles.
 */

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { AuthService } from "../services/auth.service.js";
import type { EmailService } from "../services/email.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  public register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { username, email, password } = req.body;

      const existingUser = await this.authService.findUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: "Email already in use." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.authService.createUser({
        username,
        email,
        passwordHash: hashedPassword,
      });

      res.status(201).json({ message: "User created." });
    },
  );

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const JWT_SECRET = process.env.JWT_SECRET as string;
      const { email, password } = req.body;
      const user = await this.authService.findUserByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: "Email or password is incorrect." });
        return;
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    },
  );

  public getUserProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.userId as string;
      const user = await this.authService.findUserById(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    },
  );

  public forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;
      const user = await this.authService.findUserByEmail(email);

      if (!user) {
        // For security, don't reveal if user exists
        res.json({
          message: "If an account with that email exists, we sent a reset link.",
        });
        return;
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await this.authService.setResetToken(email, token, expires);

      // Send actual email
      await this.emailService.sendPasswordResetEmail(email, token);

      res.json({
        message: "If an account with that email exists, we sent a reset link.",
      });
    },
  );

  public resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { token, newPassword } = req.body;

      const user = await this.authService.findUserByResetToken(token);

      if (
        !user ||
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        res.status(400).json({ error: "Token is invalid or has expired." });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.authService.updatePassword(user.id, hashedPassword);

      res.json({ message: "Password has been reset." });
    },
  );

  public changePassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.userId; // Set by authenticate middleware
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await this.authService.findUserById(userId);
      // We need passwordHash which is not in findUserById (select id, username, email, createdAt)
      // I should update findUserById or just find full user here.
      const fullUser = await this.authService.findUserByEmail(user?.email || "");

      if (
        !fullUser ||
        !(await bcrypt.compare(oldPassword, fullUser.passwordHash))
      ) {
        res.status(400).json({ error: "Old password is incorrect." });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.authService.updatePassword(fullUser.id, hashedPassword);

      res.json({ message: "Password updated successfully." });
    },
  );
}
