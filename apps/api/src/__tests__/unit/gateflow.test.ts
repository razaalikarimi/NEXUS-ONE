import { describe, it, expect } from 'vitest';
import { gateFlowEngine, type RouteDefinition } from '../../services/gateflow/engine.js';

describe('GateFlow API Gateway Routing & Rate Limiting Engine', () => {
  it('matches exact paths and wildcard path patterns accurately', () => {
    expect(gateFlowEngine.matchPath('/api/v1/auth/login', '/api/v1/auth/login')).toBe(true);
    expect(gateFlowEngine.matchPath('/api/v1/payments/*', '/api/v1/payments/charge')).toBe(true);
    expect(gateFlowEngine.matchPath('/api/v1/payments/*', '/api/v1/payments/tx-99/receipt')).toBe(true);
    expect(gateFlowEngine.matchPath('/api/v1/payments/*', '/api/v1/users/profile')).toBe(false);
  });

  it('validates HTTP method permissions case-insensitively', () => {
    const allowed = ['GET', 'POST'];
    expect(gateFlowEngine.matchMethod(allowed, 'get')).toBe(true);
    expect(gateFlowEngine.matchMethod(allowed, 'POST')).toBe(true);
    expect(gateFlowEngine.matchMethod(allowed, 'DELETE')).toBe(false);
  });

  it('correctly resolves upstream target path with stripPath true and false', () => {
    const routeWithStrip: RouteDefinition = {
      id: 'rt-1',
      name: 'Payments',
      pathPattern: '/api/v1/payments/*',
      upstreamUrl: 'https://payments-backend.internal:8443',
      methods: ['POST'],
      stripPath: true,
      rateLimitRps: 10,
      rateLimitBurst: 20,
      authRequired: true,
      corsEnabled: true,
      transformHeaders: {},
      timeoutMs: 5000,
      status: 'active',
    };

    const target1 = gateFlowEngine.resolveTargetPath(routeWithStrip, '/api/v1/payments/charge');
    expect(target1).toBe('/charge');

    const routeNoStrip: RouteDefinition = {
      ...routeWithStrip,
      stripPath: false,
    };
    const target2 = gateFlowEngine.resolveTargetPath(routeNoStrip, '/api/v1/payments/charge');
    expect(target2).toBe('/api/v1/payments/charge');
  });

  it('enforces token bucket rate limiting and denies requests when burst is exhausted', () => {
    const bucketKey = 'test-client-exhaustion';
    const config = { capacity: 3, refillRate: 1 };

    // First 3 requests should be allowed
    const r1 = gateFlowEngine.checkRateLimit(bucketKey, config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = gateFlowEngine.checkRateLimit(bucketKey, config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = gateFlowEngine.checkRateLimit(bucketKey, config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request must be denied with remaining = 0
    const r4 = gateFlowEngine.checkRateLimit(bucketKey, config);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.resetSeconds).toBeGreaterThanOrEqual(1);
  });

  it('sanitizes hop-by-hop headers and injects gateway headers', () => {
    const incomingHeaders = {
      'content-type': 'application/json',
      connection: 'keep-alive',
      'transfer-encoding': 'chunked',
      'x-nexus-internal-secret': 'super-secret',
      authorization: 'Bearer user-token',
    };

    const routeTransforms = {
      'X-Tenant-Tier': 'Enterprise',
    };

    const transformed = gateFlowEngine.transformHeaders(incomingHeaders, routeTransforms);

    // Stripped
    expect(transformed['connection']).toBeUndefined();
    expect(transformed['transfer-encoding']).toBeUndefined();
    expect(transformed['x-nexus-internal-secret']).toBeUndefined();

    // Kept
    expect(transformed['authorization']).toBe('Bearer user-token');
    expect(transformed['content-type']).toBe('application/json');

    // Injected
    expect(transformed['X-Gateway']).toBe('GateFlow/1.0');
    expect(transformed['X-Tenant-Tier']).toBe('Enterprise');
  });

  it('executes end-to-end proxy simulation and returns accurate rate limit headers', async () => {
    const route: RouteDefinition = {
      id: 'rt-sim-1',
      name: 'Inference Proxy',
      pathPattern: '/v1/models/*',
      upstreamUrl: 'https://llm.internal:8000',
      methods: ['POST'],
      stripPath: true,
      rateLimitRps: 50,
      rateLimitBurst: 100,
      authRequired: true,
      corsEnabled: true,
      transformHeaders: { 'X-Engine': 'GateFlow' },
      timeoutMs: 10000,
      status: 'active',
    };

    const res = await gateFlowEngine.executeProxy({
      route,
      method: 'POST',
      incomingPath: '/v1/models/claude-3-5',
      headers: { 'Content-Type': 'application/json' },
      body: { prompt: 'Hello world' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.targetPath).toBe('/claude-3-5');
    expect(res.upstreamUrl).toBe('https://llm.internal:8000/claude-3-5');
    expect(res.headers['X-Gateway']).toBe('GateFlow/1.0');
    expect(res.headers['X-Engine']).toBe('GateFlow');
    expect(res.headers['X-RateLimit-Limit']).toBe('100');
    expect(res.latencyMs).toBeGreaterThan(0);
  });
});
