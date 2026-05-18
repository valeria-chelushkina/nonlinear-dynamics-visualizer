/**
 * @file preset.service.ts
 * @description Data access layer isolating Preset CRUD database actions.
 */

import { prisma } from "../lib/prisma.js";

interface CreatePresetInput {
  name: string;
  systemType: string;
  parameters: any;
  isPublic: boolean;
  cameraConfig?: any;
  visuals?: any;
  userId: string;
}

export const createPreset = async (data: CreatePresetInput) => {
  return await prisma.preset.create({ data });
};

export const findPresetById = async (id: number) => {
  return await prisma.preset.findUnique({
    where: { id },
  });
};

export const getPresetsList = async (requesterId: string | undefined) => {
  return await prisma.preset.findMany({
    where: {
      OR: [{ isPublic: true }, { userId: requesterId || "NONE" }],
    },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getPresetsByUserId = async (
  targetUserId: string,
  requesterId: string | undefined,
) => {
  return await prisma.preset.findMany({
    where: {
      userId: targetUserId,
      OR: requesterId === targetUserId ? undefined : [{ isPublic: true }],
    },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const deletePresetById = async (id: number) => {
  return await prisma.preset.delete({
    where: { id },
  });
};
