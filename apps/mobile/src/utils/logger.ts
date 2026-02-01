/**
 * Logger utility for structured logging
 * Replaces console.log with environment-aware logging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private minLevel: LogLevel;

  constructor() {
    this.isDevelopment = __DEV__;
    // In production, only log warnings and errors
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  /**
   * Check if a log level should be printed
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.minLevel);
    return currentIndex >= minIndex;
  }

  /**
   * Format log message with context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context != null ? ` ${this.safeStringify(context)}` : '';
    return `[${timestamp}] ${level} ${message}${contextStr}`;
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, this.normalizeContext(context)));
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, this.normalizeContext(context)));
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, this.normalizeContext(context)));
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      if (!message && !error) {
        console.error(this.formatMessage(LogLevel.ERROR, '(empty error message)'));
        return;
      }

      const baseContext = this.normalizeContext(context);
      const errorValue = error instanceof Error
        ? error.message
        : error !== null && error !== undefined
        ? this.formatUnknownError(error)
        : undefined;

      const errorContext = error instanceof Error
        ? { ...(baseContext ?? {}), error: error.message, stack: error.stack }
        : errorValue !== undefined
        ? { ...(baseContext ?? {}), error: errorValue }
        : baseContext || {};

      const safeMessage = this.normalizeMessage(message, error);

      console.error(this.formatMessage(LogLevel.ERROR, safeMessage, errorContext));
    }
  }

  private safeStringify(value: unknown): string {
    try {
      const seen = new WeakSet<object>();
      const json = JSON.stringify(value, (_key, current) => {
        if (typeof current === 'bigint') {
          return current.toString();
        }

        if (typeof current === 'symbol') {
          return current.toString();
        }

        if (typeof current === 'function') {
          return `[Function${current.name ? `: ${current.name}` : ''}]`;
        }

        if (current instanceof Error) {
          return { name: current.name, message: current.message, stack: current.stack };
        }

        if (typeof current === 'object' && current !== null) {
          if (seen.has(current)) {
            return '[Circular]';
          }
          seen.add(current);
        }

        return current;
      });

      return json === undefined ? String(value) : json;
    } catch {
      return '[Unserializable]';
    }
  }

  private normalizeContext(context?: LogContext): LogContext | undefined {
    if (context === null || context === undefined) {
      return undefined;
    }

    if (typeof context !== 'object') {
      return { value: context } as LogContext;
    }

    return context;
  }

  private normalizeMessage(message: unknown, error?: Error | unknown): string {
    if (typeof message === 'string') {
      const trimmed = message.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }

    if (typeof message === 'number' || typeof message === 'boolean' || typeof message === 'bigint') {
      return String(message);
    }

    if (message !== null && message !== undefined && typeof message !== 'string') {
      return this.safeStringify(message);
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Error occurred';
  }

  private formatUnknownError(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (typeof error === 'number' || typeof error === 'boolean' || typeof error === 'bigint') {
      return String(error);
    }

    if (error && typeof error === 'object') {
      const message = (error as { message?: unknown }).message;
      if (message !== undefined) {
        return String(message);
      }

      const serialized = this.safeStringify(error);
      return serialized === '[Unserializable]' ? '[Unserializable error]' : serialized;
    }

    return String(error);
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case LogLevel.DEBUG:
        this.debug(message, context);
        break;
      case LogLevel.INFO:
        this.info(message, context);
        break;
      case LogLevel.WARN:
        this.warn(message, context);
        break;
      case LogLevel.ERROR:
        this.error(message, undefined, context);
        break;
    }
  }

  /**
   * Create a scoped logger with context
   */
  scope(scopeName: string): ScopedLogger {
    return new ScopedLogger(this, scopeName);
  }
}

/**
 * Scoped logger that automatically includes scope context
 */
class ScopedLogger {
  constructor(
    private logger: Logger,
    private scopeName: string
  ) {}

  debug(message: string, context?: LogContext): void {
    const scopedContext = context ? { ...context, scope: this.scopeName } : { scope: this.scopeName };
    this.logger.debug(message, scopedContext);
  }

  info(message: string, context?: LogContext): void {
    const scopedContext = context ? { ...context, scope: this.scopeName } : { scope: this.scopeName };
    this.logger.info(message, scopedContext);
  }

  warn(message: string, context?: LogContext): void {
    const scopedContext = context ? { ...context, scope: this.scopeName } : { scope: this.scopeName };
    this.logger.warn(message, scopedContext);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const scopedContext = context ? { ...context, scope: this.scopeName } : { scope: this.scopeName };
    this.logger.error(message, error, scopedContext);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;

// Usage examples:
// logger.debug('Debug message');
// logger.info('Info message', { userId: 123 });
// logger.warn('Warning message', { board: 'my-board' });
// logger.error('Error occurred', error, { operation: 'saveBoard' });
//
// const boardLogger = logger.scope('BoardService');
// boardLogger.info('Board loaded', { boardId: 'my-board' });
