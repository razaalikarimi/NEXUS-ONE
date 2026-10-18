# Local Development

## Prerequisites

- **Node.js** 20 or later
- **Docker** and **Docker Compose**
- **Git**

## Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd nexus-one

# 2. Copy environment variables
cp .env.example .env
# Edit .env with appropriate values

# 3. Start infrastructure services
docker compose up -d

# 4. Verify services are running
docker compose ps

# 5. Install dependencies
npm install

# 6. Generate Prisma client
npm run db:generate

# 7. Run database migrations
npm run db:migrate

# 8. (Optional) Seed the database
npm run db:seed

# 9. Start all services
npm run dev
```

## Service URLs

| Service | URL |
|---------|-----|
| Marketing Site | http://localhost:3000 |
| Dashboard | http://localhost:5173 |
| API Server | http://localhost:3001 |
| API Documentation | http://localhost:3001/docs |
| Health Check | http://localhost:3001/health |

## Running Individual Services

```bash
# API server only
npm run dev -w apps/api

# Dashboard only
npm run dev -w apps/dashboard

# Marketing site only
npm run dev -w apps/marketing

# Worker only
npm run dev -w apps/worker
```

## Database Management

```bash
npm run db:migrate        # Create and apply migrations
npm run db:generate       # Regenerate Prisma client
npm run db:seed           # Seed with demo data
npm run db:studio         # Open Prisma Studio
npm run db:reset          # Reset database (destructive)
```

## Testing

```bash
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
```

## Troubleshooting

### Port conflicts
If port 5432 or 6379 is in use, stop other services or change ports in `docker-compose.yml` and `.env`.

### Node modules issues
```bash
npm run clean
npm install
```

### Database connection refused
Ensure Docker is running and containers are healthy:
```bash
docker compose ps
docker compose logs postgres
```
