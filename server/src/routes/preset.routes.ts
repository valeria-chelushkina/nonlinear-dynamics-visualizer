import { Router } from "express";
import * as presetController from "../controllers/preset.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/presets", presetController.getAllPresets);
router.post("/presets", authenticate, presetController.savePreset);
router.delete("/presets/:id", authenticate, presetController.deletePreset);
router.get("/users/:userId/presets", presetController.getUserPresets);

export default router;
