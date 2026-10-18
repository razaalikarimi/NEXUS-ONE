// ============================================================
// @nexus-one/types — Shared TypeScript Types
// ============================================================
// This package contains shared type definitions used across
// all apps and packages. It has zero internal dependencies.
// ============================================================

// ---- Platform-wide enums ----

export const PRODUCT_NAMES = [
  'agentforge',
  'pulseops',
  'gateflow',
  'cortexrag',
  'syncspace',
  'sentinelx',
  'cloudpilot',
] as const;

export type ProductName = (typeof PRODUCT_NAMES)[number];

export const ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export const MEMBERSHIP_STATUS = ['active', 'invited', 'suspended'] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[number];

export const INVITATION_STATUS = ['pending', 'accepted', 'expired', 'revoked'] as const;
export type InvitationStatus = (typeof INVITATION_STATUS)[number];

// ---- Shared interfaces ----

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  deletedAt: Date | null;
}

export interface TenantScoped {
  orgId: string;
  workspaceId: string;
}

// ---- User types ----

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  orgId: string | null;
  role: Role | null;
  expiresAt: Date;
}

// ---- Organization types ----

export interface OrganizationPublic {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: Date;
}

export interface WorkspacePublic {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface MembershipPublic {
  id: string;
  userId: string;
  orgId: string;
  role: Role;
  user: UserPublic;
  joinedAt: Date;
}

// ---- API response types ----

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---- Audit types ----

export interface AuditEventPublic {
  id: string;
  orgId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  timestamp: Date;
}

// ---- Notification types ----

export interface NotificationPublic {
  id: string;
  userId: string;
  orgId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: Date;
}

// ---- Product-specific type stubs (expanded in later phases) ----

// AgentForge
export type WorkflowStatus = 'draft' | 'published' | 'archived';
export type WorkflowRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type WorkflowNodeType =
  | 'input'
  | 'prompt'
  | 'model'
  | 'tool'
  | 'condition'
  | 'transform'
  | 'approval'
  | 'output';

// PulseOps
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus =
  | 'open'
  | 'acknowledged'
  | 'investigating'
  | 'resolved'
  | 'closed'
  | 'reopened';

// GateFlow
export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

// CortexRAG
export type DocumentStatus = 'pending' | 'processing' | 'indexed' | 'failed' | 'deleted';

// SyncSpace
export type CollabDocumentStatus = 'active' | 'archived' | 'deleted';

// SentinelX
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'negligible';
export type CaseStatus = 'open' | 'under_review' | 'escalated' | 'resolved' | 'dismissed';

// CloudPilot
export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type BudgetAlertSeverity = 'warning' | 'critical' | 'exceeded';

// ---- Job types ----

export interface JobInfo {
  id: string;
  queue: string;
  name: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  data: Record<string, unknown>;
  result?: unknown;
  failedReason?: string;
  createdAt: Date;
  processedAt?: Date;
  finishedAt?: Date;
  attemptsMade: number;
}

// ---- Health check types ----

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: Record<string, ComponentHealth>;
}

export interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
}
