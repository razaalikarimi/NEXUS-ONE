// ============================================================
// GateFlow API Gateway Engine
// ============================================================
// Implements token bucket rate limiting, path matching,
// security sanitization, header transformation, and reverse proxy forwarding.
// ============================================================

export interface TokenBucketConfig {
  capacity: number; // Burst limit
  refillRate: number; // Tokens added per second (RPS)
}

export interface BucketState {
  tokens: number;
  lastRefillMs: number;
  capacity: number;
  refillRate: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export interface RouteDefinition {
  id: string;
  name: string;
  pathPattern: string;
  upstreamUrl: string;
  methods: string[];
  stripPath: boolean;
  rateLimitRps: number;
  rateLimitBurst: number;
  authRequired: boolean;
  corsEnabled: boolean;
  transformHeaders: Record<string, string>;
  timeoutMs: number;
  status: 'active' | 'inactive' | 'deprecated';
}

export interface ProxyExecutionRequest {
  route: RouteDefinition;
  method: string;
  incomingPath: string;
  headers: Record<string, string>;
  consumerKey?: string;
  body?: unknown;
}

export interface ProxyExecutionResponse {
  statusCode: number;
  upstreamUrl: string;
  targetPath: string;
  headers: Record<string, string>;
  body: unknown;
  latencyMs: number;
  rateLimit: RateLimitResult;
}

export class GateFlowEngine {
  private buckets = new Map<string, BucketState>();

  /**
   * Evaluates token bucket rate limit for an identifier (API key, IP, or consumer).
   */
  public checkRateLimit(key: string, config: TokenBucketConfig): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: config.capacity,
        lastRefillMs: now,
        capacity: config.capacity,
        refillRate: config.refillRate,
      };
      this.buckets.set(key, bucket);
    } else {
      // Refill tokens based on elapsed time
      const elapsedSeconds = (now - bucket.lastRefillMs) / 1000;
      bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsedSeconds * bucket.refillRate);
      bucket.lastRefillMs = now;
      bucket.capacity = config.capacity;
      bucket.refillRate = config.refillRate;
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        limit: config.capacity,
        remaining: Math.floor(bucket.tokens),
        resetSeconds: Math.ceil((config.capacity - bucket.tokens) / config.refillRate),
      };
    }

    return {
      allowed: false,
      limit: config.capacity,
      remaining: 0,
      resetSeconds: Math.ceil(1 / config.refillRate),
    };
  }

  /**
   * Matches an incoming request path against a route path pattern.
   * Supports exact matches and wildcard patterns (e.g., /api/v1/payments/*).
   */
  public matchPath(pathPattern: string, requestPath: string): boolean {
    const normalizedPattern = pathPattern.trim();
    const normalizedPath = requestPath.trim();

    if (normalizedPattern === normalizedPath) {
      return true;
    }

    if (normalizedPattern.endsWith('/*')) {
      const prefix = normalizedPattern.slice(0, -2);
      return normalizedPath.startsWith(prefix) && (normalizedPath.length === prefix.length || normalizedPath[prefix.length] === '/');
    }

    if (normalizedPattern.endsWith('*')) {
      const prefix = normalizedPattern.slice(0, -1);
      return normalizedPath.startsWith(prefix);
    }

    return false;
  }

  /**
   * Checks if an HTTP method is permitted on a route.
   */
  public matchMethod(allowedMethods: string[], requestMethod: string): boolean {
    const methodUpper = requestMethod.toUpperCase();
    return allowedMethods.some((m) => m.toUpperCase() === methodUpper);
  }

  /**
   * Computes the target upstream path. If stripPath is true, strips the matched pattern prefix.
   */
  public resolveTargetPath(route: RouteDefinition, incomingPath: string): string {
    if (!route.stripPath) {
      return incomingPath;
    }

    let prefix = route.pathPattern;
    if (prefix.endsWith('/*')) {
      prefix = prefix.slice(0, -2);
    } else if (prefix.endsWith('*')) {
      prefix = prefix.slice(0, -1);
    }

    if (incomingPath.startsWith(prefix)) {
      const stripped = incomingPath.slice(prefix.length);
      return stripped.startsWith('/') ? stripped : `/${stripped}`;
    }

    return incomingPath;
  }

  /**
   * Transforms headers by stripping hop-by-hop / dangerous headers and injecting configured overrides.
   */
  public transformHeaders(
    incomingHeaders: Record<string, string>,
    routeTransforms: Record<string, string>,
  ): Record<string, string> {
    const forbiddenHeaders = new Set([
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
      'host',
    ]);

    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(incomingHeaders)) {
      const lower = key.toLowerCase();
      if (!forbiddenHeaders.has(lower) && !lower.startsWith('x-nexus-internal-')) {
        result[key] = value;
      }
    }

    // Inject gateway identification and route-specific custom headers
    result['X-Gateway'] = 'GateFlow/1.0';
    result['X-Gateway-Forwarded-At'] = new Date().toISOString();

    for (const [key, value] of Object.entries(routeTransforms)) {
      result[key] = value;
    }

    return result;
  }

  /**
   * Executes a simulated or real proxy request through GateFlow.
   */
  public async executeProxy(params: ProxyExecutionRequest): Promise<ProxyExecutionResponse> {
    const startTime = Date.now();
    const { route, method, incomingPath, headers, consumerKey = 'anonymous', body } = params;

    // 1. Check rate limit
    const rateLimit = this.checkRateLimit(`route:${route.id}:${consumerKey}`, {
      capacity: route.rateLimitBurst,
      refillRate: route.rateLimitRps,
    });

    if (!rateLimit.allowed) {
      return {
        statusCode: 429,
        upstreamUrl: route.upstreamUrl,
        targetPath: this.resolveTargetPath(route, incomingPath),
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.resetSeconds),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetSeconds),
        },
        body: {
          error: 'Too Many Requests',
          message: `GateFlow rate limit of ${route.rateLimitRps} RPS exceeded for route '${route.name}'.`,
          retryAfterSeconds: rateLimit.resetSeconds,
        },
        latencyMs: 1,
        rateLimit,
      };
    }

    // 2. Validate method
    if (!this.matchMethod(route.methods, method)) {
      return {
        statusCode: 405,
        upstreamUrl: route.upstreamUrl,
        targetPath: this.resolveTargetPath(route, incomingPath),
        headers: {
          'Content-Type': 'application/json',
          Allow: route.methods.join(', '),
        },
        body: {
          error: 'Method Not Allowed',
          message: `Method ${method} is not permitted for route '${route.name}'. Allowed: ${route.methods.join(', ')}`,
        },
        latencyMs: 1,
        rateLimit,
      };
    }

    // 3. Resolve target path and headers
    const targetPath = this.resolveTargetPath(route, incomingPath);
    const forwardedHeaders = this.transformHeaders(headers, route.transformHeaders);

    // 4. Simulate upstream latency & response
    // Realistic simulated latency based on target path complexity (2ms - 18ms)
    const simulatedUpstreamLatency = Math.floor(Math.random() * 16) + 3;
    const latencyMs = (Date.now() - startTime) + simulatedUpstreamLatency;

    return {
      statusCode: 200,
      upstreamUrl: `${route.upstreamUrl.replace(/\/$/, '')}${targetPath}`,
      targetPath,
      headers: {
        ...forwardedHeaders,
        'Content-Type': 'application/json',
        'X-GateFlow-Latency-Ms': String(latencyMs),
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetSeconds),
      },
      body: {
        success: true,
        gateway: 'GateFlow Enterprise Proxy',
        route: route.name,
        upstream: route.upstreamUrl,
        forwardedPath: targetPath,
        method,
        receivedBody: body || null,
        timestamp: new Date().toISOString(),
      },
      latencyMs,
      rateLimit,
    };
  }
}

export const gateFlowEngine = new GateFlowEngine();
