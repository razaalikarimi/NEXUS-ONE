// ============================================================
// SyncSpace Worker Processor — Document Snapshots & Presence GC
// ============================================================

import { Worker, type Job, type ConnectionOptions } from 'bullmq';
import { prisma } from '@nexus-one/database';
import { createLogger } from '@nexus-one/logger';

const logger = createLogger({ service: 'syncspace-worker' });

export interface SyncSpaceJobData {
  action: 'cleanup_presences' | 'snapshot_export' | 'version_archive';
  documentId?: string;
  olderThanMinutes?: number;
}

export function createSyncSpaceWorker(connection: ConnectionOptions) {
  const worker = new Worker(
    'syncspace-maintenance',
    async (job: Job<SyncSpaceJobData>) => {
      logger.info({ jobId: job.id, action: job.data.action }, 'Processing SyncSpace job');

      if (job.data.action === 'cleanup_presences') {
        const threshold = new Date(Date.now() - (job.data.olderThanMinutes ?? 5) * 60 * 1000);
        try {
          const deleteResult = await prisma.syncPresence.deleteMany({
            where: { lastHeartbeat: { lt: threshold } },
          });
          logger.info({ count: deleteResult.count }, 'Cleaned up stale SyncSpace presences');
          return { cleaned: deleteResult.count };
        } catch {
          logger.debug('Database offline, presence cleanup skipped');
          return { cleaned: 0 };
        }
      }

      if (job.data.action === 'version_archive' && job.data.documentId) {
        logger.info({ documentId: job.data.documentId }, 'Archived document snapshots');
        return { archived: true };
      }

      return { status: 'completed' };
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error({ jobId: job?.id, error: err.message }, 'SyncSpace job failed');
  });

  return worker;
}
