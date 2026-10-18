import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@nexus-one/ui';

interface Incident {
  id: string;
  title: string;
  service: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}

export function PulseOpsPage() {
  const [incidents] = useState<Incident[]>([
    {
      id: 'inc-104',
      title: 'Database connection pool saturation on replica',
      service: 'PostgreSQL-Replica-02',
      severity: 'medium',
      status: 'investigating',
      createdAt: '18m ago',
    },
    {
      id: 'inc-103',
      title: 'Stripe webhook 504 gateway timeout spike',
      service: 'Payment-Gateway',
      severity: 'high',
      status: 'resolved',
      createdAt: '3h ago',
    },
  ]);

  return (
    <div className="nx-product-shell">
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-pulseops)' }}>
            <span>🚨 PulseOps</span>
            <span className="nx-pill-tag">Incident Management & Observability</span>
          </div>
          <h1 className="nx-product-title">Real-Time Incident Command</h1>
          <p className="nx-product-desc">
            AI-driven anomaly detection, automatic error fingerprinting, and collaborative incident escalation rooms.
          </p>
        </div>

        <Button variant="danger">+ Declare Incident</Button>
      </div>

      <div className="nx-product-grid-3">
        <Card>
          <div className="nx-stat-title">Active Incidents</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-warning-500)' }}>1</div>
          <div className="nx-stat-sub">1 under active investigation</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Mean Time to Resolution (MTTR)</div>
          <div className="nx-stat-value">4.2m</div>
          <div className="nx-stat-sub">-42% vs previous 30-day baseline</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Monitored Services</div>
          <div className="nx-stat-value">18</div>
          <div className="nx-stat-sub">100% telemetry coverage</div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <CardHeader>
          <CardTitle>Incident Feed & Escalation Triage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="nx-table-wrap">
            <table className="nx-table">
              <thead className="nx-table__header">
                <tr>
                  <th className="nx-table__head-cell">Incident</th>
                  <th className="nx-table__head-cell">Affected Service</th>
                  <th className="nx-table__head-cell">Severity</th>
                  <th className="nx-table__head-cell">Status</th>
                  <th className="nx-table__head-cell">Reported</th>
                  <th className="nx-table__head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="nx-table__body">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="nx-table__row">
                    <td className="nx-table__cell">
                      <strong>{inc.title}</strong>
                    </td>
                    <td className="nx-table__cell">
                      <span className="nx-service-tag">{inc.service}</span>
                    </td>
                    <td className="nx-table__cell">
                      <Badge variant={inc.severity === 'high' ? 'error' : 'warning'} size="sm">
                        {inc.severity}
                      </Badge>
                    </td>
                    <td className="nx-table__cell">
                      <Badge variant={inc.status === 'resolved' ? 'success' : 'default'} size="sm">
                        {inc.status}
                      </Badge>
                    </td>
                    <td className="nx-table__cell">{inc.createdAt}</td>
                    <td className="nx-table__cell">
                      <Button variant="secondary" size="sm">
                        War Room →
                      </Button>
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
