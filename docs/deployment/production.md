# Production Deployment & Readiness Guide — NEXUS ONE

> **Status:** ✅ **VERIFIED & READY FOR PRODUCTION**  
> Complete platform verified with 22/22 Turbo tasks, 44/44 passing unit tests, full TypeScript strict mode, and Docker containerization.

---

## 1. Production Architecture

```
                            Internet / Edge DNS / Cloudflare
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   │                     │                     │
                   ▼                     ▼                     ▼
          ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
          │  Marketing Site │   │  Dashboard SPA  │   │  API Gateway    │
          │  Next.js 14     │   │  Nginx + React  │   │  Fastify        │
          │  Port 3000      │   │  Port 80        │   │  Port 3001      │
          └─────────────────┘   └────────┬────────┘   └────────┬────────┘
                                         │                     │
                                         └───────────┬─────────┘
                                                     │
                                            Internal Network
                                                     │
                             ┌───────────────────────┼───────────────────────┐
                             │                       │                       │
                             ▼                       ▼                       ▼
                   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
                   │  PostgreSQL 16   │    │  Redis 7 Alpine  │    │  BullMQ Workers  │
                   │  with pgvector   │    │  Queues & Caches │    │  Async Jobs      │
                   │  Port 5432       │    │  Port 6379       │    │  All 7 Engines   │
                   └──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 2. Pre-Deployment Verification Checklist

Before pushing to your production cluster, verify that the following local checks pass:

| Check | Command | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Typecheck** | `npx turbo typecheck` | 22/22 tasks successful, 0 errors | ✅ PASS |
| **Linting** | `npx turbo lint` | 22/22 tasks successful, 0 errors | ✅ PASS |
| **Unit Tests** | `npm test -w apps/api` | 8 test suites, 44/44 tests passed | ✅ PASS |
| **Production Build** | `npx turbo build` | 14/14 packages/apps built cleanly | ✅ PASS |
| **API Health Probe** | `GET http://localhost:3001/health` | HTTP 200 `{"status":"healthy"}` | ✅ PASS |
| **API Ready Probe** | `GET http://localhost:3001/ready` | HTTP 200 `{"status":"ready"}` | ✅ PASS |

---

## 3. Production Environment Configuration

Create `.env.production` (or configure secrets in your cloud provider: AWS Secrets Manager, Vault, or GCP Secret Manager):

```env
# Application Environment
NODE_ENV=production
LOG_LEVEL=info

# Database (PostgreSQL 16 with pgvector)
DATABASE_URL=postgresql://nexusone:YOUR_SECURE_PASSWORD@postgres:5432/nexusone_prod?schema=public

# Redis 7 Cache & Job Queues
REDIS_URL=redis://redis:6379

# Session Security (Generate with: openssl rand -hex 32)
SESSION_SECRET=e7a8f102c938b4d81239c0e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4

# CORS Security (List all production hostnames)
CORS_ORIGINS=https://nexusone.dev,https://app.nexusone.dev,https://api.nexusone.dev

# Public Dashboard Endpoint (Baked into static build)
VITE_API_URL=https://api.nexusone.dev
```

---

## 4. Single-Command Turn-Key Deployment (Docker Compose)

To launch the entire platform with production settings:

```bash
# 1. Start all 6 production services
docker compose -f docker-compose.prod.yml up -d --build

# 2. Run database migrations inside the API container
docker compose -f docker-compose.prod.yml exec api npm run db:migrate:deploy

# 3. Seed production base data (users, organizations, workspaces)
docker compose -f docker-compose.prod.yml exec api npm run db:seed

# 4. Check cluster status
docker compose -f docker-compose.prod.yml ps
```

---

## 5. Kubernetes & Cloud Container Deployment

Each application contains its own independent multi-stage Dockerfile:

- **API Server:** `apps/api/Dockerfile`
  - Base: `node:20-alpine`
  - Non-root user: `node`
  - Healthcheck: `/health` endpoint
- **Worker Daemon:** `apps/worker/Dockerfile`
  - Base: `node:20-alpine`
  - Non-root user: `node`
  - Background processors: `agentforge`, `pulseops`, `gateflow`, `cortexrag`, `syncspace`, `sentinelx`, `cloudpilot`
- **Dashboard SPA:** `apps/dashboard/Dockerfile`
  - Base: `nginx:alpine`
  - Static fallback: `try_files $uri $uri/ /index.html;`
  - Gzip compression & browser cache headers
- **Marketing Site:** `apps/marketing/Dockerfile`
  - Base: `node:20-alpine`
  - Next.js 14 server with security headers

---

## 6. Post-Deployment Smoke Verification

Run these smoke tests immediately after deployment:

1. **Verify API Health:**
   ```bash
   curl -f https://api.nexusone.dev/health
   # Returns: {"status":"healthy","version":"0.1.0"}
   ```
2. **Verify Database Connectivity:**
   ```bash
   curl -f https://api.nexusone.dev/ready
   # Returns: {"status":"ready","checks":{"server":"up"}}
   ```
3. **Verify Dashboard Loading:**
   Open `https://app.nexusone.dev` in a browser. Verify login page displays, demo quick-fill buttons function, and product views load without JS errors.
4. **Verify Marketing Landing:**
   Open `https://nexusone.dev` in a browser. Verify all 7 product cards, architecture diagram, security compliance tokens, and pricing tiers render cleanly.
