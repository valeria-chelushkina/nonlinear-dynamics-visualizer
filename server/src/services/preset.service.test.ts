import { describe, it, expect, vi, beforeEach } from "vitest";
import { PresetService } from "./preset.service.js";
import type { PrismaClient } from "@prisma/client";

describe("PresetService", () => {
  let presetService: PresetService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      preset: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        delete: vi.fn(),
      },
    };
    presetService = new PresetService(prismaMock as unknown as PrismaClient);
  });

  describe("createPreset", () => {
    it("should call prisma.preset.create with correct data", async () => {
      const input = {
        name: "My Preset",
        systemType: "lorenz",
        parameters: { a: 1 },
        isPublic: true,
        userId: "user-1",
      };
      prismaMock.preset.create.mockResolvedValue({ id: 1, ...input });

      const result = await presetService.createPreset(input);

      expect(prismaMock.preset.create).toHaveBeenCalledWith({ data: input });
      expect(result.id).toBe(1);
    });
  });

  describe("getPresetsList", () => {
    it("should query public and owned presets", async () => {
      const requesterId = "user-1";
      prismaMock.preset.findMany.mockResolvedValue([]);

      await presetService.getPresetsList(requesterId);

      expect(prismaMock.preset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ isPublic: true }, { userId: requesterId }],
          },
        }),
      );
    });

    it('should use "NONE" if requesterId is undefined', async () => {
      prismaMock.preset.findMany.mockResolvedValue([]);

      await presetService.getPresetsList(undefined);

      expect(prismaMock.preset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ isPublic: true }, { userId: "NONE" }],
          },
        }),
      );
    });
  });

  describe("deletePresetById", () => {
    it("should call prisma.preset.delete with correct id", async () => {
      const id = 123;
      prismaMock.preset.delete.mockResolvedValue({ id });

      const result = await presetService.deletePresetById(id);

      expect(prismaMock.preset.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result.id).toBe(id);
    });
  });
});
