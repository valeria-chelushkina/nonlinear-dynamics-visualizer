import * as express from "express";

// Extend Express request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
