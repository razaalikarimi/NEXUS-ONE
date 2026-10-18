// ============================================================
// @nexus-one/validators — Shared Zod Schemas
// ============================================================
// Shared validation schemas used by both API (server-side)
// and Dashboard (client-side) for consistent data contracts.
// ============================================================

import { z } from 'zod';

// ---- Common field validators ----

export const emailSchema = z.string().email('Invalid email address').max(255).trim().toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be at most 100 characters')
  .trim();

export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .trim();

export const idSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ---- Auth schemas ----

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  avatar: z.string().url().nullish(),
});

// ---- Organization schemas ----

export const createOrgSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
});

export const updateOrgSchema = z.object({
  name: nameSchema.optional(),
});

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'member', 'viewer']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

// ---- Type inference exports ----

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

// ---- PulseOps schemas ----

export const createServiceSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().max(500).optional(),
  environment: z.enum(['production', 'staging', 'development']).default('production'),
});

export const createTelemetryEventSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  eventType: z.enum(['error', 'latency', 'crash', 'info']).default('error'),
  message: z.string().min(1, 'Message is required').max(1000),
  stackTrace: z.string().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('medium'),
  metadata: z.record(z.unknown()).default({}),
});

export const createIncidentSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID').optional(),
  title: z.string().min(1, 'Title is required').max(200),
  summary: z.string().max(2000).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('medium'),
});

export const updateIncidentSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'closed']).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
  rootCause: z.string().max(2000).optional(),
  resolution: z.string().max(2000).optional(),
});

export const createIncidentEventSchema = z.object({
  eventType: z.enum(['state_change', 'comment', 'ai_diagnosis', 'runbook_action']),
  message: z.string().min(1, 'Message is required').max(2000),
  metadata: z.record(z.unknown()).default({}),
});

export const createAlertRuleSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID').optional(),
  name: z.string().min(1, 'Name is required').max(100),
  conditionType: z.enum(['error_rate_spike', 'latency_p99', 'service_down']),
  threshold: z.number().positive(),
  timeWindowMinutes: z.number().int().min(1).max(60).default(5),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('high'),
  enabled: z.boolean().default(true),
});

// ---- GateFlow schemas ----

export const httpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']);

export const createGatewayRouteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  pathPattern: z.string().min(1, 'Path pattern is required').max(200),
  upstreamUrl: z.string().url('Invalid upstream URL'),
  methods: z.array(httpMethodSchema).min(1, 'At least one HTTP method is required').default(['GET', 'POST']),
  stripPath: z.boolean().default(true),
  rateLimitRps: z.number().int().min(1).max(50000).default(100),
  rateLimitBurst: z.number().int().min(1).max(100000).default(200),
  corsEnabled: z.boolean().default(true),
  authRequired: z.boolean().default(true),
  transformHeaders: z.record(z.string()).default({}),
  timeoutMs: z.number().int().min(100).max(60000).default(10000),
});

export const updateGatewayRouteSchema = createGatewayRouteSchema.partial().extend({
  status: z.enum(['active', 'inactive', 'deprecated']).optional(),
});

export const createGatewayConsumerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  tier: z.enum(['free', 'pro', 'enterprise']).default('free'),
  customQuotaRps: z.number().int().positive().optional(),
});

export const testProxyRequestSchema = z.object({
  routeId: z.string().uuid('Invalid route ID'),
  method: httpMethodSchema.default('GET'),
  path: z.string().default('/'),
  headers: z.record(z.string()).default({}),
  body: z.unknown().optional(),
});

// ---- CortexRAG schemas ----

export const createKnowledgeBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  embeddingModel: z.string().default('text-embedding-3-small'),
  chunkSize: z.number().int().min(64).max(2048).default(512),
  chunkOverlap: z.number().int().min(0).max(256).default(64),
});

export const createKnowledgeDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  fileType: z.enum(['markdown', 'pdf', 'docx', 'json', 'txt']).default('markdown'),
  rawContent: z.string().min(1, 'Document content is required').max(500000),
});

export const queryRagSchema = z.object({
  knowledgeBaseId: z.string().uuid('Invalid knowledge base ID'),
  query: z.string().min(1, 'Query is required').max(1000),
  topK: z.number().int().min(1).max(20).default(5),
  hybridAlpha: z.number().min(0).max(1).default(0.6),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateTelemetryEventInput = z.infer<typeof createTelemetryEventSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type CreateIncidentEventInput = z.infer<typeof createIncidentEventSchema>;
export type CreateAlertRuleInput = z.infer<typeof createAlertRuleSchema>;
export type CreateGatewayRouteInput = z.infer<typeof createGatewayRouteSchema>;
export type UpdateGatewayRouteInput = z.infer<typeof updateGatewayRouteSchema>;
export type CreateGatewayConsumerInput = z.infer<typeof createGatewayConsumerSchema>;
export type TestProxyRequestInput = z.infer<typeof testProxyRequestSchema>;
export type CreateKnowledgeBaseInput = z.infer<typeof createKnowledgeBaseSchema>;
export type CreateKnowledgeDocumentInput = z.infer<typeof createKnowledgeDocumentSchema>;
export type QueryRagInput = z.infer<typeof queryRagSchema>;

// Re-export zod for convenience
export { z };
