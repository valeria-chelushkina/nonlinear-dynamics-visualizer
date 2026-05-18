import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { prisma } from "../lib/prisma.js";
import { AuthService } from "../services/auth.service.js";
import { AuthController } from "../controllers/auth.controller.js";

const router = Router();

const authService = new AuthService(prisma);
const authController = new AuthController(authService);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users/:userId", authController.getUserProfile);

export default router;
