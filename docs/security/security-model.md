# Security Model

## Authentication

- Passwords hashed with bcrypt (12 rounds minimum)
- Server-side sessions stored in Redis
- Session tokens: 64 hex characters (32 bytes entropy)
- Sessions expire after configurable TTL (default: 24 hours)
- Rate limiting on auth endpoints

## Authorization

- Role-based access control: owner, admin, member, viewer
- Server-side authorization on every protected operation
- Tenant isolation: all queries scoped to orgId/workspaceId
- Frontend controls are presentation-only, never security boundaries

## Input Validation

- All API inputs validated with Zod schemas
- Request body, query parameters, and path parameters validated
- File uploads: type, size, and content validation
- Consistent error responses with safe messages

## Transport Security

- HTTPS everywhere in production
- Secure cookies: HttpOnly, Secure, SameSite=Lax
- HSTS headers
- CORS restricted to configured origins

## Headers

- Helmet for security headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: configured per deployment

## Rate Limiting

- Global rate limit on all endpoints
- Stricter limits on authentication endpoints
- Per-IP and per-user limiting where appropriate

## Secrets Management

- All secrets in environment variables
- `.env.example` contains placeholder names only
- No secrets in source code or client bundles
- Credentials redacted in logs

## Audit

- AuditEvent table for security-relevant actions
- Records: user, action, resource, metadata, IP, timestamp
- Immutable append-only log

## Known Limitations (Phase 1)

- CSRF protection: Not yet implemented (Phase 2)
- OAuth: Not yet implemented (Phase 2)
- MFA: Planned for future phases
- Dependency scanning: CI workflow planned
