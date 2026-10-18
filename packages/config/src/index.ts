// ============================================================
// @nexus-one/config — Environment Configuration
// ============================================================
// Validates environment variables at startup using Zod.
// Fails fast with clear error messages for missing config.
// ============================================================

import { z } from 'zod';

// ---- Schema definitions ----

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  // URLs
  DASHBOARD_URL: z.string().url().default('http://localhost:5173'),
  MARKETING_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:3001'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  // Auth
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  SESSION_MAX_AGE_HOURS: z.coerce.number().int().positive().default(24),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:3000')
    .transform((v) => v.split(',')),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),

  // Optional — S3
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),

  // Optional — LLM providers
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-3-5-sonnet-20241022'),

  // Optional — Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().default('nexus-one-api'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Analytics
  ANALYTICS_ENABLED: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  ANALYTICS_ENDPOINT: z.string().url().optional(),
});

const clientEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3001'),
  VITE_WS_URL: z.string().url().default('ws://localhost:3001'),
  VITE_APP_NAME: z.string().default('NEXUS ONE'),
});

// ---- Type exports ----

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

// ---- Validation functions ----

/**
 * Parse and validate server-side environment variables.
 * Throws with detailed errors if validation fails.
 */
export function parseServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  const result = serverEnvSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}

/**
 * Parse and validate client-side environment variables.
 */
export function parseClientEnv(
  env: Record<string, string | undefined> = {},
): ClientEnv {
  const result = clientEnvSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');
    throw new Error(`Client environment validation failed:\n${formatted}`);
  }
  return result.data;
}

// ---- Feature flag helpers ----

export function isLlmConfigured(env: ServerEnv): boolean {
  return !!(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY);
}

export function isS3Configured(env: ServerEnv): boolean {
  return !!(env.S3_ENDPOINT && env.S3_BUCKET && env.S3_ACCESS_KEY && env.S3_SECRET_KEY);
}

export function isSmtpConfigured(env: ServerEnv): boolean {
  return !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_FROM);
}

export function isAnalyticsEnabled(env: ServerEnv): boolean {
  return env.ANALYTICS_ENABLED && !!env.ANALYTICS_ENDPOINT;
}

// ---- Re-exports ----

export { serverEnvSchema, clientEnvSchema };
