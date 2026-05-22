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

  public async getPresetsList(requesterId: string | undefined, username?: string) {
    const where: any = {
      AND: [
        {
          OR: [{ isPublic: true }, { userId: requesterId || "NONE" }],
        },
      ],
    };

    if (username) {
      where.AND.push({
        user: {
          username: {
            contains: username,
            mode: "insensitive",
          },
        },
      });
    }

    return await this.prisma.preset.findMany({
      where,
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  public async getPresetsByUserId(
    targetUserId: string,
    requesterId: string | undefined,
  ) {
    const where: any = { userId: targetUserId };

    // If requester is not the owner, only show public presets
    if (requesterId !== targetUserId) {
      where.isPublic = true;
    }

    return await this.prisma.preset.findMany({
      where,
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