# Production Deployment

> ⚠️ This document describes the intended production deployment. Actual deployment has NOT been verified yet.

## Architecture

```
                    ┌─────────────┐
                    │  CDN/Edge   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────┴──────┐ ┌──┴───┐ ┌──────┴──────┐
       │  Marketing  │ │ API  │ │  Dashboard  │
       │  (Next.js)  │ │      │ │   (Static)  │
       └─────────────┘ └──┬───┘ └─────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
              ┌─────┴─────┐ ┌──┴───┐
              │ PostgreSQL │ │Redis │
              └───────────┘ └──┬───┘
                               │
                          ┌────┴────┐
                          │ Workers │
                          └─────────┘
```

## Deployment Requirements

- Container runtime (Docker, ECS, GKE, etc.)
- PostgreSQL 16 with pgvector extension
- Redis 7
- S3-compatible object storage (for file uploads)
- SMTP service (for email notifications)

## Environment Variables

See `.env.example` for the complete list. All variables must be set in the production environment.

Critical production variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `SESSION_SECRET` — Must be cryptographically random, at least 32 characters
- `CORS_ORIGINS` — Production domain(s)
- `NODE_ENV=production`

## Deployment Steps

1. Build Docker images for each service
2. Configure environment variables
3. Run database migrations: `npm run db:migrate:deploy`
4. Deploy API server
5. Deploy workers
6. Deploy dashboard (static files to CDN)
7. Deploy marketing site (Next.js to Vercel/container)
8. Verify health endpoints
9. Run smoke tests

## Rollback Procedure

1. Identify the failing deployment
2. Revert to previous container image
3. If database migration is needed, follow the rollback migration procedure
4. Verify health endpoints
5. Monitor error rates

## Status

This deployment has NOT been verified. Do not claim production readiness.
