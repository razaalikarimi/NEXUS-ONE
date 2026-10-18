// ============================================================
// CortexRAG Routes — /api/v1/cortexrag
// ============================================================
// Knowledge base management, document chunking, hybrid vector/BM25
// retrieval, and citation-grounded RAG query synthesis.
// ============================================================

import type { FastifyPluginAsync } from 'fastify';
import { prisma, type DocumentStatus } from '@nexus-one/database';
import { cortexRagEngine } from '../services/cortexrag/engine.js';
import { z } from 'zod';

const createKnowledgeBaseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  embeddingModel: z.string().default('text-embedding-3-small'),
  chunkSize: z.number().int().min(64).max(2048).default(512),
  chunkOverlap: z.number().int().min(0).max(256).default(64),
});

const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  fileType: z.enum(['markdown', 'pdf', 'docx', 'json', 'txt']).default('markdown'),
  rawContent: z.string().min(1).max(500000),
});

const queryRagSchema = z.object({
  knowledgeBaseId: z.string().uuid(),
  query: z.string().min(1).max(1000),
  topK: z.number().int().min(1).max(20).default(5),
  hybridAlpha: z.number().min(0).max(1).default(0.6),
});

async function getWorkspaceId(orgId: string): Promise<string> {
  const workspace = await prisma.workspace.findFirst({ where: { orgId } });
  if (!workspace) throw new Error('No workspace found for organization');
  return workspace.id;
}

export const cortexragRoutes: FastifyPluginAsync = async (app) => {
  // Authentication required for all endpoints
  app.addHook('preHandler', app.authenticate);

  // ---- GET /knowledge-bases — List knowledge bases ----
  app.get('/knowledge-bases', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['cortexrag'],
      summary: 'List all knowledge bases for the current organization',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;

    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: { orgId },
      include: {
        _count: {
          select: { documents: true, queries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ knowledgeBases });
  });

  // ---- POST /knowledge-bases — Create a knowledge base ----
  app.post('/knowledge-bases', {
    preHandler: [app.requireTenant('admin')],
    schema: {
      tags: ['cortexrag'],
      summary: 'Create a new vector knowledge base with custom chunking parameters',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const workspaceId = await getWorkspaceId(orgId);
    const body = createKnowledgeBaseSchema.parse(request.body);

    const existing = await prisma.knowledgeBase.findUnique({
      where: { orgId_name: { orgId, name: body.name } },
    });

    if (existing) {
      return reply.status(409).send({ error: 'A knowledge base with this name already exists in this organization.' });
    }

    const kb = await prisma.knowledgeBase.create({
      data: {
        orgId,
        workspaceId,
        name: body.name,
        description: body.description,
        embeddingModel: body.embeddingModel,
        chunkSize: body.chunkSize,
        chunkOverlap: body.chunkOverlap,
      },
    });

    return reply.status(201).send({ knowledgeBase: kb });
  });

  // ---- GET /knowledge-bases/:id — Get single KB with stats ----
  app.get('/knowledge-bases/:id', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['cortexrag'],
      summary: 'Get knowledge base details and document counts',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const { id } = request.params as { id: string };

    const kb = await prisma.knowledgeBase.findFirst({
      where: { id, orgId },
      include: {
        documents: {
          select: { id: true, title: true, fileType: true, fileSize: true, status: true, chunkCount: true, createdAt: true },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!kb) {
      return reply.status(404).send({ error: 'Knowledge base not found' });
    }

    return reply.send({ knowledgeBase: kb });
  });

  // ---- GET /knowledge-bases/:id/documents — List documents in KB ----
  app.get('/knowledge-bases/:id/documents', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['cortexrag'],
      summary: 'List all documents indexed inside a knowledge base',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const { id: knowledgeBaseId } = request.params as { id: string };

    const documents = await prisma.knowledgeDocument.findMany({
      where: { knowledgeBaseId, orgId },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ documents });
  });

  // ---- POST /knowledge-bases/:id/documents — Ingest & Chunk Document ----
  app.post('/knowledge-bases/:id/documents', {
    preHandler: [app.requireTenant('member')],
    schema: {
      tags: ['cortexrag'],
      summary: 'Ingest raw document, segment into semantic chunks, and index into vector store',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const workspaceId = await getWorkspaceId(orgId);
    const { id: knowledgeBaseId } = request.params as { id: string };
    const body = createDocumentSchema.parse(request.body);

    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, orgId },
    });

    if (!kb) {
      return reply.status(404).send({ error: 'Knowledge base not found' });
    }

    // 1. Chunk document using CortexRagEngine
    const chunks = cortexRagEngine.chunkDocument(
      body.rawContent,
      kb.chunkSize,
      kb.chunkOverlap,
    );

    // 2. Create document record
    const document = await prisma.knowledgeDocument.create({
      data: {
        knowledgeBaseId,
        orgId,
        workspaceId,
        title: body.title,
        fileType: body.fileType,
        fileSize: body.rawContent.length,
        status: 'indexed' as DocumentStatus,
        rawContent: body.rawContent,
        chunkCount: chunks.length,
        chunks: {
          create: chunks.map((c) => ({
            knowledgeBaseId,
            chunkIndex: c.chunkIndex,
            content: c.content,
            tokenCount: c.tokenCount,
            metadata: c.metadata as any,
          })),
        },
      },
      include: {
        chunks: true,
      },
    });

    // 3. Update KB counters
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        documentCount: { increment: 1 },
        chunkCount: { increment: chunks.length },
      },
    });

    return reply.status(201).send({
      document,
      totalChunksCreated: chunks.length,
    });
  });

  // ---- POST /query — Hybrid Retrieval + RAG Synthesis ----
  app.post('/query', {
    preHandler: [app.requireTenant('viewer')],
    schema: {
      tags: ['cortexrag'],
      summary: 'Execute hybrid vector + keyword search and synthesize grounded answers with citations',
    },
  }, async (request, reply) => {
    const orgId = request.tenant!.orgId;
    const startTime = Date.now();
    const body = queryRagSchema.parse(request.body);

    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: body.knowledgeBaseId, orgId },
    });

    if (!kb) {
      return reply.status(404).send({ error: 'Knowledge base not found' });
    }

    // Fetch candidate chunks from documents in this KB
    const chunks = await prisma.documentChunk.findMany({
      where: { knowledgeBaseId: body.knowledgeBaseId },
      include: {
        document: { select: { id: true, title: true } },
      },
      take: 100, // Top candidates for hybrid ranking
    });

    if (chunks.length === 0) {
      return reply.send({
        query: body.query,
        answer: 'This knowledge base currently contains no indexed document chunks. Please ingest documents to enable generative synthesis.',
        citations: [],
        retrievedChunks: [],
        latencyMs: Date.now() - startTime,
        confidenceScore: 0,
      });
    }

    const candidates = chunks.map((c) => ({
      chunkId: c.id,
      documentId: c.document.id,
      documentTitle: c.document.title,
      chunkIndex: c.chunkIndex,
      content: c.content,
      metadata: (c.metadata || {}) as Record<string, unknown>,
    }));

    // Perform hybrid ranking (dense vector cosine similarity + BM25 keyword score)
    const topChunks = cortexRagEngine.hybridRank(
      body.query,
      candidates,
      body.hybridAlpha,
      body.topK,
    );

    // Synthesize grounded response with source citations
    const synthesis = cortexRagEngine.synthesizeAnswer(body.query, topChunks);
    const latencyMs = Date.now() - startTime;

    // Log query asynchronously
    await prisma.ragQueryLog.create({
      data: {
        knowledgeBaseId: body.knowledgeBaseId,
        orgId,
        query: body.query,
        retrievedChunkIds: topChunks.map((c) => c.chunkId),
        hybridScore: topChunks[0]?.hybridScore || 0,
        latencyMs,
        synthesizedAnswer: synthesis.answer,
        citationsCount: synthesis.citations.length,
      },
    }).catch(() => {});

    return reply.send({
      query: body.query,
      answer: synthesis.answer,
      citations: synthesis.citations,
      retrievedChunks: topChunks,
      latencyMs,
      confidenceScore: synthesis.confidence,
    });
  });
};
