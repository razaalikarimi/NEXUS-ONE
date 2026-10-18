# NEXUS ONE

> **Build. Observe. Automate. Understand.**

A unified enterprise AI and developer platform with seven integrated products.

## Products

| Product | Description | Status |
|---------|-------------|--------|
| **AgentForge** | AI Agent Orchestration Platform | Phase 4 |
| **PulseOps** | AI-Powered Incident Management and Observability | Phase 6 |
| **GateFlow** | API Gateway and Developer Platform | Phase 7 |
| **CortexRAG** | Enterprise Knowledge Intelligence | Phase 5 |
| **SyncSpace** | Real-Time Collaborative Workspace | Phase 8 |
| **SentinelX** | Real-Time Fraud and Risk Engine | Phase 9 |
| **CloudPilot** | Cloud Cost and Resource Intelligence | Phase 10 |

## Tech Stack

- **Monorepo**: Turborepo + npm workspaces
- **Marketing Site**: Next.js 14 (App Router, SSR/SSG)
- **Dashboard**: React 18 + Vite 5
- **API Server**: Fastify 4 (TypeScript)
- **Database**: PostgreSQL 16 + Prisma 5 + pgvector
- **Cache & Queues**: Redis 7 + BullMQ 5
- **Real-time**: Socket.IO 4
- **Validation**: Zod 3
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Docker

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd nexus-one

# Copy environment variables
cp .env.example .env

# Start PostgreSQL and Redis
docker compose up -d

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start all services in development mode
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all services in dev mode |
| `npm run build` | Build all packages and apps |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | Type-check all packages |
| `npm run test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests |
| `npm run format` | Format all files with Prettier |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |

### URLs (Development)

| Service | URL |
|---------|-----|
| Marketing Site | http://localhost:3000 |
| Dashboard | http://localhost:5173 |
| API Server | http://localhost:3001 |
| API Documentation | http://localhost:3001/docs |
| Health Check | http://localhost:3001/health |
| Prisma Studio | http://localhost:5555 |

## Project Structure

```
nexus-one/
├── apps/
│   ├── marketing/       # Next.js public website
│   ├── dashboard/       # React + Vite authenticated app
│   ├── api/             # Fastify REST API
│   └── worker/          # BullMQ background workers
├── packages/
│   ├── database/        # Prisma schema and client
│   ├── auth/            # Authentication logic
│   ├── config/          # Environment validation
│   ├── validators/      # Shared Zod schemas
│   ├── types/           # Shared TypeScript types
│   ├── ui/              # Shared React components
│   ├── design-tokens/   # CSS custom properties
│   ├── logger/          # Structured logging
│   ├── integrations/    # Provider adapters
│   └── testing/         # Test utilities
├── infra/
│   ├── docker/          # Dockerfiles
│   └── ci/              # CI/CD configs
├── docs/                # Documentation
└── .github/workflows/   # GitHub Actions
```

## Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Data Model](docs/architecture/data-model.md)
- [Security Model](docs/security/security-model.md)
- [Local Development](docs/deployment/local-development.md)
- [Production Deployment](docs/deployment/production.md)
- [API Overview](docs/api/overview.md)
- [Release Checklist](docs/release-checklist.md)
- [Implementation Status](docs/implementation-status.md)

## Implementation Status

See [docs/implementation-status.md](docs/implementation-status.md) for current status of all features and products.

## License

Proprietary — All rights reserved.
