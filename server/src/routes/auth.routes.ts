/**
 * @file auth.routes.ts
 * @description Express routing config for user authentication and account management.
 * Handles register, login, getting user profile and passwords options.
 */

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthService } from "../services/auth.service.js";
import { EmailService } from "../services/email.service.js";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const authService = new AuthService(prisma);
const emailService = new EmailService();
const authController = new AuthController(authService, emailService);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users/:userId", authController.getUserProfile);

// Password management
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", authenticate, authController.changePassword);

export default router;
