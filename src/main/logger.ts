// offline-internet/src/main/logger.ts

/**
 * Minimal logger factory that prefixes all messages with a unique identifier.
 *
 * Only the most common console methods are exposed: log, debug, info, warn, error.
 */
export function createLogger(name: string) {
  const prefix = `[${name}]`;

  return {
    log: (...args: any[]) => console.log(prefix, ...args),
    debug: (...args: any[]) => console.debug(prefix, ...args),
    info: (...args: any[]) => console.info(prefix, ...args),
    warn: (...args: any[]) => console.warn(prefix, ...args),
    error: (...args: any[]) => console.error(prefix, ...args),
  };
}