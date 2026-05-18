/**
 * @file preset.controller.ts
 * @description Manages access controls and responses for presets.
 */

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as presetService from "../services/preset.service.js";

const jwtSecret = process.env.JWT_SECRET as string;

/** Helper method to optionalize user token parsing across open lists */
const parseOptionalToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return undefined;
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return (decoded as any).userId;
  } catch {
    return undefined;
  }
};

export const savePreset = async (req: Request, res: Response) => {
  try {
    const { name, systemType, parameters, isPublic, cameraConfig, visuals } =
      req.body;
    const newPreset = await presetService.createPreset({
      name,
      systemType,
      parameters,
      isPublic,
      cameraConfig,
      visuals,
      userId: req.userId!,
    });
    return res.status(201).json(newPreset);
  } catch (error) {
    console.error("Save preset error:", error);
    return res.status(500).json({ error: "Failed to save a preset" });
  }
};

export const getAllPresets = async (req: Request, res: Response) => {
  try {
    const requesterId = parseOptionalToken(req);
    const presets = await presetService.getPresetsList(requesterId);
    return res.json(presets);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch presets" });
  }
};

export const getUserPresets = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const requesterId = parseOptionalToken(req);
    const presets = await presetService.getPresetsByUserId(id, requesterId);
    return res.json(presets);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user presets" });
  }
};

export const deletePreset = async (req: Request, res: Response) => {
  try {
    const id_req = req.params.id as string;
    const id = parseInt(id_req);
    const preset = await presetService.findPresetById(id);

    if (!preset) return res.status(404).json({ error: "Preset not found" });
    if (preset.userId !== req.userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this preset" });
    }

    await presetService.deletePresetById(id);
    return res.json({ message: "Preset deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete preset" });
  }
};
