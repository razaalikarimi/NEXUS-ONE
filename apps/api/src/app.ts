// ============================================================
// Fastify App Builder
// ============================================================
// Constructs and configures the Fastify instance with all
// plugins, middleware, and routes.
// ============================================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { randomUUID } from 'node:crypto';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] || 'info',
      ...(process.env['NODE_ENV'] === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          }
        : {}),
      redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
    },
    genReqId: () => randomUUID(),
    trustProxy: true,
  });

  // ---- Security headers ----
  await app.register(helmet, {
    contentSecurityPolicy: false, // Configured per-deployment
  });

  // ---- CORS ----
  const corsOrigins = (process.env['CORS_ORIGINS'] || 'http://localhost:5173,http://localhost:3000').split(',');
  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Org-Id'],
  });

  // ---- Cookies ----
  await app.register(cookie, {
    secret: process.env['SESSION_SECRET'] || 'dev-secret-change-me',
  });

  // ---- Rate limiting ----
  await app.register(rateLimit, {
    max: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10),
    timeWindow: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000', 10),
  });

  // ---- OpenAPI documentation ----
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'NEXUS ONE API',
        description: 'Unified Enterprise AI & Developer Platform API',
        version: '0.1.0',
      },
      servers: [
        { url: process.env['API_URL'] || 'http://localhost:3001', description: 'Development' },
      ],
      tags: [
        { name: 'auth', description: 'Authentication and sessions' },
        { name: 'organizations', description: 'Organization management' },
        { name: 'workspaces', description: 'Workspace management' },
        { name: 'agentforge', description: 'AI Agent Orchestration' },
        { name: 'pulseops', description: 'Incident Management' },
        { name: 'gateflow', description: 'API Gateway' },
        { name: 'cortexrag', description: 'Knowledge Intelligence' },
        { name: 'syncspace', description: 'Collaborative Workspace' },
        { name: 'sentinelx', description: 'Fraud & Risk Engine' },
        { name: 'cloudpilot', description: 'Cloud Cost Intelligence' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // ---- Request ID propagation ----
  app.addHook('onRequest', async (request, reply) => {
    const requestId = request.id;
    reply.header('X-Request-Id', requestId);
  });

  // ---- Health check ----
  app.get('/health', {
    schema: {
      tags: ['system'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            version: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
          },
        },
      },
    },
  }, async () => ({
    status: 'healthy',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // ---- Readiness check ----
  app.get('/ready', {
    schema: { tags: ['system'] },
  }, async () => {
    // Phase 2: Add database and Redis connectivity checks
    return { status: 'ready' };
  });

  // ---- API v1 routes (Phase 2+) ----
  // app.register(authRoutes, { prefix: '/api/v1/auth' });
  // app.register(orgRoutes, { prefix: '/api/v1/organizations' });

  return app;
}
