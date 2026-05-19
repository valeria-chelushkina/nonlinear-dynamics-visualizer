import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth.service.js";
import type { PrismaClient } from "@prisma/client";

describe("AuthService", () => {
  let authService: AuthService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    authService = new AuthService(prismaMock as unknown as PrismaClient);
  });

  describe("createUser", () => {
    it("should call prisma.user.create with correct data", async () => {
      const input = {
        username: "testuser",
        email: "test@example.com",
        passwordHash: "hashedpassword",
      };

      prismaMock.user.create.mockResolvedValue({ id: "1", ...input });

      const result = await authService.createUser(input);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result.id).toBe("1");
    });
  });

  describe("findUserByEmail", () => {
    it("should call prisma.user.findUnique with correct email", async () => {
      const email = "test@example.com";
      prismaMock.user.findUnique.mockResolvedValue({ id: "1", email });

      const result = await authService.findUserByEmail(email);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result?.email).toBe(email);
    });
  });
});
