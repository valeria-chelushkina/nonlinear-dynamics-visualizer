import { describe, it, expect, vi } from "vitest";
import { validate } from "./validate.js";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

describe("validate middleware", () => {
  it("should call next if validation succeeds", async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });
    const middleware = validate(schema as any);
    const req = {
      body: { name: "test" },
      query: {},
      params: {},
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: "test" });
  });

  it("should call next with error if validation fails", async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });
    const middleware = validate(schema as any);
    const req = {
      body: { name: 123 }, // Should be string
      query: {},
      params: {},
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
