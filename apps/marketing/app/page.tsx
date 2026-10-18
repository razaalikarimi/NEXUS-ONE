const PRODUCTS = [
  {
    id: 'agentforge',
    name: 'AgentForge',
    tagline: 'AI Agent Orchestration Platform',
    badge: 'Autonomous AI',
    color: 'var(--nx-agentforge, #8b5cf6)',
    desc: 'Visually assemble, evaluate, and deploy multi-agent workflows. Connect LLMs, tool integrations, conditional routing, and human-in-the-loop approvals with full state checkpointing.',
    features: [
      'Visual DAG & Node Graph Workflow Builder',
      'Multi-model fallback & prompt versioning',
      'Safe sandbox tool execution & step tracing',
      'Granular human review & policy gates',
    ],
  },
  {
    id: 'pulseops',
    name: 'PulseOps',
    tagline: 'Incident Management & Observability',
    badge: 'AI Operations',
    color: 'var(--nx-pulseops, #ef4444)',
    desc: 'Real-time telemetry ingestion, automatic error fingerprinting, and AI-assisted root-cause diagnosis that reduces MTTR from hours to minutes.',
    features: [
      'Real-time event stream & telemetry ingestion',
      'Smart alert clustering & deduplication',
      'Automated root-cause analysis & runbooks',
      'Incident escalation timelines & postmortems',
    ],
  },
  {
    id: 'gateflow',
    name: 'GateFlow',
    tagline: 'API Gateway & Developer Platform',
    badge: 'Core Infra',
    color: 'var(--nx-gateflow, #06b6d4)',
    desc: 'Unified developer API gateway with cryptographic key management, dynamic rate limiting, OpenAPI 3.1 documentation generation, and real-time usage analytics.',
    features: [
      'Hashed SHA-256 API key issuance & rotation',
      'Token-bucket & sliding window rate limiting',
      'Interactive Swagger & OpenAPI 3.1 documentation',
      'Latency percentiles & traffic metrics',
    ],
  },
  {
    id: 'cortexrag',
    name: 'CortexRAG',
    tagline: 'Enterprise Knowledge Intelligence',
    badge: 'Vector Intelligence',
    color: 'var(--nx-cortexrag, #f59e0b)',
    desc: 'High-precision retrieval-augmented generation engine with hybrid semantic search, document ingestion pipelines, contextual chunking, and strict citations.',
    features: [
      'Multi-format parser (PDF, Markdown, JSON, HTML)',
      'Configurable sliding-window chunking algorithms',
      'Hybrid dense vector + sparse keyword search',
      'Deterministic citations with source preview',
    ],
  },
  {
    id: 'syncspace',
    name: 'SyncSpace',
    tagline: 'Real-Time Collaborative Workspace',
    badge: 'Collaboration',
    color: 'var(--nx-syncspace, #22c55e)',
    desc: 'Sub-millisecond collaborative documents powered by CRDTs (Yjs) and WebSockets. Seamless real-time cursor tracking, live presence, and immutable revision history.',
    features: [
      'Conflict-free Replicated Data Types (CRDT)',
      'Live multiplayer presence & cursor tracking',
      'Encrypted WebSocket synchronization',
      'Time-travel version history & restore points',
    ],
  },
  {
    id: 'sentinelx',
    name: 'SentinelX',
    tagline: 'Autonomous Fraud & Risk Engine',
    badge: 'Risk & Security',
    color: 'var(--nx-sentinelx, #f97316)',
    desc: 'Automated policy evaluation, behavioral anomaly detection, and risk scoring engine for enterprise transactions, user activities, and API interactions.',
    features: [
      'Dynamic rule evaluation DSL & risk scoring',
      'Real-time decisioning (allow, challenge, block)',
      'Comprehensive case management for analysts',
      'Immutable audit trail for compliance',
    ],
  },
  {
    id: 'cloudpilot',
    name: 'CloudPilot',
    tagline: 'Intelligent Cloud Cost Optimizer',
    badge: 'FinOps Intelligence',
    color: 'var(--nx-cloudpilot, #3b82f6)',
    desc: 'Cross-cloud cost intelligence, budget forecasting, and automated anomaly detection to eliminate cloud waste across AWS, GCP, and Azure environments.',
    features: [
      'Unified multi-cloud cost billing ingestion',
      'Proactive cost spike & leak detection alerts',
      'Granular attribution per team, project & workspace',
      'Predictive 90-day spend forecasting',
    ],
  },
];

export default function HomePage() {
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
            <span className="nx-brand__tag">v0.1.0</span>
          </div>

          <nav className="nx-nav" aria-label="Main Navigation">
            <a href="#products" className="nx-nav__link">Products</a>
            <a href="#architecture" className="nx-nav__link">Architecture</a>
            <a href="#security" className="nx-nav__link">Security</a>
            <a href="#pricing" className="nx-nav__link">Pricing</a>
            <a href="http://localhost:3001/docs" target="_blank" rel="noopener noreferrer" className="nx-nav__link">API Docs</a>
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
            <span>The Unified Enterprise AI & Developer Platform</span>
          </div>

          <h1 className="nx-hero__title">
            Build. Observe. <br />
            <span className="nx-gradient-text">Automate. Understand.</span>
          </h1>

          <p className="nx-hero__subtitle">
            A cohesive platform integrating seven mission-critical enterprise systems into one unified control plane. Powered by shared multi-tenancy, end-to-end auditability, and production-ready infrastructure.
          </p>

          <div className="nx-hero__cta-group">
            <a href="http://localhost:5173/register" className="nx-btn nx-btn--primary nx-btn--lg">
              Get Started with NEXUS ONE →
            </a>
            <a href="#architecture" className="nx-btn nx-btn--secondary nx-btn--lg">
              Explore Architecture
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="nx-hero__metrics">
            <div className="nx-metric">
              <span className="nx-metric__value">7</span>
              <span className="nx-metric__label">Integrated Products</span>
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
              <span className="nx-metric__label">RBAC & Multi-Tenant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Showcase Section */}
      <section id="products" className="nx-section">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__eyebrow">The Seven Pillars</span>
            <h2 className="nx-section__title">Engineered to Operate in Total Harmony</h2>
            <p className="nx-section__desc">
              Every product in NEXUS ONE shares the same authentication, tenant boundaries, audit trail, and design system.
            </p>
          </div>

          <div className="nx-products-grid">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="nx-product-card" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="nx-product-card__header">
                  <div
                    className="nx-product-card__accent"
                    style={{ backgroundColor: product.color }}
                  />
                  <div>
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
                    <li key={idx}>
                      <span className="nx-check" style={{ color: product.color }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="nx-product-card__footer">
                  <a href={`http://localhost:5173/${product.id}`} className="nx-card-link">
                    Open in Dashboard →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="nx-section nx-section--darker">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__eyebrow">Enterprise System Design</span>
            <h2 className="nx-section__title">Uncompromising Architectural Integrity</h2>
            <p className="nx-section__desc">
              Decoupled Fastify API, BullMQ background worker engine, and PostgreSQL data plane with full tenant isolation.
            </p>
          </div>

          <div className="nx-arch-diagram">
            <div className="nx-arch-layer">
              <div className="nx-arch-layer__title">Presentation & Edge Tier</div>
              <div className="nx-arch-layer__cards">
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

            <div className="nx-arch-connector">↓ TLS 1.3 / HTTPS / WSS ↓</div>

            <div className="nx-arch-layer">
              <div className="nx-arch-layer__title">Unified API Gateway & Control Plane (Fastify 4)</div>
              <div className="nx-arch-layer__cards">
                <div className="nx-arch-card">
                  <strong>Auth & RBAC Guard</strong>
                  <span>Session tokens & role hierarchy</span>
                </div>
                <div className="nx-arch-card">
                  <strong>7 Product REST Routers</strong>
                  <span>Validated with shared Zod schemas</span>
                </div>
                <div className="nx-arch-card">
                  <strong>Real-time Broker</strong>
                  <span>Socket.IO & Yjs synchronization</span>
                </div>
              </div>
            </div>

            <div className="nx-arch-connector">↓ Async Job Queues & Direct Data Plane ↓</div>

            <div className="nx-arch-layer">
              <div className="nx-arch-layer__title">Worker Engine & Enterprise Data Plane</div>
              <div className="nx-arch-layer__cards">
                <div className="nx-arch-card">
                  <strong>BullMQ Workers</strong>
                  <span>Background execution & retries</span>
                </div>
                <div className="nx-arch-card">
                  <strong>PostgreSQL 16 + pgvector</strong>
                  <span>Multi-tenant schema & vector store</span>
                </div>
                <div className="nx-arch-card">
                  <strong>Redis 7 In-Memory</strong>
                  <span>Sessions, pub/sub & queues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section id="security" className="nx-section">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__eyebrow">Enterprise Trust</span>
            <h2 className="nx-section__title">Built for Stringent Security Mandates</h2>
            <p className="nx-section__desc">
              From cryptographic hashing to immutable audit logs, NEXUS ONE conforms to modern zero-trust principles.
            </p>
          </div>

          <div className="nx-grid-3">
            <div className="nx-feature-card">
              <div className="nx-feature-icon">🛡️</div>
              <h3>Zero-Trust Multi-Tenancy</h3>
              <p>Every single query, request, and storage record enforces strict organization boundaries. No cross-tenant data leakage is possible.</p>
            </div>
            <div className="nx-feature-card">
              <div className="nx-feature-icon">🔒</div>
              <h3>Cryptographic Security</h3>
              <p>Passwords hashed with bcrypt 12 rounds, API keys hashed with SHA-256, and secure HTTP-only SameSite session cookies.</p>
            </div>
            <div className="nx-feature-card">
              <div className="nx-feature-icon">📋</div>
              <h3>Immutable Audit Trail</h3>
              <p>All sensitive operations, role updates, and access decisions are logged into append-only audit events with timestamp and client IP.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="nx-section nx-section--darker">
        <div className="nx-container">
          <div className="nx-section__header">
            <span className="nx-section__eyebrow">Transparent Tiers</span>
            <h2 className="nx-section__title">Predictable Pricing for Teams of Any Scale</h2>
            <p className="nx-section__desc">Start building for free, then scale up as your workloads and team expand.</p>
          </div>

          <div className="nx-pricing-grid">
            <div className="nx-pricing-card">
              <h3>Starter</h3>
              <div className="nx-price">$0 <span>/ month</span></div>
              <p className="nx-pricing-desc">For individual developers and testing sandbox environments.</p>
              <ul className="nx-pricing-features">
                <li>✓ Access to all 7 products</li>
                <li>✓ 3 Active AgentForge workflows</li>
                <li>✓ Up to 100k GateFlow requests/mo</li>
                <li>✓ 50MB CortexRAG document store</li>
                <li>✓ Community forum support</li>
              </ul>
              <a href="http://localhost:5173/register" className="nx-btn nx-btn--secondary" style={{ width: '100%', marginTop: 'auto' }}>
                Start Free
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
                <li>✓ Dedicated VPC & On-prem deployment</li>
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

      {/* Footer */}
      <footer className="nx-footer">
        <div className="nx-container nx-footer__inner">
          <div className="nx-footer__col-brand">
            <div className="nx-brand">
              <div className="nx-brand__icon" aria-hidden="true">
                <span className="nx-brand__dot" />
              </div>
              <span className="nx-brand__name">NEXUS ONE</span>
            </div>
            <p className="nx-footer__text">
              Unified Enterprise AI & Developer Platform. Built with engineering rigor and complete architectural coherence.
            </p>
            <div className="nx-footer__status">
              <span className="nx-status-dot" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="nx-footer__links">
            <div className="nx-footer__group">
              <h4>Products</h4>
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
            <span>Tagline: Build. Observe. Automate. Understand.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
