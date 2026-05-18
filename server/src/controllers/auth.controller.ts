/**
 * @file auth.controller.ts
 * @description Processes registration and login requests.
 */

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as authService from "../services/auth.service.js";

const jwtSecret = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await authService.createUser({
      username,
      email,
      passwordHash: hashedPassword,
    });
    return res.status(201).json({ message: "User created." });
  } catch (err) {
    return res.status(400).json({ error: "Username or Email already exists." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "24h",
    });
    return res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    return res.status(500).json({ error: "Internal login error." });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId as string;
    const user = await authService.findUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user info" });
  }
};
