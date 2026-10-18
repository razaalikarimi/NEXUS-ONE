# Data Model

## Overview

NEXUS ONE uses PostgreSQL with Prisma ORM. The schema is organized into shared platform entities and product-specific entities.

All product entities include `orgId` and `workspaceId` for tenant isolation.

## Shared Platform Entities

### User
- Primary user accounts
- Fields: id, email, name, passwordHash, avatar, emailVerified

### Session
- Server-side session records backed by Redis
- Fields: id, userId, token, expiresAt, ipAddress, userAgent

### Organization
- Multi-tenant organization containers
- Fields: id, name, slug, plan

### Workspace
- Isolated workspaces within organizations
- Fields: id, orgId, name, slug, settings

### Membership
- User-organization relationships with RBAC
- Roles: owner, admin, member, viewer

### Invitation
- Pending invitations to join an organization
- States: pending, accepted, expired, revoked

### AuditEvent
- Immutable audit trail for security-relevant actions
- Fields: orgId, userId, action, resource, metadata, ip

### Notification
- User-facing notifications
- Fields: userId, orgId, type, title, body, read

### ApiKey
- Hashed API keys for programmatic access
- Fields: orgId, hashedKey, prefix, scopes, lastUsedAt, revokedAt

## Product-Specific Entities

Detailed entity definitions are added with each product phase. See the Prisma schema for the current state.

## Status

- Phase 1: Minimal User model for build validation
- Phase 2: Full shared platform schema with migrations
- Phases 4-10: Product-specific entities added incrementally
