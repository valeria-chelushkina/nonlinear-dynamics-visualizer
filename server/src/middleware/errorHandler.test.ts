import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "./errorHandler.js";
import type { Request, Response, NextFunction } from "express";

describe("errorHandler middleware", () => {
  it("should return 500 for generic errors", () => {
    const err = new Error("Something went wrong");
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "Something went wrong",
    });
  });

  it("should return custom status code if present", () => {
    const err = new Error("Custom error");
    (err as any).statusCode = 404;
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Application Error",
      message: "Custom error",
    });
  });
});
