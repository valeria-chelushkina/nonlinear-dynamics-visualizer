/**
 * @file preset.validation.ts
 * @description Validates preset object using TypeScript validaiton library ('zod').
 */

import { z } from "zod";

export const SavePresetSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Preset name is required").max(100),
    systemType: z.string().min(1, "System type is required"),
    parameters: z.record(
      z.string(),
      z.number({ message: "Parameters must contain numbers" }),
    ),
    isPublic: z.boolean().default(false),
    cameraConfig: z
      .object({
        position: z.tuple([z.number(), z.number(), z.number()]),
        target: z.tuple([z.number(), z.number(), z.number()]),
      })
      .optional(),
    visuals: z
      .object({
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color format"),
        colorEnd: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color format")
          .optional(),
        useGradient: z.boolean(),
      })
      .optional(),
  }),
});
