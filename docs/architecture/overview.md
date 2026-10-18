# Architecture Overview

## System Architecture

NEXUS ONE is a TypeScript-first monorepo containing four applications and ten shared packages.

### Applications

1. **Marketing Site** (`apps/marketing`) — Next.js 14 with App Router for SSR/SSG public pages
2. **Dashboard** (`apps/dashboard`) — React 18 + Vite SPA for authenticated product interfaces
3. **API Server** (`apps/api`) — Fastify 4 REST API with WebSocket support
4. **Worker** (`apps/worker`) — BullMQ background job processors

### Shared Packages

| Package | Purpose | Dependencies |
|---------|---------|-------------|
| `types` | Shared TypeScript interfaces and enums | None (leaf node) |
| `config` | Environment validation with Zod | Zod |
| `design-tokens` | CSS custom properties | None |
| `logger` | Pino-based structured logging | Pino |
| `validators` | Shared Zod schemas for API contracts | Zod |
| `database` | Prisma client and migrations | Prisma, config |
| `auth` | Password hashing, sessions, tokens | database, config, logger |
| `ui` | Shared React components | design-tokens, types |
| `integrations` | Provider adapter interfaces | config, logger, types |
| `testing` | Test factories and fixtures | database, types, validators |

### Key Architectural Decisions

1. **Fastify over NestJS** — Lower overhead, TypeScript-native, explicit plugin architecture
2. **Server-side sessions over JWT** — Revocable, no token leakage risk, Redis-backed
3. **Prisma over raw SQL** — Type-safe queries, migration management, pgvector support
4. **BullMQ over agenda/custom** — Reliable Redis-backed queues with retry, dead-letter, and concurrency
5. **Zod for validation** — Runtime type checking shared between frontend and backend
6. **CSS custom properties over CSS-in-JS** — No runtime cost, full theme support, framework-agnostic

### Security Architecture

- Transport: HTTPS, secure cookies, HSTS
- Input: Zod validation on every request
- Authentication: Bcrypt passwords, Redis sessions
- Authorization: RBAC middleware, tenant isolation on every query
- Output: Safe serialization, credential redaction in logs
- Infrastructure: Helmet headers, CORS, rate limiting, CSRF

### Data Flow

```
Browser → CDN/Edge → Load Balancer → Fastify API
  ↓                                    ↓
  ← Response ←                 Auth Middleware
                                      ↓
                               RBAC + Tenant Guard
                                      ↓
                               Business Logic
                                 ↓       ↓
                            PostgreSQL  Redis/BullMQ → Worker
```
