import { describe, it, expect } from 'vitest';
import { cortexRagEngine } from '../../services/cortexrag/engine.js';

describe('CortexRAG Hybrid Retrieval & Semantic Synthesis Engine', () => {
  it('chunks documents on paragraph boundaries while preserving section metadata and overlap', () => {
    const markdownContent = `
# Section 1: Overview
This is the first paragraph describing enterprise cloud architecture and distributed database topologies.

# Section 2: Failover
When promoting a replica during an emergency, follow the runbook protocol precisely to prevent split-brain scenarios. Ensure WAL replay lag is zero.
    `;

    const chunks = cortexRagEngine.chunkDocument(markdownContent, 15, 5);

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]?.tokenCount).toBeGreaterThan(0);
    expect(chunks[0]?.metadata.section).toBeDefined();
    expect(chunks[0]?.content).toContain('enterprise cloud architecture');
  });

  it('generates normalized embeddings with deterministic cosine similarity', () => {
    const textA = 'Database connection pool saturation and query timeout error';
    const textB = 'Database connection pool saturation and query timeout error';
    const textC = 'Frontend CSS styling button glassmorphism theme';

    const vecA = cortexRagEngine.generateEmbedding(textA);
    const vecB = cortexRagEngine.generateEmbedding(textB);
    const vecC = cortexRagEngine.generateEmbedding(textC);

    const simIdentical = cortexRagEngine.cosineSimilarity(vecA, vecB);
    const simDifferent = cortexRagEngine.cosineSimilarity(vecA, vecC);

    expect(simIdentical).toBeCloseTo(1.0, 3);
    expect(simDifferent).toBeLessThan(simIdentical);
  });

  it('computes lexical keyword scores accurately', () => {
    const query = 'PostgreSQL replica promotion';
    const contentMatch = 'Detailed instructions on PostgreSQL replica promotion in high availability clusters.';
    const contentNoMatch = 'Kubernetes ingress controller configuration for GateFlow proxy.';

    const scoreMatch = cortexRagEngine.computeLexicalScore(query, contentMatch);
    const scoreNoMatch = cortexRagEngine.computeLexicalScore(query, contentNoMatch);

    expect(scoreMatch).toBe(1.0);
    expect(scoreNoMatch).toBe(0.0);
  });

  it('fuses dense and sparse scores into hybrid ranking', () => {
    const query = 'WAL replay lag threshold';
    const candidates = [
      {
        chunkId: 'chk-1',
        documentId: 'doc-1',
        documentTitle: 'Postgres SRE Runbook',
        chunkIndex: 0,
        content: 'Ensure WAL replay lag threshold is less than 100ms prior to failover.',
      },
      {
        chunkId: 'chk-2',
        documentId: 'doc-2',
        documentTitle: 'Frontend Guide',
        chunkIndex: 0,
        content: 'React components should use design tokens for typography and borders.',
      },
    ];

    const ranked = cortexRagEngine.hybridRank(query, candidates, 0.6, 2);

    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.chunkId).toBe('chk-1');
    expect(ranked[0]?.hybridScore).toBeGreaterThan(ranked[1]?.hybridScore || 0);
  });

  it('synthesizes grounded answers with verified source citations', () => {
    const query = 'What is the required WAL replay lag threshold?';
    const topChunks = [
      {
        chunkId: 'chk-1',
        documentId: 'doc-1',
        documentTitle: 'Postgres SRE Runbook',
        chunkIndex: 2,
        content: 'The required WAL replay lag threshold must be strictly under 100ms before initiating replica promotion.',
        denseScore: 0.95,
        sparseScore: 0.90,
        hybridScore: 0.93,
      },
    ];

    const result = cortexRagEngine.synthesizeAnswer(query, topChunks);

    expect(result.answer).toContain('Postgres SRE Runbook');
    expect(result.answer).toContain('[Doc 1]');
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]?.documentTitle).toBe('Postgres SRE Runbook');
    expect(result.citations[0]?.chunkIndex).toBe(2);
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
  });
});
