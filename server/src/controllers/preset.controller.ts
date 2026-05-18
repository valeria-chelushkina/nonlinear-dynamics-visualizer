/**
 * @file preset.controller.ts
 * @description Manages access controls and handles presentation protocols for preset resources.
 */

import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { PresetService } from "../services/preset.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export class PresetController {
  constructor(private readonly presetService: PresetService) {}

  /** Helper method to extract token payload information across public/private contexts */
  private parseOptionalToken = (req: Request): string | undefined => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) return undefined;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch {
      return undefined;
    }
  };

  public savePreset = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const newPreset = await this.presetService.createPreset({
        ...req.body,
        userId: req.userId!,
      });

      res.status(201).json(newPreset);
    },
  );

  public getAllPresets = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requesterId = this.parseOptionalToken(req);
      const presets = await this.presetService.getPresetsList(requesterId);

      res.json(presets);
    },
  );

  public getUserPresets = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params.id as string;
      const requesterId = this.parseOptionalToken(req);
      const presets = await this.presetService.getPresetsByUserId(
        id,
        requesterId,
      );
      res.json(presets);
    },
  );

  public deletePreset = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const idParam = req.params.id as string;
      const id = parseInt(idParam, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid preset identifier format" });
        return;
      }

      const preset = await this.presetService.findPresetById(id);

      if (!preset) {
        res.status(404).json({ error: "Preset not found" });
        return;
      }

      if (preset.userId !== req.userId) {
        res.status(403).json({
          error: "You do not have permission to delete this preset",
        });
        return;
      }

      await this.presetService.deletePresetById(id);
      res.json({ message: "Preset deleted successfully" });
    },
  );
}
