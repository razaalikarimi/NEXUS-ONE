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

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  environment: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  errorCount: number;
}

interface IncidentTimelineEvent {
  id: string;
  eventType: 'state_change' | 'comment' | 'ai_diagnosis' | 'runbook_action';
  message: string;
  timestamp: string;
  author: string;
}

interface IncidentItem {
  id: string;
  title: string;
  service: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  summary: string;
  createdAt: string;
  rootCause?: string;
  aiConfidence?: number;
  aiRemediation?: string[];
  timeline: IncidentTimelineEvent[];
}

interface ErrorGroupItem {
  id: string;
  service: string;
  fingerprint: string;
  title: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  status: 'active' | 'resolved' | 'ignored';
}

interface AlertRuleItem {
  id: string;
  name: string;
  service: string;
  condition: string;
  threshold: string;
  severity: 'critical' | 'high' | 'medium';
  enabled: boolean;
}

export function PulseOpsPage() {
  const [activeTab, setActiveTab] = useState('incidents');

  // Services State
  const [services] = useState<ServiceItem[]>([]);

  // Incidents State
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);

  // Selected incident for War Room Drawer
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  // Error Groups State
  const [errorGroups, setErrorGroups] = useState<ErrorGroupItem[]>([]);

  // Alert Rules State
  const [alertRules, setAlertRules] = useState<AlertRuleItem[]>([]);

  // Modals
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [newIncidentTitle, setNewIncidentTitle] = useState('');
  const [newIncidentService, setNewIncidentService] = useState('PostgreSQL Primary & Read-Replicas');
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [newIncidentSummary, setNewIncidentSummary] = useState('');

  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [simulatorScenario, setSimulatorScenario] = useState('db_pool');
  const [newTimelineComment, setNewTimelineComment] = useState('');

  // Declare Incident
  function handleDeclareIncident(e: React.FormEvent) {
    e.preventDefault();
    if (!newIncidentTitle) return;

    const newInc: IncidentItem = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      title: newIncidentTitle,
      service: newIncidentService,
      severity: newIncidentSeverity,
      status: 'open',
      summary: newIncidentSummary || 'Manually declared operational incident.',
      createdAt: 'Just now',
      rootCause: 'Initial investigation in progress.',
      aiConfidence: 0.88,
      aiRemediation: [
        'Check service logs and trace waterfalls.',
        'Review recent Git deployments and config changes.',
      ],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          eventType: 'state_change',
          message: `Incident declared manually with ${newIncidentSeverity.toUpperCase()} severity.`,
          timestamp: 'Just now',
          author: 'Current User',
        },
      ],
    };

    setIncidents([newInc, ...incidents]);
    setSelectedIncidentId(newInc.id);
    setIsDeclareModalOpen(false);
    setNewIncidentTitle('');
    setNewIncidentSummary('');
  }

  // Update incident status
  function handleUpdateIncidentStatus(id: string, newStatus: 'open' | 'investigating' | 'resolved' | 'closed') {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updatedTimeline: IncidentTimelineEvent[] = [
            ...inc.timeline,
            {
              id: `tl-${Date.now()}`,
              eventType: 'state_change',
              message: `Status moved from ${inc.status.toUpperCase()} to ${newStatus.toUpperCase()}`,
              timestamp: 'Just now',
              author: 'Current User',
            },
          ];
          return {
            ...inc,
            status: newStatus,
            timeline: updatedTimeline,
          };
        }
        return inc;
      })
    );
  }

  // Add War Room Comment
  function handleAddTimelineNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newTimelineComment.trim() || !selectedIncident) return;

    const newEntry: IncidentTimelineEvent = {
      id: `tl-${Date.now()}`,
      eventType: 'comment',
      message: newTimelineComment.trim(),
      timestamp: 'Just now',
      author: 'Current User',
    };

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === selectedIncident.id ? { ...inc, timeline: [...inc.timeline, newEntry] } : inc))
    );
    setNewTimelineComment('');
  }

  // Simulate Telemetry Event
  function handleSimulateTelemetry() {
    let msg = '';
    let service = '';
    let severity: 'critical' | 'high' | 'medium' = 'high';

    if (simulatorScenario === 'db_pool') {
      msg = 'ConnectionResetError: Connection pool connection timed out after 5000ms';
      service = 'PostgreSQL Primary & Read-Replicas';
      severity = 'critical';
    } else if (simulatorScenario === 'oom') {
      msg = 'FatalError: JavaScript heap out of memory in Node.js runtime';
      service = 'AgentForge LLM Inference Pipeline';
      severity = 'critical';
    } else {
      msg = 'HTTP 504 GatewayTimeout on upstream Stripe API';
      service = 'Stripe Payment Webhook Gateway';
      severity = 'high';
    }

    void severity;

    // Update error groups
    setErrorGroups((prev) => {
      const existing = prev.find((eg) => eg.service === service);
      if (existing) {
        return prev.map((eg) => (eg.id === existing.id ? { ...eg, count: eg.count + 1, lastSeen: 'Just now' } : eg));
      }
      return [
        {
          id: `eg-${Date.now()}`,
          service,
          fingerprint: Math.random().toString(16).substring(2, 14),
          title: msg,
          count: 1,
          firstSeen: 'Just now',
          lastSeen: 'Just now',
          status: 'active',
        },
        ...prev,
      ];
    });

    setIsSimulatorModalOpen(false);
  }

  return (
    <div className="nx-product-shell">
      {/* Top Header */}
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-pulseops)' }}>
            <span>🚨 PulseOps</span>
            <span className="nx-pill-tag">AI Incident Management & Observability</span>
          </div>
          <h1 className="nx-product-title">Real-Time Incident Command & War Room</h1>
          <p className="nx-product-desc">
            Autonomous error fingerprinting, sub-minute anomaly correlation, and AI-powered root cause diagnosis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setIsSimulatorModalOpen(true)}>
            ⚡ Telemetry Simulator
          </Button>
          <Button variant="danger" onClick={() => setIsDeclareModalOpen(true)}>
            + Declare Incident
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="nx-product-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card>
          <div className="nx-stat-title">Active Incidents</div>
          <div className="nx-stat-value" style={{ color: incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length > 0 ? 'var(--nx-warning-500)' : 'var(--nx-success-500)' }}>
            {incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length}
          </div>
          <div className="nx-stat-sub">{incidents.length === 0 ? 'All services nominal' : 'Active triage in progress'}</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Mean Time to Resolution (MTTR)</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-brand-400)' }}>—</div>
          <div className="nx-stat-sub">No recorded incident outages</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Telemetry Events / sec</div>
          <div className="nx-stat-value">0</div>
          <div className="nx-stat-sub">Awaiting stream ingestion</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Monitored Services</div>
          <div className="nx-stat-value">{services.length}</div>
          <div className="nx-stat-sub">{services.length} active microservices</div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultTab="incidents" activeTab={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab id="incidents">War Room &amp; Incidents ({incidents.length})</Tab>
          <Tab id="services">Service Health ({services.length})</Tab>
          <Tab id="errors">Error Groups &amp; Fingerprints ({errorGroups.length})</Tab>
          <Tab id="alerts">Alert Rules ({alertRules.length})</Tab>
        </TabList>

        {/* Tab 1: War Room & Incidents */}
        <TabPanel id="incidents">
          {incidents.length === 0 ? (
            <Card style={{ padding: '3.5rem 1rem', textAlign: 'center', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚨</div>
              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>All Systems Nominal</h3>
              <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                No active or historical incidents detected. PulseOps is actively listening for error anomalies and telemetry health signals.
              </p>
              <Button variant="danger" onClick={() => setIsDeclareModalOpen(true)}>
                + Declare Incident
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              {/* Incident List */}
              <Card>
                <CardHeader>
                  <CardTitle>Active &amp; Historical Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {incidents.map((inc) => {
                    const isSelected = inc.id === selectedIncidentId;
                    return (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid var(--nx-pulseops)' : '1px solid var(--nx-border-subtle)',
                          background: isSelected ? 'rgba(239, 68, 68, 0.08)' : 'var(--nx-bg-surface-elevated)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--nx-text-muted)' }}>{inc.id.toUpperCase()}</span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Badge variant={inc.severity === 'critical' ? 'error' : inc.severity === 'high' ? 'warning' : 'default'} size="sm">
                              {inc.severity}
                            </Badge>
                            <Badge variant={inc.status === 'resolved' ? 'success' : 'default'} size="sm">
                              {inc.status}
                            </Badge>
                          </div>
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--nx-text-primary)' }}>
                          {inc.title}
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--nx-text-muted)' }}>
                          <span>{inc.service}</span>
                          <span>{inc.createdAt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* War Room Detail Panel */}
            {selectedIncident ? (
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--nx-pulseops)', fontWeight: 700 }}>WAR ROOM #{selectedIncident.id}</span>
                        <Badge variant={selectedIncident.severity === 'critical' ? 'error' : 'warning'} size="sm">
                          {selectedIncident.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle>{selectedIncident.title}</CardTitle>
                    </div>

                    {/* Status Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {selectedIncident.status !== 'resolved' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ background: 'var(--nx-success-500)', borderColor: 'var(--nx-success-600)' }}
                          onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'resolved')}
                        >
                          ✓ Mark Resolved
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'investigating')}
                        >
                          Re-open Investigation
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* AI Root Cause Diagnosis Box */}
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60a5fa' }}>
                        🧠 AI Root Cause Assessment
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                        Confidence: {Math.round((selectedIncident.aiConfidence || 0.9) * 100)}%
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: 'var(--nx-text-primary)' }}>
                      {selectedIncident.rootCause || 'AI is aggregating error traces...'}
                    </p>
                    {selectedIncident.aiRemediation && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--nx-text-muted)' }}>
                          Recommended Remediation Actions:
                        </span>
                        <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, fontSize: '0.825rem', color: 'var(--nx-text-secondary)' }}>
                          {selectedIncident.aiRemediation.map((rem, idx) => (
                            <li key={idx} style={{ marginBottom: '0.2rem' }}>{rem}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Incident Timeline */}
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--nx-text-secondary)' }}>
                    War Room Activity & Timeline
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      paddingRight: '0.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {selectedIncident.timeline.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '6px',
                          background: item.eventType === 'ai_diagnosis' ? 'rgba(59, 130, 246, 0.05)' : 'var(--nx-bg-surface)',
                          borderLeft: item.eventType === 'ai_diagnosis' ? '3px solid #3b82f6' : '3px solid var(--nx-border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--nx-text-muted)', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600 }}>{item.author}</span>
                          <span>{item.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--nx-text-primary)' }}>{item.message}</div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline input note */}
                  <form onSubmit={handleAddTimelineNote} style={{ display: 'flex', gap: '0.5rem' }}>
                    <Input
                      placeholder="Add investigation update or note..."
                      value={newTimelineComment}
                      onChange={(e) => setNewTimelineComment(e.target.value)}
                    />
                    <Button type="submit" variant="secondary">Post</Button>
                  </form>
                </CardContent>
              </Card>
            ) : null}
          </div>
          )}
        </TabPanel>

        {/* Tab 2: Service Health Catalog */}
        <TabPanel id="services">
          {services.length === 0 ? (
            <Card style={{ padding: '3.5rem 1rem', textAlign: 'center', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📡</div>
              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Monitored Services</h3>
              <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                Connect your microservices, Kubernetes clusters, or serverless functions to track uptime SLAs and telemetry in real time.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {services.map((srv) => (
                <Card key={srv.id}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Badge variant={srv.status === 'healthy' ? 'success' : srv.status === 'degraded' ? 'warning' : 'error'}>
                        {srv.status.toUpperCase()}
                      </Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--nx-text-muted)' }}>{srv.environment}</span>
                    </div>
                    <CardTitle style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>{srv.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--nx-text-muted)' }}>Uptime SLA</span>
                      <span style={{ fontWeight: 600, color: 'var(--nx-text-primary)' }}>{srv.uptime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--nx-text-muted)' }}>24h Errors</span>
                      <span style={{ fontWeight: 600, color: srv.errorCount > 0 ? 'var(--nx-warning-500)' : 'var(--nx-text-primary)' }}>
                        {srv.errorCount}
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                      Inspect Traces →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        {/* Tab 3: Error Groups & Fingerprints */}
        <TabPanel id="errors">
          {errorGroups.length === 0 ? (
            <Card style={{ padding: '3.5rem 1rem', textAlign: 'center', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>Zero Error Fingerprints</h3>
              <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                PulseOps has not detected any exception stack traces or recurring error groups across your infrastructure.
              </p>
            </Card>
          ) : (
            <Card style={{ marginTop: '1.5rem' }}>
              <CardHeader>
                <CardTitle>Fingerprinted Error Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="nx-table-wrap">
                  <table className="nx-table">
                    <thead className="nx-table__header">
                      <tr>
                        <th className="nx-table__head-cell">Fingerprint</th>
                        <th className="nx-table__head-cell">Exception Title</th>
                        <th className="nx-table__head-cell">Service</th>
                        <th className="nx-table__head-cell">Events</th>
                        <th className="nx-table__head-cell">Last Seen</th>
                        <th className="nx-table__head-cell">Status</th>
                        <th className="nx-table__head-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="nx-table__body">
                      {errorGroups.map((eg) => (
                        <tr key={eg.id} className="nx-table__row">
                          <td className="nx-table__cell">
                            <code style={{ fontSize: '0.75rem', color: 'var(--nx-brand-400)', background: 'var(--nx-bg-surface-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
                              {eg.fingerprint}
                            </code>
                          </td>
                          <td className="nx-table__cell" style={{ maxWidth: '300px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--nx-text-primary)' }}>
                              {eg.title}
                            </span>
                          </td>
                          <td className="nx-table__cell">{eg.service}</td>
                          <td className="nx-table__cell">
                            <Badge variant="default" size="sm">{eg.count}</Badge>
                          </td>
                          <td className="nx-table__cell">{eg.lastSeen}</td>
                          <td className="nx-table__cell">
                            <Badge variant={eg.status === 'resolved' ? 'success' : 'error'} size="sm">
                              {eg.status}
                            </Badge>
                          </td>
                          <td className="nx-table__cell">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                setErrorGroups((prev) =>
                                  prev.map((g) => (g.id === eg.id ? { ...g, status: g.status === 'resolved' ? 'active' : 'resolved' } : g))
                                )
                              }
                            >
                              {eg.status === 'resolved' ? 'Reopen' : 'Resolve'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {/* Tab 4: Alert Rules */}
        <TabPanel id="alerts">
          {alertRules.length === 0 ? (
            <Card style={{ padding: '3.5rem 1rem', textAlign: 'center', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔔</div>
              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Alert Rules Configured</h3>
              <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                Configure threshold alert rules for latency spikes, error rate breaches, or infrastructure degradation.
              </p>
            </Card>
          ) : (
            <Card style={{ marginTop: '1.5rem' }}>
              <CardHeader>
                <CardTitle>Autonomous Alert Rules & Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {alertRules.map((ar) => (
                    <div
                      key={ar.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        background: 'var(--nx-bg-surface-elevated)',
                        border: '1px solid var(--nx-border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--nx-text-primary)' }}>{ar.name}</span>
                          <Badge variant={ar.severity === 'critical' ? 'error' : 'warning'} size="sm">
                            {ar.severity}
                          </Badge>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--nx-text-muted)' }}>
                          Scope: {ar.service} • Condition: <code>{ar.condition}</code>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Badge variant={ar.enabled ? 'success' : 'default'} size="sm">
                          {ar.enabled ? 'ACTIVE' : 'MUTED'}
                        </Badge>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setAlertRules((prev) =>
                              prev.map((r) => (r.id === ar.id ? { ...r, enabled: !r.enabled } : r))
                            )
                          }
                        >
                          {ar.enabled ? 'Mute' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabPanel>
      </Tabs>

      {/* Declare Incident Modal */}
      <Modal isOpen={isDeclareModalOpen} onClose={() => setIsDeclareModalOpen(false)} title="🚨 Declare Operational Incident">
        <form onSubmit={handleDeclareIncident} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField label="Incident Title" required>
            <Input
              placeholder="e.g. Memory leak in inference pods"
              value={newIncidentTitle}
              onChange={(e) => setNewIncidentTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Affected Service" required>
            <Select
              value={newIncidentService}
              onChange={(e) => setNewIncidentService(e.target.value)}
            >
              {services.length === 0 ? (
                <option value="Production Cluster">Production Cluster</option>
              ) : (
                services.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.environment})
                  </option>
                ))
              )}
            </Select>
          </FormField>

          <FormField label="Severity Level" required>
            <Select
              value={newIncidentSeverity}
              onChange={(e) => setNewIncidentSeverity(e.target.value as 'critical' | 'high' | 'medium' | 'low')}
            >
              <option value="critical">Critical (P0 - Service Down)</option>
              <option value="high">High (P1 - Degraded Service)</option>
              <option value="medium">Medium (P2 - Partial Impact)</option>
              <option value="low">Low (P3 - Minor Anomaly)</option>
            </Select>
          </FormField>

          <FormField label="Initial Assessment & Summary">
            <textarea
              className="nx-input"
              rows={3}
              placeholder="Describe symptoms, customer impact, or triggering alerts..."
              value={newIncidentSummary}
              onChange={(e) => setNewIncidentSummary(e.target.value)}
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" type="button" onClick={() => setIsDeclareModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Declare & Open War Room
            </Button>
          </div>
        </form>
      </Modal>

      {/* Simulator Modal */}
      <Modal isOpen={isSimulatorModalOpen} onClose={() => setIsSimulatorModalOpen(false)} title="⚡ Telemetry Event Ingestion Simulator">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nx-text-secondary)' }}>
            Inject simulated production error events to test the PulseOps fingerprinting engine, error grouping, and AI diagnosis pipeline in real-time.
          </p>

          <FormField label="Scenario">
            <Select
              value={simulatorScenario}
              onChange={(e) => setSimulatorScenario(e.target.value)}
            >
              <option value="db_pool">Database Connection Pool Exhaustion (PostgreSQL)</option>
              <option value="oom">V8 Node.js JavaScript Heap Out Of Memory</option>
              <option value="stripe_504">Payment Gateway HTTP 504 Timeout</option>
            </Select>
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsSimulatorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSimulateTelemetry}>
              Fire Telemetry Event ⚡
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
