type Level = "debug" | "info" | "warn" | "error";

const levels: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minimumLevel: number = process.env.NODE_ENV === "production" ? levels.info : levels.debug;

export const logger = {
  debug: (...args: unknown[]) => levels.debug >= minimumLevel && console.debug(...args),
  info: (...args: unknown[]) => levels.info >= minimumLevel && console.info(...args),
  warn: (...args: unknown[]) => levels.warn >= minimumLevel && console.warn(...args),
  error: (...args: unknown[]) => levels.error >= minimumLevel && console.error(...args),
};
