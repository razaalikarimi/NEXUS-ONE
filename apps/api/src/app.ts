// ============================================================
// Fastify App Builder — NEXUS ONE API
// ============================================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { randomUUID } from 'node:crypto';

import authPlugin from './plugins/auth.js';
import tenantPlugin from './plugins/tenant.js';

import { authRoutes } from './routes/auth.js';
import { organizationRoutes } from './routes/organizations.js';
import { workspaceRoutes } from './routes/workspaces.js';

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
    contentSecurityPolicy: false,
  });

  // ---- CORS ----
  const corsOrigins = (
    process.env['CORS_ORIGINS'] || 'http://localhost:5173,http://localhost:3000'
  ).split(',');
  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Org-Id'],
  });

  // ---- Cookies ----
  await app.register(cookie, {
    secret: process.env['SESSION_SECRET'] || 'dev-session-secret-nexusone-super-secure',
  });

  // ---- Rate limiting ----
  await app.register(rateLimit, {
    max: parseInt(process.env['RATE_LIMIT_MAX'] || '200', 10),
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
        { url: process.env['API_URL'] || 'http://localhost:3001', description: 'Development Server' },
      ],
      tags: [
        { name: 'system', description: 'Health and readiness endpoints' },
        { name: 'auth', description: 'Authentication and session management' },
        { name: 'organizations', description: 'Multi-tenant organization management' },
        { name: 'workspaces', description: 'Workspace isolation and settings' },
        { name: 'agentforge', description: 'AI Agent Orchestration Platform' },
        { name: 'pulseops', description: 'AI-Powered Incident Management' },
        { name: 'gateflow', description: 'API Gateway & Developer Platform' },
        { name: 'cortexrag', description: 'Enterprise Knowledge Intelligence' },
        { name: 'syncspace', description: 'Real-Time Collaborative Workspace' },
        { name: 'sentinelx', description: 'Autonomous Fraud & Risk Engine' },
        { name: 'cloudpilot', description: 'Intelligent Cloud Cost Optimizer' },
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

  // ---- Core Auth & Tenant Plugins ----
  await app.register(authPlugin);
  await app.register(tenantPlugin);

  // ---- Health check ----
  app.get('/health', {
    schema: {
      tags: ['system'],
      summary: 'Liveness probe',
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
    schema: {
      tags: ['system'],
      summary: 'Readiness probe',
    },
  }, async () => {
    return {
      status: 'ready',
      checks: {
        server: 'up',
      },
    };
  });

  // ---- API v1 Routes ----
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(organizationRoutes, { prefix: '/api/v1/organizations' });
  await app.register(workspaceRoutes, { prefix: '/api/v1/workspaces' });

  return app;
}
