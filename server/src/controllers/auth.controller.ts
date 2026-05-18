/**
 * @file auth.controller.ts
 * @description Class-based controller processing registration, session validation, and profiles.
 */

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { username, email, password } = req.body;

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
        user: { id: user.id, username: user.username },
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
}
