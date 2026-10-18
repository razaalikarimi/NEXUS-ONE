import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
  Input,
  FormField,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from '@nexus-one/ui';

interface GatewayRouteItem {
  id: string;
  name: string;
  pathPattern: string;
  upstreamUrl: string;
  methods: string[];
  stripPath: boolean;
  rateLimitRps: number;
  rateLimitBurst: number;
  corsEnabled: boolean;
  authRequired: boolean;
  status: 'active' | 'inactive';
  latencyP99: string;
  requestsToday: number;
}

interface ConsumerItem {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  quota: string;
  apiKeysCount: number;
  status: 'active' | 'suspended';
  lastActive: string;
}

interface ProxySimulationResult {
  statusCode: number;
  latencyMs: number;
  targetUrl: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  remainingTokens: number;
  burstLimit: number;
}

export function GateFlowPage() {
  const [activeTab, setActiveTab] = useState('routes');

  // Routes State
  const [routes, setRoutes] = useState<GatewayRouteItem[]>([
    {
      id: 'rt-1',
      name: 'Authentication & Session Service',
      pathPattern: '/api/v1/auth/*',
      upstreamUrl: 'https://auth.internal.nexusone.dev:8443',
      methods: ['POST', 'GET'],
      stripPath: false,
      rateLimitRps: 50,
      rateLimitBurst: 100,
      corsEnabled: true,
      authRequired: false,
      status: 'active',
      latencyP99: '12ms',
      requestsToday: 42100,
    },
    {
      id: 'rt-2',
      name: 'AgentForge DAG Orchestrations',
      pathPattern: '/api/v1/agentforge/*',
      upstreamUrl: 'https://agentforge.internal.nexusone.dev:8443',
      methods: ['GET', 'POST', 'PATCH'],
      stripPath: true,
      rateLimitRps: 200,
      rateLimitBurst: 400,
      corsEnabled: true,
      authRequired: true,
      status: 'active',
      latencyP99: '6.4ms',
      requestsToday: 89400,
    },
    {
      id: 'rt-3',
      name: 'PulseOps Telemetry Ingestion Ingress',
      pathPattern: '/api/v1/pulseops/events',
      upstreamUrl: 'https://pulseops-ingest.internal.nexusone.dev:9092',
      methods: ['POST'],
      stripPath: false,
      rateLimitRps: 1000,
      rateLimitBurst: 2500,
      corsEnabled: true,
      authRequired: true,
      status: 'active',
      latencyP99: '1.8ms',
      requestsToday: 320400,
    },
    {
      id: 'rt-4',
      name: 'Stripe Payment Webhook Ingress',
      pathPattern: '/webhooks/stripe',
      upstreamUrl: 'https://billing.internal.nexusone.dev:8443',
      methods: ['POST'],
      stripPath: false,
      rateLimitRps: 100,
      rateLimitBurst: 200,
      corsEnabled: false,
      authRequired: false,
      status: 'active',
      latencyP99: '4.2ms',
      requestsToday: 1420,
    },
  ]);

  // Consumers State
  const [consumers, setConsumers] = useState<ConsumerItem[]>([
    {
      id: 'con-1',
      name: 'Acme Global Mobile App',
      tier: 'enterprise',
      quota: '10,000 req/min',
      apiKeysCount: 3,
      status: 'active',
      lastActive: '1m ago',
    },
    {
      id: 'con-2',
      name: 'FinTech Cloud Analytics Webhooks',
      tier: 'pro',
      quota: '1,000 req/min',
      apiKeysCount: 2,
      status: 'active',
      lastActive: '4m ago',
    },
    {
      id: 'con-3',
      name: 'Community Open Source SDK',
      tier: 'free',
      quota: '100 req/min',
      apiKeysCount: 1,
      status: 'active',
      lastActive: '2h ago',
    },
  ]);

  // Modal State for New Route
  const [isNewRouteModalOpen, setIsNewRouteModalOpen] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRoutePath, setNewRoutePath] = useState('');
  const [newRouteUpstream, setNewRouteUpstream] = useState('');
  const [newRouteRps, setNewRouteRps] = useState('100');
  const [newRouteMethods, setNewRouteMethods] = useState('GET, POST');

  // Modal State for Key Generator
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [selectedConsumerId, setSelectedConsumerId] = useState<string>('con-1');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Interactive Proxy Simulator State
  const [simRouteId, setSimRouteId] = useState<string>('rt-2');
  const [simMethod, setSimMethod] = useState<string>('GET');
  const [simPath, setSimPath] = useState<string>('/workflows');
  const [simResult, setSimResult] = useState<ProxySimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Create Route
  function handleCreateRoute(e: React.FormEvent) {
    e.preventDefault();
    if (!newRouteName || !newRoutePath || !newRouteUpstream) return;

    const methodsArray = newRouteMethods
      .split(',')
      .map((m) => m.trim().toUpperCase())
      .filter(Boolean);

    const createdRoute: GatewayRouteItem = {
      id: `rt-${Date.now().toString().slice(-4)}`,
      name: newRouteName,
      pathPattern: newRoutePath.startsWith('/') ? newRoutePath : `/${newRoutePath}`,
      upstreamUrl: newRouteUpstream,
      methods: methodsArray.length > 0 ? methodsArray : ['GET'],
      stripPath: true,
      rateLimitRps: parseInt(newRouteRps, 10) || 100,
      rateLimitBurst: (parseInt(newRouteRps, 10) || 100) * 2,
      corsEnabled: true,
      authRequired: true,
      status: 'active',
      latencyP99: '4.8ms',
      requestsToday: 0,
    };

    setRoutes([createdRoute, ...routes]);
    setIsNewRouteModalOpen(false);
    setNewRouteName('');
    setNewRoutePath('');
    setNewRouteUpstream('');
  }

  // Toggle Route Active
  function handleToggleRoute(id: string) {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r
      )
    );
  }

  // Generate API Key
  function handleGenerateKey(e: React.FormEvent) {
    e.preventDefault();
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const key = `gf_live_${token}`;
    setGeneratedKey(key);
    setConsumers((prev) =>
      prev.map((c) => (c.id === selectedConsumerId ? { ...c, apiKeysCount: c.apiKeysCount + 1 } : c))
    );
  }

  // Run Proxy Simulation
  function handleRunProxyTest() {
    setIsSimulating(true);
    const matchedRoute = routes.find((r) => r.id === simRouteId);

    setTimeout(() => {
      if (!matchedRoute) {
        setIsSimulating(false);
        return;
      }

      const simulatedLatency = Math.floor(Math.random() * 12) + 2;
      const burst = matchedRoute.rateLimitBurst;
      const remaining = Math.max(1, burst - Math.floor(Math.random() * 8) - 1);

      setSimResult({
        statusCode: 200,
        latencyMs: simulatedLatency,
        targetUrl: `${matchedRoute.upstreamUrl}${simPath}`,
        headers: {
          'content-type': 'application/json',
          'x-gateway': 'GateFlow/1.0',
          'x-gateflow-latency-ms': String(simulatedLatency),
          'x-ratelimit-limit': String(burst),
          'x-ratelimit-remaining': String(remaining),
          'x-ratelimit-reset': '1',
          'access-control-allow-origin': '*',
        },
        body: {
          success: true,
          gateway: 'GateFlow Edge Proxy v1',
          matchedRoute: matchedRoute.name,
          path: simPath,
          method: simMethod,
          upstream: matchedRoute.upstreamUrl,
          clientIp: '127.0.0.1',
          timestamp: new Date().toISOString(),
        },
        remainingTokens: remaining,
        burstLimit: burst,
      });

      setIsSimulating(false);
    }, 280);
  }

  return (
    <div className="nx-product-shell">
      {/* Top Header */}
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-gateflow)' }}>
            <span>🚪 GateFlow</span>
            <span className="nx-pill-tag">Enterprise API Gateway & Developer Platform</span>
          </div>
          <h1 className="nx-product-title">API Gateway & Edge Traffic Control</h1>
          <p className="nx-product-desc">
            Token bucket rate limiting, cryptographic API key authentication, sub-millisecond reverse proxying, and OpenAPI documentation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="http://localhost:3001/docs" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">OpenAPI Docs ↗</Button>
          </a>
          <Button variant="primary" onClick={() => setIsNewRouteModalOpen(true)}>
            + Register Route
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="nx-product-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card>
          <div className="nx-stat-title">Ingested Throughput</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-gateflow)' }}>1,650 req/s</div>
          <div className="nx-stat-sub">453,920 requests today</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Gateway Overhead (p99)</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-success-500)' }}>1.2ms</div>
          <div className="nx-stat-sub">Zero proxy latency penalty</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Active Gateway Routes</div>
          <div className="nx-stat-value">{routes.filter((r) => r.status === 'active').length}</div>
          <div className="nx-stat-sub">{routes.length} configured endpoints</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Registered Consumers</div>
          <div className="nx-stat-value">{consumers.length}</div>
          <div className="nx-stat-sub">6 active cryptokeys issued</div>
        </Card>
      </div>

      {/* Tabs Container */}
      <Tabs defaultTab="routes" activeTab={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab id="routes">Routes & Policies ({routes.length})</Tab>
          <Tab id="simulator">Live Gateway Tester ⚡</Tab>
          <Tab id="consumers">Consumers & API Keys ({consumers.length})</Tab>
          <Tab id="analytics">Traffic & Latency Analytics</Tab>
        </TabList>

        {/* Tab 1: Routes & Policies */}
        <TabPanel id="routes">
          <Card style={{ marginTop: '1.5rem' }}>
            <CardHeader>
              <CardTitle>Configured Ingress & Reverse Proxy Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="nx-table-wrap">
                <table className="nx-table">
                  <thead className="nx-table__header">
                    <tr>
                      <th className="nx-table__head-cell">Route Name</th>
                      <th className="nx-table__head-cell">Methods</th>
                      <th className="nx-table__head-cell">Path Pattern</th>
                      <th className="nx-table__head-cell">Upstream Target</th>
                      <th className="nx-table__head-cell">Rate Limit</th>
                      <th className="nx-table__head-cell">p99 Latency</th>
                      <th className="nx-table__head-cell">Status</th>
                      <th className="nx-table__head-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="nx-table__body">
                    {routes.map((rt) => (
                      <tr key={rt.id} className="nx-table__row">
                        <td className="nx-table__cell">
                          <strong>{rt.name}</strong>
                        </td>
                        <td className="nx-table__cell">
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {rt.methods.map((m) => (
                              <span
                                key={m}
                                className={`nx-method-badge nx-method--${m.toLowerCase()}`}
                                style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px' }}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="nx-table__cell">
                          <code style={{ fontSize: '0.8rem', color: 'var(--nx-brand-400)', background: 'var(--nx-bg-surface-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
                            {rt.pathPattern}
                          </code>
                        </td>
                        <td className="nx-table__cell" style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--nx-text-muted)' }}>{rt.upstreamUrl}</span>
                        </td>
                        <td className="nx-table__cell">
                          <Badge variant="default" size="sm">
                            {rt.rateLimitRps} RPS ({rt.rateLimitBurst} burst)
                          </Badge>
                        </td>
                        <td className="nx-table__cell">{rt.latencyP99}</td>
                        <td className="nx-table__cell">
                          <Badge variant={rt.status === 'active' ? 'success' : 'default'} size="sm">
                            {rt.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="nx-table__cell">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleRoute(rt.id)}
                          >
                            {rt.status === 'active' ? 'Pause' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 2: Live Gateway Simulator */}
        <TabPanel id="simulator">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <Card>
              <CardHeader>
                <CardTitle>Send Simulated Gateway Request</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FormField label="Target Gateway Route">
                    <Select value={simRouteId} onChange={(e) => setSimRouteId(e.target.value)}>
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.pathPattern})
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField label="HTTP Method">
                    <Select value={simMethod} onChange={(e) => setSimMethod(e.target.value)}>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </Select>
                  </FormField>

                  <FormField label="Request Subpath">
                    <Input
                      value={simPath}
                      onChange={(e) => setSimPath(e.target.value)}
                      placeholder="/v1/items or query"
                    />
                  </FormField>

                  <Button
                    variant="primary"
                    onClick={handleRunProxyTest}
                    disabled={isSimulating}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {isSimulating ? 'Forwarding...' : 'Fire Gateway Request ⚡'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Proxy Response & Execution Trace</CardTitle>
              </CardHeader>
              <CardContent>
                {simResult ? (
                  <div>
                    {/* Status & Timing Bar */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        background: 'var(--nx-bg-surface-elevated)',
                        border: '1px solid var(--nx-border-subtle)',
                        marginBottom: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Badge variant="success" size="sm">
                          HTTP {simResult.statusCode} OK
                        </Badge>
                        <span style={{ fontSize: '0.85rem', color: 'var(--nx-text-primary)' }}>
                          Latency: <strong>{simResult.latencyMs}ms</strong>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--nx-text-muted)' }}>
                        Tokens: {simResult.remainingTokens} / {simResult.burstLimit}
                      </div>
                    </div>

                    {/* Upstream Forward Target */}
                    <div style={{ fontSize: '0.8rem', color: 'var(--nx-text-muted)', marginBottom: '0.5rem' }}>
                      Forwarded Target: <code>{simResult.targetUrl}</code>
                    </div>

                    {/* Transformed Gateway Headers */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--nx-text-muted)' }}>
                        INJECTED GATEWAY HEADERS:
                      </span>
                      <pre
                        style={{
                          margin: '0.25rem 0 0 0',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          background: 'var(--nx-bg-surface)',
                          fontSize: '0.75rem',
                          color: '#93c5fd',
                          overflowX: 'auto',
                        }}
                      >
                        {JSON.stringify(simResult.headers, null, 2)}
                      </pre>
                    </div>

                    {/* Upstream Payload */}
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--nx-text-muted)' }}>
                        UPSTREAM JSON RESPONSE:
                      </span>
                      <pre
                        style={{
                          margin: '0.25rem 0 0 0',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          background: 'var(--nx-bg-surface)',
                          fontSize: '0.75rem',
                          color: '#a7f3d0',
                          overflowX: 'auto',
                        }}
                      >
                        {JSON.stringify(simResult.body, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--nx-text-muted)' }}>
                    Select a route and click "Fire Gateway Request ⚡" to inspect real-time rate limiting and header injection.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        {/* Tab 3: Consumers & API Keys */}
        <TabPanel id="consumers">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <Card>
              <Badge variant="default" size="sm">FREE TIER</Badge>
              <h3 style={{ margin: '0.5rem 0 0.25rem 0' }}>100 req / min</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nx-text-muted)' }}>Standard rate limit bucket with burst capacity of 200 requests.</p>
            </Card>
            <Card>
              <Badge variant="warning" size="sm">PRO TIER</Badge>
              <h3 style={{ margin: '0.5rem 0 0.25rem 0' }}>1,000 req / min</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nx-text-muted)' }}>High-concurrency token refill with 2,500 burst capacity.</p>
            </Card>
            <Card>
              <Badge variant="success" size="sm">ENTERPRISE TIER</Badge>
              <h3 style={{ margin: '0.5rem 0 0.25rem 0' }}>10,000 req / min</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nx-text-muted)' }}>Dedicated gateway edge tenant with custom quotas and SLAs.</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <CardTitle>Registered Consumers & Issued API Keys</CardTitle>
                <Button variant="primary" size="sm" onClick={() => setIsKeyModalOpen(true)}>
                  + Issue API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="nx-table-wrap">
                <table className="nx-table">
                  <thead className="nx-table__header">
                    <tr>
                      <th className="nx-table__head-cell">Consumer Name</th>
                      <th className="nx-table__head-cell">Tier</th>
                      <th className="nx-table__head-cell">Quota Rate</th>
                      <th className="nx-table__head-cell">Active Keys</th>
                      <th className="nx-table__head-cell">Last Active</th>
                      <th className="nx-table__head-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody className="nx-table__body">
                    {consumers.map((c) => (
                      <tr key={c.id} className="nx-table__row">
                        <td className="nx-table__cell">
                          <strong>{c.name}</strong>
                        </td>
                        <td className="nx-table__cell">
                          <Badge variant={c.tier === 'enterprise' ? 'success' : c.tier === 'pro' ? 'warning' : 'default'} size="sm">
                            {c.tier.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="nx-table__cell">{c.quota}</td>
                        <td className="nx-table__cell">{c.apiKeysCount} keys</td>
                        <td className="nx-table__cell">{c.lastActive}</td>
                        <td className="nx-table__cell">
                          <Badge variant="success" size="sm">{c.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 4: Analytics */}
        <TabPanel id="analytics">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
            <Card>
              <div className="nx-stat-title">Latency Percentiles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>p50 (Median)</span>
                  <strong>0.8ms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>p90</span>
                  <strong>2.1ms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>p95</span>
                  <strong>3.4ms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>p99</span>
                  <strong style={{ color: 'var(--nx-success-500)' }}>7.9ms</strong>
                </div>
              </div>
            </Card>

            <Card>
              <div className="nx-stat-title">HTTP Status Code Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>2xx Success</span>
                  <strong style={{ color: 'var(--nx-success-500)' }}>98.2% (139,993)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>4xx Client Errors</span>
                  <strong style={{ color: 'var(--nx-warning-500)' }}>1.5% (2,450)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>5xx Server Errors</span>
                  <strong style={{ color: 'var(--nx-error-500)' }}>0.3% (407)</strong>
                </div>
              </div>
            </Card>

            <Card>
              <div className="nx-stat-title">Cache Efficiency</div>
              <div className="nx-stat-value" style={{ color: 'var(--nx-brand-400)' }}>42.8%</div>
              <div className="nx-stat-sub">Edge cache hit ratio across idempotent endpoints</div>
            </Card>
          </div>
        </TabPanel>
      </Tabs>

      {/* Register Route Modal */}
      <Modal isOpen={isNewRouteModalOpen} onClose={() => setIsNewRouteModalOpen(false)} title="🚪 Register Gateway Ingress Route">
        <form onSubmit={handleCreateRoute} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField label="Route Friendly Name" required>
            <Input
              placeholder="e.g. Payments Gateway Ingress"
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Incoming Path Pattern" required>
            <Input
              placeholder="e.g. /api/v1/payments/*"
              value={newRoutePath}
              onChange={(e) => setNewRoutePath(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Upstream Target URL" required>
            <Input
              placeholder="e.g. https://payments.internal.nexusone.dev:8443"
              value={newRouteUpstream}
              onChange={(e) => setNewRouteUpstream(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Permitted HTTP Methods">
            <Input
              placeholder="e.g. GET, POST, PUT, DELETE"
              value={newRouteMethods}
              onChange={(e) => setNewRouteMethods(e.target.value)}
            />
          </FormField>

          <FormField label="Rate Limit RPS (Burst capacity = 2x)">
            <Input
              type="number"
              value={newRouteRps}
              onChange={(e) => setNewRouteRps(e.target.value)}
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" type="button" onClick={() => setIsNewRouteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Provision Route
            </Button>
          </div>
        </form>
      </Modal>

      {/* Issue Key Modal */}
      <Modal isOpen={isKeyModalOpen} onClose={() => { setIsKeyModalOpen(false); setGeneratedKey(null); }} title="🔑 Issue Cryptographic API Key">
        <form onSubmit={handleGenerateKey} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField label="Consumer Organization" required>
            <Select value={selectedConsumerId} onChange={(e) => setSelectedConsumerId(e.target.value)}>
              {consumers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier.toUpperCase()})
                </option>
              ))}
            </Select>
          </FormField>

          {generatedKey && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', marginBottom: '0.25rem' }}>
                GENERATED API KEY (SAVE THIS KEY SECURELY):
              </div>
              <code style={{ fontSize: '0.85rem', color: '#a7f3d0', wordBreak: 'break-all' }}>
                {generatedKey}
              </code>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" type="button" onClick={() => { setIsKeyModalOpen(false); setGeneratedKey(null); }}>
              Done
            </Button>
            {!generatedKey && (
              <Button variant="primary" type="submit">
                Generate Key
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
