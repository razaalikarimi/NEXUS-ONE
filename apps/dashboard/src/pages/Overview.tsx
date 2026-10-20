import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@nexus-one/ui';
import {
  WorkflowIcon,
  ActivityPulseIcon,
  GatewayIcon,
  KnowledgeDatabaseIcon,
  CollabDocIcon,
  ShieldSecurityIcon,
  CloudServerIcon,
} from '../components/Icons';

const PRODUCT_CARDS = [
  {
    id: 'agentforge',
    name: 'AgentForge',
    tagline: 'Workflow & Process Orchestration',
    Icon: WorkflowIcon,
    color: '#4f46e5',
    metric: '12 Active Workflows',
    submetric: '99.8% step completion',
    badge: 'Healthy',
    badgeVariant: 'success' as const,
    link: '/agentforge',
  },
  {
    id: 'pulseops',
    name: 'PulseOps',
    tagline: 'Telemetry & Incident SRE',
    Icon: ActivityPulseIcon,
    color: '#2563eb',
    metric: '0 Critical Incidents',
    submetric: 'MTTR: 4.2 minutes',
    badge: 'Optimal',
    badgeVariant: 'success' as const,
    link: '/pulseops',
  },
  {
    id: 'gateflow',
    name: 'GateFlow',
    tagline: 'API Gateway & Traffic Control',
    Icon: GatewayIcon,
    color: '#0891b2',
    metric: '1.42M Ingested Req/24h',
    submetric: 'p99 latency: 3.8ms',
    badge: 'Active',
    badgeVariant: 'info' as const,
    link: '/gateflow',
  },
  {
    id: 'cortexrag',
    name: 'CortexRAG',
    tagline: 'Knowledge Index & Hybrid Search',
    Icon: KnowledgeDatabaseIcon,
    color: '#4338ca',
    metric: '142,500 Vectors Indexed',
    submetric: '8 collections active',
    badge: 'Synced',
    badgeVariant: 'warning' as const,
    link: '/cortexrag',
  },
  {
    id: 'syncspace',
    name: 'SyncSpace',
    tagline: 'Real-Time Multiplayer Workspace',
    Icon: CollabDocIcon,
    color: '#059669',
    metric: '24 Collaborative Docs',
    submetric: 'CRDT sync latency: <12ms',
    badge: 'Active',
    badgeVariant: 'success' as const,
    link: '/syncspace',
  },
  {
    id: 'sentinelx',
    name: 'SentinelX',
    tagline: 'Risk Engine & Access Compliance',
    Icon: ShieldSecurityIcon,
    color: '#d97706',
    metric: '0 High-Risk Cases',
    submetric: 'Evaluated 45,210 tx/hr',
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
    metric: '$12,480 / mo Tracked',
    submetric: '+$1,820 savings identified',
    badge: 'Optimizing',
    badgeVariant: 'info' as const,
    link: '/cloudpilot',
  },
];

export function OverviewPage() {
  const { user, activeOrg, activeWorkspace } = useAuth();

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
        <span className="nx-subhead-status">All 7 Services Connected & Isolated by Tenant</span>
      </div>

      <div className="nx-pillar-grid">
        {PRODUCT_CARDS.map((item) => {
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
                <span className="nx-audit-badge">auth.login</span>
                <span className="nx-audit-user">{user?.email}</span>
                <span className="nx-audit-desc">Established interactive session</span>
                <span className="nx-audit-time">Just now</span>
              </div>
              <div className="nx-audit-row">
                <span className="nx-audit-badge">agent.run</span>
                <span className="nx-audit-user">AgentForge Runner</span>
                <span className="nx-audit-desc">Executed daily triage workflow</span>
                <span className="nx-audit-time">12m ago</span>
              </div>
              <div className="nx-audit-row">
                <span className="nx-audit-badge">rag.index</span>
                <span className="nx-audit-user">Cortex Ingestion Worker</span>
                <span className="nx-audit-desc">Indexed 12 documents in API reference</span>
                <span className="nx-audit-time">48m ago</span>
              </div>
              <div className="nx-audit-row">
                <span className="nx-audit-badge">finops.audit</span>
                <span className="nx-audit-user">CloudPilot Engine</span>
                <span className="nx-audit-desc">AWS billing anomaly scan completed</span>
                <span className="nx-audit-time">2h ago</span>
              </div>
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
                <span className="nx-telemetry-label">PostgreSQL 16 Connection</span>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>
              <div className="nx-telemetry-item">
                <span className="nx-telemetry-label">Redis 7 State Cache</span>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>
              <div className="nx-telemetry-item">
                <span className="nx-telemetry-label">BullMQ Worker Processors</span>
                <Badge variant="success" size="sm">6 Queues Active</Badge>
              </div>
              <div className="nx-telemetry-item">
                <span className="nx-telemetry-label">Rate Limiter</span>
                <Badge variant="info" size="sm">Enforced (200 req/m)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
