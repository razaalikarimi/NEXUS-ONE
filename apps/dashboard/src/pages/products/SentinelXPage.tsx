import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@nexus-one/ui';

interface RiskRule {
  id: string;
  name: string;
  expression: string;
  action: 'block' | 'challenge' | 'flag';
  evalCount: number;
  status: 'active' | 'disabled';
}

export function SentinelXPage() {
  const [rules] = useState<RiskRule[]>([
    {
      id: 'rule-1',
      name: 'High-Velocity Carding Defense',
      expression: 'attempts(ip, 60s) > 10 AND failed_cvv > 3',
      action: 'block',
      evalCount: 14210,
      status: 'active',
    },
    {
      id: 'rule-2',
      name: 'Impossible Traveler Geolocation Check',
      expression: 'geo_distance(last_login, current_login) > 800km AND delta_time < 30m',
      action: 'challenge',
      evalCount: 8904,
      status: 'active',
    },
    {
      id: 'rule-3',
      name: 'Excessive API Rate Burst Anomaly',
      expression: 'req_burst(token, 5s) > 150',
      action: 'flag',
      evalCount: 22100,
      status: 'active',
    },
  ]);

  return (
    <div className="nx-product-shell">
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-sentinelx)' }}>
            <span>🛡️ SentinelX</span>
            <span className="nx-pill-tag">Autonomous Fraud & Risk Engine</span>
          </div>
          <h1 className="nx-product-title">Fraud Detection & Policy Enforcement</h1>
          <p className="nx-product-desc">
            Deterministic risk DSL evaluation, real-time behavioral anomalies, and automated case decisioning.
          </p>
        </div>

        <Button variant="primary">+ New Risk Rule</Button>
      </div>

      <div className="nx-product-grid-3">
        <Card>
          <div className="nx-stat-title">Transactions Evaluated</div>
          <div className="nx-stat-value">45,214 / hr</div>
          <div className="nx-stat-sub">Across all API and web endpoints</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Current Risk Profile</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-success-500)' }}>Clean (0.2%)</div>
          <div className="nx-stat-sub">99.8% transactions classified low-risk</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Automated Blocks</div>
          <div className="nx-stat-value">124</div>
          <div className="nx-stat-sub">Past 24 hours</div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <CardHeader>
          <CardTitle>Active Policy Evaluation DSL Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="nx-table-wrap">
            <table className="nx-table">
              <thead className="nx-table__header">
                <tr>
                  <th className="nx-table__head-cell">Rule Name</th>
                  <th className="nx-table__head-cell">DSL Expression</th>
                  <th className="nx-table__head-cell">Decision Action</th>
                  <th className="nx-table__head-cell">Evals Count</th>
                  <th className="nx-table__head-cell">Status</th>
                  <th className="nx-table__head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="nx-table__body">
                {rules.map((rule) => (
                  <tr key={rule.id} className="nx-table__row">
                    <td className="nx-table__cell">
                      <strong>{rule.name}</strong>
                    </td>
                    <td className="nx-table__cell">
                      <code>{rule.expression}</code>
                    </td>
                    <td className="nx-table__cell">
                      <Badge
                        variant={
                          rule.action === 'block'
                            ? 'error'
                            : rule.action === 'challenge'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {rule.action}
                      </Badge>
                    </td>
                    <td className="nx-table__cell">{rule.evalCount.toLocaleString()}</td>
                    <td className="nx-table__cell">
                      <Badge variant="success" size="sm">{rule.status}</Badge>
                    </td>
                    <td className="nx-table__cell">
                      <Button variant="secondary" size="sm">Edit Rule</Button>
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
