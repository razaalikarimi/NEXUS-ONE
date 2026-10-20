'use client';

import React, { useState } from 'react';

// Enterprise Vector Icons
function WorkflowIcon({ className = '', size = 20, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="3" width="6" height="6" rx="1.5" />
      <rect x="9" y="15" width="6" height="6" rx="1.5" />
      <path d="M6 9v3a3 3 0 0 0 3 3h3" />
      <path d="M18 9v3a3 3 0 0 1-3 3" />
    </svg>
  );
}

function ActivityPulseIcon({ className = '', size = 20, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function GatewayIcon({ className = '', size = 20, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2.5" />
      <line x1="10" y1="6" x2="10.01" y2="6" strokeWidth="2.5" />
      <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="2.5" />
      <line x1="10" y1="18" x2="10.01" y2="18" strokeWidth="2.5" />
    </svg>
  );
}

function KnowledgeDatabaseIcon({ className = '', size = 20, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function CollabDocIcon({ className = '', size = 20, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function ShieldSecurityIcon({ className = '', size = 20, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function CloudServerIcon({ className = '', size = 20, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2.5" />
      <line x1="10" y1="6" x2="10.01" y2="6" strokeWidth="2.5" />
      <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="2.5" />
      <line x1="10" y1="18" x2="10.01" y2="18" strokeWidth="2.5" />
    </svg>
  );
}

function LockKeyIcon({ className = '', size = 28, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function AuditListIcon({ className = '', size = 28, color = 'currentColor' }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

const PRODUCTS = [
  {
    id: 'agentforge',
    name: 'AgentForge',
    tagline: 'Visual Workflow & Process Engine',
    badge: 'Workflow Automation',
    Icon: WorkflowIcon,
    desc: 'Visually assemble, evaluate, and orchestrate complex multi-step pipelines. Connect microservices, conditional logic gates, and human-in-the-loop approvals with state checkpointing.',
    features: [
      'Visual DAG & Node Graph Workflow Builder',
      'Configurable fallback routing & version control',
      'Sandboxed task execution with telemetry tracing',
      'Granular policy approval gates & review states',
    ],
  },
  {
    id: 'pulseops',
    name: 'PulseOps',
    tagline: 'Incident Management & Observability',
    badge: 'Telemetry & SRE',
    Icon: ActivityPulseIcon,
    desc: 'Real-time telemetry ingestion, automatic error fingerprinting, and SRE incident workflows that reduce Mean Time to Resolution (MTTR) across distributed production environments.',
    features: [
      'High-throughput telemetry ingestion pipeline',
      'Intelligent error clustering & deduplication',
      'Automated root-cause analysis & playbooks',
      'Real-time War Room timeline & incident postmortems',
    ],
  },
  {
    id: 'gateflow',
    name: 'GateFlow',
    tagline: 'API Gateway & Traffic Orchestration',
    badge: 'API Infrastructure',
    Icon: GatewayIcon,
    desc: 'Enterprise API gateway with SHA-256 cryptographic key issuance, dynamic rate limiting, automated OpenAPI 3.1 contract generation, and live ingress latency analytics.',
    features: [
      'Cryptographic SHA-256 key issuance & lifecycle rotation',
      'Token-bucket & sliding window rate limiters',
      'Interactive Swagger & OpenAPI 3.1 documentation',
      'Detailed latency percentiles (p50, p95, p99) & telemetry',
    ],
  },
  {
    id: 'cortexrag',
    name: 'CortexRAG',
    tagline: 'Enterprise Knowledge & Semantic Retrieval',
    badge: 'Knowledge Index',
    Icon: KnowledgeDatabaseIcon,
    desc: 'High-precision knowledge indexing and retrieval engine with hybrid dense vector and sparse keyword search, multi-format ingestion pipelines, and deterministic source citations.',
    features: [
      'Document parser pipeline (PDF, Markdown, JSON, HTML)',
      'Configurable sliding-window semantic chunking',
      'Hybrid dense vector + full-text sparse retrieval',
      'Strict source verification & preview citations',
    ],
  },
  {
    id: 'syncspace',
    name: 'SyncSpace',
    tagline: 'Real-Time Multiplayer Collaboration',
    badge: 'Real-Time Sync',
    Icon: CollabDocIcon,
    desc: 'Sub-millisecond collaborative workspaces built on Conflict-Free Replicated Data Types (CRDTs) and secure WebSockets. Seamless multi-user presence, cursor broadcasting, and immutable history.',
    features: [
      'Conflict-free Replicated Data Types (CRDTs / Yjs)',
      'Live multiplayer presence & real-time cursor broadcast',
      'Encrypted WebSocket channel communication',
      'Point-in-time document revision history',
    ],
  },
  {
    id: 'sentinelx',
    name: 'SentinelX',
    tagline: 'Policy Evaluation & Risk Engine',
    badge: 'Security & Compliance',
    Icon: ShieldSecurityIcon,
    desc: 'Automated policy rule evaluation, behavioral anomaly detection, and real-time risk decisioning for enterprise API traffic, financial transactions, and privileged access events.',
    features: [
      'Dynamic rule evaluation DSL & scoring algorithms',
      'Real-time automated decisioning (allow, challenge, block)',
      'Structured case management workspace for analysts',
      'Tamper-evident audit trail for regulatory compliance',
    ],
  },
  {
    id: 'cloudpilot',
    name: 'CloudPilot',
    tagline: 'Cloud Infrastructure Analytics & FinOps',
    badge: 'Cloud Optimization',
    Icon: CloudServerIcon,
    desc: 'Unified multi-cloud cost intelligence, budget forecasting, and infrastructure anomaly detection to optimize compute efficiency and eliminate resource waste across AWS, GCP, and Azure.',
    features: [
      'Cross-cloud billing ingestion & cost normalization',
      'Proactive cost anomaly & spike notification alerts',
      'Granular attribution per team, workspace & service',
      'Predictive 90-day spend forecasting models',
    ],
  },
];

const CODE_EXAMPLES: Record<string, string> = {
  typescript: `import { NexusClient } from '@nexus-one/sdk';

const client = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY,
  organizationId: 'org_enterprise_prod',
});

// Trigger a resilient workflow with policy gates
const execution = await client.agentforge.workflows.run({
  workflowId: 'wf_prod_deploy_v2',
  inputs: {
    targetEnvironment: 'us-east-1',
    canaryWeight: 10,
    rollbackOnMTTRExceeded: true,
  },
  policyGates: ['security-audit', 'lead-sre-approval'],
});

console.log('Execution initiated:', execution.id, execution.status);`,
  python: `from nexusone import NexusClient
import os

client = NexusClient(
    api_key=os.environ.get("NEXUS_API_KEY"),
    organization_id="org_enterprise_prod"
)

# Ingest and query vector knowledge with citations
result = client.cortexrag.search(
    query="Failover procedure for PostgreSQL read replicas",
    collection_id="sre_runbooks_v3",
    hybrid_alpha=0.75,
    top_k=3
)

for citation in result.citations:
    print(f"[{citation.score:.2f}] {citation.document_title}: {citation.snippet}")`,
  curl: `curl -X POST "https://api.nexusone.dev/v1/gateflow/routes" \\
  -H "Authorization: Bearer nx_live_sec_8f902a7b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pathPattern": "/api/v1/payments/*",
    "upstreamUrl": "https://payments-service.internal:8080",
    "rateLimit": { "windowMs": 60000, "maxRequests": 10000 },
    "requireHmac": true
  }'`,
};

export default function HomePage() {
  const [consoleTab, setConsoleTab] = useState<'workflow' | 'telemetry' | 'gateway' | 'cortex'>('workflow');
  const [codeLang, setCodeLang] = useState<'typescript' | 'python' | 'curl'>('typescript');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function handleCopy() {
    const textToCopy = CODE_EXAMPLES[codeLang] || '';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="nx-marketing-root">
      {/* Background glow effects */}
      <div className="nx-bg-glow nx-bg-glow--top" aria-hidden="true" />
      <div className="nx-bg-glow nx-bg-glow--bottom" aria-hidden="true" />

      {/* Navigation Header */}
      <header className="nx-header">
        <div className="nx-container nx-header__inner">
          <div className="nx-brand">
            <div className="nx-brand__icon" aria-hidden="true">
              <span className="nx-brand__dot" />
            </div>
            <span className="nx-brand__name">NEXUS ONE</span>
            <span className="nx-brand__tag">v0.1.0-prod</span>
          </div>

          <nav className="nx-nav" aria-label="Main Navigation">
            <a href="#services" className="nx-nav__link">Services</a>
            <a href="#console" className="nx-nav__link">Live Console</a>
            <a href="#developer" className="nx-nav__link">Developers</a>
            <a href="#architecture" className="nx-nav__link">Architecture</a>
            <a href="#security" className="nx-nav__link">Security</a>
            <a href="#pricing" className="nx-nav__link">Pricing</a>
            <a href="http://localhost:3001/docs" target="_blank" rel="noopener noreferrer" className="nx-nav__link">REST Docs</a>
          </nav>

          <div className="nx-header__actions">
            <a href="http://localhost:5173/login" className="nx-btn nx-btn--ghost">Sign In</a>
            <a href="http://localhost:5173/register" className="nx-btn nx-btn--primary">Launch Platform</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="nx-hero">
        <div className="nx-container nx-hero__inner">
          <div className="nx-hero__pill">
            <span className="nx-hero__pill-dot" />
            <span>Enterprise Cloud & Developer Infrastructure Platform</span>
          </div>

          <h1 className="nx-hero__title">
            The Infrastructure Control Plane <br />
            <span className="nx-gradient-text">Built for Engineering Scale.</span>
          </h1>

          <p className="nx-hero__subtitle">
            Unify workflow orchestration, real-time observability, zero-trust API management, and cross-cloud analytics into one secure, multi-tenant control plane.
          </p>

          <div className="nx-hero__cta-group">
            <a href="http://localhost:5173/register" className="nx-btn nx-btn--primary nx-btn--lg">
              Get Started with NEXUS ONE →
            </a>
            <a href="#console" className="nx-btn nx-btn--secondary nx-btn--lg">
              Interactive Product Console
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="nx-hero__metrics">
            <div className="nx-metric">
              <span className="nx-metric__value">7</span>
              <span className="nx-metric__label">Core Services</span>
            </div>
            <div className="nx-metric__divider" />
            <div className="nx-metric">
              <span className="nx-metric__value">100%</span>
              <span className="nx-metric__label">Type-Safe Contracts</span>
            </div>
            <div className="nx-metric__divider" />
            <div className="nx-metric">
              <span className="nx-metric__value">&lt;5ms</span>
              <span className="nx-metric__label">Gateway Latency</span>
            </div>
            <div className="nx-metric__divider" />
            <div className="nx-metric">
              <span className="nx-metric__value">Zero Trust</span>
              <span className="nx-metric__label">RBAC & Isolation</span>
            </div>
          </div>

          {/* Interactive Mac Console Window Mockup */}
          <div id="console" className="nx-console-window">
            <div className="nx-console-header">
              <div className="nx-console-dots">
                <span className="nx-console-dot nx-console-dot--red" />
                <span className="nx-console-dot nx-console-dot--yellow" />
                <span className="nx-console-dot nx-console-dot--green" />
              </div>

              <div className="nx-console-tabs">
                <button
                  type="button"
                  className={`nx-console-tab ${consoleTab === 'workflow' ? 'nx-console-tab--active' : ''}`}
                  onClick={() => setConsoleTab('workflow')}
                >
                  ⚡ AgentForge DAG
                </button>
                <button
                  type="button"
                  className={`nx-console-tab ${consoleTab === 'telemetry' ? 'nx-console-tab--active' : ''}`}
                  onClick={() => setConsoleTab('telemetry')}
                >
                  📡 PulseOps Telemetry
                </button>
                <button
                  type="button"
                  className={`nx-console-tab ${consoleTab === 'gateway' ? 'nx-console-tab--active' : ''}`}
                  onClick={() => setConsoleTab('gateway')}
                >
                  🛡️ GateFlow Ingress
                </button>
                <button
                  type="button"
                  className={`nx-console-tab ${consoleTab === 'cortex' ? 'nx-console-tab--active' : ''}`}
                  onClick={() => setConsoleTab('cortex')}
                >
                  🔍 CortexRAG Search
                </button>
              </div>

              <div className="nx-console-status">
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4ade80' }} />
                <span>Live Cluster</span>
              </div>
            </div>

            <div className="nx-console-body">
              {consoleTab === 'workflow' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Active Workflow: prod-deploy-pipeline-v4</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>State Checkpoint ID: chk_9918a20 · Runner: BullMQ Worker #04</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '0.25rem 0.6rem', borderRadius: '4px', height: 'fit-content', fontWeight: 600 }}>
                      RUNNING (Step 3/4)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>1. Ingress Trigger</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.35rem', color: '#f8fafc' }}>Webhook Payload</div>
                      <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '0.4rem' }}>✓ Completed in 14ms</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>2. Model Evaluation</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.35rem', color: '#f8fafc' }}>Fastify Worker</div>
                      <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '0.4rem' }}>✓ Passed (Score: 0.98)</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(37, 99, 235, 0.15)', borderRadius: '0.5rem', border: '1px solid #2563eb' }}>
                      <div style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase' }}>3. Policy Gate</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.35rem', color: '#60a5fa' }}>Human Approval</div>
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.4rem' }}>⏳ Awaiting SRE review</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '0.5rem', border: '1px solid #334155', opacity: 0.6 }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>4. Rollout</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.35rem', color: '#f8fafc' }}>Canary Deploy</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem' }}>Pending gate approval</div>
                    </div>
                  </div>
                </div>
              )}

              {consoleTab === 'telemetry' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Live Incident Telemetry Stream</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Automatic Error Fingerprinting & Deduplication</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>0 Unresolved Incidents</span>
                  </div>

                  <div style={{ fontFamily: 'var(--nx-font-mono, monospace)', fontSize: '0.8rem', lineHeight: 1.8 }}>
                    <div style={{ color: '#94a3b8' }}>[21:28:44] <span style={{ color: '#4ade80' }}>INFO</span> Ingested 12,450 telemetry packets via UDP ingress socket</div>
                    <div style={{ color: '#94a3b8' }}>[21:28:45] <span style={{ color: '#38bdf8' }}>TELEMETRY</span> Cluster p99 latency evaluated at 3.82ms (SLA target &lt;10ms)</div>
                    <div style={{ color: '#94a3b8' }}>[21:28:46] <span style={{ color: '#f59e0b' }}>WARN</span> Redis memory usage at 18.2% · Buffer clean · Zero dropped packets</div>
                    <div style={{ color: '#94a3b8' }}>[21:28:47] <span style={{ color: '#4ade80' }}>RESOLVED</span> Incident INC-402 automatically fingerprinted and closed (MTTR: 3.2m)</div>
                  </div>
                </div>
              )}

              {consoleTab === 'gateway' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>GateFlow High-Performance Ingress Router</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Hashed SHA-256 Authentication · Sliding-Window Rate Limiter</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>1.42M Ingested / 24h</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.8rem', fontFamily: 'var(--nx-font-mono, monospace)' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '0.4rem' }}>
                      <span style={{ color: '#4ade80' }}>GET</span> /api/v1/health<br />
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Latency: 1.8ms · 200 OK</span>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '0.4rem' }}>
                      <span style={{ color: '#38bdf8' }}>POST</span> /api/v1/auth/login<br />
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Latency: 24ms · 200 OK</span>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '0.4rem' }}>
                      <span style={{ color: '#818cf8' }}>GET</span> /api/v1/cortex/search<br />
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Latency: 12ms · 200 OK</span>
                    </div>
                  </div>
                </div>
              )}

              {consoleTab === 'cortex' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>CortexRAG Hybrid Semantic Search Engine</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>pgvector 1536-dim Embedding Search + BM25 Sparse Keyword Ranking</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>142,500 Vectors Synced</span>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', padding: '0.85rem', borderRadius: '0.4rem', border: '1px solid #334155', fontSize: '0.82rem' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Query: &quot;How do read replicas fail over in PostgreSQL 16 during an outage?&quot;
                    </div>
                    <div style={{ color: '#cbd5e1', lineHeight: 1.5, fontSize: '0.78rem' }}>
                      &ldquo;According to RFC-402, when promoting a PostgreSQL read-replica to primary, on-call SREs must verify WAL replay lag is under 100ms. The promote trigger is dispatched via CloudPilot.&rdquo;
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                      <span>Source: db-failover-spec.md</span>
                      <span style={{ color: '#4ade80' }}>Cosine Similarity: 0.941</span>
                      <span style={{ color: '#38bdf8' }}>Latency: 18ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Trust Strip */}
      <section className="nx-trust-strip">
        <div className="nx-container">
          <div className="nx-trust-strip__label">
            Engineered for High-Reliability Teams &amp; Modern Cloud Infrastructure
          </div>
          <div className="nx-trust-strip__logos">
            <span className="nx-trust-logo">◆ HYPERSCALE</span>
            <span className="nx-trust-logo">▲ APOLLO CLOUD</span>
            <span className="nx-trust-logo">● FINCORE TECH</span>
            <span className="nx-trust-logo">■ VERTEX DATA</span>
            <span className="nx-trust-logo">◈ SENTINEL GLOBAL</span>
          </div>
        </div>
      </section>

      {/* Services Showcase Section */}
      <section id="services" className="nx-section">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__tag">Platform Services</span>
            <h2 className="nx-section__title">Engineered for Resilient Enterprise Scale</h2>
            <p className="nx-section__desc">
              Every service in NEXUS ONE shares unified identity, isolated tenant boundaries, end-to-end auditability, and an accessible design system.
            </p>
          </div>

          <div className="nx-products-grid">
            {PRODUCTS.map((product) => {
              const IconComp = product.Icon;
              return (
                <div key={product.id} className="nx-product-card">
                  <div className="nx-product-card__header">
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={20} color="#2563eb" />
                    </div>
                    <div className="nx-product-card__title-group">
                      <div className="nx-product-card__top">
                        <h3 className="nx-product-card__name">{product.name}</h3>
                        <span className="nx-badge-chip">{product.badge}</span>
                      </div>
                      <div className="nx-product-card__tagline">{product.tagline}</div>
                    </div>
                  </div>

                  <p className="nx-product-card__desc">{product.desc}</p>

                  <ul className="nx-product-card__features">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="nx-feature-item">
                        <span className="nx-check">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="nx-product-card__footer">
                    <a href={`http://localhost:5173/${product.id}`} className="nx-card-link">
                      Open Service Console →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Developer SDK Quickstart Section */}
      <section id="developer" className="nx-section nx-section--darker">
        <div className="nx-container">
          <div className="nx-dev-showcase">
            <div>
              <span className="nx-section__tag">Developer Experience</span>
              <h2 className="nx-section__title" style={{ textAlign: 'left' }}>
                Integrate in Minutes with Type-Safe SDKs
              </h2>
              <p className="nx-section__desc" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                Every API route is backed by strict Zod schema validation, real-time WebSockets, and zero-overhead cryptographic key authentication.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#0f172a' }}>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span>
                  <span>Full TypeScript strict typing and Zod schemas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#0f172a' }}>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span>
                  <span>Auto-generated OpenAPI 3.1 Swagger interactive documentation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#0f172a' }}>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span>
                  <span>Real-time WebSocket &amp; CRDT synchronization channels</span>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <a
                  href="http://localhost:3001/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nx-btn nx-btn--primary nx-btn--lg"
                >
                  Explore Interactive REST API Docs →
                </a>
              </div>
            </div>

            <div className="nx-code-box">
              <div className="nx-code-header">
                <div className="nx-code-tabs">
                  <button
                    type="button"
                    className={`nx-code-tab ${codeLang === 'typescript' ? 'nx-code-tab--active' : ''}`}
                    onClick={() => setCodeLang('typescript')}
                  >
                    TypeScript
                  </button>
                  <button
                    type="button"
                    className={`nx-code-tab ${codeLang === 'python' ? 'nx-code-tab--active' : ''}`}
                    onClick={() => setCodeLang('python')}
                  >
                    Python
                  </button>
                  <button
                    type="button"
                    className={`nx-code-tab ${codeLang === 'curl' ? 'nx-code-tab--active' : ''}`}
                    onClick={() => setCodeLang('curl')}
                  >
                    cURL
                  </button>
                </div>

                <button type="button" className="nx-code-copy-btn" onClick={handleCopy}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <pre className="nx-code-pre">
                <code>{CODE_EXAMPLES[codeLang]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="nx-section">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__tag">System Architecture</span>
            <h2 className="nx-section__title">Uncompromising Architectural Integrity</h2>
            <p className="nx-section__desc">
              Decoupled Fastify API, BullMQ background worker engine, and PostgreSQL data plane with strict tenant isolation.
            </p>
          </div>

          <div className="nx-arch-diagram">
            <div className="nx-arch-layer">
              <div className="nx-arch-layer__title">Presentation &amp; Edge Tier</div>
              <div className="nx-arch-cards">
                <div className="nx-arch-card">
                  <strong>Marketing Website</strong>
                  <span>Next.js 14 App Router (SSR/SSG, SEO)</span>
                </div>
                <div className="nx-arch-card">
                  <strong>Authenticated Dashboard</strong>
                  <span>React 18 + Vite SPA (Client Routing)</span>
                </div>
                <div className="nx-arch-card">
                  <strong>Design System</strong>
                  <span>@nexus-one/ui + Shared Tokens</span>
                </div>
              </div>
            </div>

            <div className="nx-arch-connector">↓ TLS 1.3 / HTTPS / WSS Ingress ↓</div>

            <div className="nx-arch-layer">
              <div className="nx-arch-layer__title">Unified API Gateway &amp; Control Plane (Fastify 4)</div>
              <div className="nx-arch-cards">
                <div className="nx-arch-card">
                  <strong>Auth &amp; RBAC Guard</strong>
                  <span>Session tokens &amp; role hierarchy</span>
                </div>
                <div className="nx-arch-card">
                  <strong>7 Product REST Routers</strong>
                  <span>Validated with shared Zod schemas</span>
                </div>
                <div className="nx-arch-card">
                  <strong>Real-time Broker</strong>
                  <span>Socket.IO &amp; Yjs synchronization</span>
                </div>
              </div>
            </div>

            <div className="nx-arch-connector">↓ Async Job Queues &amp; Direct Data Plane ↓</div>

            <div className="nx-arch-layer">
              <div className="nx-arch-layer__title">Worker Engine &amp; Enterprise Data Plane</div>
              <div className="nx-arch-cards">
                <div className="nx-arch-card">
                  <strong>BullMQ Workers</strong>
                  <span>Background execution &amp; retries</span>
                </div>
                <div className="nx-arch-card">
                  <strong>PostgreSQL 16 + pgvector</strong>
                  <span>Multi-tenant schema &amp; vector store</span>
                </div>
                <div className="nx-arch-card">
                  <strong>Redis 7 In-Memory</strong>
                  <span>Sessions, pub/sub &amp; queues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section id="security" className="nx-section nx-section--darker">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__tag">Security &amp; Compliance</span>
            <h2 className="nx-section__title">Built for Zero-Trust Enterprise Environments</h2>
            <p className="nx-section__desc">
              From cryptographic hashing to immutable audit logs, NEXUS ONE conforms to modern zero-trust security principles.
            </p>
          </div>

          <div className="nx-features-grid">
            <div className="nx-feature-card">
              <div className="nx-feature-icon" style={{ color: '#2563eb' }}>
                <ShieldSecurityIcon size={32} color="#2563eb" />
              </div>
              <h3>Zero-Trust Multi-Tenancy</h3>
              <p>Every single query, request, and storage record enforces strict organization boundaries. No cross-tenant data leakage is possible.</p>
            </div>
            <div className="nx-feature-card">
              <div className="nx-feature-icon" style={{ color: '#2563eb' }}>
                <LockKeyIcon size={32} color="#2563eb" />
              </div>
              <h3>Cryptographic Security</h3>
              <p>Passwords hashed with bcrypt 12 rounds, API keys hashed with SHA-256, and secure HTTP-only SameSite session cookies.</p>
            </div>
            <div className="nx-feature-card">
              <div className="nx-feature-icon" style={{ color: '#2563eb' }}>
                <AuditListIcon size={32} color="#2563eb" />
              </div>
              <h3>Immutable Audit Trail</h3>
              <p>All sensitive operations, role updates, and access decisions are logged into append-only audit events with timestamp and client IP.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Customer Social Proof */}
      <section className="nx-section">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__tag">Engineering Testimonials</span>
            <h2 className="nx-section__title">Validated by Platform Engineers in Production</h2>
            <p className="nx-section__desc">See how engineering teams use NEXUS ONE to unify operations and accelerate delivery.</p>
          </div>

          <div className="nx-testimonial-grid">
            <div className="nx-testimonial-card">
              <p className="nx-testimonial-quote">
                &ldquo;Replacing 4 fragmented SaaS monitoring and incident tools with PulseOps and GateFlow dropped our incident triage MTTR by 64% in our first month alone.&rdquo;
              </p>
              <div className="nx-testimonial-author">
                <div className="nx-testimonial-avatar">EM</div>
                <div className="nx-testimonial-meta">
                  <strong>Elena Morris</strong>
                  <span>VP of Infrastructure, CloudScale</span>
                </div>
              </div>
            </div>

            <div className="nx-testimonial-card">
              <p className="nx-testimonial-quote">
                &ldquo;Having a shared tenant model with AgentForge and CortexRAG let our developers prototype enterprise knowledge search with zero cross-tenant security risk.&rdquo;
              </p>
              <div className="nx-testimonial-author">
                <div className="nx-testimonial-avatar">DK</div>
                <div className="nx-testimonial-meta">
                  <strong>David Kim</strong>
                  <span>Principal Platform Architect, FinTech Global</span>
                </div>
              </div>
            </div>

            <div className="nx-testimonial-card">
              <p className="nx-testimonial-quote">
                &ldquo;CloudPilot identified $38,000 in idle cross-cloud compute allocations within 48 hours of connecting our AWS and GCP organization accounts.&rdquo;
              </p>
              <div className="nx-testimonial-author">
                <div className="nx-testimonial-avatar">SJ</div>
                <div className="nx-testimonial-meta">
                  <strong>Sarah Jenkins</strong>
                  <span>Director of Cloud Operations, HyperScale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="nx-section nx-section--darker">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__tag">Transparent Tiers</span>
            <h2 className="nx-section__title">Predictable Pricing for Teams of Any Scale</h2>
            <p className="nx-section__desc">Start building with generous sandbox limits, then scale up as your workloads and team expand.</p>
          </div>

          <div className="nx-pricing-grid">
            <div className="nx-pricing-card">
              <h3>Starter</h3>
              <div className="nx-price">$0 <span>/ month</span></div>
              <p className="nx-pricing-desc">For individual developers and testing sandbox environments.</p>
              <ul className="nx-pricing-features">
                <li>✓ Access to all 7 core services</li>
                <li>✓ 3 Active AgentForge workflows</li>
                <li>✓ Up to 100k GateFlow requests/mo</li>
                <li>✓ 50MB CortexRAG document store</li>
                <li>✓ Community forum support</li>
              </ul>
              <a href="http://localhost:5173/register" className="nx-btn nx-btn--secondary" style={{ width: '100%', marginTop: 'auto' }}>
                Start Free Sandbox
              </a>
            </div>

            <div className="nx-pricing-card nx-pricing-card--popular">
              <div className="nx-pricing-badge">Recommended</div>
              <h3>Team</h3>
              <div className="nx-price">$49 <span>/ user / month</span></div>
              <p className="nx-pricing-desc">For high-velocity engineering and operations teams.</p>
              <ul className="nx-pricing-features">
                <li>✓ Everything in Starter</li>
                <li>✓ Unlimited AgentForge workflows</li>
                <li>✓ Full PulseOps incident timelines</li>
                <li>✓ Real-time SyncSpace collaboration</li>
                <li>✓ SentinelX DSL risk rules</li>
                <li>✓ Standard 99.9% uptime SLA</li>
              </ul>
              <a href="http://localhost:5173/register" className="nx-btn nx-btn--primary" style={{ width: '100%', marginTop: 'auto' }}>
                Start Team Trial
              </a>
            </div>

            <div className="nx-pricing-card">
              <h3>Enterprise</h3>
              <div className="nx-price">Custom</div>
              <p className="nx-pricing-desc">Dedicated infrastructure, SSO, compliance, and custom SLAs.</p>
              <ul className="nx-pricing-features">
                <li>✓ Everything in Team</li>
                <li>✓ SAML / Okta / Azure AD SSO</li>
                <li>✓ Dedicated VPC &amp; On-prem deployment</li>
                <li>✓ CloudPilot custom billing connectors</li>
                <li>✓ Custom 99.99% uptime SLA</li>
                <li>✓ 24/7 dedicated support engineering</li>
              </ul>
              <a href="mailto:sales@nexusone.dev" className="nx-btn nx-btn--secondary" style={{ width: '100%', marginTop: 'auto' }}>
                Contact Enterprise
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise FAQ Accordion */}
      <section className="nx-section">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__tag">Frequently Asked Questions</span>
            <h2 className="nx-section__title">Enterprise Questions Answered</h2>
            <p className="nx-section__desc">Everything you need to know about security, architecture, deployment, and data isolation.</p>
          </div>

          <div className="nx-faq-list">
            {[
              {
                q: 'How does NEXUS ONE guarantee tenant data isolation?',
                a: 'Every single database transaction, Redis pub/sub message, and worker queue job carries an immutable organizationId claim verified at the API Gateway. Cross-tenant queries are blocked at both application middleware and database schema levels.',
              },
              {
                q: 'Can NEXUS ONE be deployed in our private VPC or on-premise?',
                a: 'Yes. Enterprise customers have the option to deploy NEXUS ONE in their own dedicated AWS, GCP, or Azure VPC, or air-gapped on-premise Kubernetes clusters with dedicated support and custom Helm charts.',
              },
              {
                q: 'How does the cryptographic API key management work?',
                a: 'When an API key is generated in GateFlow, only the initial creator receives the raw secret once. The database exclusively stores an irreversible SHA-256 cryptographic digest with salt, ensuring zero plaintext exposure even in worst-case database breaches.',
              },
              {
                q: 'What level of SLA and uptime guarantee is provided?',
                a: 'Our cloud platform offers a 99.9% uptime SLA for Team tiers and a 99.99% financially backed SLA for Enterprise plans, supported by multi-region automated database failovers and active-active gateway ingress.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="nx-faq-item">
                <button
                  type="button"
                  className="nx-faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <span className="nx-faq-chevron" style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="nx-faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Conversion CTA */}
          <div className="nx-cta-banner">
            <h2>Ready to Modernize Your Engineering Operations?</h2>
            <p>
              Join forward-thinking platform teams building resilient, observable, and cost-efficient cloud infrastructure with NEXUS ONE.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="http://localhost:5173/register" className="nx-btn nx-btn--primary nx-btn--lg" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
                Create Free Account →
              </a>
              <a href="mailto:sales@nexusone.dev" className="nx-btn nx-btn--secondary nx-btn--lg" style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: '#475569' }}>
                Schedule Enterprise Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="nx-footer">
        <div className="nx-container nx-footer__inner">
          <div>
            <div className="nx-brand">
              <div className="nx-brand__icon" aria-hidden="true">
                <span className="nx-brand__dot" />
              </div>
              <span className="nx-brand__name" style={{ color: '#ffffff' }}>NEXUS ONE</span>
            </div>
            <p className="nx-footer__text">
              Enterprise Cloud &amp; Developer Infrastructure Platform. Engineered with rigorous reliability and architectural coherence.
            </p>
            <div className="nx-footer__status">
              <span className="nx-status-dot" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="nx-footer__links">
            <div className="nx-footer__group">
              <h4>Services</h4>
              <a href="http://localhost:5173/agentforge">AgentForge</a>
              <a href="http://localhost:5173/pulseops">PulseOps</a>
              <a href="http://localhost:5173/gateflow">GateFlow</a>
              <a href="http://localhost:5173/cortexrag">CortexRAG</a>
              <a href="http://localhost:5173/syncspace">SyncSpace</a>
              <a href="http://localhost:5173/sentinelx">SentinelX</a>
              <a href="http://localhost:5173/cloudpilot">CloudPilot</a>
            </div>

            <div className="nx-footer__group">
              <h4>Platform</h4>
              <a href="http://localhost:3001/docs" target="_blank" rel="noopener noreferrer">REST API Docs</a>
              <a href="#architecture">Architecture</a>
              <a href="#security">Security Model</a>
              <a href="#pricing">Pricing</a>
            </div>

            <div className="nx-footer__group">
              <h4>Organization</h4>
              <a href="http://localhost:5173/login">Sign In</a>
              <a href="http://localhost:5173/register">Register</a>
              <a href="mailto:contact@nexusone.dev">Contact</a>
            </div>
          </div>
        </div>

        <div className="nx-footer__bottom">
          <div className="nx-container nx-footer__bottom-inner">
            <span>© 2026 NEXUS ONE Inc. All rights reserved.</span>
            <span>Enterprise Cloud &amp; Developer Infrastructure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
