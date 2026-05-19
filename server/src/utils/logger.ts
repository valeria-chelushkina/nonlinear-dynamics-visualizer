/**
 * @file logger.ts
 * @description Centralized logging utility for the backend.
 * Provides structured logging with levels and timestamps.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

class BackendLogger {
  private isDev = process.env.NODE_ENV !== "production";

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  public info(message: string, meta?: any): void {
    console.log(this.formatMessage("info", message), meta || "");
  }

  public warn(message: string, meta?: any): void {
    console.warn(this.formatMessage("warn", message), meta || "");
  }

  public error(message: string, error?: any): void {
    const stack = error instanceof Error ? error.stack : error;
    console.error(this.formatMessage("error", message), stack || "");
  }

  public debug(message: string, meta?: any): void {
    if (this.isDev) {
      console.debug(this.formatMessage("debug", message), meta || "");
    }
  }
}

export const logger = new BackendLogger();
