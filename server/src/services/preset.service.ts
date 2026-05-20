/**
 * @file preset.service.ts
 * @description Service that isolates preset CRUD database actions.
 */

import type { PrismaClient } from "@prisma/client";

export interface CreatePresetInput {
  name: string;
  systemType: string;
  parameters: any;
  isPublic: boolean;
  cameraConfig?: any;
  visuals?: any;
  userId: string;
}

export class PresetService {
  constructor(private readonly prisma: PrismaClient) {}

  public async createPreset(data: CreatePresetInput) {
    return await this.prisma.preset.create({ data });
  }

  public async findPresetById(id: number) {
    return await this.prisma.preset.findUnique({
      where: { id },
    });
  }

  public async getPresetsList(requesterId: string | undefined) {
    return await this.prisma.preset.findMany({
      where: {
        OR: [{ isPublic: true }, { userId: requesterId || "NONE" }],
      },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  public async getPresetsByUserId(targetUserId: string, requesterId: string | undefined) {
    return await this.prisma.preset.findMany({
      where: {
        userId: targetUserId,
        OR: requesterId === targetUserId ? undefined : [{ isPublic: true }],
      },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  public async deletePresetById(id: number) {
    return await this.prisma.preset.delete({
      where: { id },
    });
  }
}