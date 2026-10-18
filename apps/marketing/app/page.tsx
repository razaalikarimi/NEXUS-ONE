export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>NEXUS ONE</h1>
          <p className="tagline">Build. Observe. Automate. Understand.</p>
          <p className="description">
            A unified enterprise AI and developer platform with seven integrated products.
          </p>
          <div className="cta-group">
            <a href="/products" className="btn btn-primary">
              Explore the Platform
            </a>
            <a href="/docs" className="btn btn-secondary">
              Documentation
            </a>
          </div>
        </div>
      </section>

      <section className="products" id="products">
        <h2>Seven Products. One Platform.</h2>
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.slug} className="product-card">
              <div
                className="product-icon"
                style={{ '--product-color': product.color } as React.CSSProperties}
                aria-hidden="true"
              >
                {product.icon}
              </div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const products = [
  {
    name: 'AgentForge',
    slug: 'agentforge',
    description: 'AI Agent Orchestration Platform — create, configure, execute, and observe AI agent workflows.',
    color: 'var(--nx-agentforge)',
    icon: '⚡',
  },
  {
    name: 'PulseOps',
    slug: 'pulseops',
    description: 'AI-Powered Incident Management and Observability — ingest telemetry, manage incidents, and configure alerts.',
    color: 'var(--nx-pulseops)',
    icon: '📡',
  },
  {
    name: 'GateFlow',
    slug: 'gateflow',
    description: 'API Gateway and Developer Platform — register, document, and manage APIs with usage tracking.',
    color: 'var(--nx-gateflow)',
    icon: '🔐',
  },
  {
    name: 'CortexRAG',
    slug: 'cortexrag',
    description: 'Enterprise Knowledge Intelligence — ingest documents, search semantically, and get cited answers.',
    color: 'var(--nx-cortexrag)',
    icon: '🧠',
  },
  {
    name: 'SyncSpace',
    slug: 'syncspace',
    description: 'Real-Time Collaborative Workspace — edit documents together with live presence and persistence.',
    color: 'var(--nx-syncspace)',
    icon: '🤝',
  },
  {
    name: 'SentinelX',
    slug: 'sentinelx',
    description: 'Real-Time Fraud and Risk Engine — evaluate transactions with explainable risk scores.',
    color: 'var(--nx-sentinelx)',
    icon: '🛡️',
  },
  {
    name: 'CloudPilot',
    slug: 'cloudpilot',
    description: 'Cloud Cost and Resource Intelligence — track spending, set budgets, and forecast costs.',
    color: 'var(--nx-cloudpilot)',
    icon: '☁️',
  },
];
