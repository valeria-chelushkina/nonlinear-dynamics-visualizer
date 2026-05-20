/**
 * @file logger.ts
 * @description Provides structured logging for frontend with levels and theme formatting.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

class FrontendLogger {
  private isDev = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string): string {
    return `[${level.toUpperCase()}] ${new Date().toLocaleTimeString()}: ${message}`;
  }

  public info(message: string, ...args: any[]): void {
    if (this.isDev) {
      console.log(
        `%c${this.formatMessage("info", message)}`,
        "color: #3b82f6; font-weight: bold;",
        ...args,
      );
    }
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(
      `%c${this.formatMessage("warn", message)}`,
      "color: #f59e0b; font-weight: bold;",
      ...args,
    );
  }

  public error(message: string, error?: Error | unknown, ...args: any[]): void {
    console.error(
      `%c${this.formatMessage("error", message)}`,
      "color: #ef4444; font-weight: bold;",
      error,
      ...args,
    );
  }

  public debug(message: string, ...args: any[]): void {
    if (this.isDev) {
      console.debug(
        `%c${this.formatMessage("debug", message)}`,
        "color: #8b5cf6; font-weight: italic;",
        ...args,
      );
    }
  }

  public stateChange(storeName: string, action: string, nextState: any): void {
    if (this.isDev) {
      console.groupCollapsed(
        `%cStore Update: ${storeName} > ${action}`,
        "color: #10b981; font-weight: bold;",
      );
      console.log("Next State:", nextState);
      console.groupEnd();
    }
  }
}

export const AppLogger = new FrontendLogger();
