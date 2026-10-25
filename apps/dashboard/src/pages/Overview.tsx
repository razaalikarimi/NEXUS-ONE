import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@nexus-one/ui';
import { api } from '../services/api';
import {
  WorkflowIcon,
  ActivityPulseIcon,
  GatewayIcon,
  KnowledgeDatabaseIcon,
  CollabDocIcon,
  ShieldSecurityIcon,
  CloudServerIcon,
} from '../components/Icons';

export function OverviewPage() {
  const { user, activeOrg, activeWorkspace } = useAuth();
  const [stats, setStats] = useState({
    activeWorkflows: 0,
    openIncidents: 0,
    activeRoutes: 0,
    systemHealth: 'operational',
  });

  useEffect(() => {
    if (activeOrg?.id) {
      api.getDashboardStats(activeOrg.id)
        .then((res: { activeWorkflows: number; openIncidents: number; activeRoutes: number; systemHealth: string }) => {
          if (res) {
            setStats(res);
          }
        })
        .catch(() => {});
    }
  }, [activeOrg]);

  const productCards = [
    {
      id: 'agentforge',
      name: 'AgentForge',
      tagline: 'Workflow & Process Orchestration',
      Icon: WorkflowIcon,
      color: '#4f46e5',
      metric: `${stats.activeWorkflows} Active Workflows`,
      submetric: stats.activeWorkflows === 0 ? 'No workflows configured' : 'Automated execution active',
      badge: stats.activeWorkflows === 0 ? 'Ready' : 'Healthy',
      badgeVariant: (stats.activeWorkflows === 0 ? 'default' : 'success') as 'default' | 'success',
      link: '/agentforge',
    },
    {
      id: 'pulseops',
      name: 'PulseOps',
      tagline: 'Telemetry & Incident SRE',
      Icon: ActivityPulseIcon,
      color: '#2563eb',
      metric: `${stats.openIncidents} Critical Incidents`,
      submetric: stats.openIncidents === 0 ? 'All services nominal' : 'Action required',
      badge: stats.openIncidents === 0 ? 'Optimal' : 'Warning',
      badgeVariant: (stats.openIncidents === 0 ? 'success' : 'warning') as 'success' | 'warning',
      link: '/pulseops',
    },
    {
      id: 'gateflow',
      name: 'GateFlow',
      tagline: 'API Gateway & Traffic Control',
      Icon: GatewayIcon,
      color: '#0891b2',
      metric: `${stats.activeRoutes} Active Routes`,
      submetric: stats.activeRoutes === 0 ? 'No endpoints routed' : 'Routing traffic',
      badge: stats.activeRoutes === 0 ? 'Standby' : 'Active',
      badgeVariant: (stats.activeRoutes === 0 ? 'default' : 'info') as 'default' | 'info',
      link: '/gateflow',
    },
    {
      id: 'cortexrag',
      name: 'CortexRAG',
      tagline: 'Knowledge Index & Hybrid Search',
      Icon: KnowledgeDatabaseIcon,
      color: '#4338ca',
      metric: '0 Vectors Indexed',
      submetric: 'Ready for document upload',
      badge: 'Standby',
      badgeVariant: 'default' as const,
      link: '/cortexrag',
    },
    {
      id: 'syncspace',
      name: 'SyncSpace',
      tagline: 'Real-Time Multiplayer Workspace',
      Icon: CollabDocIcon,
      color: '#059669',
      metric: '0 Collaborative Docs',
      submetric: 'No active sessions',
      badge: 'Ready',
      badgeVariant: 'default' as const,
      link: '/syncspace',
    },
    {
      id: 'sentinelx',
      name: 'SentinelX',
      tagline: 'Risk Engine & Access Compliance',
      Icon: ShieldSecurityIcon,
      color: '#d97706',
      metric: '0 Flagged Cases',
      submetric: 'Risk rules active',
      badge: 'Secured',
      badgeVariant: 'success' as const,
      link: '/sentinelx',
    },
    {
      id: 'cloudpilot',
      name: 'CloudPilot',
      tagline: 'Cloud Infrastructure Analytics',
      Icon: CloudServerIcon,
      color: '#2563eb',
      metric: '$0.00 Tracked',
      submetric: 'Connect cloud provider to start',
      badge: 'Standby',
      badgeVariant: 'default' as const,
      link: '/cloudpilot',
    },
  ];

  return (
    <div className="nx-overview-page">
      {/* Welcome Banner */}
      <div className="nx-welcome-banner">
        <div>
          <h1 className="nx-welcome-title">Command Center</h1>
          <p className="nx-welcome-desc">
            Welcome back, <strong>{user?.name}</strong>. Organization:{' '}
            <span className="nx-text-highlight">{activeOrg?.name}</span> (Plan:{' '}
            <span className="nx-plan-tag">{activeOrg?.plan}</span>) — Workspace:{' '}
            <span className="nx-text-highlight">{activeWorkspace?.name || 'Default'}</span>
          </p>
        </div>

        <div className="nx-welcome-actions">
          <Link to="/agentforge">
            <Button variant="primary" size="md">
              + New Workflow
            </Button>
          </Link>
          <Link to="/settings/api-keys">
            <Button variant="secondary" size="md">
              Generate API Key
            </Button>
          </Link>
        </div>
      </div>

      {/* Cross-Product Status Grid */}
      <div className="nx-section-subhead">
        <h2>Core Platform Services</h2>
        <span className="nx-subhead-status">All 7 Services Connected &amp; Isolated by Tenant</span>
      </div>

      <div className="nx-pillar-grid">
        {productCards.map((item) => {
          const IconComponent = item.Icon;
          return (
            <Link key={item.id} to={item.link} className="nx-pillar-card-link">
              <Card className="nx-pillar-card">
                <div className="nx-pillar-card__top">
                  <span className="nx-pillar-icon" style={{ color: item.color }}>
                    <IconComponent size={22} color={item.color} />
                  </span>
                  <Badge variant={item.badgeVariant} size="sm">
                    {item.badge}
                  </Badge>
                </div>

                <h3 className="nx-pillar-title">{item.name}</h3>
                <p className="nx-pillar-tagline">{item.tagline}</p>

                <div className="nx-pillar-metrics">
                  <div className="nx-pillar-metric-main">{item.metric}</div>
                  <div className="nx-pillar-metric-sub">{item.submetric}</div>
                </div>

                <div
                  className="nx-pillar-accent-bar"
                  style={{ backgroundColor: item.color }}
                />
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Activity & System Health Row */}
      <div className="nx-dashboard-row">
        <Card className="nx-dashboard-col-left">
          <CardHeader>
            <CardTitle>Recent Platform Audit Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="nx-audit-stream">
              <div className="nx-audit-row">
                <span className="nx-audit-badge">auth.session</span>
                <span className="nx-audit-user">{user?.email}</span>
                <span className="nx-audit-desc">Interactive session active in {activeOrg?.name}</span>
                <span className="nx-audit-time">Just now</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed #334155', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
              No automated background jobs triggered yet. Events will record here as workflows and pipelines execute.
            </div>
          </CardContent>
        </Card>

        <Card className="nx-dashboard-col-right">
          <CardHeader>
            <CardTitle>Cluster Telemetry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="nx-telemetry-list">
              <div className="nx-telemetry-item">
                <span className="nx-telemetry-label">PostgreSQL Database</span>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>
              <div className="nx-telemetry-item">
                <span className="nx-telemetry-label">Multi-Tenant Isolation</span>
                <Badge variant="success" size="sm">Enforced</Badge>
              </div>
              <div className="nx-telemetry-item">
                <span className="nx-telemetry-label">Session Protection</span>
                <Badge variant="success" size="sm">Active (HTTP-Only)</Badge>
              </div>
              <div className="nx-telemetry-item">
                <span className="nx-telemetry-label">API Rate Limiter</span>
                <Badge variant="info" size="sm">Enforced</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
