import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticate } from "./auth.js";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

vi.mock("jsonwebtoken");

describe("authenticate middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    process.env.JWT_SECRET = "test-secret";
  });

  it("should return 401 if no token is provided", () => {
    authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("No authentication token"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and set userId if token is valid", () => {
    req.headers!.authorization = "Bearer valid-token";
    const decodedToken = { userId: "user-123" };
    vi.mocked(jwt.verify).mockReturnValue(decodedToken as any);

    authenticate(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
    expect(req.userId).toBe("user-123");
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if token is invalid", () => {
    req.headers!.authorization = "Bearer invalid-token";
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid authentication token.",
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token is expired", () => {
    req.headers!.authorization = "Bearer expired-token";
    vi.mocked(jwt.verify).mockImplementation(() => {
      const err = new Error("Expired") as any;
      err.name = "TokenExpiredError";
      // TokenExpiredError is actually a class, but we can simulate it if needed
      // or just check how it behaves. The implementation uses `instanceof jwt.TokenExpiredError`.
      throw new jwt.TokenExpiredError("expired", new Date());
    });

    authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Session expired. Please log in again.",
      }),
    );
  });
});
