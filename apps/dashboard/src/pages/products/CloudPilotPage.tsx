import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@nexus-one/ui';

interface CostAnomaly {
  id: string;
  service: string;
  provider: 'AWS' | 'GCP' | 'Azure';
  delta: string;
  cause: string;
  severity: 'high' | 'medium';
}

export function CloudPilotPage() {
  const [anomalies] = useState<CostAnomaly[]>([
    {
      id: 'anom-1',
      service: 'Amazon OpenSearch Cluster',
      provider: 'AWS',
      delta: '+$410 / day (+68%)',
      cause: 'Unattached EBS gp3 volume unprovisioned after failover',
      severity: 'high',
    },
    {
      id: 'anom-2',
      service: 'Google Cloud BigQuery',
      provider: 'GCP',
      delta: '+$95 / day (+24%)',
      cause: 'Full table scan query run by unoptimized cron job',
      severity: 'medium',
    },
  ]);

  return (
    <div className="nx-product-shell">
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-cloudpilot)' }}>
            <span>☁️ CloudPilot</span>
            <span className="nx-pill-tag">Intelligent Cloud Cost Optimizer</span>
          </div>
          <h1 className="nx-product-title">FinOps Cloud Intelligence</h1>
          <p className="nx-product-desc">
            Automated billing anomaly detection, cross-cloud spend attribution, and predictive waste elimination.
          </p>
        </div>

        <Button variant="primary">+ Connect Cloud Provider</Button>
      </div>

      <div className="nx-product-grid-3">
        <Card>
          <div className="nx-stat-title">Current Monthly Spend</div>
          <div className="nx-stat-value">$12,480.00</div>
          <div className="nx-stat-sub">Across AWS (74%) and GCP (26%)</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Projected End of Month</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-warning-500)' }}>$14,310.00</div>
          <div className="nx-stat-sub">On track: +3.2% vs budget cap ($15,000)</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Identified Wastage Savings</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-success-500)' }}>$1,820 / mo</div>
          <div className="nx-stat-sub">4 recommendations ready to apply</div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <CardHeader>
          <CardTitle>Active Spend Anomalies & Recommended Fixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="nx-table-wrap">
            <table className="nx-table">
              <thead className="nx-table__header">
                <tr>
                  <th className="nx-table__head-cell">Service</th>
                  <th className="nx-table__head-cell">Provider</th>
                  <th className="nx-table__head-cell">Spike Delta</th>
                  <th className="nx-table__head-cell">Root Cause</th>
                  <th className="nx-table__head-cell">Severity</th>
                  <th className="nx-table__head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="nx-table__body">
                {anomalies.map((anom) => (
                  <tr key={anom.id} className="nx-table__row">
                    <td className="nx-table__cell">
                      <strong>{anom.service}</strong>
                    </td>
                    <td className="nx-table__cell">
                      <span className="nx-provider-badge">{anom.provider}</span>
                    </td>
                    <td className="nx-table__cell" style={{ color: 'var(--nx-error-500)', fontWeight: 600 }}>
                      {anom.delta}
                    </td>
                    <td className="nx-table__cell">{anom.cause}</td>
                    <td className="nx-table__cell">
                      <Badge variant={anom.severity === 'high' ? 'error' : 'warning'} size="sm">
                        {anom.severity}
                      </Badge>
                    </td>
                    <td className="nx-table__cell">
                      <Button variant="secondary" size="sm">
                        Apply Fix →
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
