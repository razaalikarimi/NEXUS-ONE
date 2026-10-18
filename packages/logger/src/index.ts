// ============================================================
// @nexus-one/logger — Structured Logging
// ============================================================
// Pino-based logger with redaction of sensitive fields,
// request ID correlation, and environment-aware formatting.
// ============================================================

import pino from 'pino';

// Fields that must never appear in logs
const REDACT_PATHS = [
  'password',
  'passwordHash',
  'token',
  'sessionToken',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

export interface LoggerOptions {
  level?: string;
  service?: string;
  pretty?: boolean;
  redact?: string[];
}

/**
 * Create a configured Pino logger instance.
 */
export function createLogger(options: LoggerOptions = {}): pino.Logger {
  const {
    level = process.env['LOG_LEVEL'] || 'info',
    service = process.env['OTEL_SERVICE_NAME'] || 'nexus-one',
    pretty = process.env['NODE_ENV'] === 'development',
    redact = [],
  } = options;

  const transport = pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

  return pino({
    level,
    name: service,
    redact: [...REDACT_PATHS, ...redact],
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
    ...(transport ? { transport } : {}),
  });
}

/**
 * Create a child logger with a request-scoped correlation ID.
 */
export function withRequestId(
  logger: pino.Logger,
  requestId: string,
): pino.Logger {
  return logger.child({ requestId });
}

/**
 * Create a child logger scoped to a specific service or component.
 */
export function withContext(
  logger: pino.Logger,
  context: Record<string, unknown>,
): pino.Logger {
  return logger.child(context);
}

// Default logger instance
export const logger = createLogger();

export type { Logger } from 'pino';
export default logger;
