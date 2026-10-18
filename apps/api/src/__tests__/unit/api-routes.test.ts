import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../app.js';

describe('Fastify API Server Phase 2 Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('System endpoints', () => {
    it('GET /health returns 200 with status healthy and uptime', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json.status).toBe('healthy');
      expect(json.version).toBe('0.1.0');
      expect(typeof json.uptime).toBe('number');
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('GET /ready returns 200 ready state', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json.status).toBe('ready');
      expect(json.checks.server).toBe('up');
    });
  });

  describe('Auth validation', () => {
    it('POST /api/v1/auth/register rejects invalid email and weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'not-an-email',
          password: '123',
          name: '',
        },
      });

      expect(response.statusCode).toBe(400);
      const json = JSON.parse(response.body);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.details).toBeDefined();
    });

    it('POST /api/v1/auth/login rejects empty password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@nexusone.dev',
          password: '',
        },
      });

      expect(response.statusCode).toBe(400);
      const json = JSON.parse(response.body);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/v1/auth/me rejects unauthenticated request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const json = JSON.parse(response.body);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Tenant & RBAC guard', () => {
    it('GET /api/v1/organizations rejects unauthenticated request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/organizations',
      });

      expect(response.statusCode).toBe(401);
      const json = JSON.parse(response.body);
      expect(json.success).toBe(false);
    });

    it('GET /api/v1/workspaces rejects unauthenticated request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/workspaces',
      });

      expect(response.statusCode).toBe(401);
      const json = JSON.parse(response.body);
      expect(json.success).toBe(false);
    });
  });
});
