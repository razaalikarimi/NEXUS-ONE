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

interface KnowledgeBaseItem {
  id: string;
  name: string;
  description: string;
  docCount: number;
  chunkCount: number;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  updatedAt: string;
}

interface DocumentItem {
  id: string;
  title: string;
  fileType: 'markdown' | 'pdf' | 'docx' | 'json' | 'txt';
  chunkCount: number;
  fileSizeKb: number;
  status: 'indexed' | 'processing';
  createdAt: string;
}

interface CitationItem {
  id: string;
  docTitle: string;
  chunkIndex: number;
  snippet: string;
  relevance: number;
}

interface QueryResultState {
  query: string;
  synthesizedAnswer: string;
  confidence: number;
  citations: CitationItem[];
  retrievedChunks: Array<{
    id: string;
    docTitle: string;
    chunkIndex: number;
    denseScore: number;
    sparseScore: number;
    hybridScore: number;
    content: string;
  }>;
  latencyMs: number;
}

export function CortexRAGPage() {
  const [activeTab, setActiveTab] = useState('playground');

  // Knowledge Collections State
  const [collections, setCollections] = useState<KnowledgeBaseItem[]>([
    {
      id: 'kb-1',
      name: 'Engineering Runbooks & SRE Protocols',
      description: 'Production triage, database failover procedures, and incident recovery runbooks.',
      docCount: 42,
      chunkCount: 1240,
      embeddingModel: 'text-embedding-3-small (1536-dim)',
      chunkSize: 512,
      chunkOverlap: 64,
      updatedAt: '12m ago',
    },
    {
      id: 'kb-2',
      name: 'Architecture Specifications & RFCs',
      description: 'System design documents, multi-tenant isolation contracts, and microservice APIs.',
      docCount: 28,
      chunkCount: 890,
      embeddingModel: 'text-embedding-3-large (3072-dim)',
      chunkSize: 512,
      chunkOverlap: 64,
      updatedAt: '2h ago',
    },
    {
      id: 'kb-3',
      name: 'SOC2 & Enterprise Compliance Policies',
      description: 'Security policies, access review cadences, and cryptographic key management.',
      docCount: 15,
      chunkCount: 410,
      embeddingModel: 'text-embedding-3-small (1536-dim)',
      chunkSize: 512,
      chunkOverlap: 64,
      updatedAt: '1d ago',
    },
  ]);

  // Indexed Documents State
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'doc-1',
      title: 'Database Failover & Replica Promotion Protocol (RFC-402)',
      fileType: 'markdown',
      chunkCount: 18,
      fileSizeKb: 24,
      status: 'indexed',
      createdAt: '12m ago',
    },
    {
      id: 'doc-2',
      title: 'Multi-Tenant Tenant Isolation & RBAC Security Matrix',
      fileType: 'markdown',
      chunkCount: 12,
      fileSizeKb: 16,
      status: 'indexed',
      createdAt: '1h ago',
    },
    {
      id: 'doc-3',
      title: 'Enterprise Incident Escalation SLA & On-Call Playbook',
      fileType: 'pdf',
      chunkCount: 22,
      fileSizeKb: 45,
      status: 'indexed',
      createdAt: '3h ago',
    },
  ]);

  // Query Playground State
  const [selectedKbId, setSelectedKbId] = useState<string>('kb-1');
  const [searchQuery, setSearchQuery] = useState('What is the procedure for PostgreSQL replica promotion?');
  const [hybridAlpha, setHybridAlpha] = useState(0.6); // 60% dense vector, 40% sparse BM25
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResultState | null>({
    query: 'What is the procedure for PostgreSQL replica promotion?',
    synthesizedAnswer:
      'According to "Database Failover & Replica Promotion Protocol (RFC-402)" [Doc 1]: When promoting a PostgreSQL read-replica to primary during a primary degradation event, on-call SREs must first verify WAL replay lag is under 100ms on replica-02. The trigger promote file must then be dispatched via CloudPilot orchestration.\n\nFurthermore, as documented in "Enterprise Incident Escalation SLA & On-Call Playbook" [Doc 2], state transition from INVESTIGATING to RESOLVED must be broadcast to the PulseOps War Room within 5 minutes of verification.',
    confidence: 0.94,
    citations: [
      {
        id: 'cite-1',
        docTitle: 'Database Failover & Replica Promotion Protocol (RFC-402)',
        chunkIndex: 2,
        snippet: 'When promoting a PostgreSQL read-replica to primary, verify WAL replay lag is < 100ms before initiating trigger promote...',
        relevance: 0.942,
      },
      {
        id: 'cite-2',
        docTitle: 'Enterprise Incident Escalation SLA & On-Call Playbook',
        chunkIndex: 5,
        snippet: 'State transitions to RESOLVED must be documented in the incident war room and timeline within 5 minutes of verified health recovery...',
        relevance: 0.887,
      },
    ],
    retrievedChunks: [
      {
        id: 'chk-1',
        docTitle: 'Database Failover & Replica Promotion Protocol (RFC-402)',
        chunkIndex: 2,
        denseScore: 0.961,
        sparseScore: 0.912,
        hybridScore: 0.942,
        content: 'When promoting a PostgreSQL read-replica to primary during a primary degradation event, on-call SREs must first verify WAL replay lag is under 100ms on replica-02. Initiate the trigger promote file in /var/lib/postgresql/data and verify pg_is_in_recovery() returns false.',
      },
      {
        id: 'chk-2',
        docTitle: 'Enterprise Incident Escalation SLA & On-Call Playbook',
        chunkIndex: 5,
        denseScore: 0.874,
        sparseScore: 0.908,
        hybridScore: 0.887,
        content: 'State transitions to RESOLVED must be documented in the incident war room and timeline within 5 minutes of verified health recovery. Post-mortem reviews are mandatory for all P0/P1 incidents.',
      },
      {
        id: 'chk-3',
        docTitle: 'Multi-Tenant Tenant Isolation & RBAC Security Matrix',
        chunkIndex: 1,
        denseScore: 0.722,
        sparseScore: 0.450,
        hybridScore: 0.613,
        content: 'Tenant isolation is maintained across all PostgreSQL connection pools using search_path scoping and explicit foreign keys on orgId.',
      },
    ],
    latencyMs: 16,
  });

  // Modal State for New Ingestion
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<'markdown' | 'pdf' | 'docx' | 'json' | 'txt'>('markdown');
  const [newDocContent, setNewDocContent] = useState('');

  // Handle Search Execution
  function handleExecuteQuery(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsQuerying(true);

    setTimeout(() => {
      setQueryResult({
        query: searchQuery,
        synthesizedAnswer: `Synthesized answer from "${documents[0]?.title || 'Knowledge Base'}" [Doc 1]: Relevant documentation indicates verified protocols for query "${searchQuery}". Key parameters are monitored under active SLA baselines with strict tenant isolation.`,
        confidence: 0.92,
        citations: [
          {
            id: 'cite-1',
            docTitle: documents[0]?.title || 'Enterprise Engineering Manual',
            chunkIndex: 0,
            snippet: 'Verified operating procedure for enterprise infrastructure and data pipelines...',
            relevance: 0.925,
          },
        ],
        retrievedChunks: [
          {
            id: 'chk-dyn-1',
            docTitle: documents[0]?.title || 'Enterprise Engineering Manual',
            chunkIndex: 0,
            denseScore: 0.934,
            sparseScore: 0.910,
            hybridScore: 0.925,
            content: 'Operating guidelines for service orchestrations and enterprise data flows with zero downtime failover guarantees.',
          },
        ],
        latencyMs: 14,
      });
      setIsQuerying(false);
    }, 320);
  }

  // Handle Ingest Document
  function handleIngestDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const estimatedChunks = Math.max(1, Math.ceil(newDocContent.split(/\s+/).length / 250));
    const newDoc: DocumentItem = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      title: newDocTitle,
      fileType: newDocType,
      chunkCount: estimatedChunks,
      fileSizeKb: Math.ceil(newDocContent.length / 1024),
      status: 'indexed',
      createdAt: 'Just now',
    };

    setDocuments([newDoc, ...documents]);
    setCollections((prev) =>
      prev.map((c) =>
        c.id === selectedKbId
          ? { ...c, docCount: c.docCount + 1, chunkCount: c.chunkCount + estimatedChunks, updatedAt: 'Just now' }
          : c
      )
    );

    setIsIngestModalOpen(false);
    setNewDocTitle('');
    setNewDocContent('');
  }

  return (
    <div className="nx-product-shell">
      {/* Top Header */}
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-cortexrag)' }}>
            <span>🧠 CortexRAG</span>
            <span className="nx-pill-tag">Enterprise Knowledge Intelligence</span>
          </div>
          <h1 className="nx-product-title">Hybrid Vector Knowledge & Semantic RAG</h1>
          <p className="nx-product-desc">
            Reciprocal Rank Fusion (BM25 + Cosine Similarity), sliding-window semantic chunking, and grounded synthesis with verified citations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="primary" onClick={() => setIsIngestModalOpen(true)}>
            + Ingest Document
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="nx-product-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card>
          <div className="nx-stat-title">Indexed Vectors</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-cortexrag)' }}>
            {collections.reduce((sum, c) => sum + c.chunkCount, 0).toLocaleString()}
          </div>
          <div className="nx-stat-sub">Across {collections.length} knowledge collections</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Hybrid Retrieval Latency</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-success-500)' }}>14ms</div>
          <div className="nx-stat-sub">BM25 + Dense vector re-ranking</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Grounded Citation Rate</div>
          <div className="nx-stat-value">99.4%</div>
          <div className="nx-stat-sub">0 unverified hallucinations</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Indexed Documents</div>
          <div className="nx-stat-value">{documents.length}</div>
          <div className="nx-stat-sub">Markdown, PDF, DOCX, JSON</div>
        </Card>
      </div>

      {/* Tabs Container */}
      <Tabs defaultTab="playground" activeTab={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab id="playground">RAG Synthesis Playground ⚡</Tab>
          <Tab id="collections">Knowledge Collections ({collections.length})</Tab>
          <Tab id="documents">Indexed Documents ({documents.length})</Tab>
          <Tab id="tuning">Hybrid Ranking Parameters</Tab>
        </TabList>

        {/* Tab 1: RAG Synthesis Playground */}
        <TabPanel id="playground">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            {/* Query Form & Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Ask Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExecuteQuery} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FormField label="Target Knowledge Collection">
                    <Select value={selectedKbId} onChange={(e) => setSelectedKbId(e.target.value)}>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.docCount} docs)
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField label="Enterprise Inquiry / Prompt">
                    <textarea
                      className="nx-input"
                      rows={4}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ask any question regarding runbooks, architectural contracts, or policies..."
                    />
                  </FormField>

                  {/* Pre-fill Chips */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--nx-text-muted)' }}>
                      SAMPLE INQUIRIES:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('What is the procedure for PostgreSQL replica promotion?')}
                        style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'var(--nx-bg-surface-elevated)', border: '1px solid var(--nx-border-subtle)', color: 'var(--nx-text-secondary)', cursor: 'pointer' }}
                      >
                        Database failover procedure
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('Explain multi-tenant workspace isolation rules.')}
                        style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'var(--nx-bg-surface-elevated)', border: '1px solid var(--nx-border-subtle)', color: 'var(--nx-text-secondary)', cursor: 'pointer' }}
                      >
                        Workspace tenant isolation
                      </button>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" disabled={isQuerying} style={{ marginTop: '0.5rem' }}>
                    {isQuerying ? 'Retrieving & Synthesizing...' : 'Run Hybrid Retrieval & Synthesis ⚡'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Synthesized Answer & Grounded Citations */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <CardTitle>Grounded Generative Synthesis</CardTitle>
                  {queryResult && (
                    <Badge variant="success" size="sm">
                      {Math.round(queryResult.confidence * 100)}% Confidence • {queryResult.latencyMs}ms
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {queryResult ? (
                  <div>
                    {/* Answer Box */}
                    <div
                      style={{
                        padding: '1.25rem',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#60a5fa' }}>
                          🧠 CortexRAG Synthesized Answer
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--nx-text-primary)', whiteSpace: 'pre-line' }}>
                        {queryResult.synthesizedAnswer}
                      </p>
                    </div>

                    {/* Citations Box */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--nx-text-secondary)' }}>
                        VERIFIED SOURCE CITATIONS:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {queryResult.citations.map((cite) => (
                          <div
                            key={cite.id}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '6px',
                              background: 'var(--nx-bg-surface-elevated)',
                              borderLeft: '3px solid var(--nx-brand-400)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                              <strong style={{ color: 'var(--nx-text-primary)' }}>
                                {cite.docTitle} (Chunk #{cite.chunkIndex})
                              </strong>
                              <Badge variant="brand" size="sm">
                                Score: {(cite.relevance * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--nx-text-muted)', fontStyle: 'italic' }}>
                              "{cite.snippet}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Retrieved Chunk Inspection */}
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--nx-text-secondary)' }}>
                        HYBRID RANKED CHUNKS ({queryResult.retrievedChunks.length}):
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                        {queryResult.retrievedChunks.map((chunk) => (
                          <div
                            key={chunk.id}
                            style={{
                              padding: '0.6rem 0.75rem',
                              borderRadius: '6px',
                              background: 'var(--nx-bg-surface)',
                              fontSize: '0.78rem',
                              color: 'var(--nx-text-secondary)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.72rem', color: 'var(--nx-text-muted)' }}>
                              <span>{chunk.docTitle} • Chunk #{chunk.chunkIndex}</span>
                              <span>
                                Dense: {chunk.denseScore} | BM25: {chunk.sparseScore} | <strong>Hybrid: {chunk.hybridScore}</strong>
                              </span>
                            </div>
                            <div>{chunk.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--nx-text-muted)' }}>
                    Type an inquiry and click "Run Hybrid Retrieval & Synthesis" to inspect grounded answer generation.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        {/* Tab 2: Knowledge Collections */}
        <TabPanel id="collections">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {collections.map((col) => (
              <Card key={col.id}>
                <CardHeader>
                  <CardTitle style={{ fontSize: '1.1rem' }}>{col.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--nx-text-secondary)' }}>
                    {col.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--nx-text-muted)' }}>Embedding Model:</span>
                    <strong style={{ color: 'var(--nx-text-primary)' }}>{col.embeddingModel}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--nx-text-muted)' }}>Chunk Strategy:</span>
                    <strong style={{ color: 'var(--nx-text-primary)' }}>{col.chunkSize} tokens ({col.chunkOverlap} overlap)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--nx-text-muted)' }}>Total Documents:</span>
                    <Badge variant="default" size="sm">{col.docCount} docs • {col.chunkCount} chunks</Badge>
                  </div>
                  <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                    Manage Chunks →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabPanel>

        {/* Tab 3: Indexed Documents */}
        <TabPanel id="documents">
          <Card style={{ marginTop: '1.5rem' }}>
            <CardHeader>
              <CardTitle>Enterprise Indexed Documents & Chunks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="nx-table-wrap">
                <table className="nx-table">
                  <thead className="nx-table__header">
                    <tr>
                      <th className="nx-table__head-cell">Document Title</th>
                      <th className="nx-table__head-cell">Format</th>
                      <th className="nx-table__head-cell">Chunks</th>
                      <th className="nx-table__head-cell">Size</th>
                      <th className="nx-table__head-cell">Status</th>
                      <th className="nx-table__head-cell">Indexed</th>
                    </tr>
                  </thead>
                  <tbody className="nx-table__body">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="nx-table__row">
                        <td className="nx-table__cell">
                          <strong>{doc.title}</strong>
                        </td>
                        <td className="nx-table__cell">
                          <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--nx-bg-surface-elevated)', textTransform: 'uppercase', color: 'var(--nx-brand-400)' }}>
                            {doc.fileType}
                          </span>
                        </td>
                        <td className="nx-table__cell">{doc.chunkCount} chunks</td>
                        <td className="nx-table__cell">{doc.fileSizeKb} KB</td>
                        <td className="nx-table__cell">
                          <Badge variant="success" size="sm">INDEXED</Badge>
                        </td>
                        <td className="nx-table__cell">{doc.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 4: Hybrid Ranking Parameters */}
        <TabPanel id="tuning">
          <Card style={{ marginTop: '1.5rem' }}>
            <CardHeader>
              <CardTitle>Reciprocal Rank Fusion & Hybrid Retrieval Tuning</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Hybrid Weight Alpha (α): {hybridAlpha}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--nx-text-muted)' }}>
                      {Math.round(hybridAlpha * 100)}% Dense Vector / {Math.round((1 - hybridAlpha) * 100)}% BM25 Sparse
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={hybridAlpha}
                    onChange={(e) => setHybridAlpha(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ padding: '1rem', borderRadius: '6px', background: 'var(--nx-bg-surface-elevated)', border: '1px solid var(--nx-border-subtle)', fontSize: '0.85rem', color: 'var(--nx-text-secondary)' }}>
                  <strong>How CortexRAG Hybrid Fusion Works:</strong>
                  <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                    <li style={{ marginBottom: '0.25rem' }}>
                      <strong>Dense Vector (Cosine):</strong> Captures semantic meaning, synonyms, and conversational concepts even when exact terminology differs.
                    </li>
                    <li>
                      <strong>Sparse Lexical (BM25):</strong> Accurately pinpoints specific error codes, UUIDs, function names, and exact keywords.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>

      {/* Ingest Document Modal */}
      <Modal isOpen={isIngestModalOpen} onClose={() => setIsIngestModalOpen(false)} title="🧠 Ingest Enterprise Knowledge Document">
        <form onSubmit={handleIngestDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField label="Document Title" required>
            <Input
              placeholder="e.g. Incident Response & P0 Escalation Matrix"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Document Format">
            <Select value={newDocType} onChange={(e) => setNewDocType(e.target.value as 'markdown' | 'pdf' | 'docx' | 'json' | 'txt')}>
              <option value="markdown">Markdown (.md)</option>
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="docx">Word Document (.docx)</option>
              <option value="json">Structured JSON (.json)</option>
              <option value="txt">Plain Text (.txt)</option>
            </Select>
          </FormField>

          <FormField label="Document Raw Text Content" required>
            <textarea
              className="nx-input"
              rows={6}
              placeholder="Paste markdown or document text here. CortexRAG will automatically perform semantic chunking..."
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" type="button" onClick={() => setIsIngestModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Segment & Ingest ⚡
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
