import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@nexus-one/ui';

interface ApiRoute {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  rateLimit: string;
  latencyP99: string;
  status: 'active' | 'degraded';
}

export function GateFlowPage() {
  const [routes] = useState<ApiRoute[]>([
    {
      id: 'rt-1',
      path: '/api/v1/auth/login',
      method: 'POST',
      rateLimit: '20 req/min',
      latencyP99: '18ms',
      status: 'active',
    },
    {
      id: 'rt-2',
      path: '/api/v1/agentforge/workflows',
      method: 'GET',
      rateLimit: '200 req/min',
      latencyP99: '6ms',
      status: 'active',
    },
    {
      id: 'rt-3',
      path: '/api/v1/cortexrag/query',
      method: 'POST',
      rateLimit: '100 req/min',
      latencyP99: '42ms',
      status: 'active',
    },
    {
      id: 'rt-4',
      path: '/api/v1/cloudpilot/forecast',
      method: 'GET',
      rateLimit: '60 req/min',
      latencyP99: '14ms',
      status: 'active',
    },
  ]);

  return (
    <div className="nx-product-shell">
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-gateflow)' }}>
            <span>🚪 GateFlow</span>
            <span className="nx-pill-tag">API Gateway & Developer Platform</span>
          </div>
          <h1 className="nx-product-title">API Gateway & Traffic Control</h1>
          <p className="nx-product-desc">
            Rate limiting, cryptographic key authentication, OpenAPI 3.1 documentation, and edge routing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="http://localhost:3001/docs" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">Open Swagger UI ↗</Button>
          </a>
          <Button variant="primary">+ Register Endpoint</Button>
        </div>
      </div>

      <div className="nx-product-grid-3">
        <Card>
          <div className="nx-stat-title">Ingested Throughput</div>
          <div className="nx-stat-value">1,428 req/s</div>
          <div className="nx-stat-sub">Across 4 routing clusters</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Edge Latency (p99)</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-success-500)' }}>3.8ms</div>
          <div className="nx-stat-sub">Global average response time</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Active API Keys</div>
          <div className="nx-stat-value">14</div>
          <div className="nx-stat-sub">0 keys revoked</div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <CardHeader>
          <CardTitle>Gateway Route Policies & Latencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="nx-table-wrap">
            <table className="nx-table">
              <thead className="nx-table__header">
                <tr>
                  <th className="nx-table__head-cell">Method</th>
                  <th className="nx-table__head-cell">Endpoint Path</th>
                  <th className="nx-table__head-cell">Rate Limit Policy</th>
                  <th className="nx-table__head-cell">p99 Latency</th>
                  <th className="nx-table__head-cell">Health</th>
                  <th className="nx-table__head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="nx-table__body">
                {routes.map((rt) => (
                  <tr key={rt.id} className="nx-table__row">
                    <td className="nx-table__cell">
                      <span className={`nx-method-badge nx-method--${rt.method.toLowerCase()}`}>
                        {rt.method}
                      </span>
                    </td>
                    <td className="nx-table__cell">
                      <code>{rt.path}</code>
                    </td>
                    <td className="nx-table__cell">{rt.rateLimit}</td>
                    <td className="nx-table__cell">{rt.latencyP99}</td>
                    <td className="nx-table__cell">
                      <Badge variant="success" size="sm">{rt.status}</Badge>
                    </td>
                    <td className="nx-table__cell">
                      <Button variant="secondary" size="sm">Metrics</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
