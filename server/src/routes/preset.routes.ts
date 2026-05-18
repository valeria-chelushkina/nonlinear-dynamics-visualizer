import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { PresetService } from "../services/preset.service.js";
import { PresetController } from "../controllers/preset.controller.js";
import { SavePresetSchema } from "../validations/preset.validation.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const presetService = new PresetService(prisma);
const presetController = new PresetController(presetService);

router.get("/presets", presetController.getAllPresets);
router.post("/presets", authenticate, validate(SavePresetSchema), presetController.savePreset);
router.delete("/presets/:id", authenticate, presetController.deletePreset);
router.get("/users/:userId/presets", presetController.getUserPresets);

export default router;