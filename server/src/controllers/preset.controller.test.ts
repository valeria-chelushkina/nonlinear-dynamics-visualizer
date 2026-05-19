import { describe, it, expect, vi, beforeEach } from "vitest";
import { PresetController } from "./preset.controller.js";
import type { Request, Response } from "express";

vi.mock("jsonwebtoken");

describe("PresetController", () => {
  let presetController: PresetController;
  let presetServiceMock: any;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    presetServiceMock = {
      createPreset: vi.fn(),
      getPresetsList: vi.fn(),
      getPresetsByUserId: vi.fn(),
      findPresetById: vi.fn(),
      deletePresetById: vi.fn(),
    };
    presetController = new PresetController(presetServiceMock);
    req = { body: {}, params: {}, headers: {}, userId: "user-1" };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    process.env.JWT_SECRET = "test-secret";
  });

  describe("savePreset", () => {
    it("should create preset with userId from request", async () => {
      req.body = { name: "New Preset", systemType: "lorenz" };
      const createdPreset = { id: 1, ...req.body, userId: "user-1" };
      presetServiceMock.createPreset.mockResolvedValue(createdPreset);

      await presetController.savePreset(
        req as Request,
        res as Response,
        vi.fn(),
      );

      expect(presetServiceMock.createPreset).toHaveBeenCalledWith({
        ...req.body,
        userId: "user-1",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdPreset);
    });
  });

  describe("deletePreset", () => {
    it("should return 403 if user is not the owner", async () => {
      req.params = { id: "1" };
      req.userId = "user-1";
      presetServiceMock.findPresetById.mockResolvedValue({
        id: 1,
        userId: "other-user",
      });

      await presetController.deletePreset(
        req as Request,
        res as Response,
        vi.fn(),
      );

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "You do not have permission to delete this preset",
      });
    });

    it("should delete preset if user is owner", async () => {
      req.params = { id: "1" };
      req.userId = "user-1";
      presetServiceMock.findPresetById.mockResolvedValue({
        id: 1,
        userId: "user-1",
      });

      await presetController.deletePreset(
        req as Request,
        res as Response,
        vi.fn(),
      );

      expect(presetServiceMock.deletePresetById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Preset deleted successfully",
      });
    });
  });
});
