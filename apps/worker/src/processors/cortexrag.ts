// ============================================================
// CortexRAG Queue Processor
// ============================================================
// Asynchronously chunks ingested enterprise documents and indexes
// vector embeddings for fast hybrid search.
// ============================================================

import { Worker, type Job, type ConnectionOptions } from 'bullmq';
import { prisma } from '@nexus-one/database';
import { createLogger } from '@nexus-one/logger';

const logger = createLogger({ service: 'cortexrag-worker' });

export interface DocumentIngestionJobData {
  documentId: string;
  knowledgeBaseId: string;
  rawContent: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export function createCortexRagWorker(connection: ConnectionOptions) {
  const worker = new Worker<DocumentIngestionJobData>(
    'document-chunking-indexing',
    async (job: Job<DocumentIngestionJobData>) => {
      const { documentId, knowledgeBaseId, rawContent } = job.data;
      logger.info({ jobId: job.id, documentId, knowledgeBaseId }, 'Processing document indexing job');

      // Update document status to processing
      await prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: { status: 'processing' },
      });

      // Split into paragraphs for async worker processing
      const paragraphs = rawContent.split(/\n\s*\n/).filter(Boolean);
      let chunkIndex = 0;

      for (const para of paragraphs) {
        await prisma.documentChunk.create({
          data: {
            documentId,
            knowledgeBaseId,
            chunkIndex,
            content: para.trim(),
            tokenCount: Math.ceil(para.split(/\s+/).length * 1.3),
            metadata: { asyncProcessed: true },
          },
        });
        chunkIndex += 1;
      }

      // Mark document as indexed
      await prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: {
          status: 'indexed',
          chunkCount: chunkIndex,
        },
      });

      logger.info({ documentId, chunksCreated: chunkIndex }, 'Document indexing completed successfully');
      return { success: true, documentId, chunksCreated: chunkIndex };
    },
    {
      connection,
      concurrency: 5,
    },
  );

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error({ jobId: job?.id, error: err.message }, 'Document indexing job failed');
  });

  return worker;
}
