import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthController } from "./auth.controller.js";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

vi.mock("bcryptjs");
vi.mock("jsonwebtoken");

describe("AuthController", () => {
  let authController: AuthController;
  let authServiceMock: any;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    authServiceMock = {
      createUser: vi.fn(),
      findUserByEmail: vi.fn(),
      findUserById: vi.fn(),
    };
    authController = new AuthController(authServiceMock);
    req = { body: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    process.env.JWT_SECRET = "test-secret";
  });

  describe("register", () => {
    it("should hash password and create user", async () => {
      req.body = {
        username: "test",
        email: "test@test.com",
        password: "password123",
      };
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-pass" as never);

      await authController.register(req as Request, res as Response, vi.fn());

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(authServiceMock.createUser).toHaveBeenCalledWith({
        username: "test",
        email: "test@test.com",
        passwordHash: "hashed-pass",
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("login", () => {
    it("should return 401 if user not found", async () => {
      req.body = { email: "wrong@test.com", password: "any" };
      authServiceMock.findUserByEmail.mockResolvedValue(null);

      await authController.login(req as Request, res as Response, vi.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email or password is incorrect.",
      });
    });

    it("should return token if credentials are valid", async () => {
      req.body = { email: "test@test.com", password: "password123" };
      const user = { id: "u1", username: "test", passwordHash: "hashed" };
      authServiceMock.findUserByEmail.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue("fake-token" as any);

      await authController.login(req as Request, res as Response, vi.fn());

      expect(res.json).toHaveBeenCalledWith({
        token: "fake-token",
        user: { id: "u1", username: "test" },
      });
    });
  });
});
