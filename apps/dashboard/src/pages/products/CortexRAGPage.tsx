import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@nexus-one/ui';

interface KnowledgeCollection {
  id: string;
  name: string;
  docCount: number;
  vectorsCount: number;
  embeddingModel: string;
  updatedAt: string;
}

export function CortexRAGPage() {
  const [collections] = useState<KnowledgeCollection[]>([
    {
      id: 'kb-1',
      name: 'Corporate Engineering Runbooks',
      docCount: 142,
      vectorsCount: 48920,
      embeddingModel: 'text-embedding-3-small (1536-dim)',
      updatedAt: '1h ago',
    },
    {
      id: 'kb-2',
      name: 'Customer Compliance & SOC2 Policies',
      docCount: 38,
      vectorsCount: 12400,
      embeddingModel: 'text-embedding-3-small (1536-dim)',
      updatedAt: '2d ago',
    },
    {
      id: 'kb-3',
      name: 'Product Architecture & API Specs',
      docCount: 95,
      vectorsCount: 31200,
      embeddingModel: 'text-embedding-3-large (3072-dim)',
      updatedAt: 'Just now',
    },
  ]);

  const [testQuery, setTestQuery] = useState('');
  const [queryResults, setQueryResults] = useState<Array<{ title: string; score: number; snippet: string }>>([]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setQueryResults([
      {
        title: 'Runbook: Database Failover Procedures (Section 4.1)',
        score: 0.942,
        snippet: 'When promoting a PostgreSQL read-replica to primary, verify WAL replay lag is < 100ms before initiating trigger promote...',
      },
      {
        title: 'Architecture Overview: Tenant Isolation & pgvector',
        score: 0.887,
        snippet: 'All vector embeddings include mandatory tenant orgId foreign keys with HNSW index partitioning per organization namespace...',
      },
    ]);
  }

  return (
    <div className="nx-product-shell">
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-cortexrag)' }}>
            <span>🧠 CortexRAG</span>
            <span className="nx-pill-tag">Enterprise Knowledge Intelligence</span>
          </div>
          <h1 className="nx-product-title">Knowledge Bases & Vector Retrieval</h1>
          <p className="nx-product-desc">
            Multi-modal document parsing, sliding-window chunking, dense vector embeddings, and strict citations.
          </p>
        </div>

        <Button variant="primary">+ Ingest Document</Button>
      </div>

      <div className="nx-product-grid-3">
        <Card>
          <div className="nx-stat-title">Indexed Vectors</div>
          <div className="nx-stat-value">92,520</div>
          <div className="nx-stat-sub">Across 3 knowledge collections</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Semantic Query Latency</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-warning-500)' }}>14ms</div>
          <div className="nx-stat-sub">HNSW cosine similarity search</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Citations Accuracy</div>
          <div className="nx-stat-value">99.1%</div>
          <div className="nx-stat-sub">Deterministic source verification</div>
        </Card>
      </div>

      <div className="nx-dashboard-row" style={{ marginTop: '1.5rem' }}>
        <Card style={{ flex: 1 }}>
          <CardHeader>
            <CardTitle>Semantic Search Playground</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Ask a question across your enterprise documents..."
              />
              <Button type="submit" variant="primary">
                Search
              </Button>
            </form>

            {queryResults.length > 0 && (
              <div className="nx-query-results">
                {queryResults.map((res, idx) => (
                  <div key={idx} className="nx-result-card">
                    <div className="nx-result-header">
                      <strong>{res.title}</strong>
                      <Badge variant="brand" size="sm">
                        Score: {(res.score * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="nx-result-snippet">{res.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card style={{ flex: 1 }}>
          <CardHeader>
            <CardTitle>Knowledge Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="nx-collection-list">
              {collections.map((col) => (
                <div key={col.id} className="nx-collection-item">
                  <div>
                    <strong>{col.name}</strong>
                    <div className="nx-collection-meta">
                      {col.docCount} docs • {col.vectorsCount.toLocaleString()} vectors • {col.embeddingModel}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Manage</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
